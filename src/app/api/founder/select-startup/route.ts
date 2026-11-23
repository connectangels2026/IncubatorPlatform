import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;

    if (!user?.email && !user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const startupId = body.startupId || body.startup_id;

    if (!startupId || typeof startupId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid startupId' }, { status: 400 });
    }

    const emailLower = (user.email || '').trim().toLowerCase();

    // 1. Fetch startup
    const { data: startup, error: stErr } = await supabaseAdmin
      .from('startups')
      .select('id, startup_name, founder_id, founder_email, status, is_active')
      .eq('id', startupId)
      .is('deleted_at', null)
      .maybeSingle();

    if (stErr || !startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    // 2. Verify server-side that startup belongs to this founder
    const founderEmailClean = (startup.founder_email || '').trim().toLowerCase();
    let belongsToFounder =
      Boolean(user.id && startup.founder_id && startup.founder_id === user.id) ||
      Boolean(emailLower && founderEmailClean && founderEmailClean === emailLower);

    if (!belongsToFounder && emailLower) {
      const { data: appRow } = await supabaseAdmin
        .from('applications')
        .select('id')
        .eq('startup_id', startupId)
        .ilike('applicant_email', emailLower)
        .limit(1)
        .maybeSingle();

      if (appRow) {
        belongsToFounder = true;
      }
    }

    if (!belongsToFounder) {
      return NextResponse.json({ error: 'Forbidden: Startup does not belong to you' }, { status: 403 });
    }

    // 3. Verify server-side that startup is dashboard_assigned
    let isAssigned = startup.status === 'active' || startup.is_active === true;

    if (!isAssigned) {
      const { data: linkedApp } = await supabaseAdmin
        .from('applications')
        .select('id, admission_status, form_data')
        .eq('startup_id', startupId)
        .or('admission_status.eq.dashboard_assigned,form_data->>dashboard_access_granted.eq.true')
        .limit(1)
        .maybeSingle();

      if (linkedApp) {
        isAssigned = true;
      }
    }

    if (!isAssigned) {
      return NextResponse.json(
        { error: 'No assigned dashboard', code: 'NO_ASSIGNED_DASHBOARD' },
        { status: 403 }
      );
    }

    // 4. Set the selected startup using cookie and return success
    const res = NextResponse.json({
      success: true,
      message: 'Startup selected successfully',
      startupId,
    });

    res.cookies.set('selected_startup_id', startupId, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return res;
  } catch (err: any) {
    console.error('[founder/select-startup] Server error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
