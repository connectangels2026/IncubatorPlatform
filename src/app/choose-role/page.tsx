'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, Code, Layers, ArrowRight, CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';
import { supabase } from '@/backend/lib/supabase';
import { apiClient } from '@/services/apiClient';
import Logo from '@/frontend/components/ui/Logo';

export type StartupTrack = 'hardware' | 'software' | 'both';

export default function ChooseRolePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState<StartupTrack | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkExistingTrack() {
      if (!isLoading && !user) {
        router.push('/login?redirect=/choose-role');
        return;
      }

      if (user?.email) {
        try {
          const res = await fetch(`/api/v1/applications/status?email=${encodeURIComponent(user.email)}`);
          const data = await res.json();
          const app = data?.data || (data?.applications && data.applications[0]);

          if (app) {
            setApplicationId(app.id);
            const savedTrack = app.form_data?.startup_track;
            // If track is already saved, bypass selection and go straight to dashboard
            if (savedTrack) {
              const orgId = app.organization_id || app.organization?.id;
              router.replace('/startup/dashboard');
              return;
            }
          }
        } catch (e) {
          console.warn('Track check error:', e);
        } finally {
          setIsChecking(false);
        }
      }
    }

    checkExistingTrack();
  }, [user, isLoading, router]);

  const handleSelectTrack = async (track: StartupTrack) => {
    setSelectedTrack(track);
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ? `Bearer ${session.access_token}` : '';
      const headers: Record<string, string> = token ? { Authorization: token, 'x-org-id': 'all' } : { 'x-org-id': 'all' };

      if (applicationId) {
        await apiClient.put(
          `/applications/${applicationId}`,
          {
            form_data: {
              startup_track: track,
              track_selected_at: new Date().toISOString(),
            },
          },
          { headers }
        );
      }

      // Also persist to localStorage for fast local routing
      if (typeof window !== 'undefined') {
        localStorage.setItem('startup_track', track);
      }

      // Update Supabase user metadata
      await supabase.auth.updateUser({
        data: { startup_track: track },
      });

      router.push('/startup/dashboard');
    } catch (err: any) {
      console.error('Failed to save track:', err);
      // Fallback redirect
      router.push('/startup/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] flex flex-col justify-between overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -left-32 w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-10 -right-32 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-5xl w-full mx-auto px-6 py-8 flex items-center justify-between">
        <Logo size="md" href="/" />
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
          Cohort Onboarding
        </span>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-6 py-6 sm:py-10 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Step 1 of 1 • Tailor Your Dashboard</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#1A2151] tracking-tight mb-3">
          Select Your Startup Track
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto mb-10 leading-relaxed font-medium">
          Choose the focus domain of your startup. We will dynamically configure your incubator metrics, fabrication pipeline, tech stack, and mentor office hours.
        </p>

        {/* 3 Selectable Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Card 1: Hardware */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSelectTrack('hardware')}
            className={`group p-7 rounded-3xl border-2 transition-all duration-300 relative bg-white hover:shadow-xl cursor-pointer flex flex-col justify-between text-left ${
              selectedTrack === 'hardware'
                ? 'border-blue-600 ring-4 ring-blue-500/15 shadow-lg'
                : 'border-slate-200/80 hover:border-blue-400'
            }`}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Cpu className="w-7 h-7" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black text-[#1A2151]">Hardware</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Physical Tech
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
                IoT, robotics, embedded devices, smart wearables, sensor arrays, and precision fabrication labs.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-all">
              <span>Includes BOM & Lab Bench</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card 2: Software */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSelectTrack('software')}
            className={`group p-7 rounded-3xl border-2 transition-all duration-300 relative bg-white hover:shadow-xl cursor-pointer flex flex-col justify-between text-left ${
              selectedTrack === 'software'
                ? 'border-blue-600 ring-4 ring-blue-500/15 shadow-lg'
                : 'border-slate-200/80 hover:border-blue-400'
            }`}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Code className="w-7 h-7" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black text-[#1A2151]">Software</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Digital / SaaS
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
                Enterprise SaaS, AI/LLM applications, APIs, mobile applications, cloud platforms, and data infrastructure.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-all">
              <span>Includes Stack & CI/CD Hub</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card 3: Both */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSelectTrack('both')}
            className={`group p-7 rounded-3xl border-2 transition-all duration-300 relative bg-white hover:shadow-xl cursor-pointer flex flex-col justify-between text-left ${
              selectedTrack === 'both'
                ? 'border-indigo-600 ring-4 ring-indigo-500/15 shadow-lg'
                : 'border-slate-200/80 hover:border-indigo-400'
            }`}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200/60 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black text-[#1A2151]">Both</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  DeepTech
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
                Integrated cyber-physical systems, Edge AI hardware, connected medical tech, autonomous vehicles, and drones.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-all">
              <span>Full Software + Hardware Suite</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {isSubmitting && (
          <p className="text-xs font-bold text-blue-600 mt-6 flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Configuring your workspace...
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/60">
        <p>© 2026 Arba360 Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

