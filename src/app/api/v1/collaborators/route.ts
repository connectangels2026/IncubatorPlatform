import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { CollaboratorService } from '@/modules/collaborators/services';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const list = await CollaboratorService.getAll(orgId!);
    return NextResponse.json({ success: true, organization_id: orgId, total: list.length, data: list });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Validation Error: name is required' }, { status: 400 });
    }

    const created = await CollaboratorService.create({ ...body, organization_id: orgId! });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
