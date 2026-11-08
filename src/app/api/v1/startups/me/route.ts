import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { StartupService } from '@/backend/services/startupService';

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

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await StartupService.updateStartup('me', body, user);

    return NextResponse.json({ success: true, startup: updated, data: updated });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : err.message?.includes('Unauthorized') ? 401 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}


