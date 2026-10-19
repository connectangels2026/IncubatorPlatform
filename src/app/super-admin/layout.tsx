'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/backend/lib/supabase';
import { ShieldAlert, Loader2 } from 'lucide-react';

const AUTHORIZED_SUPER_ADMIN_EMAIL = 'shadmannc0516@gmail.com';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Exclude the login page itself from authentication guard
    if (pathname === '/super-admin/login') {
      setIsAuthorized(true);
      return;
    }

    let isMounted = true;

    async function verifySuperAdmin() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user || !user.email) {
          if (isMounted) {
            setIsAuthorized(false);
            router.replace('/super-admin/login');
          }
          return;
        }

        const emailLower = user.email.toLowerCase().trim();
        if (emailLower !== AUTHORIZED_SUPER_ADMIN_EMAIL) {
          if (isMounted) {
            setIsAuthorized(false);
            router.replace('/super-admin/login?error=unauthorized');
          }
          return;
        }

        if (isMounted) {
          setIsAuthorized(true);
        }
      } catch (err) {
        if (isMounted) {
          setIsAuthorized(false);
          router.replace('/super-admin/login');
        }
      }
    }

    verifySuperAdmin();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const emailLower = session?.user?.email?.toLowerCase().trim();
      if (pathname !== '/super-admin/login' && emailLower !== AUTHORIZED_SUPER_ADMIN_EMAIL) {
        setIsAuthorized(false);
        router.replace('/super-admin/login');
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [pathname, router]);

  // If on login page, render directly
  if (pathname === '/super-admin/login') {
    return <>{children}</>;
  }

  // Verifying state
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#0A0E26] flex flex-col items-center justify-center p-4 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-400 tracking-wide">
            Verifying Super Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0E26] flex items-center justify-center p-4 text-white">
        <div className="bg-[#101638] border border-rose-500/30 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold">Access Restricted</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Only the designated Super Admin (<span className="text-cyan-400 font-mono">{AUTHORIZED_SUPER_ADMIN_EMAIL}</span>) can access this governance console.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
