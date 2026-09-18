import { supabase } from '@/lib/supabase';

export const signUp = async (email: string, password?: string) => {
  if (password) {
    return supabase.auth.signUp({ email, password });
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
