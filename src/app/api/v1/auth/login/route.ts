import { NextResponse } from 'next/server';
import { signIn } from '@/backend/services/auth';
import { storeActiveToken, logAuthEvent } from '@/backend/lib/session';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { isSuperAdminEmail } from '@/backend/lib/superadmin';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    const { data, error } = await signIn(email, password);

    if (error) {
      await logAuthEvent('failed_attempt');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed. Please try again.', code: 'AUTH_FAILED' },
        { status: 401 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const isSuperAdmin = (await isSuperAdminEmail(cleanEmail));

    // Query user profile by auth_user_id, id, or email (case-insensitive) to prevent duplicates
    let { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, email_verified, role, organization_id')
      .or(`id.eq.${data.user.id},auth_user_id.eq.${data.user.id},email.ilike.${cleanEmail}`)
      .limit(1)
      .maybeSingle();

    // Auto-provision missing public.users record for authenticated Supabase user
    if (!userData && data.user) {
      const resolvedRole = isSuperAdmin
        ? 'super-admin'
        : (data.user.user_metadata?.role || data.user.user_metadata?.selected_role || null);

      const fullName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.user_metadata?.founder_name ||
        cleanEmail.split('@')[0] ||
        'User';

      const insertPayload: Record<string, any> = {
        id: data.user.id,
        auth_user_id: data.user.id,
        email: cleanEmail,
        full_name: fullName,
        first_name: fullName.split(' ')[0] || fullName,
        role: resolvedRole,
        email_verified: Boolean(data.user.email_confirmed_at || isSuperAdmin),
      };

      const { data: createdUser, error: insertUserErr } = await supabaseAdmin
        .from('users')
        .insert(insertPayload)
        .select('id, email, email_verified, role, organization_id')
        .maybeSingle();

      if (insertUserErr) {
        console.warn('Auto-provisioning user insert notice:', insertUserErr);
        const { data: fetchedAfterInsert } = await supabaseAdmin
          .from('users')
          .select('id, email, email_verified, role, organization_id')
          .ilike('email', cleanEmail)
          .maybeSingle();
        userData = fetchedAfterInsert || (insertPayload as any);
      } else {
        userData = createdUser || (insertPayload as any);
      }
    }

    if (!userData) {
      console.error('User not found:', userError);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Super Admin bypasses incubator organization requirement

    let orgData: any = null;
    const userRole = (isSuperAdmin ? 'super-admin' : (userData.role || '')).toLowerCase();
    const isIncubatorStaff = userRole === 'admin' || userRole === 'incubator_admin' || userRole === 'incubator' || userRole === 'pending_incubator';

    // Only incubator staff own/manage organizations; startups do NOT receive incubator organizations
    if (!isSuperAdmin && isIncubatorStaff) {
      if (userData.organization_id) {
        const { data: oData } = await supabaseAdmin
          .from('organizations')
          .select('id, slug, name, founder_name, founder_email, is_verified')
          .eq('id', userData.organization_id)
          .maybeSingle();

        orgData = oData;
      } else {
        // Fallback: lookup incubator by auth_user_id or founder_email in a single query
        const { data: oDataFallback } = await supabaseAdmin
          .from('organizations')
          .select('id, slug, name, founder_name, founder_email, is_verified')
          .or(`auth_user_id.eq.${data.user.id},founder_email.ilike.${cleanEmail}`)
          .limit(1)
          .maybeSingle();

        if (oDataFallback) {
          orgData = oDataFallback;
          supabaseAdmin.from('users').update({ organization_id: orgData.id }).eq('id', userData.id).then();
        }
      }
    }

    // Auto-resolve role from active organization, user metadata, or admitted startup
    if (!isSuperAdmin && !userData.role) {
      if (orgData?.id) {
        userData.role = 'admin';
        await supabaseAdmin.from('users').update({ role: 'admin' }).eq('id', userData.id);
      } else if (data.user.user_metadata?.role) {
        userData.role = data.user.user_metadata.role;
        await supabaseAdmin.from('users').update({ role: userData.role }).eq('id', userData.id);
      } else if (email) {
        const { data: startupCheck } = await supabaseAdmin
          .from('startups')
          .select('id')
          .or(`founder_id.eq.${data.user.id},founder_email.ilike.${email.trim()}`)
          .limit(1)
          .maybeSingle();

        if (startupCheck) {
          userData.role = 'startup';
          await supabaseAdmin.from('users').update({ role: 'startup' }).eq('id', userData.id);
        }
      }
    }

    // Check if email is verified (using users table, not organizations table)
    if (!isSuperAdmin && !userData.email_verified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please verify your email first',
          code: 'EMAIL_NOT_VERIFIED',
          user_id: userData.id,
        },
        { status: 403 }
      );
    }

    // Check if user has selected a role
    if (!isSuperAdmin && !userData.role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please select your role first',
          code: 'ROLE_NOT_SELECTED',
          user_id: userData.id,
          next_step: '/auth/choose-role',
        },
        { status: 403 }
      );
    }

    // Calculate immediate redirect target server-side to avoid client-side waterfalls
    let redirectTo = '/programs/preincubator/status';
    let acceptedOrgId: string | null = null;

    if (isSuperAdmin || userRole === 'super-admin' || userRole === 'super_admin') {
      redirectTo = '/super-admin/dashboard';
    } else if (userRole === 'admin' || userRole === 'incubator_admin' || userRole === 'incubator') {
      redirectTo = orgData?.id ? `/dashboard?org=${orgData.id}` : '/dashboard';
    } else if (userRole === 'pending_incubator') {
      redirectTo = '/auth/incubator-plans';
    } else {
      // Startup or applicant: verify active record in startups table
      const { data: startupRow } = await supabaseAdmin
        .from('startups')
        .select('id, organization_id, track')
        .or(`founder_id.eq.${data.user.id},founder_email.ilike.${cleanEmail}`)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (startupRow) {
        let hasTrack = Boolean(startupRow.track);
        if (!hasTrack) {
          const { data: appRow } = await supabaseAdmin
            .from('applications')
            .select('form_data')
            .ilike('applicant_email', cleanEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (appRow?.form_data?.startup_track) {
            hasTrack = true;
          }
        }

        redirectTo = hasTrack ? '/startup/dashboard' : '/choose-role';
        acceptedOrgId = startupRow.organization_id || null;
      } else {
        redirectTo = '/programs/preincubator/status';
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        redirect_to: redirectTo,
        accepted_organization_id: acceptedOrgId,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: isSuperAdmin ? 'super-admin' : userData.role,
          founder_name: orgData?.founder_name || data.user.user_metadata?.full_name || 'Administrator',
        },
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }
          : null,
        organization: orgData
          ? {
              id: orgData.id,
              slug: orgData.slug,
              name: orgData.name,
              founder_name: orgData.founder_name,
              founder_email: orgData.founder_email,
              is_verified: orgData.is_verified,
            }
          : null,
      },
      { status: 200 }
    );

    if (data.session) {
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'Unknown';

      // Create active session record & log auth event concurrently
      await Promise.allSettled([
        storeActiveToken(data.user.id, data.session.access_token, data.session.refresh_token, ip, userAgent),
        logAuthEvent('login', data.user.id),
      ]);

      // Set httpOnly refresh cookie
      response.cookies.set('refresh_token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      // Set access token in response header for client-side access
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
      response.headers.set('x-access-token', data.session.access_token);
    }

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
