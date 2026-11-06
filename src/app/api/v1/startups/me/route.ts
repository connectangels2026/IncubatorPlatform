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

    // Issue 1: Incubator administrators must NOT create startup records or access startup dashboards
    const callerRole = (user.role || '').toLowerCase();
    if (callerRole === 'admin' || callerRole === 'incubator_admin' || callerRole === 'incubator' || callerRole === 'super-admin' || callerRole === 'super_admin') {
      return NextResponse.json(
        { success: false, has_assigned_dashboard: false, error: 'Forbidden: Incubator administrators do not have personal startup dashboards.' },
        { status: 403 }
      );
    }

    const { data: dbUserCheck } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('email', emailLower)
      .maybeSingle();

    const dbRoleCheck = (dbUserCheck?.role || '').toLowerCase();
    if (dbRoleCheck === 'admin' || dbRoleCheck === 'incubator_admin' || dbRoleCheck === 'incubator' || dbRoleCheck === 'super-admin' || dbRoleCheck === 'super_admin') {
      return NextResponse.json(
        { success: false, has_assigned_dashboard: false, error: 'Forbidden: Incubator administrators do not have personal startup dashboards.' },
        { status: 403 }
      );
    }

    // 1. Fetch startup record strictly belonging to this founder
    let query = supabaseAdmin
      .from('startups')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (user.id && emailLower) {
      query = query.or(`founder_id.eq.${user.id},founder_email.ilike.${emailLower}`);
    } else if (user.id) {
      query = query.eq('founder_id', user.id);
    } else {
      query = query.ilike('founder_email', emailLower);
    }

    const { data: startup, error: stErr } = await query.maybeSingle();

    if (!startup) {
      return NextResponse.json(
        {
          success: false,
          has_assigned_dashboard: false,
          message: 'No active startup record found in database. Dashboard access requires an incubator to accept your application and assign a dashboard.',
        },
        { status: 403 }
      );
    }

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
        .or(`startup_id.eq.${startup.id},applicant_email.ilike.${emailLower}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      linkedApp = appData;
    } else if (emailLower) {
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
    const orgId = startup.organization_id || linkedApp?.organization_id || linkedApp?.selected_incubator_id;
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

