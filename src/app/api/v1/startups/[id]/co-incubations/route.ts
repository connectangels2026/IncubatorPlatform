import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { StartupService } from '@/modules/startups/services';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const startup = await StartupService.getStartupById(id, orgId!);
    if (!startup) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });

    // Ownership check: non-staff can only view their own co-incubations
    const role = user?.role?.toLowerCase() || '';
    const isStaff = role === 'admin' || role === 'super-admin' || role === 'super_admin' || role === 'incubator_admin' || role === 'incubator';
    if (!isStaff && user?.email) {
      const isOwner =
        Boolean(startup.founder_id && startup.founder_id === user?.id) ||
        Boolean(startup.email && startup.email.toLowerCase() === user.email.toLowerCase());
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden: Founders can only view their own co-incubations' }, { status: 403 });
      }
    }

    const coincubations = await StartupService.getCoIncubations(id);
    return NextResponse.json({ success: true, startup_id: id, data: coincubations });
  } catch (error) {
    return handleApiError(error);
  }
}
