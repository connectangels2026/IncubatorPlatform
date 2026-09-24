import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { CollaboratorService } from '@/modules/collaborators/services';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const signed = await CollaboratorService.signMOU(id, orgId!);
    if (!signed) return NextResponse.json({ error: 'Collaborator not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: 'MOU signed successfully',
      data: signed,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
