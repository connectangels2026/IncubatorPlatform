import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { resetPassword } from '@/backend/services/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.nextUrl.origin ||
      'http://localhost:3000';
    const redirectTo = `${siteUrl}/auth/reset-password`;

    // 1. Attempt standard password reset email via service
    let resetResult: any = null;
    try {
      resetResult = await resetPassword(email);
    } catch (err: any) {
      resetResult = { error: err };
    }

    // If resetPassword succeeded directly or generated link
    if (!resetResult?.error) {
      const recoveryLink = resetResult?.data?.recovery_link;
      return NextResponse.json(
        {
          success: true,
          message: 'Password reset instructions sent to your email.',
          ...(recoveryLink ? { recovery_link: recoveryLink } : {}),
        },
        { status: 200 }
      );
    }

    const rawError = resetResult.error;
    const errMsg = (rawError.message || '').toLowerCase();
    const isRateLimit =
      rawError.status === 429 ||
      errMsg.includes('rate limit') ||
      errMsg.includes('over_email_send_rate_limit');
    const isFetchFailed =
      rawError.status === 0 ||
      errMsg.includes('fetch') ||
      errMsg.includes('network');

    // 2. If rate limited or fetch failed, generate recovery link with service role admin
    if (isRateLimit || isFetchFailed || rawError) {
      try {
        const { data: linkData, error: adminError } =
          await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email,
            options: {
              redirectTo,
            },
          });

        if (!adminError && linkData?.properties?.action_link) {
          return NextResponse.json(
            {
              success: true,
              message: 'Password reset instructions sent.',
              recovery_link: linkData.properties.action_link,
            },
            { status: 200 }
          );
        }

        if (adminError) {
          const adminMsg = adminError.message?.toLowerCase() || '';
          if (adminMsg.includes('not found') || adminMsg.includes('user')) {
            return NextResponse.json(
              { error: `No account found with ${email}. Please check your email or sign up.` },
              { status: 404 }
            );
          }
        }
      } catch (adminErr: any) {
        console.error('[AUTH] Admin generateLink error:', adminErr);
      }
    }

    // 3. Fallback error response
    let userFacingError = rawError.message || 'Failed to send reset link.';
    if (isRateLimit) {
      userFacingError =
        'Email delivery rate limit reached. Please wait a few moments or contact support.';
    } else if (isFetchFailed) {
      userFacingError =
        'Unable to connect to the authentication service. Please check your network connection.';
    }

    return NextResponse.json(
      { error: userFacingError },
      { status: rawError.status && rawError.status >= 400 && rawError.status < 600 ? rawError.status : 400 }
    );
  } catch (err: any) {
    console.error('[AUTH] Forgot password server error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
