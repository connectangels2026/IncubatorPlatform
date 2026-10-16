import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const VALID_ROLES = ['startup', 'incubator'];

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();

    // Validate inputs
    if (!email || !role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          code: 'MISSING_FIELD',
          message: 'Email and role are required',
        },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid role',
          code: 'INVALID_ROLE',
          message: `Role must be one of: ${VALID_ROLES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Get the user record
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, role, email_verified')
      .eq('email', trimmedEmail)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND',
          message: 'No user account found with this email',
        },
        { status: 404 }
      );
    }

    // Check if email is verified
    // NOTE: Email verification disabled for now - skipping this check
    // Will be re-enabled later

    // Check if role already selected
    if (userData.role && userData.role !== null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Role already selected',
          code: 'ROLE_ALREADY_SET',
          message: `Your role is already set to: ${userData.role}`,
        },
        { status: 400 }
      );
    }

    // Update user role
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Failed to update user role:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update role',
          code: 'UPDATE_FAILED',
          message: 'Failed to save your role selection. Please try again.',
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Role selected successfully. You are now a ${role}.`,
        user_id: userData.id,
        email: trimmedEmail,
        role: role,
        next_step: role === 'startup'
          ? 'Fill out your startup application form'
          : 'Set up your incubator organization',
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Select role error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'An error occurred',
        code: 'INTERNAL_ERROR',
        message: err.message || 'An error occurred while selecting your role',
      },
      { status: 500 }
    );
  }
}
