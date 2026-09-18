import { NextResponse } from 'next/server';
import { refreshToken } from '@/services/auth';
import { storeActiveToken } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    const { data, error } = await refreshToken(refresh_token);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }

    if (data.session) {
      // Store the new active token
      await storeActiveToken(data.user?.id || 'unknown', data.session.access_token);
    }

    return NextResponse.json({ session: data.session }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
