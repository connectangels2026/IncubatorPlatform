import { NextResponse } from 'next/server';
import { signUp } from '@/backend/services/auth';
import { logAuthEvent } from '@/backend/lib/session';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { data, error } = await signUp(email, password);

    if (error) {
      await logAuthEvent('failed_attempt');
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }

    return NextResponse.json({ user: data.user, session: data.session }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
