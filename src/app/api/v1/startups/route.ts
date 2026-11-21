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

    const founderEmail = (body.founder_email || body.email || '').trim().toLowerCase();
    const founderName = (body.founder_name || '').trim();

    if (!founderEmail) {
      return NextResponse.json({ error: 'Validation Error: founder_email is required' }, { status: 400 });
    }

    // 1. Check if email already exists in users table
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .ilike('email', founderEmail)
      .limit(1)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered. A user with this email already exists.' },
        { status: 400 }
      );
    }

    // 2. Generate password = <foundername>@123 (lowercase, no spaces)
    const cleanFounderName = founderName.toLowerCase().replace(/\s+/g, '');
    const generatedPassword = `${cleanFounderName || 'startup'}@123`;

    // 3. Create founder in Supabase Auth via Admin API
    const adminCreateResult = await supabaseAdmin.auth.admin.createUser({
      email: founderEmail,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: {
        full_name: founderName,
        name: founderName,
        role: 'startup',
      },
    });

    if (adminCreateResult.error) {
      const errMsg = (adminCreateResult.error.message || '').toLowerCase();
      if (
        errMsg.includes('already') ||
        errMsg.includes('exists') ||
        errMsg.includes('duplicate') ||
        (adminCreateResult.error as any).status === 422
      ) {
        return NextResponse.json(
          { error: 'Email already registered. A user with this email already exists.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Auth Error: ${adminCreateResult.error.message}` },
        { status: 400 }
      );
    }

    const authUser = adminCreateResult.data.user;
    const founderId = authUser.id;

    // 4. Create user profile in users table with role = 'startup', is_active = true, email_verified = true
    const nameArray = founderName.split(' ');
    const firstName = nameArray[0] || 'Founder';
    const lastName = nameArray.slice(1).join(' ') || '';

    await supabaseAdmin
      .from('users')
      .upsert({
        id: founderId,
        organization_id: orgId,
        email: founderEmail,
        first_name: firstName,
        last_name: lastName,
        full_name: founderName,
        is_active: true,
        email_verified: true,
        role: 'startup',
      });

    // 5. Create startup in startups table with status = 'active'
    const created = await StartupService.createStartup({
      ...body,
      startup_name: resolvedName,
      name: resolvedName,
      founder_name: founderName,
      founder_email: founderEmail,
      email: founderEmail,
      founder_id: founderId,
      organization_id: orgId,
      status: 'active',
      is_active: true,
      track: body.track || 'incubation',
    });

    return NextResponse.json(
      {
        success: true,
        data: created,
        credentials: {
          email: founderEmail,
          password: generatedPassword,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
