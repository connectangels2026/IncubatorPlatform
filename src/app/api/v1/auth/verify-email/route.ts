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

    // Get organization data for this user
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, name, is_verified')
      .eq('auth_user_id', data.user.id)
      .single();

    if (orgError || !orgData) {
      return NextResponse.json(
        { success: false, error: 'Organization not found', code: 'ORG_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update organization as verified
    const { error: updateError } = await supabaseAdmin
      .from('organizations')
      .update({ is_verified: true })
      .eq('id', orgData.id);

    if (updateError) {
      console.error('Failed to update organization verification status:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify email. Please contact support.', code: 'VERIFICATION_FAILED' },
        { status: 500 }
      );
    }

    // Mark user email as verified
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({ email_verified: true })
      .eq('email', data.user.email);

    if (userUpdateError) {
      console.error('Failed to mark user email as verified:', userUpdateError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully',
        organization_name: orgData.name,
        is_verified: true,
        redirect_to: '/auth/login?message=Email%20verified%20successfully',
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

    // Get organization data for this user
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, name, is_verified')
      .eq('auth_user_id', data.user.id)
      .single();

    if (orgError || !orgData) {
      return NextResponse.json(
        { success: false, error: 'Organization not found', code: 'ORG_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update organization as verified
    const { error: updateError } = await supabaseAdmin
      .from('organizations')
      .update({ is_verified: true })
      .eq('id', orgData.id);

    if (updateError) {
      console.error('Failed to update organization verification status:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify email. Please contact support.', code: 'VERIFICATION_FAILED' },
        { status: 500 }
      );
    }

    // Mark user email as verified
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({ email_verified: true })
      .eq('email', data.user.email);

    if (userUpdateError) {
      console.error('Failed to mark user email as verified:', userUpdateError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully',
        organization_name: orgData.name,
        is_verified: true,
        redirect_to: '/auth/login?message=Email%20verified%20successfully',
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
