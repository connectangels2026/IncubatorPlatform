import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { calculatePerformanceRating } from '../route';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);

    const { data: review, error } = await supabaseAdmin
      .from('startup_reviews')
      .select(`
        *,
        startup:startups (id, name, sector, stage, founder_email)
      `)
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .single();

    if (error || !review) {
      return NextResponse.json({ error: 'Startup review not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    // 1. Fetch current review
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('startup_reviews')
      .select('*')
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Startup review not found' }, { status: 404 });
    }

    // 2. Lock Check: Review locked after submission
    if (existing.review_status === 'submitted') {
      return NextResponse.json(
        { error: 'Review is locked and cannot be edited after final submission' },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.review_type !== undefined) updates.review_type = body.review_type;
    if (body.review_period_start !== undefined) updates.review_period_start = body.review_period_start;
    if (body.review_period_end !== undefined) updates.review_period_end = body.review_period_end;
    if (body.product_status !== undefined) updates.product_status = body.product_status;
    if (body.assessor_comments !== undefined) updates.assessor_comments = body.assessor_comments;
    if (body.action_plan !== undefined) updates.action_plan = body.action_plan;
    if (body.milestones_achieved !== undefined) updates.milestones_achieved = body.milestones_achieved;
    if (body.milestones_pending !== undefined) updates.milestones_pending = body.milestones_pending;
    if (body.improvement_areas !== undefined) updates.improvement_areas = body.improvement_areas;

    const newRevenue = body.revenue !== undefined ? Number(body.revenue) : existing.revenue || 0;
    const newCustomers = body.customer_count !== undefined ? Number(body.customer_count) : existing.customer_count || 0;
    const newTeamSize = body.team_size !== undefined ? Number(body.team_size) : existing.team_size || 1;
    const newMilestonesCount = body.milestones_achieved ? body.milestones_achieved.length : (existing.milestones_achieved?.length || 0);

    updates.revenue = newRevenue;
    updates.customer_count = newCustomers;
    updates.team_size = newTeamSize;

    // Recalculate rating
    const { rating, score } = calculatePerformanceRating(newRevenue, newCustomers, newMilestonesCount);
    updates.performance_rating = rating;
    updates.overall_score = score;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('startup_reviews')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        startup:startups (id, name, sector)
      `)
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: 'Startup review updated successfully',
      data: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);

    const { data: existing } = await supabaseAdmin
      .from('startup_reviews')
      .select('review_status')
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .single();

    if (!existing) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    if (existing.review_status === 'submitted') {
      return NextResponse.json({ error: 'Cannot delete a finalized and locked review' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('startup_reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Draft review deleted successfully',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
