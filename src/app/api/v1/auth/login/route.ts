import { NextResponse } from 'next/server';
import { signIn } from '@/services/auth';
import { storeActiveToken, logAuthEvent } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { data, error } = await signIn(email, password);

    if (error) {
      await logAuthEvent('failed_attempt');
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }

    if (data.session) {
      // Store active token in session management
      await storeActiveToken(data.user.id, data.session.access_token);
      await logAuthEvent('login', data.user.id);
    }

    return NextResponse.json({ user: data.user, session: data.session }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
