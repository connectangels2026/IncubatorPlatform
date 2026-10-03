import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

// GET /api/v1/reports/funding - Funding raised metrics, rounds, and startup breakdowns
export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId } = requireOrg(req);
    const realOrgId = resolveOrg(orgId);

    const { data: startups, error } = await supabaseAdmin
      .from('startups')
      .select('id, name, sector, stage, funding_raised, monthly_revenue, annual_revenue')
      .eq('organization_id', realOrgId)
      .order('funding_raised', { ascending: false });

    if (error) throw error;

    const all = startups || [];
    const fundedStartups = all.filter((s) => Number(s.funding_raised) > 0);
    const totalFundingRaised = all.reduce((sum, s) => sum + (Number(s.funding_raised) || 0), 0);
    const averageFunding = fundedStartups.length > 0 ? Math.round(totalFundingRaised / fundedStartups.length) : 0;

    // Group funding by sector
    const fundingBySector: Record<string, number> = {};
    all.forEach((s) => {
      const sector = s.sector || 'Uncategorized';
      fundingBySector[sector] = (fundingBySector[sector] || 0) + (Number(s.funding_raised) || 0);
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_funding_raised: totalFundingRaised,
          total_startups: all.length,
          startups_with_funding: fundedStartups.length,
          funded_ratio_pct: all.length > 0 ? Number(((fundedStartups.length / all.length) * 100).toFixed(1)) : 0,
          average_funding_per_funded_startup: averageFunding,
        },
        funding_by_sector: Object.entries(fundingBySector).map(([sector, total_amount]) => ({
          sector,
          total_amount,
        })),
        top_funded_startups: fundedStartups.slice(0, 10).map((s) => ({
          id: s.id,
          name: s.name,
          sector: s.sector,
          stage: s.stage,
          funding_raised: Number(s.funding_raised),
        })),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
