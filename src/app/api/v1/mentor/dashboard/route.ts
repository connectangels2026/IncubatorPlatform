import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { NotificationService } from '@/backend/services/notificationService';
import { logActivity } from '@/backend/services/activityLogger';

export const dynamic = 'force-dynamic';

const SHARED_STARTUP_COLUMNS =
  'id, organization_id, startup_name, sector, stage, logo_url, founder_name, founder_email, description, problem_statement, team_size, customer_count, tagline, website';

function calcSessionMinutes(row: any): number {
  if (typeof row?.duration_minutes === 'number' && row.duration_minutes > 0) {
    return row.duration_minutes;
  }
  if (row?.start_time && row?.end_time) {
    const [sh, sm] = String(row.start_time).split(':').map((n) => parseInt(n, 10) || 0);
    const [eh, em] = String(row.end_time).split(':').map((n) => parseInt(n, 10) || 0);
    const diff = eh * 60 + em - (sh * 60 + sm);
    if (diff > 0) return diff;
  }
  return 60;
}

const isValidUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

async function resolveUserAndMentor(authUser: { id: string; email?: string }) {
  let dbUser: any = null;
  if (isValidUUID(authUser.id)) {
    const { data } = await supabaseAdmin
      .from('users')
      .select('id, organization_id, email, phone, first_name, last_name, full_name, profile_picture_url, bio, linkedin_url, website, role')
      .eq('id', authUser.id)
      .maybeSingle();
    if (data) dbUser = data;
  }
  if (!dbUser && authUser.email) {
    const { data } = await supabaseAdmin
      .from('users')
      .select('id, organization_id, email, phone, first_name, last_name, full_name, profile_picture_url, bio, linkedin_url, website, role')
      .ilike('email', authUser.email.trim())
      .maybeSingle();
    if (data) dbUser = data;
  }

  let mentor: any = null;
  if (dbUser?.id) {
    const { data } = await supabaseAdmin
      .from('mentors')
      .select(`
        *,
        organization:organizations (
          id,
          name,
          city,
          state
        )
      `)
      .eq('user_id', dbUser.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) mentor = data;
  }

  return { dbUser, mentor };
}

function normalizeStartup(s: any) {
  if (!s) return null;
  return {
    id: s.id,
    name: s.startup_name || s.name || 'Startup',
    sector: s.sector || 'Technology',
    stage: s.stage || 'Seed',
    logo: s.logo_url || null,
    founder: s.founder_name || s.founder_email || 'Founder',
    email: s.founder_email || '',
    bio: s.description || s.problem_statement || 'Early-stage venture in incubator cohort.',
    tagline: s.tagline || '',
    website: s.website || '',
    teamSize: Number(s.team_size || 1),
    customerCount: Number(s.customer_count || 0),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dbUser, mentor } = await resolveUserAndMentor(user);
    const fullName =
      dbUser?.full_name ||
      [dbUser?.first_name, dbUser?.last_name].filter(Boolean).join(' ').trim() ||
      user.email?.split('@')[0] ||
      'Mentor';

    const userPayload = {
      id: dbUser?.id || user.id,
      email: dbUser?.email || user.email || '',
      fullName,
      phone: dbUser?.phone || '',
      avatar: dbUser?.profile_picture_url || null,
      role: dbUser?.role || user.role || null,
    };

    if (!mentor) {
      return NextResponse.json({
        success: true,
        hasMentorProfile: false,
        user: userPayload,
      });
    }

    const [sessionsRes, allocationsRes, sharedStartupsRpcRes, notificationsRes] = await Promise.all([
      supabaseAdmin
        .from('mentorship_sessions')
        .select('*')
        .eq('mentor_id', mentor.id)
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true }),
      supabaseAdmin
        .from('startup_mentors')
        .select(`*, startup:startups (${SHARED_STARTUP_COLUMNS})`)
        .eq('mentor_id', mentor.id)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false }),
      supabaseAdmin.rpc('get_mentor_allocated_startups', { p_mentor_id: mentor.id }),
      dbUser?.id
        ? supabaseAdmin
            .from('notifications')
            .select('id, title, message, notification_type, is_read, related_entity_type, related_entity_id, created_at')
            .eq('recipient_id', dbUser.id)
            .eq('is_read', false)
            .order('created_at', { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const rawSessions = sessionsRes.data || [];
    const allocations = allocationsRes.data || [];
    const startupMap = new Map<string, any>();
    const activeStartupMap = new Map<string, any>();

    if (!sharedStartupsRpcRes.error && Array.isArray(sharedStartupsRpcRes.data)) {
      for (const sRow of sharedStartupsRpcRes.data) {
        const normalized = normalizeStartup(sRow);
        if (normalized) {
          startupMap.set(normalized.id, normalized);
          activeStartupMap.set(normalized.id, normalized);
        }
      }
    }

    for (const alloc of allocations) {
      const sRow = Array.isArray(alloc.startup) ? alloc.startup[0] : alloc.startup;
      const normalized = normalizeStartup(sRow);
      if (normalized) {
        if (!startupMap.has(normalized.id)) startupMap.set(normalized.id, normalized);
        if (alloc.status === 'active' && !activeStartupMap.has(normalized.id)) {
          activeStartupMap.set(normalized.id, normalized);
        }
      }
    }

    // Include any session-linked startups (non-financial shared columns only)
    const missingIds = Array.from(
      new Set(rawSessions.map((r: any) => r.startup_id).filter((id: string) => id && !startupMap.has(id)))
    );
    if (missingIds.length > 0) {
      const { data: extraStartups } = await supabaseAdmin
        .from('startups')
        .select(SHARED_STARTUP_COLUMNS)
        .in('id', missingIds);
      for (const s of extraStartups || []) {
        const normalized = normalizeStartup(s);
        if (normalized) startupMap.set(normalized.id, normalized);
      }
    }

    const now = Date.now();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    const sevenDaysAhead = now + 7 * 86400000;

    const sessions = rawSessions.map((row: any) => {
      const st = startupMap.get(row.startup_id);
      const dtIso = row.scheduled_date && row.start_time ? `${row.scheduled_date}T${row.start_time}` : null;
      const timestamp = dtIso ? new Date(dtIso).getTime() : now;
      const rawStatus = (row.status || 'scheduled').toLowerCase();
      let displayStatus = 'Confirmed';
      if (rawStatus === 'pending' || rawStatus === 'requested') displayStatus = 'Pending';
      else if (rawStatus === 'completed') displayStatus = 'Completed';
      else if (rawStatus === 'cancelled' || rawStatus === 'declined') displayStatus = 'Declined';

      const tabCategory =
        displayStatus === 'Pending'
          ? 'Requests'
          : displayStatus === 'Confirmed'
          ? 'Upcoming'
          : 'Past';

      return {
        id: row.id,
        startupId: row.startup_id,
        startupName: st?.name || 'Portfolio Startup',
        startupLogo: st?.logo || null,
        title: row.session_title || 'Mentorship Session',
        date: row.scheduled_date || '',
        startTime: (row.start_time || '').slice(0, 5),
        endTime: (row.end_time || '').slice(0, 5),
        time:
          row.start_time && row.end_time
            ? `${String(row.start_time).slice(0, 5)} - ${String(row.end_time).slice(0, 5)}`
            : String(row.start_time || '').slice(0, 5),
        timestamp: Number.isNaN(timestamp) ? now : timestamp,
        mode: row.meeting_mode || 'Google Meet',
        meetingLink: row.meeting_link || '',
        meetingLocation: row.meeting_location || '',
        timezone: row.timezone || mentor.timezone || 'Asia/Kolkata',
        status: displayStatus,
        tabCategory,
        agenda: row.agenda || row.description || '',
        notes: row.session_notes || '',
        actionPoints: Array.isArray(row.action_points) ? row.action_points : [],
        startupRating: row.startup_rating || null,
        startupFeedback: row.startup_feedback || null,
        mentorFeedback: row.mentor_feedback || null,
        mentorFeedbackScores: row.mentor_feedback_scores || null,
        durationMinutes: calcSessionMinutes(row),
      };
    });

    const startups = Array.from(activeStartupMap.values()).map((st) => {
      const stSessions = sessions.filter((s: any) => s.startupId === st.id);
      const upcoming = stSessions.find((s: any) => s.status === 'Confirmed' && s.timestamp >= now);
      const completed = stSessions.filter((s: any) => s.status === 'Completed');
      const lastFb = completed.find((s: any) => s.mentorFeedback || s.startupFeedback);

      return {
        ...st,
        nextSession: upcoming ? `${upcoming.date}, ${upcoming.startTime}` : 'No upcoming session',
        sessionsHeld: completed.length,
        lastFeedbackDate: lastFb?.date || '—',
        metrics: {
          Stage: st.stage || 'Seed',
          Customers: String(st.customerCount),
          Team: `${st.teamSize} FTEs`,
        },
      };
    });

    const feedbackList = sessions
      .filter((s: any) => s.startupRating || s.startupFeedback)
      .map((s: any) => {
        const st = startupMap.get(s.startupId);
        return {
          id: `fb-${s.id}`,
          sessionId: s.id,
          startupName: s.startupName,
          founderName: st?.founder || 'Founder',
          date: s.date,
          rating: s.startupRating || null,
          comment: s.startupFeedback || '',
          tags: Array.isArray(mentor.expertise_areas) ? mentor.expertise_areas.slice(0, 2) : ['Mentorship'],
        };
      });

    const ratings = feedbackList.map((f: any) => Number(f.rating)).filter((r: number) => r >= 1 && r <= 5);
    const avgRating =
      ratings.length > 0
        ? Number((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1))
        : 0;
    const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of ratings) {
      const bucket = Math.min(5, Math.max(1, Math.round(r)));
      ratingDistribution[bucket] += 1;
    }
    const ratingTrend = feedbackList
      .filter((f: any) => typeof f.rating === 'number' && f.rating >= 1)
      .slice(-7)
      .map((f: any) => f.rating);

    const actionQueue: any[] = [];
    for (const alloc of allocations) {
      if (alloc.status === 'pending') {
        const sRow = Array.isArray(alloc.startup) ? alloc.startup[0] : alloc.startup;
        const stName = sRow?.startup_name || sRow?.name || 'Startup';
        actionQueue.push({
          id: `alloc-${alloc.id}`,
          allocationId: alloc.id,
          startupId: alloc.startup_id,
          type: 'allocation',
          title: 'New Startup Allocation Request',
          subtitle: `${stName} (${alloc.domain || 'Advisory'}) was allocated to your mentorship portfolio.`,
          startupName: stName,
          href: '/mentor/dashboard',
          date: new Date(alloc.created_at || Date.now()).toLocaleDateString(),
        });
      }
    }
    for (const s of sessions) {
      if (s.status === 'Pending') {
        actionQueue.push({
          id: `confirm-${s.id}`,
          type: 'session_confirm',
          title: 'Session Confirmation Needed',
          subtitle: `${s.startupName} requested "${s.title}" on ${s.date} at ${s.startTime}.`,
          sessionId: s.id,
          href: '/mentor/sessions',
          date: s.date,
        });
      } else if (s.status === 'Completed' && !s.mentorFeedback) {
        actionQueue.push({
          id: `fb-due-${s.id}`,
          type: 'feedback_due',
          title: 'Feedback Required',
          subtitle: `Session with ${s.startupName} on ${s.date} requires mentor evaluation.`,
          sessionId: s.id,
          href: '/mentor/feedback',
          date: s.date,
        });
      }
    }
    for (const n of notificationsRes.data || []) {
      const nt = String(n.notification_type || n.related_entity_type || '').toLowerCase();
      const href =
        nt.includes('feedback') || nt.includes('rating')
          ? '/mentor/feedback'
          : nt.includes('booking') || nt.includes('session')
          ? '/mentor/sessions'
          : nt.includes('allocation')
          ? '/mentor/startups'
          : '/mentor/dashboard';
      actionQueue.push({
        id: `notif-${n.id}`,
        notificationId: n.id,
        type: 'notification',
        notificationType: n.notification_type,
        relatedEntityId: n.related_entity_id,
        href,
        title: n.title,
        subtitle: n.message,
        date: new Date(n.created_at).toLocaleDateString(),
      });
    }

    const monthlyNonDeclined = sessions.filter(
      (s: any) => s.timestamp >= startOfMonth && s.status !== 'Declined'
    );
    const sessionsThisMonth = monthlyNonDeclined.length;
    const hoursUsedThisMonth = Number(
      (
        monthlyNonDeclined.reduce((acc: number, s: any) => acc + (Number(s.durationMinutes) || 60), 0) / 60
      ).toFixed(1)
    );
    const upcoming7Days = sessions.filter(
      (s: any) => s.status === 'Confirmed' && s.timestamp >= now && s.timestamp <= sevenDaysAhead
    ).length;

    const availJson = mentor.availability_json || {};
    const profileFieldsComplete = [
      Boolean(fullName),
      Boolean(availJson.job_title),
      Boolean(mentor.company_background),
      Boolean(mentor.bio && mentor.bio.length >= 30),
      Array.isArray(mentor.expertise_areas) && mentor.expertise_areas.length > 0,
      Boolean(mentor.linkedin_url),
      Boolean(mentor.calendar_url || availJson.default_meeting_link),
    ];
    const completeness = Math.round(
      (profileFieldsComplete.filter(Boolean).length / profileFieldsComplete.length) * 100
    );

    return NextResponse.json({
      success: true,
      hasMentorProfile: true,
      user: userPayload,
      mentor: {
        id: mentor.id,
        organization_id: mentor.organization_id,
        organization: mentor.organization || null,
        is_active: mentor.is_active,
        is_available: mentor.is_available,
        availability_hours_per_month: mentor.availability_hours_per_month || 10,
        preferred_meeting_mode: mentor.preferred_meeting_mode || 'video',
        timezone: mentor.timezone || 'Asia/Kolkata',
        calendar_url: mentor.calendar_url || '',
        bio: mentor.bio || dbUser?.bio || '',
        company_background: mentor.company_background || '',
        years_of_experience: mentor.years_of_experience || 1,
        expertise_areas: Array.isArray(mentor.expertise_areas) ? mentor.expertise_areas : [],
        industry_experience: mentor.industry_experience || '',
        linkedin_url: mentor.linkedin_url || dbUser?.linkedin_url || '',
        website: mentor.website || dbUser?.website || '',
        availability_json: availJson,
        completeness,
      },
      stats: {
        sessionsThisMonth,
        hoursUsedThisMonth,
        upcoming7Days,
        avgRating,
        ratingCount: ratings.length,
        ratingDistribution,
        ratingTrend,
        activeStartups: startups.length,
      },
      sessions,
      startups,
      feedbackList,
      actionQueue,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dbUser, mentor } = await resolveUserAndMentor(user);
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action } = body;
    const nowIso = new Date().toISOString();

    if (action === 'toggle_availability') {
      const nextVal = Boolean(body.is_available);
      const { data, error } = await supabaseAdmin
        .from('mentors')
        .update({ is_available: nextVal, updated_at: nowIso })
        .eq('id', mentor.id)
        .select('id, is_available')
        .single();
      if (error) throw error;
      await logActivity({
        organization_id: mentor.organization_id,
        user_id: dbUser?.id,
        actor_email: dbUser?.email,
        action: 'mentor_availability_toggled',
        entity_type: 'mentor',
        entity_id: mentor.id,
        description: `Mentor set accepting startups to ${nextVal}`,
        details: { is_available: nextVal },
      });
      return NextResponse.json({ success: true, data });
    }

    if (action === 'save_availability') {
      const mergedAvailJson = {
        ...(mentor.availability_json || {}),
        weekly_grid: body.weekly_grid || (mentor.availability_json || {}).weekly_grid || {},
        default_meeting_link: body.default_meeting_link ?? (mentor.availability_json || {}).default_meeting_link ?? '',
        vacation_date: body.vacation_date ?? (mentor.availability_json || {}).vacation_date ?? '',
      };

      const { data, error } = await supabaseAdmin
        .from('mentors')
        .update({
          availability_json: mergedAvailJson,
          timezone: body.timezone || mentor.timezone,
          preferred_meeting_mode: body.preferred_meeting_mode || mentor.preferred_meeting_mode,
          calendar_url: body.default_meeting_link ?? mentor.calendar_url,
          is_available: body.is_available !== undefined ? Boolean(body.is_available) : mentor.is_available,
          availability_hours_per_month:
            body.availability_hours_per_month !== undefined
              ? Number(body.availability_hours_per_month)
              : mentor.availability_hours_per_month,
          updated_at: nowIso,
        })
        .eq('id', mentor.id)
        .select()
        .single();
      if (error) throw error;
      await logActivity({
        organization_id: mentor.organization_id,
        user_id: dbUser?.id,
        actor_email: dbUser?.email,
        action: 'mentor_availability_updated',
        entity_type: 'mentor',
        entity_id: mentor.id,
        description: 'Mentor updated weekly availability schedule',
        details: { timezone: data.timezone, hours_per_month: data.availability_hours_per_month },
      });
      return NextResponse.json({ success: true, data });
    }

    if (action === 'save_profile') {
      const fullName = String(body.full_name || '').trim();
      const parts = fullName.split(/\s+/).filter(Boolean);
      const firstName = parts[0] || undefined;
      const lastName = parts.slice(1).join(' ') || null;

      if (dbUser?.id) {
        await supabaseAdmin
          .from('users')
          .update({
            ...(fullName ? { full_name: fullName, first_name: firstName, last_name: lastName } : {}),
            bio: body.bio ?? dbUser.bio,
            linkedin_url: body.linkedin_url ?? dbUser.linkedin_url,
            website: body.website ?? dbUser.website,
            updated_at: nowIso,
          })
          .eq('id', dbUser.id);
      }

      const mergedAvailJson = {
        ...(mentor.availability_json || {}),
        job_title: body.job_title ?? (mentor.availability_json || {}).job_title ?? '',
        primary_expertise: body.primary_expertise ?? (mentor.availability_json || {}).primary_expertise ?? '',
        sme_specialization: body.sme_specialization ?? (mentor.availability_json || {}).sme_specialization ?? '',
      };

      const { data, error } = await supabaseAdmin
        .from('mentors')
        .update({
          company_background: body.company_background ?? mentor.company_background,
          bio: body.bio ?? mentor.bio,
          expertise_areas: Array.isArray(body.expertise_areas) ? body.expertise_areas : mentor.expertise_areas,
          years_of_experience:
            body.years_of_experience !== undefined ? Number(body.years_of_experience) : mentor.years_of_experience,
          linkedin_url: body.linkedin_url ?? mentor.linkedin_url,
          website: body.website ?? mentor.website,
          availability_json: mergedAvailJson,
          updated_at: nowIso,
        })
        .eq('id', mentor.id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (action === 'decide_allocation') {
      const { allocation_id, decision, decline_reason } = body;
      if (!allocation_id || !['active', 'declined'].includes(decision)) {
        return NextResponse.json({ error: 'allocation_id and valid decision (active | declined) are required' }, { status: 400 });
      }
      if (decision === 'declined' && !String(decline_reason || '').trim()) {
        return NextResponse.json({ error: 'Decline reason is required when declining an allocation' }, { status: 400 });
      }

      const { data: allocRow, error: fetchAllocErr } = await supabaseAdmin
        .from('startup_mentors')
        .select('*, startup:startups (*)')
        .eq('id', allocation_id)
        .eq('mentor_id', mentor.id)
        .maybeSingle();

      if (fetchAllocErr || !allocRow) {
        return NextResponse.json({ error: 'Allocation not found' }, { status: 404 });
      }

      const { data: updatedAlloc, error: updAllocErr } = await supabaseAdmin
        .from('startup_mentors')
        .update({
          status: decision,
          decline_reason: decision === 'declined' ? String(decline_reason).trim() : null,
          decided_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', allocation_id)
        .eq('mentor_id', mentor.id)
        .select()
        .single();
      if (updAllocErr) throw updAllocErr;

      // Notify incubator admins (and allocator) about mentor decision
      try {
        const sRow = Array.isArray(allocRow.startup) ? allocRow.startup[0] : allocRow.startup;
        const stName = sRow?.startup_name || sRow?.name || 'Startup';
        const mentorDisplayName =
          dbUser?.full_name ||
          [dbUser?.first_name, dbUser?.last_name].filter(Boolean).join(' ').trim() ||
          dbUser?.email ||
          'Mentor';
        const title =
          decision === 'active'
            ? `Mentor Accepted Allocation: ${stName}`
            : `Mentor Declined Allocation: ${stName}`;
        const message =
          decision === 'active'
            ? `${mentorDisplayName} accepted the mentor allocation for ${stName}.`
            : `${mentorDisplayName} declined the mentor allocation for ${stName}. Reason: ${String(decline_reason).trim()}`;

        const { data: admins } = await supabaseAdmin
          .from('users')
          .select('id, email')
          .eq('organization_id', allocRow.organization_id)
          .in('role', ['admin', 'incubator_admin', 'incubator'])
          .limit(5);

        const recipientMap = new Map<string, string>();
        for (const a of admins || []) {
          if (a.id && isValidUUID(a.id)) recipientMap.set(a.id, a.email || '');
        }
        if (allocRow.allocated_by && isValidUUID(allocRow.allocated_by) && !recipientMap.has(allocRow.allocated_by)) {
          recipientMap.set(allocRow.allocated_by, '');
        }

        await Promise.allSettled(
          Array.from(recipientMap.entries()).map(([recId, recEmail]) =>
            NotificationService.createNotification({
              organization_id: allocRow.organization_id,
              recipient_id: recId,
              recipient_email: recEmail || undefined,
              title,
              message,
              notification_type: 'mentor_allocation',
              send_email: true,
              send_in_app: true,
              related_entity_type: 'startup',
              related_entity_id: allocRow.startup_id,
            })
          )
        );
      } catch (nErr) {
        console.warn('Allocation decision notification error:', nErr);
      }

      await logActivity({
        organization_id: allocRow.organization_id,
        user_id: dbUser?.id,
        actor_email: dbUser?.email,
        action: `mentor_allocation_${decision}`,
        entity_type: 'startup_mentor',
        entity_id: allocation_id,
        description: `Mentor ${decision} allocation for startup`,
        details: { startup_id: allocRow.startup_id, decline_reason: decline_reason || null },
      });

      return NextResponse.json({ success: true, data: updatedAlloc });
    }

    if (action === 'update_session') {
      const {
        session_id,
        status,
        meeting_link,
        session_notes,
        action_points,
        mentor_feedback,
        decline_reason,
        scheduled_date,
        start_time,
        end_time,
      } = body;
      if (!session_id) return NextResponse.json({ error: 'session_id is required' }, { status: 400 });

      const { data: existingSess } = await supabaseAdmin
        .from('mentorship_sessions')
        .select('*, startup:startups (*)')
        .eq('id', session_id)
        .eq('mentor_id', mentor.id)
        .maybeSingle();

      if (!existingSess) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

      const updates: Record<string, any> = { updated_at: nowIso };
      let mappedStatus: string | null = null;
      if (status) {
        const s = String(status).toLowerCase();
        mappedStatus = s === 'confirmed' ? 'scheduled' : s === 'pending' ? 'requested' : s;
        if (mappedStatus === 'declined' && !String(decline_reason || '').trim()) {
          return NextResponse.json({ error: 'Decline reason is required when declining a session' }, { status: 400 });
        }
        updates.status = mappedStatus;
        if (mappedStatus === 'completed') updates.attended = true;
      }
      if (decline_reason !== undefined) updates.decline_reason = String(decline_reason).trim() || null;
      if (meeting_link !== undefined) updates.meeting_link = meeting_link;
      if (session_notes !== undefined) updates.session_notes = session_notes;
      if (action_points !== undefined) updates.action_points = action_points;
      if (mentor_feedback !== undefined) updates.mentor_feedback = mentor_feedback;

      if (scheduled_date || start_time || end_time) {
        const nextDate = scheduled_date || existingSess.scheduled_date;
        const nextStart = start_time || existingSess.start_time;
        const nextEnd = end_time || existingSess.end_time;
        const { data: conflicts } = await supabaseAdmin
          .from('mentorship_sessions')
          .select('id, start_time, end_time')
          .eq('mentor_id', mentor.id)
          .eq('scheduled_date', nextDate)
          .neq('id', session_id)
          .not('status', 'in', '("cancelled","declined")');

        const toMin = (t: string) => {
          const [h, m] = String(t || '0:0').split(':');
          return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
        };
        const reqS = toMin(nextStart);
        const reqE = toMin(nextEnd);
        if ((conflicts || []).some((c: any) => reqS < toMin(c.end_time) && reqE > toMin(c.start_time))) {
          return NextResponse.json(
            { error: 'Overlapping session already exists at this date and time' },
            { status: 409 }
          );
        }
        updates.scheduled_date = nextDate;
        updates.start_time = nextStart;
        updates.end_time = nextEnd;
      }

      const { data, error } = await supabaseAdmin
        .from('mentorship_sessions')
        .update(updates)
        .eq('id', session_id)
        .eq('mentor_id', mentor.id)
        .select()
        .single();
      if (error) {
        if ((error as any).code === '23505') {
          return NextResponse.json({ error: 'Selected time slot is already booked' }, { status: 409 });
        }
        throw error;
      }

      // Notify startup when confirmed, declined, rescheduled, or cancelled
      if (mappedStatus || scheduled_date || start_time) {
        try {
          const stRow = Array.isArray(existingSess.startup) ? existingSess.startup[0] : existingSess.startup;
          if (stRow?.founder_id && isValidUUID(stRow.founder_id)) {
            const label = mappedStatus || 'rescheduled';
            await NotificationService.createNotification({
              organization_id: existingSess.organization_id,
              recipient_id: stRow.founder_id,
              recipient_email: stRow.founder_email || undefined,
              title: `Session ${label}: ${existingSess.session_title}`,
              message:
                mappedStatus === 'declined'
                  ? `Your session "${existingSess.session_title}" was declined. Reason: ${updates.decline_reason}`
                  : `Your session "${existingSess.session_title}" on ${updates.scheduled_date || existingSess.scheduled_date} is now ${label}.`,
              notification_type: 'mentorship_booking',
              send_email: true,
              send_in_app: true,
              related_entity_type: 'mentorship_session',
              related_entity_id: session_id,
            });
          }
        } catch {}
      }

      await logActivity({
        organization_id: existingSess.organization_id,
        user_id: dbUser?.id,
        actor_email: dbUser?.email,
        action: mappedStatus ? `mentorship_session_${mappedStatus}` : 'mentorship_session_updated',
        entity_type: 'mentorship_session',
        entity_id: session_id,
        description: `Mentor updated session "${existingSess.session_title || 'Session'}"`,
        details: { status: mappedStatus || existingSess.status, startup_id: existingSess.startup_id },
      });

      return NextResponse.json({ success: true, data });
    }

    if (action === 'create_session') {
      const { startup_id, session_title, scheduled_date, start_time, end_time, meeting_link, agenda, meeting_mode } =
        body;
      if (!startup_id || !scheduled_date || !start_time) {
        return NextResponse.json({ error: 'startup_id, scheduled_date, and start_time are required' }, { status: 400 });
      }
      const computedEnd = end_time || `${String(Math.min(23, Number(start_time.split(':')[0] || 9) + 1)).padStart(2, '0')}:${start_time.split(':')[1] || '00'}`;

      const { data: conflicts } = await supabaseAdmin
        .from('mentorship_sessions')
        .select('id, start_time, end_time')
        .eq('mentor_id', mentor.id)
        .eq('scheduled_date', scheduled_date)
        .not('status', 'in', '("cancelled","declined")');

      const toMin = (t: string) => {
        const [h, m] = String(t || '0:0').split(':');
        return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
      };
      const reqS = toMin(start_time);
      const reqE = toMin(computedEnd);
      if ((conflicts || []).some((c: any) => reqS < toMin(c.end_time) && reqE > toMin(c.start_time))) {
        return NextResponse.json({ error: 'Cannot double-book: overlapping session exists on this slot' }, { status: 409 });
      }

      const mentorDisplayName =
        dbUser?.full_name ||
        [dbUser?.first_name, dbUser?.last_name].filter(Boolean).join(' ').trim() ||
        'Mentor';

      const { data, error } = await supabaseAdmin
        .from('mentorship_sessions')
        .insert({
          organization_id: mentor.organization_id,
          startup_id,
          mentor_id: mentor.id,
          mentor_name: mentorDisplayName,
          session_title: session_title?.trim() || 'Mentorship Session',
          scheduled_date,
          start_time,
          end_time: computedEnd,
          duration_minutes: Math.max(15, reqE - reqS),
          timezone: mentor.timezone || 'Asia/Kolkata',
          meeting_mode: meeting_mode || mentor.preferred_meeting_mode || 'video',
          meeting_link: meeting_link || mentor.calendar_url || '',
          agenda: agenda || '',
          status: 'scheduled',
          created_by: dbUser?.id || null,
        })
        .select()
        .single();
      if (error) {
        if ((error as any).code === '23505') {
          return NextResponse.json({ error: 'Cannot double-book: slot already occupied' }, { status: 409 });
        }
        throw error;
      }
      await logActivity({
        organization_id: mentor.organization_id,
        user_id: dbUser?.id,
        actor_email: dbUser?.email,
        action: 'mentorship_session_created',
        entity_type: 'mentorship_session',
        entity_id: data.id,
        description: `${mentorDisplayName} scheduled "${data.session_title}"`,
        details: { startup_id, scheduled_date, start_time },
      });

      return NextResponse.json({ success: true, data }, { status: 201 });
    }

    if (action === 'submit_feedback') {
      const { session_id, mentor_feedback, action_points, scores } = body;
      if (!session_id) return NextResponse.json({ error: 'session_id is required' }, { status: 400 });

      const { data: existingSess } = await supabaseAdmin
        .from('mentorship_sessions')
        .select('id, organization_id, startup_id, session_title, startup:startups (id, startup_name, founder_id, founder_email)')
        .eq('id', session_id)
        .eq('mentor_id', mentor.id)
        .maybeSingle();

      if (!existingSess) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

      const cleanNote = String(mentor_feedback || '').trim();
      const scoresObj = scores && typeof scores === 'object' ? scores : null;
      const summaryText =
        cleanNote ||
        (scoresObj
          ? `Preparedness: ${scoresObj.preparedness ?? '-'}/5, Clarity: ${scoresObj.clarity ?? '-'}/5, Progress: ${scoresObj.progress ?? '-'}/5`
          : 'Session reviewed.');

      const updates: Record<string, any> = {
        mentor_feedback: summaryText,
        updated_at: nowIso,
      };
      if (Array.isArray(action_points)) {
        updates.action_points = action_points;
      }
      if (scoresObj) {
        updates.mentor_feedback_scores = scoresObj;
      }

      let { data, error } = await supabaseAdmin
        .from('mentorship_sessions')
        .update(updates)
        .eq('id', session_id)
        .eq('mentor_id', mentor.id)
        .select()
        .single();

      if (error && (error as any).code === '42703' && updates.mentor_feedback_scores !== undefined) {
        delete updates.mentor_feedback_scores;
        const retry = await supabaseAdmin
          .from('mentorship_sessions')
          .update(updates)
          .eq('id', session_id)
          .eq('mentor_id', mentor.id)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }
      if (error) throw error;

      const mentorDisplayName =
        dbUser?.full_name ||
        [dbUser?.first_name, dbUser?.last_name].filter(Boolean).join(' ').trim() ||
        dbUser?.email?.split('@')[0] ||
        'Mentor';

      try {
        await supabaseAdmin.from('startup_activity').insert({
          startup_id: existingSess.startup_id,
          author_id: dbUser?.id || null,
          author_name: mentorDisplayName,
          author_role: 'Mentor',
          type: 'mentor_feedback',
          title: `Mentor Feedback · ${existingSess.session_title || 'Mentorship Session'}`,
          body: summaryText,
          scores: scoresObj || {},
        });
      } catch (actErr) {
        console.warn('Could not insert startup_activity mentor_feedback:', actErr);
      }

      try {
        const stRow = Array.isArray(existingSess.startup) ? existingSess.startup[0] : existingSess.startup;
        if (stRow?.founder_id && isValidUUID(stRow.founder_id)) {
          await NotificationService.createNotification({
            organization_id: existingSess.organization_id,
            recipient_id: stRow.founder_id,
            recipient_email: stRow.founder_email || undefined,
            title: `New Mentor Feedback: ${existingSess.session_title || 'Session'}`,
            message: `${mentorDisplayName} submitted session feedback. View feedback and rate your session on the dashboard.`,
            notification_type: 'mentor_feedback',
            send_email: true,
            send_in_app: true,
            related_entity_type: 'mentorship_session',
            related_entity_id: session_id,
          });
        }
      } catch {}

      await logActivity({
        organization_id: existingSess.organization_id,
        user_id: dbUser?.id,
        actor_email: dbUser?.email,
        action: 'mentor_feedback_submitted',
        entity_type: 'mentorship_session',
        entity_id: session_id,
        description: `${mentorDisplayName} submitted feedback for session "${existingSess.session_title || 'Session'}"`,
        details: { startup_id: existingSess.startup_id, scores: scoresObj },
      });

      return NextResponse.json({ success: true, data });
    }

    if (action === 'dismiss_notification') {
      if (body.notification_id && dbUser?.id) {
        await supabaseAdmin
          .from('notifications')
          .update({ is_read: true, read_at: nowIso })
          .eq('id', body.notification_id)
          .eq('recipient_id', dbUser.id);
      } else if (dbUser?.id) {
        await supabaseAdmin
          .from('notifications')
          .update({ is_read: true, read_at: nowIso })
          .eq('recipient_id', dbUser.id)
          .eq('is_read', false);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (err) {
    return handleApiError(err);
  }
}

