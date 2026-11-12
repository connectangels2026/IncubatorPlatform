import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { CoIncubationService } from '@/modules/co_incubations/services';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { data: startup } = await supabaseAdmin
      .from('startups')
      .select('id, organization_id, founder_id, founder_email')
      .eq('id', id)
      .maybeSingle();

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    const role = user?.role?.toLowerCase() || '';
    const isSuperAdmin = role === 'super-admin' || role === 'super_admin';
    const isStaff = isSuperAdmin || role.includes('admin') || role.includes('incubator');

    const isOwner =
      Boolean(startup.founder_id && startup.founder_id === user?.id) ||
      Boolean(startup.founder_email && startup.founder_email.toLowerCase() === user?.email?.toLowerCase());

    if (!isStaff && !isOwner) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to view co-incubations for this startup' }, { status: 403 });
    }

    if (isOwner && !isStaff) {
      // Startup role: reads only its own active rows, without mou_*, equity_split, and responsibilities
      const list = await CoIncubationService.listForStartup(id, user!);
      return NextResponse.json({ success: true, startup_id: id, data: list });
    }

    // Incubator staff role: query all co-incubations for this startup
    const { orgId } = requireOrg(req);
    const { data: coincubations, error } = await supabaseAdmin
      .from('co_incubations')
      .select(`
        *,
        primary_incubator:organizations!co_incubations_primary_incubator_id_fkey(id, name, logo_url),
        co_incubator:organizations!co_incubations_co_incubator_id_fkey(id, name, logo_url)
      `)
      .eq('startup_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, startup_id: id, data: coincubations || [] });
  } catch (error) {
    return handleApiError(error);
  }
}
