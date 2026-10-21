import { supabase } from '@/backend/lib/supabase';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const signUp = async (email: string, password?: string) => {
  if (password) {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify-email`,
      },
    });

    // If Supabase free tier email rate limit is hit, gracefully fall back to admin creation
    if (result.error && (result.error.status === 429 || (result.error.message || '').toLowerCase().includes('rate limit'))) {
      const adminResult = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email,
        password,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify-email`,
        },
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

    return result;
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
