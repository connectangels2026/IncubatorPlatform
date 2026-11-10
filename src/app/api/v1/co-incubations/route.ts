import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { CoIncubationService } from '@/modules/co_incubations/services';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const searchParams = req.nextUrl.searchParams;
    const view = (searchParams.get('view') as 'all' | 'primary' | 'partner') || 'all';
    const status = searchParams.get('status') || undefined;

    const list = await CoIncubationService.listForIncubator(orgId!, { view, status });
    return NextResponse.json({
      success: true,
      organization_id: orgId,
      view,
      total: list.length,
      data: list,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const body = await req.json();

    if (!body.startup_id) {
      return NextResponse.json({ error: 'Validation Error: startup_id is required' }, { status: 400 });
    }
    if (!body.co_incubator_id) {
      return NextResponse.json({ error: 'Validation Error: co_incubator_id (partner organization) is required' }, { status: 400 });
    }

    const created = await CoIncubationService.requestCoIncubation(
      {
        ...body,
        primary_incubator_id: orgId!,
      },
      user!
    );

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
