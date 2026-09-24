import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { CoIncubationService } from '@/modules/co_incubations/services';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const body = await req.json();
    if (!body.status) {
      return NextResponse.json({ error: 'Validation Error: status is required' }, { status: 400 });
    }

    const updated = await CoIncubationService.updateStatus(id, orgId!, body.status);
    if (!updated) return NextResponse.json({ error: 'Co-incubation program not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: `Status updated to ${body.status}`,
      data: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
