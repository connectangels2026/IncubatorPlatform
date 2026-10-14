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

function validateOrganizationName(name: string): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return { field: 'organization_name', message: 'Organization name is required', code: 'REQUIRED_FIELD' };
  }
  if (name.length < 3) {
    return { field: 'organization_name', message: 'Organization name must be at least 3 characters', code: 'MIN_LENGTH' };
  }
  if (name.length > 255) {
    return { field: 'organization_name', message: 'Organization name must not exceed 255 characters', code: 'MAX_LENGTH' };
  }
  return null;
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
  return null;
}

function validateEmail(email: string): ValidationError | null {
  if (!email || email.trim().length === 0) {
    return { field: 'founder_email', message: 'Email is required', code: 'REQUIRED_FIELD' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { field: 'founder_email', message: 'Invalid email format', code: 'INVALID_FORMAT' };
  }
  return null;
}

function validatePassword(pwd: string): ValidationError | null {
  if (!pwd) {
    return { field: 'password', message: 'Password is required', code: 'REQUIRED_FIELD' };
  }
  if (pwd.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters', code: 'MIN_LENGTH' };
  }
  if (!/[A-Z]/.test(pwd)) {
    return { field: 'password', message: 'Password must contain at least one uppercase letter', code: 'INVALID_PASSWORD' };
  }
  if (!/[0-9]/.test(pwd)) {
    return { field: 'password', message: 'Password must contain at least one number', code: 'INVALID_PASSWORD' };
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
    const { organization_name, founder_name, founder_email, password } = await req.json();

    // Validate all required fields with detailed errors
    const orgNameError = validateOrganizationName(organization_name);
    if (orgNameError) {
      return NextResponse.json(
        { success: false, error: orgNameError.message, code: orgNameError.code },
        { status: 400 }
      );
    }

    const founderNameError = validateFounderName(founder_name);
    if (founderNameError) {
      return NextResponse.json(
        { success: false, error: founderNameError.message, code: founderNameError.code },
        { status: 400 }
      );
    }

    const emailError = validateEmail(founder_email);
    if (emailError) {
      return NextResponse.json(
        { success: false, error: emailError.message, code: emailError.code },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json(
        { success: false, error: passwordError.message, code: passwordError.code },
        { status: 400 }
      );
    }

    const trimmedEmail = founder_email.trim().toLowerCase();

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
        { success: false, error: 'Email already registered', code: 'DUPLICATE_EMAIL' },
        { status: 409 }
      );
    }

    // Check for duplicate organization name
    const { data: existingOrg } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('name', organization_name.trim())
      .maybeSingle();

    if (existingOrg) {
      return NextResponse.json(
        { success: false, error: 'Organization name already exists', code: 'DUPLICATE_ORG_NAME' },
        { status: 409 }
      );
    }

    // Create Supabase Auth user
    const { data, error } = await signUp(trimmedEmail, password);

    if (error) {
      await logAuthEvent('failed_attempt');
      return NextResponse.json(
        { success: false, error: error.message, code: 'AUTH_FAILED' },
        { status: error.status || 500 }
      );
    }

    // Edge Case: Supabase enumeration protection returns user with empty identities
    if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Email already registered', code: 'DUPLICATE_EMAIL' },
        { status: 409 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: 'User creation failed. Please try again.', code: 'AUTH_FAILED' },
        { status: 500 }
      );
    }

    // Generate slug
    const slug = generateSlug(organization_name);

    // Check if slug already exists (for duplicate organization names with different casing)
    const { data: existingSlug } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'Organization name already exists', code: 'DUPLICATE_ORG_NAME' },
        { status: 409 }
      );
    }

    // Create organization record with auth_user_id
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: organization_name.trim(),
        slug,
        founder_name: founder_name.trim(),
        founder_email: trimmedEmail,
        auth_user_id: data.user.id,
        is_verified: false,
        is_active: true,
      })
      .select()
      .single();

    if (orgError) {
      console.error('Organization creation failed:', orgError);
      // Ideally delete the auth user here, but we'll leave it for recovery
      return NextResponse.json(
        { success: false, error: 'Failed to create organization. Please contact support.', code: 'ORG_CREATION_FAILED' },
        { status: 500 }
      );
    }

    // Create founder user profile in public.users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        organization_id: orgData.id,
        email: trimmedEmail,
        first_name: founder_name.trim().split(' ')[0],
        last_name: founder_name.trim().split(' ').slice(1).join(' ') || '',
        full_name: founder_name.trim(),
        is_active: true,
        email_verified: false,
      })
      .select()
      .single();

    if (userError) {
      console.error('User profile creation failed:', userError);
      return NextResponse.json(
        { success: false, error: 'Failed to create user profile. Please contact support.', code: 'USER_CREATION_FAILED' },
        { status: 500 }
      );
    }

    // Create user_roles entry with admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userData.id,
        organization_id: orgData.id,
        role: 'admin',
        is_active: true,
      });

    if (roleError) {
      console.error('User role assignment failed:', roleError);
      return NextResponse.json(
        { success: false, error: 'Failed to assign role. Please contact support.', code: 'ROLE_ASSIGNMENT_FAILED' },
        { status: 500 }
      );
    }

    // Return success response matching the specification
    return NextResponse.json(
      {
        success: true,
        message: 'Organization created successfully',
        organization_id: orgData.id,
        organization_name: orgData.name,
        slug: orgData.slug,
        founder_email: orgData.founder_email,
        is_verified: false,
        next_steps: 'Verification email sent. Click the link to verify your email and complete signup.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'An error occurred during signup', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
