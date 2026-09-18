import { NextResponse } from 'next/server';
import { signOut } from '@/services/auth';
import { invalidateToken, logAuthEvent } from '@/lib/session';

export async function POST(req: Request) {
  try {
    // We expect the client to send the access token to invalidate
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

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
