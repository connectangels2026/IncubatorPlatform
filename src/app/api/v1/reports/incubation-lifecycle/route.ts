import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

// GET /api/v1/reports/incubation-lifecycle - Cohort tracking & stage progression
export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId } = requireOrg(req);
    const realOrgId = resolveOrg(orgId);

    const { data: startups, error } = await supabaseAdmin
      .from('startups')
      .select('id, name, stage, lifecycle_stage, status, incubation_start_date, incubation_end_date, created_at')
      .eq('organization_id', realOrgId);

    if (error) throw error;

    const all = startups || [];

    // Stage counts
    const lifecycleBreakdown: Record<string, number> = {
      application: 0,
      onboarding: 0,
      active_incubation: 0,
      graduated: 0,
      alumni: 0,
      dropped: 0,
    };

    all.forEach((s) => {
      const stage = (s.lifecycle_stage || s.status || 'active_incubation').toLowerCase();
      if (lifecycleBreakdown[stage] !== undefined) {
        lifecycleBreakdown[stage]++;
      } else {
        lifecycleBreakdown[stage] = 1;
      }
    });

    const graduatedCount = lifecycleBreakdown.graduated || 0;
    const activeCount = (lifecycleBreakdown.active_incubation || 0) + (lifecycleBreakdown.onboarding || 0);
    const graduationRatePct = all.length > 0 ? Number(((graduatedCount / all.length) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_startups_tracked: all.length,
          active_startups: activeCount,
          graduated_startups: graduatedCount,
          graduation_rate_pct: graduationRatePct,
        },
        lifecycle_stages: lifecycleBreakdown,
        startups_timeline: all.map((s) => ({
          id: s.id,
          name: s.name,
          stage: s.stage,
          lifecycle_stage: s.lifecycle_stage || 'active_incubation',
          incubation_start_date: s.incubation_start_date || s.created_at,
          incubation_end_date: s.incubation_end_date || null,
        })),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
