import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { isSuperAdminEmail } from '@/backend/lib/superadmin';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    let orgData: any = null;
    let userProfile: any = null;

    if (user?.id) {
      // 1. Check organization by auth_user_id
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('id, slug, name, founder_name, founder_email, is_verified, logo_url')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      orgData = org;

      // 2. Query public.users table for profile (robust match by id or email)
      if (user.email || user.id) {
        const cleanEmail = (user.email || '').trim().toLowerCase();
        let uRec: any = null;

        const isValidUUID = (val?: string) =>
          Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

        if (isValidUUID(user.id)) {
          const { data: byId } = await supabaseAdmin
            .from('users')
            .select('id, organization_id, email, full_name, first_name, last_name, role')
            .eq('id', user.id)
            .maybeSingle();
          if (byId) uRec = byId;
        }

        if (!uRec && cleanEmail) {
          const { data: byEmail } = await supabaseAdmin
            .from('users')
            .select('id, organization_id, email, full_name, first_name, last_name, role')
            .ilike('email', cleanEmail)
            .maybeSingle();
          if (byEmail) uRec = byEmail;
        }

        userProfile = uRec;

        // 3. Fallback to org linked via public.users if not found by auth_user_id
        if (!orgData && uRec?.organization_id) {
          const { data: org2 } = await supabaseAdmin
            .from('organizations')
            .select('id, slug, name, founder_name, founder_email, is_verified, logo_url')
            .eq('id', uRec.organization_id)
            .maybeSingle();
          orgData = org2;
        }

        // 4. Fallback to org matched by founder_email
        if (!orgData && user.email) {
          const { data: orgByEmail } = await supabaseAdmin
            .from('organizations')
            .select('id, slug, name, founder_name, founder_email, is_verified, logo_url')
            .ilike('founder_email', user.email.trim())
            .maybeSingle();
          if (orgByEmail) orgData = orgByEmail;
        }
      }
    }

    const isSuperAdmin = await isSuperAdminEmail(user?.email);
    const validRoles = ['startup', 'founder', 'incubator_admin', 'incubator', 'admin', 'super-admin'];
    const dbRole = userProfile?.role && validRoles.includes(userProfile.role.toLowerCase()) ? userProfile.role : null;
    const userMetaRole = (user as any)?.user_metadata?.role;
    const metaRole = userMetaRole && validRoles.includes(String(userMetaRole).toLowerCase()) ? userMetaRole : null;

    const resolvedRole = isSuperAdmin
      ? 'super-admin'
      : (dbRole ?? metaRole ?? (orgData && !userProfile ? 'admin' : null));

    return NextResponse.json(
      {
        success: true,
        user: {
          ...user,
          role: resolvedRole,
          is_super_admin: isSuperAdmin,
          full_name: userProfile?.full_name || [userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(' ') || orgData?.founder_name,
          user_table_full_name: userProfile?.full_name || [userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(' ') || null,
          founder_name: orgData?.founder_name || userProfile?.full_name,
        },
        organization: orgData,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

