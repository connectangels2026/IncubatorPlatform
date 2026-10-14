import { NextResponse } from 'next/server';
import { signIn } from '@/backend/services/auth';
import { storeActiveToken, logAuthEvent } from '@/backend/lib/session';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

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

    // Query organization by auth_user_id
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, slug, name, founder_name, founder_email, is_verified')
      .eq('auth_user_id', data.user.id)
      .single();

    if (orgError || !orgData) {
      // Organization not found - user exists in auth but no organization
      console.error('Organization not found for auth_user_id:', data.user.id);
      return NextResponse.json(
        { success: false, error: 'Organization not found. Please contact support.', code: 'ORG_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if organization is verified
    if (!orgData.is_verified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please verify your email first',
          code: 'EMAIL_NOT_VERIFIED',
          organization_id: orgData.id,
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
          founder_name: orgData.founder_name,
        },
        organization: {
          id: orgData.id,
          slug: orgData.slug,
          name: orgData.name,
          founder_name: orgData.founder_name,
          founder_email: orgData.founder_email,
          is_verified: orgData.is_verified,
        },
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
