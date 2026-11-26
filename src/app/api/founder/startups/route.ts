import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;

    if (!user?.email && !user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const userRole = (user?.role || '').toLowerCase();
    if (
      userRole === 'super-admin' ||
      userRole === 'super_admin' ||
      userRole === 'admin' ||
      userRole === 'incubator' ||
      userRole === 'incubator_admin' ||
      userRole === 'organization'
    ) {
      return NextResponse.json({ error: 'Forbidden: Startup founders only', startups: [], total: 0 }, { status: 403 });
    }

    const emailLower = (user.email || '').trim().toLowerCase();

    // 1. Fetch startups linked to this founder (by founder_id or founder_email)
    let query = supabaseAdmin
      .from('startups')
      .select(`
        id,
        startup_name,
        sector,
        stage,
        batch,
        team_size,
        funding_raised,
        logo_url,
        logo_color,
        initials,
        organization_id,
        founder_id,
        founder_email,
        status,
        is_active,
        created_at,
        organizations (
          id,
          name,
          slug,
          logo_url
        )
      `)
      .is('deleted_at', null);

    if (user.id && emailLower) {
      query = query.or(`founder_id.eq.${user.id},founder_email.ilike.${emailLower}`);
    } else if (user.id) {
      query = query.eq('founder_id', user.id);
    } else {
      query = query.ilike('founder_email', emailLower);
    }

    const { data: startups, error: stErr } = await query.order('created_at', { ascending: false });

    if (stErr) {
      console.error('[founder/startups] Error fetching startups:', stErr);
      return NextResponse.json({ error: stErr.message }, { status: 500 });
    }

    // 2. Fetch applications linked to this founder to check admission_status = 'dashboard_assigned'
    const { data: assignedApps } = await supabaseAdmin
      .from('applications')
      .select('id, startup_id, applicant_email, admission_status, form_data')
      .or('admission_status.eq.dashboard_assigned,form_data->>dashboard_access_granted.eq.true')
      .ilike('applicant_email', emailLower);

    const assignedStartupIds = new Set<string>();
    let founderHasAssignedApp = false;

    if (assignedApps && assignedApps.length > 0) {
      assignedApps.forEach((a: any) => {
        if (a.startup_id) {
          assignedStartupIds.add(a.startup_id);
        }
        founderHasAssignedApp = true;
      });
    }

    // 3. Filter startups that belong to this founder
    const assignedStartups = (startups || []).filter((s: any) => {
      return (
        assignedStartupIds.has(s.id) ||
        s.status === 'active' ||
        s.is_active === true ||
        (startups || []).length >= 2 ||
        (founderHasAssignedApp && (startups || []).length === 1)
      );
    });

    // 4. Return requested fields: id, name, sector, stage, logo_color, initials, incubator_name
    const result = assignedStartups.map((s: any) => {
      const startupName = s.startup_name || s.name || 'Untitled Startup';
      const isAssigned =
        assignedStartupIds.has(s.id) ||
        s.status === 'active' ||
        s.is_active === true;

      return {
        id: s.id,
        name: startupName,
        sector: s.sector || 'Technology',
        stage: s.stage || 'MVP',
        logo_url: s.logo_url || null,
        logo_color: s.logo_color || null,
        initials: s.initials || startupName.slice(0, 2).toUpperCase(),
        incubator_name: (s.organizations as any)?.name || 'Assigned Incubator',
        cohort: s.batch || undefined,
        members_count: s.team_size || undefined,
        funding: s.funding_raised ? `$${Number(s.funding_raised).toLocaleString()}` : undefined,
        is_active: s.is_active ?? true,
        has_assigned_dashboard: isAssigned,
      };
    });

    return NextResponse.json({
      success: true,
      total: result.length,
      startups: result,
      data: result,
    });
  } catch (err: any) {
    console.error('[founder/startups] Server error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
