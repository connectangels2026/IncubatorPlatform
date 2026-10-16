import { NextResponse } from 'next/server';
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
  // Check for special characters
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { field: 'founder_name', message: 'Founder name can only contain letters, spaces, hyphens, and apostrophes', code: 'INVALID_FORMAT' };
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
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const duplicateAuthUser = usersData?.users?.some(
      (u) => u.email?.toLowerCase() === trimmedEmail
    );

    const { data: existingPublicUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', trimmedEmail)
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
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to create auth user',
          code: 'AUTH_FAILED',
          message: error.message || 'Failed to create auth user'
        },
        { status: error.status || 500 }
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

    // Create user profile WITHOUT organization_id (will be set after role selection)
    // For now, we need to create a temporary organization since organization_id is NOT NULL
    // BUT this organization will not be used - it's just a placeholder
    // We'll create the real organization after role selection

    const tempOrgName = `temp-${Date.now()}`;
    const { data: tempOrgData, error: tempOrgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: tempOrgName,
        slug: `temp-${Date.now()}`,
        founder_name: founder_name.trim(),
        founder_email: trimmedEmail,
        auth_user_id: data.user.id,
        is_verified: false,
        is_active: true,
      })
      .select()
      .single();

    if (tempOrgError) {
      console.error('Temp organization creation failed:', tempOrgError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create account. Please contact support.',
          code: 'ORG_CREATION_FAILED',
          message: 'Failed to create account. Please contact support.'
        },
        { status: 500 }
      );
    }

    // Create user profile with NO role (role = null)
    const nameArray = founder_name.trim().split(' ');
    const firstName = nameArray[0] || 'User';
    const lastName = nameArray.slice(1).join(' ') || '';

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        organization_id: tempOrgData.id, // Temporary org - will be replaced after role selection
        email: trimmedEmail,
        first_name: firstName,
        last_name: lastName,
        full_name: founder_name.trim(),
        is_active: true,
        email_verified: true, // Email verification disabled
        role: null, // NO ROLE YET - user must select
      })
      .select()
      .single();

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

    // Return success response - user can now select role
    return NextResponse.json(
      {
        success: true,
        message: 'Signup successful. Please select your role.',
        user_id: userData.id,
        email: trimmedEmail,
        founder_name: founder_name.trim(),
        auth_user_id: data.user.id,
      },
      { status: 201 }
    );
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

