import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { StartupService } from '@/modules/startups/services';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId } = requireOrg(req);

    const startup = await StartupService.getStartupById(id, orgId || '');
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    // Ownership & Tenant check
    const role = user?.role?.toLowerCase() || '';
    const isSuperAdmin = role === 'super-admin' || role === 'super_admin';
    const isStaff = isSuperAdmin || role === 'admin' || role === 'incubator_admin' || role === 'incubator';

    if (!isSuperAdmin) {
      if (isStaff && orgId && startup.organization_id !== orgId) {
        return NextResponse.json({ error: 'Forbidden: Startup does not belong to this organization' }, { status: 403 });
      }

      if (!isStaff && user?.email) {
        const isOwner =
          Boolean(startup.founder_id && startup.founder_id === user?.id) ||
          Boolean((startup as any).founder_email && (startup as any).founder_email.toLowerCase() === user.email.toLowerCase()) ||
          Boolean(startup.email && startup.email.toLowerCase() === user.email.toLowerCase());
        if (!isOwner) {
          return NextResponse.json({ error: 'Forbidden: Founders can only view their own startup' }, { status: 403 });
        }
      }
    }

    // Query organization_activity_log for startup-related logs
    let activityLogs: any[] = [];
    try {
      const { data: logs } = await supabaseAdmin
        .from('organization_activity_log')
        .select('*')
        .eq('organization_id', startup.organization_id || orgId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (logs) {
        activityLogs = logs.filter((l: any) =>
          l.metadata?.startup_id === id ||
          (l.description && (startup.startup_name || startup.name) && l.description.toLowerCase().includes((startup.startup_name || startup.name).toLowerCase()))
        );
      }
    } catch {
      // Activity log query error ignored gracefully
    }

    return NextResponse.json({
      success: true,
      data: {
        ...startup,
        activity_logs: activityLogs,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const startup = await StartupService.getStartupById(id, orgId!);
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    const role = user?.role?.toLowerCase() || '';
    const isSuperAdmin = role === 'super-admin' || role === 'super_admin';
    const isStaff = isSuperAdmin || role === 'admin' || role === 'incubator_admin' || role === 'incubator';
    if (!isStaff) {
      const isOwner =
        (startup.founder_id && startup.founder_id === user?.id) ||
        ((startup as any).founder_email && (startup as any).founder_email.toLowerCase() === user?.email?.toLowerCase()) ||
        (startup.email && startup.email.toLowerCase() === user?.email?.toLowerCase());
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden: Founders can only update their own startup' }, { status: 403 });
      }
    }

    const body = await req.json();

    // Support "request_change" action for incubator staff
    if (body.action === 'request_change') {
      const changeNote = body.note || body.description || 'Change request submitted by incubator';
      const targetField = body.field || 'General';

      try {
        await supabaseAdmin.from('organization_activity_log').insert({
          organization_id: orgId!,
          action: 'startup_change_requested',
          description: `Change requested for ${startup.startup_name || startup.name}: [${targetField}] ${changeNote}`,
          triggered_by: user?.email || 'Incubator Staff',
          triggered_by_id: user?.id || null,
          metadata: {
            startup_id: id,
            startup_name: startup.startup_name || startup.name,
            field: targetField,
            note: changeNote,
          },
        });
      } catch (logErr) {
        console.warn('Failed to log change request:', logErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Change request logged successfully',
        data: { id, action: 'request_change', note: changeNote, field: targetField },
      });
    }

    // Role-based field restrictions for incubator staff
    let updatePayload = { ...body };
    if (isStaff && !isSuperAdmin) {
      // Incubator allowlist: status, lifecycle_stage, cohort/batch, track, stage, incubation dates, is_active, milestones
      const ALLOWED_INCUBATOR_FIELDS = [
        'status',
        'lifecycle_stage',
        'cohort',
        'batch',
        'track',
        'stage',
        'incubation_start_date',
        'incubation_end_date',
        'is_active',
        'milestones',
      ];

      const filteredPayload: any = {};
      for (const key of ALLOWED_INCUBATOR_FIELDS) {
        if (updatePayload[key] !== undefined) {
          filteredPayload[key] = updatePayload[key];
        }
      }
      updatePayload = filteredPayload;
    }

    const updated = await StartupService.updateStartup(id, orgId!, updatePayload);
    if (!updated) {
      return NextResponse.json({ error: 'Startup not found or update failed' }, { status: 404 });
    }

    // Log incubator edit to organization_activity_log
    if (isStaff) {
      try {
        await supabaseAdmin.from('organization_activity_log').insert({
          organization_id: orgId!,
          action: 'startup_updated_by_incubator',
          description: `Updated startup ${updated.startup_name || updated.name} fields: ${Object.keys(updatePayload).join(', ')}`,
          triggered_by: user?.email || 'Incubator Staff',
          triggered_by_id: user?.id || null,
          metadata: {
            startup_id: id,
            updated_fields: Object.keys(updatePayload),
          },
        });
      } catch (logErr) {
        console.warn('Failed to log incubator update:', logErr);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return PUT(req, context);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const startup = await StartupService.getStartupById(id, orgId!);
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found or already deleted' }, { status: 404 });
    }

    const role = user?.role?.toLowerCase() || '';
    const isStaff = role === 'admin' || role === 'super-admin' || role === 'super_admin' || role === 'incubator_admin' || role === 'incubator';
    if (!isStaff) {
      const isOwner = (startup.founder_id && startup.founder_id === user?.id) ||
        (startup.email && startup.email.toLowerCase() === user?.email?.toLowerCase());
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden: Founders can only delete their own startup' }, { status: 403 });
      }
    }

    const deleted = await StartupService.softDeleteStartup(id, orgId!);
    if (!deleted) {
      return NextResponse.json({ error: 'Startup not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Startup soft-deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
