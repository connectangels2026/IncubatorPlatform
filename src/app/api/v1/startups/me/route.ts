import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized: User email required' }, { status: 401 });
    }

    const emailLower = user.email.trim().toLowerCase();

    // 1. Fetch startup record linked to this founder
    let { data: startup, error: stErr } = await supabaseAdmin
      .from('startups')
      .select('*')
      .ilike('founder_email', emailLower)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2. If no startup record found, check if user has an accepted application with dashboard assigned
    let linkedApp: any = null;

    if (!startup) {
      const { data: acceptedApp } = await supabaseAdmin
        .from('applications')
        .select('*')
        .ilike('applicant_email', emailLower)
        .or('admission_status.eq.dashboard_assigned,status.eq.admitted,status.eq.accepted')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const isDashboardAssigned =
        acceptedApp?.admission_status === 'dashboard_assigned' ||
        acceptedApp?.form_data?.dashboard_access_granted === true;

      if (!acceptedApp || !isDashboardAssigned) {
        return NextResponse.json(
          {
            success: false,
            has_assigned_dashboard: false,
            message: 'No dashboard has been assigned to your startup application yet.',
          },
          { status: 403 }
        );
      }

      linkedApp = acceptedApp;

      // Auto-provision startup row for this assigned application
      const startupName =
        acceptedApp.form_data?.startup_name ||
        acceptedApp.form_data?.businessName ||
        acceptedApp.applicant_name ||
        'My Startup';

      const { data: createdStartup } = await supabaseAdmin
        .from('startups')
        .insert({
          organization_id: acceptedApp.organization_id || acceptedApp.selected_incubator_id,
          application_id: acceptedApp.id,
          startup_name: startupName,
          founder_name: acceptedApp.applicant_name,
          founder_email: emailLower,
          founder_phone: acceptedApp.form_data?.phone || acceptedApp.applicant_phone || null,
          sector: acceptedApp.form_data?.industryVertical || acceptedApp.form_data?.sector || 'Technology',
          stage: acceptedApp.form_data?.businessStage || acceptedApp.form_data?.stage || 'Early Stage',
          status: 'active',
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      startup = createdStartup;
    } else if (startup.application_id) {
      const { data: appData } = await supabaseAdmin
        .from('applications')
        .select('*')
        .eq('id', startup.application_id)
        .maybeSingle();
      linkedApp = appData;
    } else {
      const { data: appData } = await supabaseAdmin
        .from('applications')
        .select('*')
        .ilike('applicant_email', emailLower)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      linkedApp = appData;
    }

    // 3. Fetch linked incubator organization
    let orgData: any = null;
    const orgId = startup?.organization_id || linkedApp?.organization_id || linkedApp?.selected_incubator_id;
    if (orgId) {
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('id, name, slug, logo_url')
        .eq('id', orgId)
        .maybeSingle();
      orgData = org;
    }

    return NextResponse.json(
      {
        success: true,
        has_assigned_dashboard: true,
        startup,
        application: linkedApp,
        organization: orgData,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized: User email required' }, { status: 401 });
    }

    const emailLower = user.email.trim().toLowerCase();

    // 1. Fetch current startup record linked to this founder
    const { data: startup, error: stErr } = await supabaseAdmin
      .from('startups')
      .select('*')
      .or(`founder_email.ilike.${emailLower},founder_id.eq.${user.id}`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!startup) {
      return NextResponse.json(
        { success: false, error: 'No active startup record found to update' },
        { status: 404 }
      );
    }

    const body = await req.json();

    // 2. Build whitelist update payload
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Basic Info
    if (body.startup_name !== undefined) updatePayload.startup_name = body.startup_name;
    else if (body.name !== undefined) updatePayload.startup_name = body.name;
    if (body.logo_url !== undefined) updatePayload.logo_url = body.logo_url;
    if (body.logo_color !== undefined) updatePayload.logo_color = body.logo_color;
    if (body.initials !== undefined) updatePayload.initials = body.initials;
    if (body.website !== undefined) updatePayload.website = body.website;
    if (body.sector !== undefined) updatePayload.sector = body.sector;
    if (body.stage !== undefined) updatePayload.stage = body.stage;
    if (body.founded_date !== undefined) updatePayload.founded_date = body.founded_date || null;

    // Founder & Team
    if (body.founder_name !== undefined) updatePayload.founder_name = body.founder_name;
    if (body.founder_email !== undefined) updatePayload.founder_email = body.founder_email;
    if (body.founder_phone !== undefined) updatePayload.founder_phone = body.founder_phone;
    if (body.team_size !== undefined) updatePayload.team_size = Number(body.team_size) || 1;
    if (body.cofounders !== undefined) updatePayload.cofounders = Array.isArray(body.cofounders) ? body.cofounders : [];
    if (body.team_members !== undefined) updatePayload.team_members = Array.isArray(body.team_members) ? body.team_members : [];

    // Overview
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.problem_statement !== undefined) updatePayload.problem_statement = body.problem_statement;
    if (body.solution_description !== undefined) updatePayload.solution_description = body.solution_description;
    if (body.target_market !== undefined) updatePayload.target_market = body.target_market;

    // Business Model
    if (body.business_model !== undefined) updatePayload.business_model = body.business_model;
    if (body.revenue_model !== undefined) updatePayload.revenue_model = body.revenue_model;

    // Legal
    if (body.registration_type !== undefined) updatePayload.registration_type = body.registration_type;
    if (body.registration_number !== undefined) updatePayload.registration_number = body.registration_number;
    if (body.pan_number !== undefined) updatePayload.pan_number = body.pan_number;
    if (body.gst_number !== undefined) updatePayload.gst_number = body.gst_number;
    if (body.cin_number !== undefined) updatePayload.cin_number = body.cin_number;

    // Financials
    if (body.mrr !== undefined) updatePayload.mrr = Number(body.mrr) || 0;
    if (body.monthly_revenue !== undefined) updatePayload.monthly_revenue = Number(body.monthly_revenue) || 0;
    if (body.annual_revenue !== undefined) {
      updatePayload.annual_revenue = Number(body.annual_revenue) || 0;
    } else if (body.monthly_revenue !== undefined) {
      updatePayload.annual_revenue = (Number(body.monthly_revenue) || 0) * 12;
    }
    if (body.funding_raised !== undefined) updatePayload.funding_raised = Number(body.funding_raised) || 0;
    if (body.customer_count !== undefined) updatePayload.customer_count = Number(body.customer_count) || 0;

    // Documents & Showcase Links
    if (body.tagline !== undefined) updatePayload.tagline = body.tagline;
    if (body.pitch_deck_url !== undefined) updatePayload.pitch_deck_url = body.pitch_deck_url;
    if (body.business_plan_url !== undefined) updatePayload.business_plan_url = body.business_plan_url;
    if (body.github_url !== undefined) updatePayload.github_url = body.github_url;
    if (body.figma_url !== undefined) updatePayload.figma_url = body.figma_url;
    if (body.demo_url !== undefined) updatePayload.demo_url = body.demo_url;
    if (body.demo_video_url !== undefined) updatePayload.demo_video_url = body.demo_video_url;
    if (body.tech_stack !== undefined) updatePayload.tech_stack = Array.isArray(body.tech_stack) ? body.tech_stack : [];

    // 3. Persist update in startups table
    let { data: updatedStartup, error: updateErr } = await supabaseAdmin
      .from('startups')
      .update(updatePayload)
      .eq('id', startup.id)
      .select()
      .single();

    // If update failed because logo_color or initials columns do not exist in schema cache
    if (updateErr && (updateErr.message?.includes('initials') || updateErr.message?.includes('logo_color') || updateErr.message?.includes('schema cache'))) {
      const fallbackPayload = { ...updatePayload };
      delete fallbackPayload.logo_color;
      delete fallbackPayload.initials;

      // Automatically store generated logo as an SVG into existing logo_url
      if (!body.logo_url && (body.logo_color || body.initials)) {
        const bg = body.logo_color || '#4F46E5';
        const init = (body.initials || 'ST').slice(0, 2).toUpperCase();
        fallbackPayload.logo_url = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${encodeURIComponent(bg)}"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="%23ffffff" font-family="sans-serif" font-weight="700" font-size="24">${encodeURIComponent(init)}</text></svg>`;
      }

      const retryRes = await supabaseAdmin
        .from('startups')
        .update(fallbackPayload)
        .eq('id', startup.id)
        .select()
        .single();

      updatedStartup = retryRes.data;
      updateErr = retryRes.error;
    }

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, startup: updatedStartup });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


