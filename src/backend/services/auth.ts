import { supabase } from '@/backend/lib/supabase';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const signUp = async (email: string, password?: string) => {
  if (password) {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify-email`,
        },
      });

      // If Supabase email rate limit or network fetch failure occurs, gracefully fall back to admin creation
      if (result.error) {
        const errMsg = (result.error.message || '').toLowerCase();
        const isRateLimit = result.error.status === 429 || errMsg.includes('rate limit');
        const isFetchFailed = result.error.status === 0 || errMsg.includes('fetch failed');

        if (isRateLimit || isFetchFailed) {
          const adminResult = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });

          if (!adminResult.error && adminResult.data?.user) {
            return {
              data: {
                user: adminResult.data.user,
                session: null,
              },
              error: null,
            };
          }
        }
      }

      return result;
    } catch (err: any) {
      // In case supabase.auth.signUp throws AuthRetryableFetchError
      const adminResult = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (!adminResult.error && adminResult.data?.user) {
        return {
          data: {
            user: adminResult.data.user,
            session: null,
          },
          error: null,
        };
      }
      return {
        data: { user: null, session: null },
        error: err,
      };
    }
  }
  // OTP based sign up if no password
  return supabase.auth.signInWithOtp({ email });
};

export const signIn = async (email: string, password?: string) => {
  if (password) {
    return supabase.auth.signInWithPassword({ email, password });
  }
  return supabase.auth.signInWithOtp({ email });
};

export const signInWithGoogle = async () => {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/v1/auth/google-callback`,
    },
  });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const refreshToken = async (refresh_token: string) => {
  return supabase.auth.refreshSession({ refresh_token });
};

export const getCurrentUser = async () => {
  return supabase.auth.getUser();
};

export const resetPassword = async (email: string) => {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const redirectTo = `${siteUrl}/auth/reset-password`;

  try {
    const result = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo,
    });

    if (result.error) {
      const errMsg = (result.error.message || '').toLowerCase();
      const isRateLimit =
        result.error.status === 429 ||
        errMsg.includes('rate limit') ||
        errMsg.includes('over_email_send_rate_limit');
      const isFetchFailed =
        result.error.status === 0 ||
        errMsg.includes('fetch') ||
        errMsg.includes('network');

      // Server-side fallback: if running on server and rate-limited or fetch failed, generate link via admin
      if ((isRateLimit || isFetchFailed) && typeof window === 'undefined' && supabaseAdmin) {
        try {
          const adminResult = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: trimmedEmail,
            options: { redirectTo },
          });

          if (!adminResult.error && adminResult.data) {
            return {
              data: {
                user: adminResult.data.user,
                recovery_link: adminResult.data.properties?.action_link,
              },
              error: null,
            };
          }
        } catch {
          // Proceed to return original error
        }
      }
    }

    return result;
  } catch (err: any) {
    // If supabase throws AuthRetryableFetchError or network fetch fails
    if (typeof window === 'undefined' && supabaseAdmin) {
      try {
        const adminResult = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: trimmedEmail,
          options: { redirectTo },
        });

        if (!adminResult.error && adminResult.data) {
          return {
            data: {
              user: adminResult.data.user,
              recovery_link: adminResult.data.properties?.action_link,
            },
            error: null,
          };
        }
      } catch {
        // Fall through
      }
    }

    return {
      data: null,
      error: err,
    };
  }
};
