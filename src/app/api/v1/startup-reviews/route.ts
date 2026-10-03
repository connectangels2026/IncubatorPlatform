import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

export function calculatePerformanceRating(revenue: number, customerCount: number, milestonesAchievedCount: number): { rating: string; score: number } {
  let score = 50; // base score
  if (revenue > 50000) score += 20;
  else if (revenue > 10000) score += 10;

  if (customerCount > 100) score += 15;
  else if (customerCount > 20) score += 10;

  if (milestonesAchievedCount >= 3) score += 15;
  else if (milestonesAchievedCount >= 1) score += 10;

  score = Math.min(100, Math.max(0, score));

  let rating = 'On Track';
  if (score >= 85) rating = 'Exceeding Expectations';
  else if (score >= 70) rating = 'On Track';
  else if (score >= 50) rating = 'Needs Attention';
  else rating = 'Critical Support Needed';

  return { rating, score };
}

export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const searchParams = req.nextUrl.searchParams;
    const startupId = searchParams.get('startup_id');
    const reviewType = searchParams.get('review_type');
    const reviewStatus = searchParams.get('review_status');

    let query = supabaseAdmin
      .from('startup_reviews')
      .select(`
        *,
        startup:startups (id, name, sector, stage)
      `)
      .eq('organization_id', realOrgId)
      .order('review_period_start', { ascending: false });

    if (startupId) query = query.eq('startup_id', startupId);
    if (reviewType) query = query.eq('review_type', reviewType);
    if (reviewStatus) query = query.eq('review_status', reviewStatus);

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
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    const {
      startup_id,
      review_type = 'monthly',
      review_period_start,
      review_period_end,
      revenue = 0,
      customer_count = 0,
      team_size = 1,
      product_status = 'MVP',
      milestones_achieved = [],
      milestones_pending = [],
      improvement_areas = [],
      action_plan = '',
      assessor_comments = '',
    } = body;

    if (!startup_id || !review_period_start || !review_period_end) {
      return NextResponse.json(
        { error: 'Validation Error: startup_id, review_period_start, and review_period_end are required' },
        { status: 400 }
      );
    }

    // Verify startup exists in org
    const { data: startup, error: startupErr } = await supabaseAdmin
      .from('startups')
      .select('id, name')
      .eq('id', startup_id)
      .eq('organization_id', realOrgId)
      .single();

    if (startupErr || !startup) {
      return NextResponse.json({ error: 'Startup not found for this organization' }, { status: 404 });
    }

    const { rating, score } = calculatePerformanceRating(
      Number(revenue),
      Number(customer_count),
      Array.isArray(milestones_achieved) ? milestones_achieved.length : 0
    );

    const payload = {
      organization_id: realOrgId,
      startup_id,
      review_type,
      review_period_start,
      review_period_end,
      revenue: Number(revenue),
      customer_count: Number(customer_count),
      team_size: Number(team_size),
      product_status,
      milestones_achieved: Array.isArray(milestones_achieved) ? milestones_achieved : [milestones_achieved],
      milestones_pending: Array.isArray(milestones_pending) ? milestones_pending : [milestones_pending],
      improvement_areas: Array.isArray(improvement_areas) ? improvement_areas : [improvement_areas],
      action_plan,
      assessor_comments,
      overall_score: score,
      performance_rating: rating,
      review_status: 'draft',
      reviewed_by: user?.id && isValidUUID(user.id) ? user.id : null,
    };

    const { data: review, error: insertErr } = await supabaseAdmin
      .from('startup_reviews')
      .insert(payload)
      .select(`
        *,
        startup:startups (id, name, sector)
      `)
      .single();

    if (insertErr) throw insertErr;

    return NextResponse.json({
      success: true,
      message: 'Startup progress review created in draft',
      data: review,
    }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
