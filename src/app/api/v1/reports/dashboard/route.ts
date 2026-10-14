import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { verifyAuth } from '@/backend/middleware/auth';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

// GET /api/v1/reports/dashboard - Real-time KPI summaries, applications, and startups
export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    // Resolve tenant organization ID from header, query param, or authenticated user
    const headerOrgId = req.headers.get('x-org-id');
    const paramOrgId = req.nextUrl.searchParams.get('org_id');
    let realOrgId = headerOrgId || paramOrgId;

    if (!realOrgId || !isValidUUID(realOrgId)) {
      if (user?.organization_id && isValidUUID(user.organization_id)) {
        realOrgId = user.organization_id;
      } else if (user?.id) {
        // Query organization by auth_user_id
        const { data: userOrg } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        if (userOrg?.id) {
          realOrgId = userOrg.id;
        }
      }
    }

    if (!realOrgId || !isValidUUID(realOrgId)) {
      realOrgId = DEFAULT_ORG_ID;
    }

    // 1. Fetch organization details
    const { data: orgData } = await supabaseAdmin
      .from('organizations')
      .select('id, name, slug, founder_name, founder_email, logo_url')
      .eq('id', realOrgId)
      .maybeSingle();

    // 2. Fetch startups for this organization
    const { data: startups, error: stError } = await supabaseAdmin
      .from('startups')
      .select('*')
      .eq('organization_id', realOrgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (stError) throw stError;

    // 3. Fetch applications for this organization
    const { data: applications, error: appError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('organization_id', realOrgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (appError) throw appError;

    const allStartups = startups || [];
    const allApps = applications || [];

    const totalStartups = allStartups.length;
    const totalFunding = allStartups.reduce((acc, s) => acc + (Number(s.funding_raised) || 0), 0);
    const totalJobs = allStartups.reduce((acc, s) => acc + (Number(s.team_size) || 1), 0);
    const totalApplications = allApps.length;

    const activeStartups = allStartups.filter((s) => s.status === 'active' || s.lifecycle_stage === 'incubation').length;
    const inactiveStartups = allStartups.filter((s) => s.status === 'inactive').length;
    const exitedStartups = allStartups.filter((s) => s.status === 'graduated' || s.status === 'exited').length;
    const pendingEvaluation = allApps.filter((a) => a.status === 'submitted' || a.status === 'under_review').length;

    // Format applications for dashboard
    const mappedApplications = allApps.map((app) => ({
      id: app.id,
      name: app.form_data?.startupName || app.form_data?.startup_name || 'Startup',
      founder_name: app.applicant_name || app.form_data?.applicantName || 'Founder',
      sector: app.form_data?.industry || app.form_data?.sector || 'General',
      type: app.application_type || 'Incubator',
      score: app.score ? Number(app.score) : 0,
      status: app.status || 'submitted',
      date: new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      email: app.applicant_email,
      phone: app.applicant_phone || app.form_data?.applicantPhone,
      form_data: app.form_data,
    }));

    // Format startups for dashboard
    const mappedStartups = allStartups.map((s) => ({
      id: s.id,
      name: s.name,
      founder_name: s.founder_name || s.founder_email?.split('@')[0] || orgData?.founder_name || 'Founder',
      email: s.founder_email || '',
      sector: s.sector || 'General',
      stage: s.stage || 'Idea',
      status: s.status || 'active',
      revenue: Number(s.monthly_revenue || s.annual_revenue) || 0,
      funding_raised: Number(s.funding_raised) || 0,
      team_size: Number(s.team_size) || 1,
      date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      created_at: s.created_at,
    }));

    // Format pending decisions
    const mappedPending = allApps
      .filter((a) => a.status === 'submitted' || a.status === 'under_review')
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        name: a.form_data?.startupName || a.form_data?.startup_name || a.applicant_name,
        score: a.score ? Number(a.score) : 0,
        type: a.application_type || 'Incubator',
        recommendation: a.status === 'under_review' ? 'In Review - Needs Interview / Decision' : 'New Submission - Review Required',
      }));

    // Sector & stage distribution
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
        organization: orgData,
        summary: {
          total_startups: totalStartups,
          total_applications: totalApplications,
          active_startups: activeStartups,
          inactive_startups: inactiveStartups,
          exited_startups: exitedStartups,
          total_funding_raised: totalFunding,
          total_jobs_created: totalJobs,
          pending_evaluation: pendingEvaluation,
        },
        metrics: {
          totalStartups: totalStartups,
          totalStartupsGrowth: '+0%',
          applicationsReceived: totalApplications,
          applicationsGrowth: '+0%',
          pendingEvaluation: pendingEvaluation,
          activeStartups: activeStartups,
          inactiveStartups: inactiveStartups,
          exitedStartups: exitedStartups,
          fundingRaised: totalFunding > 0 ? `$${(totalFunding / 1000000).toFixed(1)}M` : '$0',
          fundingGrowth: '+$0',
          jobsCreated: `${totalJobs}`,
          jobsGrowth: '+0 this mo',
        },
        applications: mappedApplications,
        startups: mappedStartups,
        pendingDecisions: mappedPending,
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

