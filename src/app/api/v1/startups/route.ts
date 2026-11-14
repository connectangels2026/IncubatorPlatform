import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { StartupService } from '@/modules/startups/services';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const url = req.nextUrl;
    const page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(url.searchParams.get('limit') || '5', 10) || 5;
    const offset = url.searchParams.get('offset')
      ? parseInt(url.searchParams.get('offset')!, 10)
      : (page - 1) * limit;

    const filter = {
      sector: url.searchParams.get('sector') || undefined,
      stage: url.searchParams.get('stage') || undefined,
      status: url.searchParams.get('status') || undefined,
      search: url.searchParams.get('search') || undefined,
      sort: (url.searchParams.get('sort') as any) || 'created_at',
      order: (url.searchParams.get('order') as any) || 'desc',
      limit,
      offset,
    };

    const result = await StartupService.getStartups(orgId!, filter);
    return NextResponse.json({
      success: true,
      organization_id: orgId,
      total: result.total,
      page,
      limit,
      data: result.startups,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const role = user?.role?.toLowerCase() || '';
    const isAllowed =
      !role ||
      role.includes('admin') ||
      role.includes('incubator') ||
      role === 'founder' ||
      role === 'startup' ||
      Boolean(user?.organization_id);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to create startups' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const queryOrg = req.nextUrl.searchParams.get('org_id') || req.nextUrl.searchParams.get('org');
    const headerOrg = req.headers.get('x-org-id');
    const orgId = headerOrg || queryOrg || body.organization_id || user?.organization_id;

    if (!orgId) {
      return NextResponse.json(
        { error: 'Tenant Isolation Error: Missing organization identifier (x-org-id)' },
        { status: 400 }
      );
    }

    const resolvedName = body.startup_name || body.name;
    if (!resolvedName || !body.founder_name) {
      return NextResponse.json({ error: 'Validation Error: startup_name and founder_name are required' }, { status: 400 });
    }

    const isValidUUID = (val?: any) =>
      Boolean(val && typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

    let founderId: string | null = null;
    const founderEmail = (body.founder_email || body.email || '').trim().toLowerCase();
    if (body.founder_id && isValidUUID(body.founder_id)) {
      founderId = body.founder_id;
    } else if (role === 'founder' || role === 'startup') {
      founderId = (user?.id && isValidUUID(user.id)) ? user.id : null;
    } else {
      if (founderEmail) {
        const { data: founderUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .ilike('email', founderEmail)
          .maybeSingle();
        if (founderUser?.id && isValidUUID(founderUser.id)) founderId = founderUser.id;
      }
    }

    // Guard against duplicate startup registration in this organization (e.g. from double submissions)
    if (orgId && resolvedName) {
      let dupQuery = supabaseAdmin
        .from('startups')
        .select('*')
        .eq('organization_id', orgId)
        .ilike('name', resolvedName.trim());

      if (founderEmail) {
        dupQuery = dupQuery.ilike('founder_email', founderEmail);
      }

      const { data: existingDuplicate } = await dupQuery.limit(1).maybeSingle();
      if (existingDuplicate) {
        return NextResponse.json({ success: true, data: existingDuplicate }, { status: 200 });
      }
    }

    const created = await StartupService.createStartup({
      ...body,
      startup_name: resolvedName,
      name: resolvedName,
      founder_id: founderId || undefined,
      organization_id: orgId,
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
