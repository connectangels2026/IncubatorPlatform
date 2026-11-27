import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const ALLOWED_STATUSES = ['pending', 'active', 'inactive', 'exited'];

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const role = (user?.role || '').toLowerCase();
    const isStaff =
      role === 'admin' ||
      role === 'super-admin' ||
      role === 'super_admin' ||
      role === 'incubator_admin' ||
      role === 'incubator' ||
      Boolean(user?.organization_id);

    if (!isStaff) {
      return NextResponse.json(
        { error: 'Forbidden: Only incubator staff can change startup statuses in bulk.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const status = String(body.status || '').trim().toLowerCase();

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    let updateQuery = supabaseAdmin
      .from('startups')
      .update({ status, updated_at: new Date().toISOString() })
      .is('deleted_at', null);

    if (orgId !== 'all') {
      updateQuery = updateQuery.eq('organization_id', orgId);
    }

    const { data, error } = await updateQuery.select('id');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      status,
      updated_count: Array.isArray(data) ? data.length : 0,
      message: `Status updated to ${status} for all startups in this incubator.`,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
