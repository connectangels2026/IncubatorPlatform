import { NextResponse } from 'next/server';
import { signIn } from '@/backend/services/auth';
import { storeActiveToken, logAuthEvent } from '@/backend/lib/session';

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

    const response = NextResponse.json({ user: data.user, session: data.session }, { status: 200 });

    if (data.session) {
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'Unknown';

      // Step 4: Create active session record
      await storeActiveToken(data.user.id, data.session.access_token, data.session.refresh_token, ip, userAgent);
      await logAuthEvent('login', data.user.id);

      // Step 2: Set httpOnly refresh cookie
      response.cookies.set('refresh_token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
