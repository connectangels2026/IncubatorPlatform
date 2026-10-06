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

    const rawType = (body.type || body.mentor_type || '').toLowerCase();
    const resolvedType = rawType === 'sme' || rawType === 'subject_matter_expert'
      ? 'subject_matter_expert'
      : 'general';

    const updates: Record<string, any> = {
      mentor_type: resolvedType,
      updated_at: new Date().toISOString(),
    };

    if (body.primary_expertise !== undefined) updates.primary_expertise = body.primary_expertise;
    if (body.specialization_details !== undefined) updates.specialization_details = body.specialization_details;

    const { data: updatedMentor, error: updateError } = await supabaseAdmin
      .from('mentors')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: `Mentor type updated to ${resolvedType}`,
      data: updatedMentor,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
