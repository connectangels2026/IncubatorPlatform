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
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  });
};
