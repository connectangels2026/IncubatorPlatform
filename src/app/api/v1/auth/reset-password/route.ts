import { NextResponse } from 'next/server';
import { supabase } from '@/backend/lib/supabase';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
