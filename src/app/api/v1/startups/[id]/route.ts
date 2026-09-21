import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { StartupService } from '@/modules/startups/services';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const startup = await StartupService.getStartupById(id, orgId!);
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: startup });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const body = await req.json();
    const updated = await StartupService.updateStartup(id, orgId!, body);
    if (!updated) {
      return NextResponse.json({ error: 'Startup not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const deleted = await StartupService.softDeleteStartup(id, orgId!);
    if (!deleted) {
      return NextResponse.json({ error: 'Startup not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Startup soft-deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
