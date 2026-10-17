'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
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

        // Admins and super-admins bypass review gating
        if (
          emailLower === 'arba1@gmail.com' ||
          emailLower === 'admin@nuturecave.com' ||
          role === 'admin' ||
          role === 'super-admin'
        ) {
          if (isMounted) setIsCheckingApplication(false);
          return;
        }

        // Check if user has an application pending review
        try {
          const res = await fetch(`/api/v1/applications/status?email=${encodeURIComponent(emailLower)}`);
          const data = await res.json();
          if (data?.success && data?.data) {
            const app = data.data;
            const status = (app.status || '').toLowerCase();
            // If submitted or under review, founder must see the status review page
            if (status === 'submitted' || status === 'under_review' || status === 'rejected') {
              router.push(`/programs/preincubator/status?id=${app.id}`);
              return;
            }
          }
        } catch (e) {
          console.warn('ProtectedRoute application check:', e);
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
