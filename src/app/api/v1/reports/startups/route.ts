import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

// GET /api/v1/reports/startups - Startups directory report with filters & pagination
export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId } = requireOrg(req);
    const realOrgId = resolveOrg(orgId);

    const { searchParams } = new URL(req.url);
    const sector = searchParams.get('sector');
    const stage = searchParams.get('stage');
    const status = searchParams.get('status');
    const lifecycleStage = searchParams.get('lifecycle_stage');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('startups')
      .select('*', { count: 'exact' })
      .eq('organization_id', realOrgId)
      .order('created_at', { ascending: false });

    if (sector) query = query.eq('sector', sector);
    if (stage) query = query.eq('stage', stage);
    if (status) query = query.eq('status', status);
    if (lifecycleStage) query = query.eq('lifecycle_stage', lifecycleStage);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const startups = data || [];
    const totalCount = count || 0;

    const totalFunding = startups.reduce((acc: number, s: any) => acc + (Number(s.funding_raised) || 0), 0);
    const totalJobs = startups.reduce((acc: number, s: any) => acc + (Number(s.team_size) || 1), 0);

    return NextResponse.json({
      success: true,
      pagination: {
        page,
        limit,
        total_records: totalCount,
        total_pages: Math.ceil(totalCount / limit),
      },
      summary: {
        matching_startups: totalCount,
        total_funding_sample: totalFunding,
        total_jobs_sample: totalJobs,
      },
      data: startups,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
