import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const VALID_TRANSITIONS: Record<string, string[]> = {
  submitted: ['under_review', 'rejected'],
  under_review: ['admitted', 'rejected'],
  admitted: [],
  rejected: ['under_review'],
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { data: application, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Role check: Applicant can see only their own application
    const role = user?.role?.toLowerCase() || '';
    if (role !== 'admin' && role !== 'super-admin') {
      if (application.applicant_email?.toLowerCase() !== user?.email?.toLowerCase()) {
        return NextResponse.json({ error: 'Forbidden: Applicants can only view their own application' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: application });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    // Only admins can update application status
    const role = user?.role?.toLowerCase() || '';
    if (role !== 'admin' && role !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden: Only admins can review or update applications' }, { status: 403 });
    }

    const { data: currentApp, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !currentApp) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const body = await req.json();
    const newStatus = body.status;

    if (newStatus && newStatus !== currentApp.status) {
      const allowedNext = VALID_TRANSITIONS[currentApp.status] || [];
      if (!allowedNext.includes(newStatus)) {
        return NextResponse.json({
          error: `Invalid status transition: cannot transition from '${currentApp.status}' to '${newStatus}'. Allowed: [${allowedNext.join(', ')}]`,
        }, { status: 400 });
      }
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
      ...body,
    };

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
