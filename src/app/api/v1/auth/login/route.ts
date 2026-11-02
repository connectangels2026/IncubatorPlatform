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

    // Query user profile and organization
    let { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, email_verified, role, organization_id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    const isSuperAdmin = (await isSuperAdminEmail(email)) || userData?.role === 'super-admin';
    if (!userData && isSuperAdmin) {
      const { data: newAdmin } = await supabaseAdmin
        .from('users')
        .upsert({ email: email.toLowerCase(), role: 'super-admin', email_verified: true }, { onConflict: 'email' })
        .select()
        .maybeSingle();
      userData = newAdmin || { id: data.user.id, email: email.toLowerCase(), role: 'super-admin', email_verified: true };
    }
    if (userError || !userData) {
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
