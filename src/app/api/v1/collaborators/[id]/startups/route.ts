import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { CollaboratorService } from '@/modules/collaborators/services';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const startups = await CollaboratorService.getMatchedStartups(id, orgId!);
    return NextResponse.json({ success: true, collaborator_id: id, matched_startups: startups });
  } catch (err) {
    return handleApiError(err);
  }
}
