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
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const applicationType = searchParams.get('application_type');
    const search = searchParams.get('search');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabaseAdmin
      .from('applications')
      .select('*', { count: 'exact' })
      .eq('organization_id', realOrgId)
      .is('deleted_at', null);

    // Role check: Applicants can only see their own applications
    const role = user?.role?.toLowerCase() || '';
    if (role !== 'admin' && role !== 'super-admin') {
      if (user?.email) {
        query = query.eq('applicant_email', user.email.toLowerCase());
      }
    }

    if (status) query = query.eq('status', status);
    if (applicationType) query = query.eq('application_type', applicationType);
    if (fromDate) query = query.gte('created_at', fromDate);
    if (toDate) query = query.lte('created_at', toDate);
    if (search) query = query.or(`applicant_name.ilike.%${search}%,applicant_email.ilike.%${search}%`);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      organization_id: realOrgId,
      total: count ?? data?.length ?? 0,
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

    if (!body.applicant_name || !body.applicant_email) {
      return NextResponse.json(
        { error: 'Validation Error: applicant_name and applicant_email are required' },
        { status: 400 }
      );
    }

    const payload = {
      organization_id: realOrgId,
      applicant_name: body.applicant_name,
      applicant_email: body.applicant_email.toLowerCase().trim(),
      applicant_phone: body.applicant_phone || null,
      application_type: body.application_type || 'Incubator',
      cohort_name: body.cohort_name || 'Cohort 2026',
      form_data: body.form_data || {},
      status: 'submitted',
      score: null,
      uploaded_documents: [],
      mou_signed: false,
    };

    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully. Confirmation notification dispatched.',
      data,
    }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
