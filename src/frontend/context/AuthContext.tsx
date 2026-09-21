'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/backend/lib/supabase';
import { signIn, signUp as apiSignUp, signOut as apiSignOut, refreshToken as apiRefreshToken } from '@/backend/services/auth';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Initial Session Load
    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (err: any) {
        console.error('Session load error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // 2. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 3. Auto-refresh token 5 mins before expiry
  useEffect(() => {
    if (!session?.expires_at) return;

    const expiresAt = session.expires_at * 1000;
    const fiveMinutes = 5 * 60 * 1000;
    const refreshTime = expiresAt - Date.now() - fiveMinutes;

    if (refreshTime <= 0) {
      if (session.refresh_token) {
        apiRefreshToken(session.refresh_token);
      }
      return;
    }

    const timer = setTimeout(() => {
      if (session?.refresh_token) {
        apiRefreshToken(session.refresh_token);
      }
    }, refreshTime);

    return () => clearTimeout(timer);
  }, [session]);

  const login = async (email: string, password?: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data, error: loginErr } = await signIn(email, password);
      if (loginErr) throw loginErr;
      setUser(data.user);
      setSession(data.session);
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to login';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password?: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data, error: signupErr } = await apiSignUp(email, password);
      if (signupErr) throw signupErr;
      setUser(data.user);
      setSession(data.session);
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to sign up';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiSignOut();
      setUser(null);
      setSession(null);
      router.push('/login');
    } catch (err: any) {
      console.error('Logout error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        error,
        login,
        signup,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
