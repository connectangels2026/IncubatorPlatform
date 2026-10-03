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

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id: startupId } = await params;
    const realOrgId = resolveOrg(orgId);
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format')?.toLowerCase();

    // 1. Fetch startup
    const { data: startup, error: startupErr } = await supabaseAdmin
      .from('startups')
      .select('id, name, sector, stage, founder_email, monthly_revenue, customer_count, team_size')
      .eq('id', startupId)
      .eq('organization_id', realOrgId)
      .single();

    if (startupErr || !startup) {
      return NextResponse.json({ error: 'Startup not found for this organization' }, { status: 404 });
    }

    // 2. Fetch all reviews sorted chronologically
    const { data: reviews, error: reviewErr } = await supabaseAdmin
      .from('startup_reviews')
      .select('*')
      .eq('startup_id', startupId)
      .eq('organization_id', realOrgId)
      .order('review_period_start', { ascending: true });

    if (reviewErr) throw reviewErr;

    const reviewList = reviews || [];

    // 3. Trend analysis (metrics over time)
    const trends = reviewList.map((r) => ({
      review_id: r.id,
      period_start: r.review_period_start,
      period_end: r.review_period_end,
      review_type: r.review_type,
      revenue: Number(r.revenue) || 0,
      customer_count: Number(r.customer_count) || 0,
      team_size: Number(r.team_size) || 1,
      product_status: r.product_status || 'N/A',
      performance_score: r.overall_score || 0,
      performance_rating: r.performance_rating || 'N/A',
      status: r.review_status,
    }));

    // 4. Calculate KPI changes (comparing latest with previous review)
    let kpiChanges = {
      revenue_growth_pct: null as number | null,
      customer_growth_pct: null as number | null,
      team_size_change: 0,
      previous_revenue: 0,
      current_revenue: 0,
      previous_customers: 0,
      current_customers: 0,
    };

    if (reviewList.length >= 2) {
      const latest = reviewList[reviewList.length - 1];
      const previous = reviewList[reviewList.length - 2];

      const curRev = Number(latest.revenue) || 0;
      const prevRev = Number(previous.revenue) || 0;
      const curCust = Number(latest.customer_count) || 0;
      const prevCust = Number(previous.customer_count) || 0;
      const curTeam = Number(latest.team_size) || 1;
      const prevTeam = Number(previous.team_size) || 1;

      kpiChanges = {
        revenue_growth_pct: prevRev > 0 ? Math.round(((curRev - prevRev) / prevRev) * 1000) / 10 : null,
        customer_growth_pct: prevCust > 0 ? Math.round(((curCust - prevCust) / prevCust) * 1000) / 10 : null,
        team_size_change: curTeam - prevTeam,
        previous_revenue: prevRev,
        current_revenue: curRev,
        previous_customers: prevCust,
        current_customers: curCust,
      };
    } else if (reviewList.length === 1) {
      const latest = reviewList[0];
      kpiChanges.current_revenue = Number(latest.revenue) || 0;
      kpiChanges.current_customers = Number(latest.customer_count) || 0;
    }

    const latestReview = reviewList.length > 0 ? reviewList[reviewList.length - 1] : null;

    // 5. PDF generation mode
    if (format === 'pdf') {
      const pdfReport = {
        document_title: `Startup Progress Report: ${startup.name}`,
        generated_at: new Date().toISOString(),
        startup_name: startup.name,
        sector: startup.sector,
        stage: startup.stage,
        metrics_summary: {
          current_monthly_revenue: kpiChanges.current_revenue,
          customer_count: kpiChanges.current_customers,
          revenue_growth_pct: kpiChanges.revenue_growth_pct,
          customer_growth_pct: kpiChanges.customer_growth_pct,
        },
        latest_rating: latestReview?.performance_rating || 'N/A',
        action_plan: latestReview?.action_plan || 'Continue executing core milestones.',
        improvement_areas: latestReview?.improvement_areas || [],
        timeline_trends: trends,
      };

      return NextResponse.json({
        success: true,
        report_type: 'pdf',
        download_url: `/api/v1/startups/${startupId}/progress?format=pdf`,
        pdf_content: pdfReport,
      });
    }

    return NextResponse.json({
      success: true,
      startup_id: startupId,
      startup_name: startup.name,
      stage: startup.stage,
      total_reviews_conducted: reviewList.length,
      current_performance_rating: latestReview?.performance_rating || 'Pending Initial Review',
      kpi_changes: kpiChanges,
      latest_review: latestReview
        ? {
            id: latestReview.id,
            period: `${latestReview.review_period_start} to ${latestReview.review_period_end}`,
            product_status: latestReview.product_status,
            milestones_achieved: latestReview.milestones_achieved,
            improvement_areas: latestReview.improvement_areas,
            action_plan: latestReview.action_plan,
            assessor_comments: latestReview.assessor_comments,
            is_locked: latestReview.review_status === 'submitted',
          }
        : null,
      trend_analysis: trends,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
