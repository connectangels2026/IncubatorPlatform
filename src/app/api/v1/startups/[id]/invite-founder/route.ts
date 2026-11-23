import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { Resend } from 'resend';

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
      .select('id, name, founder_email, founder_name, organization_id')
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

    // 7. Dispatch email via Resend
    let emailSent = false;
    let emailError: string | null = null;
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Acme <onboarding@resend.dev>';

    try {
      const resend = new Resend(resendApiKey);
      const { error: sendErr } = await resend.emails.send({
        from: fromEmail,
        to: founderEmail,
        subject: `Invitation to access ${startup.name || 'Startup Portal'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e293b;">Welcome to the Incubator Portal</h2>
            <p>Hi ${startup.founder_name || 'Founder'},</p>
            <p>You have been invited to access the incubator portal for <strong>${startup.name || 'your startup'}</strong>.</p>
            <p style="margin: 24px 0;">
              <a href="${link}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Set Password & Access Dashboard
              </a>
            </p>
            <p style="color: #64748b; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #2563eb; font-size: 13px; word-break: break-all;"><a href="${link}">${link}</a></p>
          </div>
        `,
      });

      if (sendErr) {
        console.error('[invite-founder] resend send error:', sendErr);
        emailError = sendErr.message;
      } else {
        emailSent = true;
      }
    } catch (sendEx: any) {
      console.error('[invite-founder] resend exception:', sendEx);
      emailError = sendEx?.message || 'Failed to dispatch email';
    }

    return NextResponse.json({
      success: true,
      link,
      email: founderEmail,
      emailSent,
      emailError,
    });
  } catch (err: any) {
    console.error('[invite-founder] unexpected error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
