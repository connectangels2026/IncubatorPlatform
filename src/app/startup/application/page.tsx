'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/context/AuthContext';
import { Building2, Rocket, ArrowRight } from 'lucide-react';
import Logo from '@/frontend/components/ui/Logo';

import { useEffect } from 'react';
import { supabase } from '@/backend/lib/supabase';

export default function StartupApplicationPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSessionUser(session.user);
      } else if (!authLoading && !user) {
        router.push('/login?redirect=/startup/application');
      }
      setChecking(false);
    });
  }, [user, authLoading, router]);

  const handleFormSelect = (type: 'pre-incubator' | 'incubator') => {
    if (type === 'pre-incubator') {
      router.push('/programs/preincubator');
    } else {
      router.push('/programs/incubator');
    }
  };

  const currentUser = user || sessionUser;

  if (checking && !currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -left-24 w-[420px] h-[420px] rounded-full bg-cyan-400/35 blur-[120px]" />
        <div className="absolute top-10 -right-24 w-[440px] h-[440px] rounded-full bg-blue-500/25 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-center">
        <Logo size="lg" href="/" />
        <h1 className="text-4xl font-extrabold text-slate-900 mt-8 mb-4">Choose Your Program</h1>
        <p className="text-slate-600 mb-12">Select the application form that matches your startup stage.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <button
            onClick={() => handleFormSelect('pre-incubator')}
            className="p-8 rounded-3xl border-2 border-slate-200 bg-white hover:border-blue-400 hover:shadow-xl transition text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
              <Rocket className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Pre-Incubator</h2>
            <p className="text-sm text-slate-500 mb-6">Early-stage idea validation and startup formation support.</p>
            <span className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm">
              Apply <ArrowRight className="w-4 h-4" />
            </span>
          </button>

          <button
            onClick={() => handleFormSelect('incubator')}
            className="p-8 rounded-3xl border-2 border-slate-200 bg-white hover:border-cyan-400 hover:shadow-xl transition text-left"
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-5">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Incubator</h2>
            <p className="text-sm text-slate-500 mb-6">Growth-stage funding, mentorship, and accelerator resources.</p>
            <span className="inline-flex items-center gap-2 text-cyan-600 font-semibold text-sm">
              Apply <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
