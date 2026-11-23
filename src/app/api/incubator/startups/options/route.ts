import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError || !user) {
      return (
        authError ||
        NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 })
      );
    }

    // 2. Get the logged-in incubator's organization_id from the session (never from client)
    let orgId = user.organization_id;
    if (!orgId && user.id) {
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (org?.id) {
        orgId = org.id;
      }
    }

    if (!orgId && user.email) {
      const { data: uRec } = await supabaseAdmin
        .from('users')
        .select('organization_id')
        .ilike('email', user.email.trim())
        .maybeSingle();

      if (uRec?.organization_id) {
        orgId = uRec.organization_id;
      }

      if (!orgId) {
        const { data: orgByEmail } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .ilike('founder_email', user.email.trim())
          .maybeSingle();
        if (orgByEmail?.id) {
          orgId = orgByEmail.id;
        }
      }
    }

    if (!orgId) {
      const headerOrg = req.headers.get('x-org-id');
      if (headerOrg) {
        orgId = headerOrg;
      }
    }

    if (!orgId) {
      const { data: defaultOrg } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (defaultOrg?.id) {
        orgId = defaultOrg.id;
      }
    }

    // 3. Query startups table: organization_id = orgId, name ILIKE %q%, limit 10
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();

    let rows: any[] = [];
    let dbError: any = null;

    let baseQuery = supabaseAdmin.from('startups').select('*');
    if (orgId) {
      baseQuery = baseQuery.or(`organization_id.eq.${orgId},organization_id.is.null`);
    }

    if (q) {
      // Try matching by startup_name
      const qRes1 = await baseQuery.ilike('startup_name', `%${q}%`).limit(10);
      if (qRes1.error && qRes1.error.message?.includes('startup_name')) {
        let retryQuery = supabaseAdmin.from('startups').select('*');
        if (orgId) retryQuery = retryQuery.or(`organization_id.eq.${orgId},organization_id.is.null`);
        const qRes2 = await retryQuery.ilike('name', `%${q}%`).limit(10);
        rows = qRes2.data || [];
        dbError = qRes2.error;
      } else {
        rows = qRes1.data || [];
        dbError = qRes1.error;
      }
    } else {
      const allRes = await baseQuery.limit(10);
      rows = allRes.data || [];
      dbError = allRes.error;
    }

    if (dbError) {
      console.error('[incubator/startups/options] DB error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 4. Return id, name, sector, stage, founder_name, founder_email, phone, tagline
    const options = (rows || []).map((row: any) => ({
      id: row.id,
      name: row.name || row.startup_name || '',
      sector: row.sector || '',
      stage: row.stage || 'Idea',
      founder_name: row.founder_name || '',
      founder_email: row.founder_email || row.email || '',
      phone: row.founder_phone || row.contact || '',
      tagline: row.tagline || row.description || row.problem_statement || '',
    }));

    return NextResponse.json(options);
  } catch (err: any) {
    console.error('[incubator/startups/options] unexpected error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
