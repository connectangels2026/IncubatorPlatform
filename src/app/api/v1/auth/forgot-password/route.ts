import { NextResponse } from 'next/server';
import { resetPassword } from '@/backend/services/auth';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { error } = await resetPassword(email);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }

    return NextResponse.json({ message: 'Password reset instructions sent' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
