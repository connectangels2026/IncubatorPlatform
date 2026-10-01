import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

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
      .select('*')
      .eq('id', id)
      .eq('organization_id', realOrgId)
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
    if (body.session_notes !== undefined) updates.session_notes = body.session_notes;
    if (body.action_points !== undefined) updates.action_points = body.action_points;

    // Rescheduling date or time: re-check conflict
    const newDate = body.scheduled_date || existing.scheduled_date;
    const newStart = body.start_time || existing.start_time;
    const newEnd = body.end_time || existing.end_time;

    if (body.scheduled_date || body.start_time || body.end_time) {
      if (newStart >= newEnd) {
        return NextResponse.json({ error: 'start_time must be earlier than end_time' }, { status: 400 });
      }

      const { data: conflicts } = await supabaseAdmin
        .from('mentorship_sessions')
        .select('id, start_time, end_time')
        .eq('mentor_id', existing.mentor_id)
        .eq('scheduled_date', newDate)
        .neq('id', id)
        .neq('status', 'cancelled');

      const hasConflict = (conflicts || []).some((s) => newStart < s.end_time && newEnd > s.start_time);
      if (hasConflict) {
        return NextResponse.json(
          { error: 'Cannot reschedule: Overlapping session exists for mentor on this date/time' },
          { status: 409 }
        );
      }

      updates.scheduled_date = newDate;
      updates.start_time = newStart;
      updates.end_time = newEnd;
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('mentorship_sessions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        mentor:mentors (
          id,
          user:users (first_name, last_name, email)
        ),
        startup:startups (id, name, founder_email)
      `)
      .single();

    if (updateErr) throw updateErr;

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
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);

    // Cancel session (sets status = 'cancelled')
    const { data: session, error } = await supabaseAdmin
      .from('mentorship_sessions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .select()
      .single();

    if (error) throw error;
    if (!session) return NextResponse.json({ error: 'Mentorship session not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: 'Mentorship session cancelled successfully',
      data: session,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
