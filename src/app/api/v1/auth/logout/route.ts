import { NextResponse } from 'next/server';
import { signOut } from '@/backend/services/auth';
import { invalidateToken, logAuthEvent } from '@/backend/lib/session';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (token) {
      await invalidateToken(token);
    }

    const { error } = await signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }

    await logAuthEvent('logout');

    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

    // Clear every auth cookie the app and Supabase set. Supabase stores the
    // session in a JSON blob under sb-<project-ref>-auth-token, so enumerate
    // the incoming Cookie header and wipe anything matching, plus the named fallbacks.
    const authCookieNames = new Set([
      'refresh_token',
      'sb-access-token',
      'access_token',
      'token',
      'auth_token',
    ]);
    const cookieHeader = req.headers.get('cookie') || '';
    for (const pair of cookieHeader.split(';')) {
      const name = pair.split('=')[0]?.trim();
      if (name && (name.startsWith('sb-') || authCookieNames.has(name))) {
        response.cookies.set(name, '', { path: '/', maxAge: 0 });
      }
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
