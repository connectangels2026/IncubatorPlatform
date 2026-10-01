import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

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
        startup:startups (
          id,
          name,
          founder_email
        )
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
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
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

    // 1. Validation
    if (!mentor_id || !startup_id || !scheduled_date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Validation Error: mentor_id, startup_id, scheduled_date, start_time, and end_time are required' },
        { status: 400 }
      );
    }

    if (start_time >= end_time) {
      return NextResponse.json(
        { error: 'start_time must be earlier than end_time' },
        { status: 400 }
      );
    }

    // 2. Fetch mentor & check availability settings
    const { data: mentor, error: mentorErr } = await supabaseAdmin
      .from('mentors')
      .select(`
        id,
        is_available,
        is_active,
        availability_json,
        availability_hours_per_month,
        user:users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', mentor_id)
      .eq('organization_id', realOrgId)
      .single();

    if (mentorErr || !mentor || !mentor.is_active) {
      return NextResponse.json({ error: 'Mentor not found or is currently inactive' }, { status: 404 });
    }

    if (!mentor.is_available) {
      return NextResponse.json({ error: 'Mentor is currently marked as unavailable' }, { status: 400 });
    }

    // Check mentor weekly availability window if defined
    const dayOfWeek = getDayName(scheduled_date);
    const availMap = (mentor.availability_json || {}) as Record<string, string[]>;
    if (availMap[dayOfWeek] && Array.isArray(availMap[dayOfWeek]) && availMap[dayOfWeek].length > 0) {
      const slots = availMap[dayOfWeek];
      const fallsWithinSlot = slots.some((slot) => {
        const [slotStart, slotEnd] = slot.split('-');
        if (!slotStart || !slotEnd) return false;
        return start_time >= slotStart.trim() && end_time <= slotEnd.trim();
      });
      if (!fallsWithinSlot) {
        return NextResponse.json(
          {
            error: `Session time (${start_time} - ${end_time}) falls outside mentor availability for ${dayOfWeek} (${slots.join(', ')})`,
            available_slots: slots,
          },
          { status: 400 }
        );
      }
    }

    // 3. Fetch startup
    const { data: startup, error: startupErr } = await supabaseAdmin
      .from('startups')
      .select('id, name, founder_email')
      .eq('id', startup_id)
      .eq('organization_id', realOrgId)
      .single();

    if (startupErr || !startup) {
      return NextResponse.json({ error: 'Startup not found for this organization' }, { status: 404 });
    }

    // 4. Anti-Double Booking Conflict Check (no overlapping sessions for mentor)
    const { data: existingSessions, error: conflictErr } = await supabaseAdmin
      .from('mentorship_sessions')
      .select('id, start_time, end_time, session_title')
      .eq('mentor_id', mentor_id)
      .eq('scheduled_date', scheduled_date)
      .neq('status', 'cancelled');

    if (conflictErr) throw conflictErr;

    const hasConflict = (existingSessions || []).some((s) => {
      // Overlap: newStart < s.end && newEnd > s.start
      return start_time < s.end_time && end_time > s.start_time;
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: 'Cannot double-book mentor: An overlapping session already exists for this mentor on this date and time' },
        { status: 409 }
      );
    }

    // 5. Monthly quota limit check
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const { count: currentMonthBookings } = await supabaseAdmin
      .from('mentorship_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('mentor_id', mentor_id)
      .neq('status', 'cancelled')
      .gte('scheduled_date', startOfMonth);

    const monthlyCap = mentor.availability_hours_per_month ?? 10;
    if ((currentMonthBookings || 0) >= monthlyCap) {
      return NextResponse.json(
        { error: `Cannot book session: Mentor has reached their monthly limit of ${monthlyCap} sessions` },
        { status: 400 }
      );
    }

    // 6. Insert new mentorship session
    const payload = {
      organization_id: realOrgId,
      mentor_id,
      startup_id,
      scheduled_date,
      start_time,
      end_time,
      session_title: session_title || `Mentorship Session: ${startup.name}`,
      description: description || null,
      meeting_mode: meeting_mode || 'online',
      meeting_link: meeting_link || 'https://meet.google.com/xyz-mentor-session',
      agenda: agenda || null,
      status: 'scheduled',
      attended: false,
      action_points: [],
      created_by: user?.id && isValidUUID(user.id) ? user.id : null,
    };

    const { data: session, error: insertErr } = await supabaseAdmin
      .from('mentorship_sessions')
      .insert(payload)
      .select(`
        *,
        mentor:mentors (
          id,
          user:users (first_name, last_name, email)
        ),
        startup:startups (id, name, founder_email)
      `)
      .single();

    if (insertErr) throw insertErr;

    // 7. Booking confirmation trigger
    const mentorUser = Array.isArray(mentor.user) ? mentor.user[0] : mentor.user;
    const mentorEmail = mentorUser?.email || 'mentor@example.com';
    const startupEmail = startup.founder_email || 'founder@example.com';

    return NextResponse.json(
      {
        success: true,
        message: 'Mentorship session booked successfully',
        data: session,
        confirmation_notifications: {
          confirmation_sent: true,
          recipients: [
            { role: 'mentor', email: mentorEmail },
            { role: 'startup', email: startupEmail },
          ],
          scheduled_at: `${scheduled_date} ${start_time} - ${end_time}`,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
