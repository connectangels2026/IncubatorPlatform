import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const searchParams = req.nextUrl.searchParams;
    const applicationType = searchParams.get('application_type');

    let query = supabaseAdmin
      .from('evaluation_criteria')
      .select('*')
      .eq('organization_id', realOrgId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (applicationType) {
      query = query.eq('application_type', applicationType);
    }

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

    // Only admins can create scoring criteria
    const role = user?.role?.toLowerCase() || '';
    if (role !== 'admin' && role !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden: Only admins can create evaluation criteria' }, { status: 403 });
    }

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Validation Error: name is required' }, { status: 400 });
    }

    const maxScore = body.max_score !== undefined ? Number(body.max_score) : 100;
    const weight = body.weight !== undefined ? Number(body.weight) : 1;

    if (maxScore <= 0) {
      return NextResponse.json({ error: 'max_score must be greater than 0' }, { status: 400 });
    }
    if (weight <= 0) {
      return NextResponse.json({ error: 'weight must be greater than 0' }, { status: 400 });
    }

    const payload = {
      organization_id: realOrgId,
      name: body.name,
      description: body.description || null,
      max_score: maxScore,
      weight: weight,
      evaluation_type: body.evaluation_type || 'numeric',
      scale_labels: body.scale_labels || null,
      application_type: body.application_type || 'Incubator',
      display_order: body.display_order || 0,
      is_active: true,
    };

    const { data, error } = await supabaseAdmin
      .from('evaluation_criteria')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Evaluation criteria created successfully',
      data,
    }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
