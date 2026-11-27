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
      .select('id, name, startup_name, founder_email, founder_name, organization_id')
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

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.nextUrl.origin ||
      'http://localhost:3000';

    // 4. Look up auth user by lowercased and trimmed email first
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = userList?.users?.find(
      (u) => (u.email || '').trim().toLowerCase() === founderEmail
    );

    // 5. If user already exists: link startup to existing founder
    if (existingUser) {
      await supabaseAdmin
        .from('startups')
        .update({
          founder_id: existingUser.id,
          founder_email: founderEmail,
        })
        .eq('id', startupId);

      return NextResponse.json({
        success: true,
        existing_user: true,
        email: founderEmail,
        message: `Existing user linked to ${startup.startup_name || startup.name || 'startup'}`,
        email_sent: false,
      });
    }

    // 6. If user doesn't exist: use Supabase native invite email
    const { data: inviteData, error: inviteErr } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(founderEmail, {
        redirectTo: `${siteUrl}/login`,
        data: {
          name: startup.founder_name || '',
          organization_id: startup.organization_id || '',
          role: 'founder',
          startup_id: startupId,
          startup_name: startup.startup_name || startup.name || '',
        },
      });

    if (inviteErr) {
      // If error is because user is already registered (e.g. race condition), link directly
      if (inviteErr.message?.toLowerCase().includes('already registered')) {
        const { data: refreshedUsers } = await supabaseAdmin.auth.admin.listUsers();
        const foundUser = refreshedUsers?.users?.find(
          (u) => (u.email || '').trim().toLowerCase() === founderEmail
        );
        if (foundUser) {
          await supabaseAdmin
            .from('startups')
            .update({
              founder_id: foundUser.id,
              founder_email: founderEmail,
            })
            .eq('id', startupId);
        }
        return NextResponse.json({
          success: true,
          existing_user: true,
          email: founderEmail,
          message: `User already registered and linked to startup`,
          email_sent: false,
        });
      }

      console.error('[invite-founder] Supabase inviteUserByEmail error:', inviteErr);
      return NextResponse.json(
        { error: 'Failed to send invite via Supabase: ' + inviteErr.message },
        { status: 500 }
      );
    }

    // Link startup to newly created invited auth user
    if (inviteData?.user?.id) {
      await supabaseAdmin
        .from('startups')
        .update({
          founder_id: inviteData.user.id,
          founder_email: founderEmail,
        })
        .eq('id', startupId);
    }

    return NextResponse.json({
      success: true,
      email: founderEmail,
      emailSent: true,
      message: 'Invitation sent via Supabase Auth successfully',
    });
  } catch (err: any) {
    console.error('[invite-founder] unexpected error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
