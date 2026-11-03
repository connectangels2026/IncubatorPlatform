import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { verifyAuth } from '@/backend/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    const paramEmail = req.nextUrl.searchParams.get('email');

    // Auth verification
    let authUserEmail: string | null = null;
    let authUserId: string | null = null;
    let authUserRole: string | null = null;
    try {
      const { user } = await verifyAuth(req);
      if (user) {
        authUserId = user.id || null;
        authUserEmail = user.email ? user.email.toLowerCase().trim() : null;
        authUserRole = user.role?.toLowerCase() || null;
      }
    } catch {
      // Unauthenticated
    }

    const isStaff = authUserRole === 'admin' || authUserRole === 'super-admin' || authUserRole === 'super_admin';
    const effectiveEmail = (authUserEmail || (isStaff ? paramEmail : null) || '').trim().toLowerCase();

    if (!isStaff && !authUserEmail && !authUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to view application status' },
        { status: 401 }
      );
    }

    if (!id && !effectiveEmail && !authUserId) {
      return NextResponse.json({ error: 'Missing application id or authentication' }, { status: 400 });
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

      // Security check: Verify application belongs strictly to currently authenticated user using User ID & Email
      if (targetApplication && !isStaff) {
        const appEmail = (targetApplication.applicant_email || '').trim().toLowerCase();
        const appCreatedBy = targetApplication.created_by;
        const appUserId = targetApplication.form_data?.userId || targetApplication.user_id;

        const isOwner =
          (authUserEmail && appEmail === authUserEmail) ||
          (authUserId && appCreatedBy === authUserId) ||
          (authUserId && appUserId === authUserId);

        if (!isOwner) {
          return NextResponse.json(
            { error: 'Forbidden: You do not have permission to view this application' },
            { status: 403 }
          );
        }
      }
    }

    // Fetch all applications strictly belonging to the currently authenticated user
    let founderApplications: any[] = [];
    if (isStaff && paramEmail) {
      const { data: apps, error: appsError } = await supabaseAdmin
        .from('applications')
        .select('*, organization:organizations!organization_id(id, name, slug, description, logo_url)')
        .ilike('applicant_email', paramEmail.trim().toLowerCase())
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;
      founderApplications = apps || [];
    } else if (authUserId || authUserEmail) {
      let query = supabaseAdmin
        .from('applications')
        .select('*, organization:organizations!organization_id(id, name, slug, description, logo_url)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (authUserId && authUserEmail) {
        query = query.or(`created_by.eq.${authUserId},applicant_email.ilike.${authUserEmail}`);
      } else if (authUserId) {
        query = query.eq('created_by', authUserId);
      } else if (authUserEmail) {
        query = query.ilike('applicant_email', authUserEmail);
      }

      const { data: apps, error: appsError } = await query;
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
