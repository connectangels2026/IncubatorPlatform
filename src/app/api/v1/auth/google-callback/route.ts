import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // Usually Google callback is handled by Supabase redirecting to the client.
    // If you need a server-side callback to exchange code for session:
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(new URL('/login?error=OAuthCallbackError', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
