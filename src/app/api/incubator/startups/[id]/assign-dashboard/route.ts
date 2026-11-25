import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: startupId } = await params;

    // 1. Check auth
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const role = (user?.role || '').toLowerCase();
    const isStaff =
      !role ||
      role.includes('incubator') ||
      role.includes('admin') ||
      role === 'super-admin' ||
      role === 'super_admin' ||
      Boolean(user?.organization_id);

    if (!isStaff) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only incubator staff can assign dashboards.' },
        { status: 403 }
      );
    }

    // 2. Fetch startup & check tenant isolation
    const { data: startup, error: startupErr } = await supabaseAdmin
      .from('startups')
      .select('*')
      .eq('id', startupId)
      .maybeSingle();

    if (startupErr || !startup) {
      return NextResponse.json({ success: false, error: 'Startup not found.' }, { status: 404 });
    }

    const isSuperAdmin = role === 'super-admin' || role === 'super_admin';
    const callerOrgId = user?.organization_id || req.headers.get('x-org-id');
    if (!isSuperAdmin && callerOrgId && startup.organization_id && startup.organization_id !== callerOrgId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Startup does not belong to your incubator.' },
        { status: 403 }
      );
    }

    // 3. Reject if admission_status is already 'dashboard_assigned'
    const founderEmail = (startup.founder_email || startup.email || '').trim().toLowerCase();
    let linkedApp: any = null;

    const { data: appByStartupId } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('startup_id', startup.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (appByStartupId) {
      linkedApp = appByStartupId;
    } else if (founderEmail) {
      const { data: appByEmail } = await supabaseAdmin
        .from('applications')
        .select('*')
        .ilike('applicant_email', founderEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      linkedApp = appByEmail;
    }

    if (linkedApp?.admission_status === 'dashboard_assigned') {
      return NextResponse.json(
        { success: false, error: 'Dashboard access is already assigned to this startup.' },
        { status: 400 }
      );
    }

    // 4. Update or link application to 'dashboard_assigned'
    const nowIso = new Date().toISOString();
    if (linkedApp) {
      const currentFd =
        typeof linkedApp.form_data === 'object' && linkedApp.form_data !== null
          ? linkedApp.form_data
          : {};
      const { error: appErr } = await supabaseAdmin
        .from('applications')
        .update({
          startup_id: startup.id,
          admission_status: 'dashboard_assigned',
          status: linkedApp.status === 'rejected' ? 'accepted' : (linkedApp.status || 'admitted'),
          form_data: {
            ...currentFd,
            dashboard_access_granted: true,
            dashboard_assigned_at: nowIso,
          },
          updated_at: nowIso,
        })
        .eq('id', linkedApp.id);

      if (appErr) {
        console.error('Error updating application for assign-dashboard:', appErr);
        return NextResponse.json({ success: false, error: appErr.message }, { status: 500 });
      }
    } else {
      const effectiveOrgId = startup.organization_id || callerOrgId || user?.organization_id;
      const { error: insAppErr } = await supabaseAdmin
        .from('applications')
        .insert({
          organization_id: effectiveOrgId,
          startup_id: startup.id,
          application_type: startup.track || 'incubation',
          applicant_name: startup.founder_name || startup.founder || 'Founder',
          applicant_email: founderEmail || 'founder@startup.com',
          applicant_phone: startup.founder_phone || null,
          status: 'admitted',
          admission_status: 'dashboard_assigned',
          admission_date: nowIso.split('T')[0],
          form_data: {
            startup_name: startup.startup_name || startup.name,
            dashboard_access_granted: true,
            dashboard_assigned_at: nowIso,
          },
        });

      if (insAppErr) {
        console.error('Error creating application for assign-dashboard:', insAppErr);
        return NextResponse.json({ success: false, error: insAppErr.message }, { status: 500 });
      }
    }

    // 5. Ensure startup status is active
    const { data: updatedStartup, error: stErr } = await supabaseAdmin
      .from('startups')
      .update({
        status: 'active',
        is_active: true,
        updated_at: nowIso,
      })
      .eq('id', startup.id)
      .select('*')
      .maybeSingle();

    if (stErr) {
      console.warn('Warning updating startup status:', stErr);
    }

    const updatedRow = {
      ...(updatedStartup || startup),
      admission_status: 'dashboard_assigned',
    };

    return NextResponse.json({
      success: true,
      message: 'Dashboard access assigned successfully.',
      startup: updatedRow,
      data: updatedRow,
    });
  } catch (err: any) {
    console.error('Assign dashboard API error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
