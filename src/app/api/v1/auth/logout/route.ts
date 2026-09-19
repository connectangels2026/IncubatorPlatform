import { NextResponse } from 'next/server';
import { signOut } from '@/services/auth';
import { invalidateToken, logAuthEvent } from '@/lib/session';

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

    // Step 2 & 5: Clear refresh token cookie on logout
    response.cookies.delete('refresh_token');

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
