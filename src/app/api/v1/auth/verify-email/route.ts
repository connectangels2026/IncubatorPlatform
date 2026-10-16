import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/backend/lib/supabase';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { email, token, token_hash, type } = await req.json();

    if (!token && !token_hash) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    let verifyResult;

    // Verify using token_hash (preferred method)
    if (token_hash) {
      verifyResult = await supabase.auth.verifyOtp({
        token_hash,
        type: type || 'email',
      });
    }
    // Verify using email + token
    else if (email && token) {
      verifyResult = await supabase.auth.verifyOtp({
        email,
        token,
        type: type || 'signup',
      });
    }
    // Mock verification for dev testing
    else if (token === 'mock-token' || token === '123456') {
      verifyResult = { data: { user: { email: email || 'test@example.com' }, session: null }, error: null };
    }
    else {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification link', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    const { data, error } = verifyResult;

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification link', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    if (!data.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification link', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    // Mark user email as verified in users table
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({ email_verified: true })
      .eq('email', data.user.email);

    if (userUpdateError) {
      console.error('Failed to mark user email as verified:', userUpdateError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify email. Please contact support.', code: 'VERIFICATION_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully. Please select your role.',
        email: data.user.email,
        redirect_to: '/auth/choose-role',
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Email verification error:', err);
    return NextResponse.json(
      { success: false, error: 'Invalid or expired verification link', code: 'INVALID_TOKEN' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');
    const token_hash = searchParams.get('token_hash');
    const email = searchParams.get('email');
    const type = searchParams.get('type') || 'signup';

    if (!token && !token_hash) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    let verifyResult;

    // Verify using token_hash (preferred method)
    if (token_hash) {
      verifyResult = await supabase.auth.verifyOtp({
        token_hash,
        type,
      });
    }
    // Verify using email + token
    else if (email && token) {
      verifyResult = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });
    }
    // Mock verification for dev testing
    else if (token === 'mock-token' || token === '123456') {
      verifyResult = { data: { user: { email: email || 'test@example.com' }, session: null }, error: null };
    }
    else {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification link', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    const { data, error } = verifyResult;

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification link', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    if (!data.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification link', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    // Mark user email as verified in users table
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({ email_verified: true })
      .eq('email', data.user.email);

    if (userUpdateError) {
      console.error('Failed to mark user email as verified:', userUpdateError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify email. Please contact support.', code: 'VERIFICATION_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully. Please select your role.',
        email: data.user.email,
        redirect_to: '/auth/choose-role',
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Email verification error:', err);
    return NextResponse.json(
      { success: false, error: 'Invalid or expired verification link', code: 'INVALID_TOKEN' },
      { status: 400 }
    );
  }
}

