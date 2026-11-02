'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/context/AuthContext';
import { supabase } from '@/backend/lib/supabase';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, organization, isLoading } = useAuth();
  const router = useRouter();
  const [isCheckingApplication, setIsCheckingApplication] = React.useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAccess() {
      if (!isLoading && !user) {
        router.push('/login');
        return;
      }

      if (user) {
        const emailLower = (user.email || '').toLowerCase();
        const role = (user as any)?.role || (user as any)?.user_metadata?.role;

        // Admins, super-admins, and incubator staff bypass review gating
        if (
          emailLower === 'arba1@gmail.com' ||
          emailLower === 'admin@nuturecave.com' ||
          role === 'admin' ||
          role === 'super-admin' ||
          role === 'super_admin' ||
          role === 'incubator_admin' ||
          role === 'incubator' ||
          Boolean(organization?.id || (user as any)?.organization_id)
        ) {
          if (isMounted) setIsCheckingApplication(false);
          return;
        }

        // Check if user has an application pending review or missing organization
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token ? `Bearer ${session.access_token}` : '';
          const authHeaders: Record<string, string> = token ? { Authorization: token } : {};

          const res = await fetch(`/api/v1/applications/status?email=${encodeURIComponent(emailLower)}`, {
            headers: authHeaders,
          });
          const data = await res.json();
          const appsList: any[] = data?.applications || (data?.data ? [data.data] : []);

          // 1. Check if user has at least one accepted or admitted application
          const hasAcceptedApp = appsList.some((a: any) => {
            const s = (a?.status || '').toLowerCase();
            return s === 'accepted' || s === 'admitted';
          });

          if (hasAcceptedApp) {
            // Admitted startup founder: grant access directly
            if (isMounted) setIsCheckingApplication(false);
            return;
          }

          // 2. If no accepted application but has pending/rejected applications -> route to status page
          if (appsList.length > 0) {
            const targetApp = appsList[0];
            router.push(`/programs/preincubator/status?id=${targetApp.id}`);
            return;
          }

          // 3. Check if user has an organization_id assigned (incubators / staff)
          const meRes = await fetch('/api/v1/auth/me', { headers: authHeaders });
          let hasOrg = false;
          if (meRes.ok) {
            const meData = await meRes.json();
            hasOrg = !!meData?.organization?.id;
          }

          // If no approved organization and no applications, route to appropriate onboarding
          if (!hasOrg) {
            if (!role) {
              router.push('/auth/choose-role');
              return;
            }
            if (role === 'startup') {
              router.push('/startup/application');
              return;
            }
            if (role === 'incubator_admin') {
              router.push('/auth/signup-incubator');
              return;
            }
            // Default fallback
            router.push('/auth/choose-role');
            return;
          }
        } catch (e) {
          console.warn('ProtectedRoute access check:', e);
        }

        if (isMounted) setIsCheckingApplication(false);
      }
    }

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [user, isLoading, router]);

  if (isLoading || (user && isCheckingApplication)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Checking cohort admission status...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole) {
    const userRole = (user.user_metadata?.role as string) || 'user';
    if (userRole !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-sm text-center">
            <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-500 mt-1">You do not have the required permissions to view this page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
