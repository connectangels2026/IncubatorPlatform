import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

// GET /api/v1/reports/dashboard - High level KPI summaries & chart datasets
export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId } = requireOrg(req);
    const realOrgId = resolveOrg(orgId);

    // Fetch startups metrics
    const { data: startups, error: stError } = await supabaseAdmin
      .from('startups')
      .select('id, sector, stage, funding_raised, team_size, status, lifecycle_stage, created_at')
      .eq('organization_id', realOrgId);

    if (stError) throw stError;

    // Fetch applications count
    const { data: applications, error: appError } = await supabaseAdmin
      .from('applications')
      .select('id, status, created_at')
      .eq('organization_id', realOrgId);

    if (appError) throw appError;

    const allStartups = startups || [];
    const allApps = applications || [];

    const totalStartups = allStartups.length;
    const totalFunding = allStartups.reduce((acc, s) => acc + (Number(s.funding_raised) || 0), 0);
    const totalJobs = allStartups.reduce((acc, s) => acc + (Number(s.team_size) || 1), 0);
    const totalApplications = allApps.length;

    // Sector breakdown
    const sectorMap: Record<string, number> = {};
    const stageMap: Record<string, number> = {};
    allStartups.forEach((s) => {
      const sector = s.sector || 'Uncategorized';
      sectorMap[sector] = (sectorMap[sector] || 0) + 1;
      const stage = s.stage || 'Unknown';
      stageMap[stage] = (stageMap[stage] || 0) + 1;
    });

    const sectorDistribution = Object.entries(sectorMap).map(([sector, count]) => ({ sector, count }));
    const stageBreakdown = Object.entries(stageMap).map(([stage, count]) => ({ stage, count }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_startups: totalStartups,
          total_applications: totalApplications,
          total_funding_raised: totalFunding,
          total_jobs_created: totalJobs,
        },
        charts: {
          sector_distribution: sectorDistribution,
          stage_breakdown: stageBreakdown,
        },
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
