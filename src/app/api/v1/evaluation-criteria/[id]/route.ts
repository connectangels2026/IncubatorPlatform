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
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const role = user?.role?.toLowerCase() || '';
    if (role !== 'admin' && role !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden: Only admins can update evaluation criteria' }, { status: 403 });
    }

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.evaluation_type !== undefined) updates.evaluation_type = body.evaluation_type;
    if (body.scale_labels !== undefined) updates.scale_labels = body.scale_labels;
    if (body.display_order !== undefined) updates.display_order = body.display_order;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    if (body.max_score !== undefined) {
      const maxScore = Number(body.max_score);
      if (maxScore <= 0) return NextResponse.json({ error: 'max_score must be greater than 0' }, { status: 400 });
      updates.max_score = maxScore;
    }

    if (body.weight !== undefined) {
      const weight = Number(body.weight);
      if (weight <= 0) return NextResponse.json({ error: 'weight must be greater than 0' }, { status: 400 });
      updates.weight = weight;
    }

    const { data, error } = await supabaseAdmin
      .from('evaluation_criteria')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Criteria not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: 'Evaluation criteria updated successfully',
      data,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const role = user?.role?.toLowerCase() || '';
    if (role !== 'admin' && role !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden: Only admins can archive evaluation criteria' }, { status: 403 });
    }

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);

    // Soft archive: set is_active = false
    const { data, error } = await supabaseAdmin
      .from('evaluation_criteria')
      .update({ is_active: false })
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Criteria not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: 'Evaluation criteria archived successfully',
      data,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
