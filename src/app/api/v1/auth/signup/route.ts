import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signUp } from '@/backend/services/auth';
import { logAuthEvent } from '@/backend/lib/session';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

function validateFounderName(name: string): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return { field: 'founder_name', message: 'Founder name is required', code: 'REQUIRED_FIELD' };
  }
  if (name.length < 2) {
    return { field: 'founder_name', message: 'Founder name must be at least 2 characters', code: 'MIN_LENGTH' };
  }
  if (name.length > 255) {
    return { field: 'founder_name', message: 'Founder name must not exceed 255 characters', code: 'MAX_LENGTH' };
  }
  // Check for special characters (allow letters, spaces, hyphens, apostrophes, and dots)
  if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
    return { field: 'founder_name', message: 'Founder name can only contain letters, spaces, hyphens, periods, and apostrophes', code: 'INVALID_FORMAT' };
  }
  return null;
}

function validateEmail(email: string): ValidationError | null {
  if (!email || email.trim().length === 0) {
    return { field: 'email', message: 'Email is required', code: 'REQUIRED_FIELD' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { field: 'email', message: 'Invalid email format', code: 'INVALID_EMAIL' };
  }
  return null;
}

function validatePassword(pwd: string): ValidationError | null {
  if (!pwd) {
    return { field: 'password', message: 'Password is required', code: 'REQUIRED_FIELD' };
  }
  if (pwd.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters', code: 'INVALID_PASSWORD' };
  }
  if (!/[A-Z]/.test(pwd)) {
    return { field: 'password', message: 'Password must be at least 8 characters and contain 1 uppercase letter and 1 number', code: 'INVALID_PASSWORD' };
  }
  if (!/[0-9]/.test(pwd)) {
    return { field: 'password', message: 'Password must be at least 8 characters and contain 1 uppercase letter and 1 number', code: 'INVALID_PASSWORD' };
  }
  return null;
}

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/\-+/g, '-')
    .slice(0, 100);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { founder_name, email, password } = body;

    // Validate only required fields for generic signup
    const founderNameError = validateFounderName(founder_name);
    if (founderNameError) {
      return NextResponse.json(
        {
          success: false,
          error: founderNameError.message,
          code: founderNameError.code,
          message: founderNameError.message
        },
        { status: 400 }
      );
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json(
        {
          success: false,
          error: emailError.message,
          code: emailError.code,
          message: emailError.message
        },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json(
        {
          success: false,
          error: passwordError.message,
          code: passwordError.code,
          message: passwordError.message
        },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check for duplicate email in auth and public tables
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const duplicateAuthUser = usersData?.users?.some(
      (u) => u.email?.toLowerCase() === trimmedEmail
    );

    const { data: existingPublicUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .ilike('email', trimmedEmail)
      .limit(1)
      .maybeSingle();

    if (duplicateAuthUser || existingPublicUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already registered',
          code: 'DUPLICATE_EMAIL',
          message: 'This email is already in use. Try logging in or use a different email.'
        },
        { status: 400 }
      );
    }

    // Create Supabase Auth user (NO EMAIL SENT - verification disabled)
    const { data, error } = await signUp(trimmedEmail, password);

    if (error) {
      console.error('Auth user creation failed:', error);
      await logAuthEvent('failed_attempt');
      const errorMsg = (error.message || '').toLowerCase();
      const isRateLimit = errorMsg.includes('rate limit') || errorMsg.includes('too many') || (error as any).status === 429;
      let userFacingError = error.message || 'Failed to create auth user';
      if (isRateLimit) {
        userFacingError = 'Too many email requests sent. Please wait 24hours before requesting a new link.';
      }
      const statusCode = isRateLimit ? 429 : ((error as any).status && (error as any).status >= 400 && (error as any).status < 600 ? (error as any).status : 400);
      return NextResponse.json(
        {
          success: false,
          error: userFacingError,
          code: isRateLimit ? 'RATE_LIMIT_EXCEEDED' : 'AUTH_CREATION_FAILED',
          message: userFacingError
        },
        { status: statusCode }
      );
    }

    if (!data?.user) {
      console.error('No user returned from auth signup');
      return NextResponse.json(
        {
          success: false,
          error: 'User creation failed. Please try again.',
          code: 'AUTH_FAILED',
          message: 'User creation failed. Please try again.'
        },
        { status: 500 }
      );
    }

    // Create user profile in users table (role = null, organization_id = null)
    const nameArray = founder_name.trim().split(' ');
    const firstName = nameArray[0] || 'User';
    const lastName = nameArray.slice(1).join(' ') || '';

    let { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: data.user.id,
        organization_id: null, // No organization created here
        email: trimmedEmail,
        first_name: firstName,
        last_name: lastName,
        full_name: founder_name.trim(),
        is_active: true,
        email_verified: true, // Verified by default to bypass email rate limits
        role: null, // Role is NOT selected yet
      })
      .select()
      .single();

    if (userError) {
      const retry = await supabaseAdmin
        .from('users')
        .insert({
          organization_id: null,
          email: trimmedEmail,
          first_name: firstName,
          last_name: lastName,
          full_name: founder_name.trim(),
          is_active: true,
          email_verified: true,
          role: null,
        })
        .select()
        .single();
      userData = retry.data;
      userError = retry.error;
    }

    // Auto-confirm user in Supabase Auth and ensure role is explicitly null until user chooses a role
    if (data?.user?.id) {
      await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
        email_confirm: true,
        user_metadata: {
          full_name: founder_name.trim(),
          name: founder_name.trim(),
          role: null,
        },
      }).catch(() => {});
    }

    if (userError) {
      console.error('User profile creation failed:', userError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create user profile. Please contact support.',
          code: 'USER_CREATION_FAILED',
          message: 'Failed to create user profile. Please contact support.',
          details: userError.message,
        },
        { status: 500 }
      );
    }

    if (!userData || !userData.id) {
      console.error('User creation returned no data');
      return NextResponse.json(
        {
          success: false,
          error: 'User creation failed - no data returned.',
          code: 'USER_CREATION_FAILED',
          message: 'Failed to create user profile. Please contact support.'
        },
        { status: 500 }
      );
    }

    // Establish authenticated session + auth cookies immediately for protected routes
    let activeSession = (data as any)?.session || null;
    if (!activeSession) {
      try {
        const anonClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          { auth: { persistSession: false, autoRefreshToken: false } }
        );
        const { data: signInData } = await anonClient.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInData?.session) {
          activeSession = signInData.session;
        }
      } catch {}
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Signup successful.',
        user_id: userData.id,
        email: trimmedEmail,
        founder_name: founder_name.trim(),
        auth_user_id: data.user.id,
        session: activeSession
          ? {
              access_token: activeSession.access_token,
              refresh_token: activeSession.refresh_token,
            }
          : null,
      },
      { status: 201 }
    );

    if (activeSession?.access_token && activeSession?.refresh_token) {
      response.cookies.set('refresh_token', activeSession.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
      response.cookies.set('sb-access-token', activeSession.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
    }

    return response;
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'An error occurred during signup',
        code: 'INTERNAL_ERROR',
        message: err.message || 'An error occurred during signup'
      },
      { status: 500 }
    );
  }
}

