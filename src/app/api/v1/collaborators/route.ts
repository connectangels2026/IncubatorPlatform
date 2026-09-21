import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    return NextResponse.json({ success: true, organization_id: orgId, data: [] });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const body = await req.json();
    return NextResponse.json({ success: true, data: { id: 'collab_' + Date.now(), ...body, organization_id: orgId } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
