import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { CoIncubationService } from '@/modules/co_incubations/services';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const body = await req.json();
    const targetStatus = body.status?.toLowerCase();

    if (!targetStatus) {
      return NextResponse.json({ error: 'Validation Error: status is required' }, { status: 400 });
    }

    let updated: any;
    if (targetStatus === 'active') {
      updated = await CoIncubationService.decideCoIncubation(id, 'accept', user!);
    } else if (targetStatus === 'rejected') {
      const reason = body.reject_reason || body.reason;
      if (!reason || !reason.trim()) {
        return NextResponse.json({ error: 'Validation Error: reject_reason is required when rejecting a co-incubation request' }, { status: 400 });
      }
      updated = await CoIncubationService.decideCoIncubation(id, 'reject', user!, reason);
    } else if (targetStatus === 'ended') {
      updated = await CoIncubationService.endCoIncubation(id, user!, body.reason);
    } else {
      return NextResponse.json({ error: `Invalid status transition: '${targetStatus}'` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Co-incubation status updated to ${updated.status}`,
      data: updated,
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
