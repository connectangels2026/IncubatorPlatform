import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { NotificationService } from '@/backend/services/notificationService';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getUTCDay()];
}

export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const searchParams = req.nextUrl.searchParams;
    const mentorId = searchParams.get('mentor_id');
    const startupId = searchParams.get('startup_id');
    const status = searchParams.get('status');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    let query = supabaseAdmin
      .from('mentorship_sessions')
      .select(`
        *,
        mentor:mentors (
          id,
          user:users (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        ),
        startup:startups (*)
      `)
      .eq('organization_id', realOrgId)
      .order('scheduled_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (mentorId) query = query.eq('mentor_id', mentorId);
    if (startupId) query = query.eq('startup_id', startupId);
    if (status) query = query.eq('status', status);
    if (fromDate) query = query.gte('scheduled_date', fromDate);
    if (toDate) query = query.lte('scheduled_date', toDate);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      organization_id: realOrgId,
      total: data?.length || 0,
      data: data || [],
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId } = requireOrg(req);

    const body = await req.json();

    const {
      mentor_id,
      startup_id,
      scheduled_date,
      start_time,
      end_time,
      session_title,
      description,
      meeting_mode,
      meeting_link,
      agenda,
    } = body;

    if (!mentor_id || !startup_id || !scheduled_date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Validation Error: mentor_id, startup_id, scheduled_date, start_time, and end_time are required' },
        { status: 400 }
      );
    }

    const reqStartMin = timeToMinutes(start_time);
    const reqEndMin = timeToMinutes(end_time);

    if (reqStartMin >= reqEndMin) {
      return NextResponse.json({ error: 'start_time must be earlier than end_time' }, { status: 400 });
    }

    const durationMinutes = Math.max(0, reqEndMin - reqStartMin);

    // Resolve startup first to get organization_id
    const { data: startup, error: startupErr } = await supabaseAdmin
      .from('startups')
      .select('*')
      .eq('id', startup_id)
      .single();

    if (startupErr || !startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    const realOrgId = startup.organization_id || resolveOrg(orgId);
    const startupTitle = startup.startup_name || startup.name || 'Startup';

    // Startup requests must target an actively allocated mentor
    const callerRole = (user?.role || '').toLowerCase();
    const isAdminOrMentor = ['admin', 'incubator_admin', 'incubator', 'super-admin', 'super_admin', 'mentor'].includes(callerRole);
    if (!isAdminOrMentor) {
      const { data: activeAlloc } = await supabaseAdmin
        .from('startup_mentors')
        .select('id')
        .eq('startup_id', startup_id)
        .eq('mentor_id', mentor_id)
        .eq('status', 'active')
        .maybeSingle();

      if (!activeAlloc) {
        return NextResponse.json(
          { error: 'You can only book sessions with actively allocated mentors' },
          { status: 403 }
        );
      }
    }

    // Fetch mentor & check availability settings
    const { data: mentor, error: mentorErr } = await supabaseAdmin
      .from('mentors')
      .select(`
        id,
        is_available,
        is_active,
        calendar_url,
        preferred_meeting_mode,
        availability_json,
        availability_hours_per_month,
        user:users (
          id,
          first_name,
          last_name,
          full_name,
          email
        )
      `)
      .eq('id', mentor_id)
      .single();

    if (mentorErr || !mentor || !mentor.is_active) {
      return NextResponse.json({ error: 'Mentor not found or is currently inactive' }, { status: 404 });
    }

    if (!mentor.is_available) {
      return NextResponse.json({ error: 'Mentor is currently not accepting new bookings' }, { status: 400 });
    }

    // Check mentor weekly availability window
    const dayOfWeek = getDayName(scheduled_date).toLowerCase();
    const shortTitle = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1, 3);
    const availMap = (mentor.availability_json || {}) as Record<string, any>;
    const weeklyGrid = (availMap.weekly_grid || {}) as Record<string, any>;
    const slots =
      weeklyGrid[shortTitle] ||
      weeklyGrid[dayOfWeek] ||
      availMap[dayOfWeek] ||
      availMap[dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)] ||
      availMap[dayOfWeek.slice(0, 3)] ||
      availMap[shortTitle];

    if (Array.isArray(slots) && slots.length > 0) {
      const fallsWithinSlot = slots.some((slot: any) => {
        if (typeof slot === 'string') {
          if (slot.includes('-')) {
            const [slotStart, slotEnd] = slot.split('-');
            return reqStartMin >= timeToMinutes(slotStart) && reqEndMin <= timeToMinutes(slotEnd);
          }
          const slotStartMin = timeToMinutes(slot);
          return reqStartMin >= slotStartMin && reqEndMin <= slotStartMin + 60;
        } else if (slot && typeof slot === 'object' && slot.start && slot.end) {
          return reqStartMin >= timeToMinutes(slot.start) && reqEndMin <= timeToMinutes(slot.end);
        }
        return false;
      });

      if (!fallsWithinSlot) {
        const slotDesc = slots.map((s: any) => (typeof s === 'string' ? s : `${s.start}-${s.end}`)).join(', ');
        return NextResponse.json(
          {
            error: `Session time (${start_time} - ${end_time}) falls outside mentor availability for ${shortTitle} (${slotDesc})`,
            available_slots: slots,
          },
          { status: 400 }
        );
      }
    }

    // Anti-double-booking conflict check (ignore cancelled & declined)
    const { data: existingSessions, error: conflictErr } = await supabaseAdmin
      .from('mentorship_sessions')
      .select('id, start_time, end_time, session_title')
      .eq('mentor_id', mentor_id)
      .eq('scheduled_date', scheduled_date)
      .not('status', 'in', '("cancelled","declined")');

    if (conflictErr) throw conflictErr;

    const hasConflict = (existingSessions || []).some((s) => {
      const sStartMin = timeToMinutes(s.start_time);
      const sEndMin = timeToMinutes(s.end_time);
      return reqStartMin < sEndMin && reqEndMin > sStartMin;
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: 'Cannot double-book mentor: An overlapping session already exists for this mentor on this date and time' },
        { status: 409 }
      );
    }

    // Monthly quota limit check
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const { count: currentMonthBookings } = await supabaseAdmin
      .from('mentorship_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('mentor_id', mentor_id)
      .not('status', 'in', '("cancelled","declined")')
      .gte('scheduled_date', startOfMonth);

    const monthlyCap = mentor.availability_hours_per_month ?? 10;
    if ((currentMonthBookings || 0) >= monthlyCap) {
      return NextResponse.json(
        { error: `Cannot book session: Mentor has reached their monthly limit of ${monthlyCap} sessions` },
        { status: 400 }
      );
    }

    const mentorUser = Array.isArray(mentor.user) ? mentor.user[0] : mentor.user;
    const mentorDisplayName =
      mentorUser?.full_name ||
      [mentorUser?.first_name, mentorUser?.last_name].filter(Boolean).join(' ').trim() ||
      mentorUser?.email?.split('@')[0] ||
      'Mentor';

    const initialStatus = isAdminOrMentor && body.status ? body.status : 'requested';
    const payload: Record<string, any> = {
      organization_id: realOrgId,
      mentor_id,
      startup_id,
      mentor_name: mentorDisplayName,
      scheduled_date,
      start_time,
      end_time,
      duration_minutes: durationMinutes,
      session_title: session_title || `1-on-1 Session: ${startupTitle}`,
      description: description || null,
      meeting_mode: meeting_mode || mentor.preferred_meeting_mode || 'video',
      meeting_link: meeting_link || null,
      agenda: agenda || null,
      status: initialStatus,
      attended: false,
      action_points: [],
      created_by: user?.id && isValidUUID(user.id) ? user.id : null,
    };

    const { data: session, error: insertErr } = await supabaseAdmin
      .from('mentorship_sessions')
      .insert(payload)
      .select('*')
      .single();

    if (insertErr) {
      if ((insertErr as any).code === '23505') {
        return NextResponse.json(
          { error: 'Cannot double-book mentor: This slot was just booked by someone else.' },
          { status: 409 }
        );
      }
      throw insertErr;
    }

    const mentorEmail = mentorUser?.email || '';
    const startupEmail = startup.founder_email || '';

    try {
      if (mentorUser?.id && isValidUUID(mentorUser.id)) {
        await NotificationService.createNotification({
          organization_id: realOrgId,
          recipient_id: mentorUser.id,
          recipient_name: mentorDisplayName,
          recipient_email: mentorEmail,
          title: `Session Request: ${payload.session_title}`,
          message: `${startupTitle} requested a 1-on-1 session on ${scheduled_date} (${start_time} - ${end_time}). Confirm with a meeting link in your Mentor Dashboard.`,
          notification_type: 'mentorship_booking',
          send_email: true,
          send_in_app: true,
          related_entity_type: 'mentorship_session',
          related_entity_id: session.id,
        });
      }
    } catch (notifErr) {
      console.warn('Failed to dispatch booking notification records:', notifErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Mentorship session requested successfully',
        data: session,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
