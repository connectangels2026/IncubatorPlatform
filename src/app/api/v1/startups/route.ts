import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { StartupService } from '@/modules/startups/services';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const url = req.nextUrl;
    const filter = {
      sector: url.searchParams.get('sector') || undefined,
      stage: url.searchParams.get('stage') || undefined,
      status: url.searchParams.get('status') || undefined,
      search: url.searchParams.get('search') || undefined,
      sort: (url.searchParams.get('sort') as any) || 'created_at',
      order: (url.searchParams.get('order') as any) || 'desc',
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : 10,
      offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!, 10) : 0,
    };

    const result = await StartupService.getStartups(orgId!, filter);
    return NextResponse.json({
      success: true,
      organization_id: orgId,
      total: result.total,
      data: result.startups,
    });
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
    if (!body.name || !body.founder_name) {
      return NextResponse.json({ error: 'Validation Error: name and founder_name are required' }, { status: 400 });
    }

    const created = await StartupService.createStartup({ ...body, organization_id: orgId! });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
