import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    // Return startups list for org
    return NextResponse.json({
      success: true,
      organization_id: orgId,
      data: [],
      total: 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const body = await req.json();
    if (!body.name || !body.founder_name) {
      return NextResponse.json({ error: 'Validation Error: name and founder_name are required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: { id: 'temp_' + Date.now(), ...body, organization_id: orgId },
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
