'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/backend/lib/supabase';
import { useAuth } from '@/frontend/context/AuthContext';
import Logo from '@/frontend/components/ui/Logo';

export default function ChooseRolePage() {
  const router = useRouter();
  const { refreshOrg } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<'startup' | 'incubator_admin' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userName, setUserName] = useState<string>('');

  // Check if user is authenticated and whether they already selected a role
  useEffect(() => {
    let isMounted = true;

    const checkAuthAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace('/signup');
          return;
        }

        const userEmail = (session.user.email || '').toLowerCase();

        // 1. Super-Admin account shortcut
        if (userEmail === 'shadmannc0516@gmail.com') {
          router.replace('/super-admin/dashboard');
          return;
        }

        let existingRole: string | null = session.user.user_metadata?.role || null;

        // 2. Check profile in users table and organization via /api/v1/auth/me
        try {
          const res = await fetch('/api/v1/auth/me', {
            headers: session.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.user?.role) {
              existingRole = data.user.role;
            }
            if (data?.organization?.id) {
              router.replace(`/dashboard?org=${data.organization.id}`);
              return;
            }
          }
        } catch (e) {
          console.warn('Could not query /api/v1/auth/me in choose-role:', e);
        }

        // 3. Direct query fallback to users table
        if (!existingRole && session.user.email) {
          try {
            const { data: uRec } = await supabase
              .from('users')
              .select('role')
              .eq('email', session.user.email)
              .maybeSingle();
            if (uRec?.role) {
              existingRole = uRec.role;
            }
          } catch (e) {
            // Ignore query error
          }
        }

        // IF ROLE IS ALREADY SELECTED: DO NOT SHOW CHOOSE-ROLE PAGE!
        if (existingRole) {
          if (existingRole === 'super-admin' || userEmail === 'shadmannc0516@gmail.com') {
            router.replace('/super-admin/dashboard');
            return;
          }
          if (existingRole === 'startup' || existingRole === 'founder') {
            router.replace('/startup/application');
            return;
          }
          if (existingRole === 'incubator_admin' || existingRole === 'admin' || existingRole === 'incubator') {
            router.replace('/auth/incubator-plans');
            return;
          }
          router.replace('/dashboard');
          return;
        }

        if (!isMounted) return;

        setUser(session.user);
        // Extract user name from email or user metadata
        const displayName = session.user.user_metadata?.full_name ||
                           session.user.user_metadata?.name ||
                           session.user.email?.split('@')[0] ||
                           'there';
        setUserName(displayName);
        setAuthChecked(true);
      } catch (err) {
        console.error('Auth check error:', err);
        router.replace('/signup');
      }
    };

    checkAuthAndRole();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleRoleSelection = async (role: 'startup' | 'incubator_admin') => {
    if (!user?.id) {
      setError('User ID not found');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedRole(role);

    try {
      // Call the choose-role endpoint with JWT token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Authentication token not found');
        setSelectedRole(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/v1/auth/choose-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          role: role,
        }),
      });

      const data = await response.json();

      if (data.success || data.code === 'ROLE_ALREADY_SET') {
        // Refresh the profile so the new role is available to protected routes.
        await refreshOrg();
        // Redirect based on role or backend suggestion
        const destination = data.redirect_to || (role === 'startup' ? '/startup/application' : '/auth/incubator-plans');
        router.push(destination);
      } else {
        setError(data.error || data.message || 'Failed to select role');
        setSelectedRole(null);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setSelectedRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden">
      {/* Ambient background glow spots */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -left-24 w-[420px] h-[420px] rounded-full bg-cyan-400/35 blur-[120px]" />
        <div className="absolute top-10 -right-24 w-[440px] h-[440px] rounded-full bg-blue-500/25 blur-[130px]" />
        <div className="absolute -bottom-24 -left-20 w-[420px] h-[420px] rounded-full bg-blue-400/30 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-[460px] h-[460px] rounded-full bg-cyan-300/35 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.35)_1.2px,transparent_0)] [background-size:24px_24px]" />
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <Logo size="lg" href="/" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto my-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[40px] sm:text-[48px] font-extrabold tracking-tight text-slate-900 leading-tight mb-3">
            What brings you here?
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Choose your role to get started. You can update this later in your account settings.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Startup Card */}
          <button
            onClick={() => handleRoleSelection('startup')}
            disabled={isLoading}
            className={`relative p-8 rounded-2xl border-2 transition-all duration-300 text-left group ${
              selectedRole === 'startup'
                ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10'
            } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {/* Check Icon */}
            {selectedRole === 'startup' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
              <Rocket className="w-6 h-6" />
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-slate-900 mb-2">I'm a Startup</h3>
            <p className="text-sm text-slate-600 mb-6">
              Looking for funding, mentorship, and resources to accelerate your growth
            </p>

            {/* Benefits List */}
            <ul className="space-y-2 mb-6">
              {['Access to funding', 'Expert mentorship', 'Demo day access'].map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500">
                {selectedRole === 'startup' ? 'Selected' : 'Select'}
              </span>
              <ArrowRight className={`w-4 h-4 transition-transform ${selectedRole === 'startup' ? 'translate-x-1 text-blue-600' : 'text-slate-400 group-hover:translate-x-1'}`} />
            </div>
          </button>

          {/* Incubator Card */}
          <button
            onClick={() => handleRoleSelection('incubator_admin')}
            disabled={isLoading}
            className={`relative p-8 rounded-2xl border-2 transition-all duration-300 text-left group ${
              selectedRole === 'incubator_admin'
                ? 'border-cyan-500 bg-cyan-50 shadow-lg shadow-cyan-500/20'
                : 'border-slate-200 bg-white hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10'
            } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {/* Check Icon */}
            {selectedRole === 'incubator_admin' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-4 group-hover:bg-cyan-200 transition">
              <Building2 className="w-6 h-6" />
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-slate-900 mb-2">I'm an Incubator</h3>
            <p className="text-sm text-slate-600 mb-6">
              Running an accelerator or incubator program to support startups
            </p>

            {/* Benefits List */}
            <ul className="space-y-2 mb-6">
              {['Manage applications', 'Track portfolios', 'Admin dashboard'].map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500">
                {selectedRole === 'incubator_admin' ? 'Selected' : 'Select'}
              </span>
              <ArrowRight className={`w-4 h-4 transition-transform ${selectedRole === 'incubator_admin' ? 'translate-x-1 text-cyan-600' : 'text-slate-400 group-hover:translate-x-1'}`} />
            </div>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && selectedRole && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-blue-600">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Setting up your account...</span>
          </div>
        )}

        {/* Info Text */}
        <p className="text-xs text-slate-500 text-center mt-8">
          You can change your role later in account settings
        </p>
      </div>

      <div />
    </div>
  );
}
