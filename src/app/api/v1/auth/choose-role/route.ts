import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const VALID_ROLES = ['startup', 'incubator_admin'];

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

// Decode JWT without external library
function decodeJWT(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Add padding if needed
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (err) {
    console.error('JWT decode error:', err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { role } = await req.json();

    // Validate role input
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid role. Must be '${VALID_ROLES.join("' or '")}'`,
          code: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid Authorization header',
          code: 'MISSING_AUTH',
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Decode JWT to get user ID
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.sub) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token',
          code: 'INVALID_TOKEN',
        },
        { status: 401 }
      );
    }

    const userId = decoded.sub;
    const userEmail = decoded.email;

    // Try by auth user id mapped from JWT sub first, then by email
    let userData: any = null;
    let userError: any = null;
    let { data: userDataByAuth, error: authErr } = await supabaseAdmin
      .from('users')
      .select('id, role, email')
      .eq('id', userId)
      .maybeSingle();
    userData = userDataByAuth;
    userError = authErr;

    // If not found by id, try by email (in case id differs)
    if (!userData) {
      const { data: userDataByEmail, error: emailErr } = await supabaseAdmin
        .from('users')
        .select('id, role, email')
        .eq('email', userEmail)
        .maybeSingle();
      if (userDataByEmail) {
        userData = userDataByEmail;
        userError = null;
      }
    }

    // If user not found in DB, return error so user knows they must be signed up
    if (!userData) {
      console.warn('User not found in DB, skipping account init');
      return NextResponse.json(
        {
          success: false,
          error: 'User account not found. Please sign up first.',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Ensure userData exists
    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to load user data',
          code: 'USER_DATA_FAILED',
        },
        { status: 500 }
      );
    }

    // Check if user already has a role selected - smoothly redirect instead of blocking with 400 error
    if (userData.role && userData.role !== null) {
      const redirect_to = (userData.role === 'startup' || role === 'startup')
        ? '/startup/application'
        : '/auth/incubator-plans';
      return NextResponse.json(
        {
          success: true,
          message: 'Role already set',
          role: userData.role,
          redirect_to,
        },
        { status: 200 }
      );
    }

    // Update user role in database - use the user's DB id (from lookup) not JWT sub
    const dbUserId = userData.id;
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', dbUserId);

    if (updateError) {
      console.error('Failed to update user role:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update role in database',
          code: 'UPDATE_FAILED',
        },
        { status: 500 }
      );
    }

    // Also synchronize user_metadata in Supabase Auth
    if (userId) {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { role },
      }).catch((metaErr) => {
        console.warn('Could not sync user_metadata role:', metaErr);
      });
    }

    // Determine redirect URL based on role
    const redirect_to = role === 'startup' ? '/startup/application' : '/auth/incubator-plans';

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Role selected successfully',
        role: role,
        user_id: dbUserId,
        email: userEmail || userData.email,
        redirect_to: redirect_to,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Choose role error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'An error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
