import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { calculatePerformanceRating } from '../../route';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);

    // 1. Fetch review
    const { data: review, error: fetchErr } = await supabaseAdmin
      .from('startup_reviews')
      .select('*')
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .single();

    if (fetchErr || !review) {
      return NextResponse.json({ error: 'Startup review not found' }, { status: 404 });
    }

    if (review.review_status === 'submitted') {
      return NextResponse.json(
        { error: 'Review has already been submitted and locked' },
        { status: 400 }
      );
    }

    // 2. Finalize rating & score calculation
    const revenue = Number(review.revenue) || 0;
    const customerCount = Number(review.customer_count) || 0;
    const milestonesCount = Array.isArray(review.milestones_achieved) ? review.milestones_achieved.length : 0;
    const { rating, score } = calculatePerformanceRating(revenue, customerCount, milestonesCount);

    // 3. Lock review
    const { data: finalized, error: updateErr } = await supabaseAdmin
      .from('startup_reviews')
      .update({
        review_status: 'submitted',
        performance_rating: rating,
        overall_score: score,
        reviewed_by: user?.id && isValidUUID(user.id) ? user.id : review.reviewed_by,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        startup:startups (id, name, sector, stage)
      `)
      .single();

    if (updateErr) throw updateErr;

    // 4. Synchronize startup's primary metrics
    if (review.startup_id && isValidUUID(review.startup_id)) {
      await supabaseAdmin
        .from('startups')
        .update({
          monthly_revenue: revenue,
          annual_revenue: revenue * 12,
          customer_count: customerCount,
          team_size: review.team_size || 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', review.startup_id);
    }

    return NextResponse.json({
      success: true,
      message: 'Startup progress review finalized and locked',
      is_locked: true,
      data: finalized,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
