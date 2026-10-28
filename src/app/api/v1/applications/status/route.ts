import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { verifyAuth } from '@/backend/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    const paramEmail = req.nextUrl.searchParams.get('email');

    // Optional auth verification
    let authUserEmail: string | null = null;
    let authUserRole: string | null = null;
    try {
      const { user } = await verifyAuth(req);
      if (user) {
        authUserEmail = user.email || null;
        authUserRole = user.role?.toLowerCase() || null;
      }
    } catch {
      // Continue with paramEmail if unauthenticated or token expired
    }

    const effectiveEmail = (authUserEmail || paramEmail || '').trim().toLowerCase();

    if (!id && !effectiveEmail) {
      return NextResponse.json({ error: 'Missing id or email parameter' }, { status: 400 });
    }

    let targetApplication: any = null;

    if (id) {
      const cleanId = id.replace(/^#/, '').trim().toLowerCase();
      if (cleanId.length === 36) {
        const { data, error } = await supabaseAdmin
          .from('applications')
          .select('*, organization:organizations!organization_id(id, name, slug, description, logo_url)')
          .eq('id', cleanId)
          .is('deleted_at', null)
          .maybeSingle();

        if (error) throw error;
        targetApplication = data;
      } else {
        const { data: list, error: listError } = await supabaseAdmin
          .from('applications')
          .select('*, organization:organizations!organization_id(id, name, slug, description, logo_url)')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(100);

        if (listError) throw listError;
        targetApplication = (list || []).find(
          (a) => a.id.toLowerCase() === cleanId || a.id.toLowerCase().startsWith(cleanId)
        );
      }

      // Security check: If targetApplication is found, verify ownership
      if (targetApplication) {
        const appEmail = (targetApplication.applicant_email || '').trim().toLowerCase();
        const isStaff = authUserRole === 'admin' || authUserRole === 'super-admin' || authUserRole === 'super_admin';
        if (!isStaff && effectiveEmail && appEmail !== effectiveEmail) {
          return NextResponse.json({ error: 'Forbidden: You can only view your own applications' }, { status: 403 });
        }
      }
    }

    // Fetch all applications for this founder so they can switch between incubators
    let founderApplications: any[] = [];
    const lookupEmail = effectiveEmail || targetApplication?.applicant_email?.toLowerCase();
    if (lookupEmail) {
      const { data: apps, error: appsError } = await supabaseAdmin
        .from('applications')
        .select('*, organization:organizations!organization_id(id, name, slug, description, logo_url)')
        .ilike('applicant_email', lookupEmail)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;
      founderApplications = apps || [];
    }

    const resultData = targetApplication || (founderApplications.length > 0 ? founderApplications[0] : null);

    if (!resultData) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: resultData,
      applications: founderApplications,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
