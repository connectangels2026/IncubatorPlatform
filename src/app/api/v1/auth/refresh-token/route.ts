import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { refreshToken } from '@/services/auth';
import { storeActiveToken } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    let tokenStr = cookieStore.get('refresh_token')?.value;

    if (!tokenStr) {
      try {
        const body = await req.json();
        tokenStr = body.refresh_token;
      } catch {}
    }

    if (!tokenStr) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    const { data, error } = await refreshToken(tokenStr);

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || 'Invalid session' }, { status: 401 });
    }

    // Store the refreshed session in Redis/Memory
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    await storeActiveToken(data.user?.id || 'unknown', data.session.access_token, data.session.refresh_token, ip, userAgent);

    // Set secure httpOnly cookie with 7-day expiry
    const response = NextResponse.json({ session: data.session }, { status: 200 });
    response.cookies.set('refresh_token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
