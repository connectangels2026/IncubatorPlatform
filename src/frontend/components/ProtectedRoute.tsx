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
          const app = data?.success && data?.data ? data.data : null;
          const status = (app?.status || '').toLowerCase();

          // 1. If application submitted, under review, or rejected -> route to status review page
          if (app && (status === 'submitted' || status === 'under_review' || status === 'rejected')) {
            router.push(`/programs/preincubator/status?id=${app.id}`);
            return;
          }

          // 2. Check if user has an organization_id assigned
          const meRes = await fetch('/api/v1/auth/me', { headers: authHeaders });
          let hasOrg = false;
          if (meRes.ok) {
            const meData = await meRes.json();
            hasOrg = !!meData?.organization?.id;
          }

          // If no approved organization, strictly block dashboard access
          if (!hasOrg) {
            if (app) {
              router.push(`/programs/preincubator/status?id=${app.id}`);
              return;
            }
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
