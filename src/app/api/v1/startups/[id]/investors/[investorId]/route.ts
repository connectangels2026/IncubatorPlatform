import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { StartupService } from '@/modules/startups/services';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; investorId: string }> }
) {
  try {
    const { id, investorId } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const startup = await StartupService.getStartupById(id, orgId!);
    if (!startup) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });

    const body = await req.json();
    const updated = await StartupService.updateInvestorAllocation(
      id,
      investorId,
      body.interest_level || 'Medium'
    );
    if (!updated) return NextResponse.json({ error: 'Investor allocation not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; investorId: string }> }
) {
  try {
    const { id, investorId } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const startup = await StartupService.getStartupById(id, orgId!);
    if (!startup) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });

    const removed = await StartupService.deallocateInvestor(id, investorId);
    if (!removed) return NextResponse.json({ error: 'Investor allocation not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Investor deallocated successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
