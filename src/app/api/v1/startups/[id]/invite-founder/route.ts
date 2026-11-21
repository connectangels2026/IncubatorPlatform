import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: startupId } = await params;

    // 1. Auth check
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    // 2. Only incubator staff can send invites
    const role = (user?.role || '').toLowerCase();
    const isStaff =
      role === 'incubator' ||
      role === 'incubator_admin' ||
      role === 'admin' ||
      role === 'super-admin' ||
      role === 'super_admin';
    if (!isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Fetch the startup to get founder email
    const { data: startup, error: startupErr } = await supabaseAdmin
      .from('startups')
      .select('id, founder_email, founder_name, organization_id')
      .eq('id', startupId)
      .single();

    if (startupErr || !startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    const founderEmail = (startup.founder_email || '').trim().toLowerCase();
    if (!founderEmail) {
      return NextResponse.json(
        { error: 'Startup has no founder email on record' },
        { status: 400 }
      );
    }

    // 4. Check if user already exists in Supabase Auth
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === founderEmail
    );

    // 5. If not exists, create a placeholder account first
    if (!existingUser) {
      const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: founderEmail,
        email_confirm: true,
        user_metadata: {
          name: startup.founder_name || '',
          organization_id: startup.organization_id || '',
          role: 'founder',
        },
      });
      if (createErr && !createErr.message?.toLowerCase().includes('already registered')) {
        console.error('[invite-founder] createUser error:', createErr);
        return NextResponse.json(
          { error: 'Could not create founder account: ' + createErr.message },
          { status: 500 }
        );
      }
    }

    // 6. Generate a password-reset / set-password link
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.nextUrl.origin ||
      'http://localhost:3000';
    const redirectTo = `${siteUrl}/auth/reset-password`;

    const { data: linkData, error: linkErr } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: founderEmail,
        options: { redirectTo },
      });

    if (linkErr || !linkData?.properties?.action_link) {
      console.error('[invite-founder] generateLink error:', linkErr);
      return NextResponse.json(
        { error: linkErr?.message || 'Failed to generate invitation link' },
        { status: 500 }
      );
    }

    const link = linkData.properties.action_link;

    return NextResponse.json({ success: true, link, email: founderEmail });
  } catch (err: any) {
    console.error('[invite-founder] unexpected error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
