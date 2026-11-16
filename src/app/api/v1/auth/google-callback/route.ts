import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function GET(req: Request) {
  return handleOAuthCallback(req);
}

export async function POST(req: Request) {
  return handleOAuthCallback(req);
}

async function handleOAuthCallback(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const oauthClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data, error } = await oauthClient.auth.exchangeCodeForSession(code);
    if (error || !data?.session?.user) {
      return NextResponse.redirect(new URL('/login?error=OAuthCallbackError', req.url));
    }

    const authUser = data.session.user;
    const cleanEmail = (authUser.email || '').trim().toLowerCase();
    let { data: uRow } = await supabaseAdmin
      .from('users')
      .select('id, role, organization_id')
      .or(`id.eq.${authUser.id}${cleanEmail ? `,email.ilike.${cleanEmail}` : ''}`)
      .limit(1)
      .maybeSingle();

    if (!uRow && cleanEmail) {
      const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || cleanEmail.split('@')[0];
      const { data: created } = await supabaseAdmin
        .from('users')
        .insert({
          id: authUser.id,
          email: cleanEmail,
          full_name: fullName,
          first_name: fullName.split(' ')[0] || fullName,
          role: null,
          is_active: true,
          email_verified: true,
        })
        .select('id, role, organization_id')
        .maybeSingle();
      uRow = created || null;
    }

    const role = String(uRow?.role || authUser.user_metadata?.role || '').toLowerCase();
    let dest = '/auth/choose-role';
    if (role === 'super-admin' || role === 'super_admin') {
      dest = '/super-admin/dashboard';
    } else if (role === 'mentor') {
      const { data: mRow } = await supabaseAdmin
        .from('mentors')
        .select('id')
        .eq('user_id', uRow?.id || authUser.id)
        .is('deleted_at', null)
        .maybeSingle();
      dest = mRow ? '/mentor/dashboard' : '/mentor/application-form';
    } else if (role === 'startup' || role === 'founder') {
      dest = '/startup/dashboard';
    } else if (role === 'pending_incubator') {
      dest = '/auth/incubator-plans';
    } else if (role === 'admin' || role === 'incubator_admin' || role === 'incubator') {
      dest = uRow?.organization_id ? `/incubator?org=${uRow.organization_id}` : '/incubator';
    }

    const res = NextResponse.redirect(new URL(dest, req.url));
    res.cookies.set('refresh_token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    res.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
