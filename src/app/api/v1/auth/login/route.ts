import { NextResponse } from 'next/server';
import { signIn } from '@/backend/services/auth';
import { storeActiveToken, logAuthEvent } from '@/backend/lib/session';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { isSuperAdminEmail } from '@/backend/lib/superadmin';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    const { data, error } = await signIn(email, password);

    if (error) {
      await logAuthEvent('failed_attempt');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed. Please try again.', code: 'AUTH_FAILED' },
        { status: 401 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const isSuperAdmin = (await isSuperAdminEmail(cleanEmail));

    // Query user profile by auth_user_id, id, or email (case-insensitive) to prevent duplicates
    let { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, email_verified, role, organization_id')
      .or(`id.eq.${data.user.id},auth_user_id.eq.${data.user.id},email.ilike.${cleanEmail}`)
      .limit(1)
      .maybeSingle();

    // Auto-provision missing public.users record for authenticated Supabase user
    if (!userData && data.user) {
      const resolvedRole = isSuperAdmin
        ? 'super-admin'
        : (data.user.user_metadata?.role || data.user.user_metadata?.selected_role || null);

      const fullName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.user_metadata?.founder_name ||
        cleanEmail.split('@')[0] ||
        'User';

      const insertPayload: Record<string, any> = {
        id: data.user.id,
        auth_user_id: data.user.id,
        email: cleanEmail,
        full_name: fullName,
        first_name: fullName.split(' ')[0] || fullName,
        role: resolvedRole,
        email_verified: Boolean(data.user.email_confirmed_at || isSuperAdmin),
      };

      const { data: createdUser, error: insertUserErr } = await supabaseAdmin
        .from('users')
        .insert(insertPayload)
        .select('id, email, email_verified, role, organization_id')
        .maybeSingle();

      if (insertUserErr) {
        console.warn('Auto-provisioning user insert notice:', insertUserErr);
        const { data: fetchedAfterInsert } = await supabaseAdmin
          .from('users')
          .select('id, email, email_verified, role, organization_id')
          .ilike('email', cleanEmail)
          .maybeSingle();
        userData = fetchedAfterInsert || (insertPayload as any);
      } else {
        userData = createdUser || (insertPayload as any);
      }
    }

    if (!userData) {
      console.error('User not found:', userError);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Super Admin bypasses incubator organization requirement

    let orgData: any = null;

    if (!isSuperAdmin) {
      if (userData.organization_id) {
        const { data: oData } = await supabaseAdmin
          .from('organizations')
          .select('id, slug, name, founder_name, founder_email, is_verified')
          .eq('id', userData.organization_id)
          .maybeSingle();

        orgData = oData;
      }

      // Fallback 1: lookup by auth_user_id
      if (!orgData && data.user?.id) {
        const { data: oDataByAuth } = await supabaseAdmin
          .from('organizations')
          .select('id, slug, name, founder_name, founder_email, is_verified')
          .eq('auth_user_id', data.user.id)
          .maybeSingle();

        if (oDataByAuth) orgData = oDataByAuth;
      }

      // Fallback 2: lookup by founder_email
      if (!orgData && email) {
        const { data: oDataByEmail } = await supabaseAdmin
          .from('organizations')
          .select('id, slug, name, founder_name, founder_email, is_verified')
          .ilike('founder_email', email.trim())
          .maybeSingle();

        if (oDataByEmail) orgData = oDataByEmail;
      }

      // Sync organization_id back to users table if missing
      if (orgData?.id && !userData.organization_id) {
        await supabaseAdmin.from('users').update({ organization_id: orgData.id }).eq('id', userData.id);
      }
    }

    // Check if email is verified (using users table, not organizations table)
    if (!isSuperAdmin && !userData.email_verified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please verify your email first',
          code: 'EMAIL_NOT_VERIFIED',
          user_id: userData.id,
        },
        { status: 403 }
      );
    }

    // Check if user has selected a role
    if (!isSuperAdmin && !userData.role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please select your role first',
          code: 'ROLE_NOT_SELECTED',
          user_id: userData.id,
          next_step: '/auth/choose-role',
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: data.user.id,
          email: data.user.email,
          role: isSuperAdmin ? 'super-admin' : userData.role,
          founder_name: orgData?.founder_name || data.user.user_metadata?.full_name || 'Administrator',
        },
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }
          : null,
        organization: orgData
          ? {
              id: orgData.id,
              slug: orgData.slug,
              name: orgData.name,
              founder_name: orgData.founder_name,
              founder_email: orgData.founder_email,
              is_verified: orgData.is_verified,
            }
          : null,
      },
      { status: 200 }
    );

    if (data.session) {
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'Unknown';

      // Create active session record
      await storeActiveToken(data.user.id, data.session.access_token, data.session.refresh_token, ip, userAgent);
      await logAuthEvent('login', data.user.id);

      // Set httpOnly refresh cookie
      response.cookies.set('refresh_token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      // Set access token in response header for client-side access
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
      response.headers.set('x-access-token', data.session.access_token);
    }

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
