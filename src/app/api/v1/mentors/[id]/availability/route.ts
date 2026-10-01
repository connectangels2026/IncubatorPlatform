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

async function getMentorAndSessionCount(mentorId: string, orgId: string) {
  const { data: mentor, error: mentorError } = await supabaseAdmin
    .from('mentors')
    .select('id, user_id, organization_id, availability_json, availability_hours_per_month, is_available')
    .eq('id', mentorId)
    .eq('organization_id', orgId)
    .single();

  if (mentorError || !mentor) return { mentor: null, bookedCount: 0 };

  // Calculate sessions booked for current month
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count } = await supabaseAdmin
    .from('mentorship_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('mentor_id', mentorId)
    .neq('status', 'cancelled')
    .gte('scheduled_at', startOfMonth);

  return { mentor, bookedCount: count || 0 };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);

    const { mentor, bookedCount } = await getMentorAndSessionCount(id, realOrgId);
    if (!mentor) return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });

    const capacity = mentor.availability_hours_per_month ?? 10;
    const remaining = Math.max(0, capacity - bookedCount);
    const canAccept = mentor.is_available && remaining > 0;

    return NextResponse.json({
      success: true,
      mentor_id: mentor.id,
      is_available: mentor.is_available,
      availability_per_day: mentor.availability_json || {},
      monthly_capacity_hours: capacity,
      sessions_booked_this_month: bookedCount,
      hours_remaining: remaining,
      can_accept_more_sessions: canAccept,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  return handleSetAvailability(req, params);
}

export async function PUT(req: NextRequest, { params }: Params) {
  return handleSetAvailability(req, params);
}

async function handleSetAvailability(req: NextRequest, params: Promise<{ id: string }>) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    const { mentor, bookedCount } = await getMentorAndSessionCount(id, realOrgId);
    if (!mentor) return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });

    // Ensure permissions: mentor themselves or admin
    const role = user?.role?.toLowerCase() || '';
    const isAdmin = role === 'admin' || role === 'super-admin';
    if (!isAdmin && user?.id !== mentor.user_id) {
      return NextResponse.json({ error: 'Forbidden: You can only update your own availability' }, { status: 403 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.hours_per_month !== undefined || body.availability_hours_per_month !== undefined) {
      const newHours = Number(body.hours_per_month ?? body.availability_hours_per_month);
      if (newHours < 0) {
        return NextResponse.json({ error: 'Availability hours must be non-negative' }, { status: 400 });
      }
      // Acceptance criteria check: cannot assign less capacity than already booked sessions
      if (newHours < bookedCount) {
        return NextResponse.json(
          {
            error: `Cannot reduce availability below already booked sessions (${bookedCount} sessions booked this month)`,
            sessions_booked: bookedCount,
          },
          { status: 400 }
        );
      }
      updates.availability_hours_per_month = newHours;
    }

    // Availability per day of week e.g. { monday: ["09:00-12:00"], tuesday: ["14:00-16:00"] }
    if (body.days !== undefined || body.availability_json !== undefined || body.schedule !== undefined) {
      updates.availability_json = body.days ?? body.availability_json ?? body.schedule;
    }

    if (body.is_available !== undefined) {
      updates.is_available = Boolean(body.is_available);
    }

    const { data: updatedMentor, error: updateError } = await supabaseAdmin
      .from('mentors')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .select()
      .single();

    if (updateError) throw updateError;

    const capacity = updatedMentor.availability_hours_per_month ?? 10;
    const remaining = Math.max(0, capacity - bookedCount);

    return NextResponse.json({
      success: true,
      message: 'Mentor availability updated successfully',
      data: {
        mentor_id: updatedMentor.id,
        is_available: updatedMentor.is_available,
        availability_per_day: updatedMentor.availability_json,
        monthly_capacity_hours: capacity,
        sessions_booked_this_month: bookedCount,
        hours_remaining: remaining,
        can_accept_more_sessions: updatedMentor.is_available && remaining > 0,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
