import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/backend/services/auth';

export async function GET() {
  try {
    const { data, error } = await getCurrentUser();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }

    return NextResponse.json({ user: data.user }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
