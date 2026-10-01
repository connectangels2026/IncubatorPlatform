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
      .select('id, session_title, scheduled_date, status, action_points, session_notes')
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: 'Mentorship session not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      session_id: session.id,
      session_title: session.session_title,
      scheduled_date: session.scheduled_date,
      status: session.status,
      total_action_points: (session.action_points || []).length,
      action_points: session.action_points || [],
      session_notes: session.session_notes,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
