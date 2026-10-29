import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

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

      // 2. Query public.users table for profile
      if (user.email) {
        const { data: uRec } = await supabaseAdmin
          .from('users')
          .select('id, organization_id, email, full_name, first_name, last_name, role')
          .eq('email', user.email)
          .maybeSingle();

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

    return NextResponse.json(
      {
        success: true,
        user: {
          ...user,
          role: userProfile?.role ?? null,
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

