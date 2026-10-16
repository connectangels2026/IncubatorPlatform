'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/backend/lib/supabase';
import { signIn, signUp as apiSignUp, signOut as apiSignOut, refreshToken as apiRefreshToken } from '@/backend/services/auth';
import type { User, Session } from '@supabase/supabase-js';

export interface Organization {
  id: string;
  slug: string;
  name: string;
  founder_name?: string;
  founder_email?: string;
  logo_url?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  organization: Organization | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; code?: string; organization?: Organization }>;
  signup: (founder_name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshOrg: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserOrg = async (token?: string) => {
    try {
      const authToken = token || session?.access_token;
      if (!authToken) return;

      const res = await fetch('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.organization) {
          setOrganization(data.organization);
          if (typeof window !== 'undefined') {
            localStorage.setItem('org_id', data.organization.id);
            if (data.organization.founder_name) {
              localStorage.setItem('org_founder_name', data.organization.founder_name);
            }
            if (data.organization.name) {
              localStorage.setItem('org_name', data.organization.name);
            }
          }
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    // 1. Initial Session Load
    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.access_token) {
          await fetchUserOrg(initialSession.access_token);
        }
      } catch (err: any) {
        console.error('Session load error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // 2. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.access_token) {
          await fetchUserOrg(currentSession.access_token);
        }
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
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Return error response with code for better handling
        return {
          success: false,
          error: data.error || 'Failed to login',
          code: data.code,
          organization: data.organization
        };
      }

      setUser(data.user || null);
      setOrganization(data.organization || null);

      // Store organization ID & founder info in localStorage for API requests
      if (typeof window !== 'undefined') {
        if (data.organization?.id) {
          localStorage.setItem('org_id', data.organization.id);
        }
        if (data.organization?.founder_name) {
          localStorage.setItem('org_founder_name', data.organization.founder_name);
        }
        if (data.organization?.name) {
          localStorage.setItem('org_name', data.organization.name);
        }
      }

      return { success: true, organization: data.organization };
    } catch (err: any) {
      const msg = err.message || 'Failed to login';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (founder_name: string, email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ founder_name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to sign up');
      }

      // After signup, try to sign in with the credentials to establish session
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (signInError) {
          console.warn('Auto sign-in after signup failed:', signInError);
          // Continue anyway - user will be redirected to choose-role
        } else if (signInData.session) {
          // Session established
          setSession(signInData.session);
          setUser(signInData.user);
        }
      } catch (signInErr) {
        console.warn('Error during auto sign-in:', signInErr);
        // Continue - session should be established by Supabase listener
      }

      // New flow: Don't set organization yet (user hasn't selected role)
      // Organization will be set after role selection
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
      setOrganization(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('org_id');
        localStorage.removeItem('org_founder_name');
        localStorage.removeItem('org_name');
      }
      router.push('/login');
    } catch (err: any) {
      console.error('Logout error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const refreshOrg = async () => {
    await fetchUserOrg();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        organization,
        isLoading,
        error,
        login,
        signup,
        logout,
        clearError,
        refreshOrg,
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
