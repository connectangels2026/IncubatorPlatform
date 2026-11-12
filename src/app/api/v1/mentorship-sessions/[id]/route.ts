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

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);

    const { data: session, error } = await supabaseAdmin
      .from('mentorship_sessions')
      .select(`
        *,
        mentor:mentors (
          id,
          user:users (id, first_name, last_name, email, phone)
        ),
        startup:startups (id, name, founder_email)
      `)
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: 'Mentorship session not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('mentorship_sessions')
      .select(`
        *,
        mentor:mentors (id, user_id, user:users(id, first_name, last_name, full_name, email)),
        startup:startups (*)
      `)
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Mentorship session not found' }, { status: 404 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.session_title !== undefined) updates.session_title = body.session_title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.meeting_link !== undefined) updates.meeting_link = body.meeting_link;
    if (body.meeting_mode !== undefined) updates.meeting_mode = body.meeting_mode;
    if (body.agenda !== undefined) updates.agenda = body.agenda;
    if (body.status !== undefined) updates.status = body.status;
    if (body.decline_reason !== undefined) updates.decline_reason = body.decline_reason;
    if (body.attended !== undefined) updates.attended = Boolean(body.attended);
    if (body.session_notes !== undefined) updates.session_notes = body.session_notes;
    if (body.action_points !== undefined) updates.action_points = body.action_points;

    // Rescheduling date or time: re-check conflict
    const newDate = body.scheduled_date || existing.scheduled_date;
    const newStart = body.start_time || existing.start_time;
    const newEnd = body.end_time || existing.end_time;
    const isRescheduling = Boolean(body.scheduled_date || body.start_time || body.end_time);

    if (isRescheduling) {
      const newStartMin = timeToMinutes(newStart);
      const newEndMin = timeToMinutes(newEnd);

      if (newStartMin >= newEndMin) {
        return NextResponse.json({ error: 'start_time must be earlier than end_time' }, { status: 400 });
      }

      const { data: conflicts } = await supabaseAdmin
        .from('mentorship_sessions')
        .select('id, start_time, end_time')
        .eq('mentor_id', existing.mentor_id)
        .eq('scheduled_date', newDate)
        .neq('id', id)
        .not('status', 'in', '("cancelled","declined")');

      const hasConflict = (conflicts || []).some((s) => {
        const sStartMin = timeToMinutes(s.start_time);
        const sEndMin = timeToMinutes(s.end_time);
        return newStartMin < sEndMin && newEndMin > sStartMin;
      });

      if (hasConflict) {
        return NextResponse.json(
          { error: 'Cannot reschedule: Overlapping session exists for mentor on this date/time' },
          { status: 409 }
        );
      }

      updates.scheduled_date = newDate;
      updates.start_time = newStart;
      updates.end_time = newEnd;
      updates.duration_minutes = Math.max(0, newEndMin - newStartMin);
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('mentorship_sessions')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (updateErr) {
      if ((updateErr as any).code === '23505') {
        return NextResponse.json(
          { error: 'Cannot reschedule: This mentor slot is already booked' },
          { status: 409 }
        );
      }
      throw updateErr;
    }

    // Notify counterparty on status change or reschedule
    try {
      const { user: caller } = await verifyAuth(req);
      const mentorUser = Array.isArray(existing.mentor?.user) ? existing.mentor.user[0] : existing.mentor?.user;
      const startupRow = existing.startup;
      const isMentorActor = caller?.id && mentorUser?.id && caller.id === mentorUser.id;
      const statusChanged = Boolean(body.status && body.status !== existing.status);

      if (isRescheduling || statusChanged) {
        const startupName = startupRow?.startup_name || startupRow?.name || 'Startup';
        const mentorName =
          mentorUser?.full_name ||
          [mentorUser?.first_name, mentorUser?.last_name].filter(Boolean).join(' ').trim() ||
          'Mentor';
        const title = statusChanged
          ? `Session ${updates.status}: ${existing.session_title}`
          : `Session Rescheduled: ${existing.session_title}`;
        const message = isMentorActor
          ? `${mentorName} updated session "${existing.session_title}" to ${updates.status || 'rescheduled'} (${newDate} ${String(newStart).slice(0, 5)}).`
          : `${startupName} updated session "${existing.session_title}" (${updates.status || `moved to ${newDate} ${String(newStart).slice(0, 5)}`}).`;

        const targetId = isMentorActor ? startupRow?.founder_id : mentorUser?.id;
        const targetEmail = isMentorActor ? startupRow?.founder_email : mentorUser?.email;
        if (targetId && isValidUUID(targetId)) {
          await NotificationService.createNotification({
            organization_id: existing.organization_id,
            recipient_id: targetId,
            recipient_email: targetEmail || undefined,
            title,
            message,
            notification_type: 'mentorship_booking',
            send_email: true,
            send_in_app: true,
            related_entity_type: 'mentorship_session',
            related_entity_id: id,
          });
        }
      }
    } catch (nErr) {
      console.warn('Session update notification skipped:', nErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Mentorship session updated successfully',
      data: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { user: caller, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { id } = await params;

    const { data: existing } = await supabaseAdmin
      .from('mentorship_sessions')
      .select(`
        *,
        mentor:mentors (id, user_id, user:users(id, email)),
        startup:startups (*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (!existing) return NextResponse.json({ error: 'Mentorship session not found' }, { status: 404 });

    const { data: session, error } = await supabaseAdmin
      .from('mentorship_sessions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    try {
      const mentorUser = Array.isArray(existing.mentor?.user) ? existing.mentor.user[0] : existing.mentor?.user;
      const isMentorActor = caller?.id && mentorUser?.id && caller.id === mentorUser.id;
      const targetId = isMentorActor ? existing.startup?.founder_id : mentorUser?.id;
      const targetEmail = isMentorActor ? existing.startup?.founder_email : mentorUser?.email;
      if (targetId && isValidUUID(targetId)) {
        await NotificationService.createNotification({
          organization_id: existing.organization_id,
          recipient_id: targetId,
          recipient_email: targetEmail || undefined,
          title: `Session Cancelled: ${existing.session_title}`,
          message: `The mentorship session on ${existing.scheduled_date} (${String(existing.start_time || '').slice(0, 5)}) was cancelled.`,
          notification_type: 'mentorship_booking',
          send_email: true,
          send_in_app: true,
          related_entity_type: 'mentorship_session',
          related_entity_id: id,
        });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Mentorship session cancelled successfully',
      data: session,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
