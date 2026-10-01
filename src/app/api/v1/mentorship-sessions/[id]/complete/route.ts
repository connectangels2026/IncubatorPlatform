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

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    const { attended, session_notes, action_points } = body;

    const formattedActionPoints = Array.isArray(action_points)
      ? action_points
      : action_points
      ? [action_points]
      : [];

    const { data: updatedSession, error } = await supabaseAdmin
      .from('mentorship_sessions')
      .update({
        status: 'completed',
        attended: attended !== undefined ? Boolean(attended) : true,
        session_notes: session_notes || null,
        action_points: formattedActionPoints,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .select(`
        *,
        mentor:mentors (
          id,
          user:users (first_name, last_name, email)
        ),
        startup:startups (id, name)
      `)
      .single();

    if (error) throw error;
    if (!updatedSession) return NextResponse.json({ error: 'Mentorship session not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: 'Mentorship session marked as completed',
      data: updatedSession,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
