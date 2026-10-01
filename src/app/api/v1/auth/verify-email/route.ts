import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/backend/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, token, token_hash, type } = await req.json();

    if (!token && !token_hash) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    if (token_hash) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type || 'email',
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Email verified successfully', session: data.session }, { status: 200 });
    }

    if (email && token) {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: type || 'signup',
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Email verified successfully', session: data.session }, { status: 200 });
    }

    // Mock verification for dev testing
    if (token === 'mock-token' || token === '123456') {
      return NextResponse.json({ success: true, message: 'Email verified successfully (dev mock)' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
