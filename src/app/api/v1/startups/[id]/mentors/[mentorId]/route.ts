import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { StartupService } from '@/modules/startups/services';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mentorId: string }> }
) {
  try {
    const { id, mentorId } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const startup = await StartupService.getStartupById(id, orgId!);
    if (!startup) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });

    const body = await req.json();
    const updated = await StartupService.updateMentorAllocation(id, mentorId, body.mentor_type || 'Lead');
    if (!updated) return NextResponse.json({ error: 'Mentor allocation not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mentorId: string }> }
) {
  try {
    const { id, mentorId } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const startup = await StartupService.getStartupById(id, orgId!);
    if (!startup) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });

    const removed = await StartupService.deallocateMentor(id, mentorId);
    if (!removed) return NextResponse.json({ error: 'Mentor allocation not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Mentor deallocated successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
