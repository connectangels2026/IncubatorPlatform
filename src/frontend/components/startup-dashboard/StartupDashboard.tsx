'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/context/AuthContext';
import { supabase } from '@/backend/lib/supabase';
import { StartupDashboardHeader } from './StartupDashboardHeader';
import { OverviewTab } from './OverviewTab';
import { PitchPrototypeTab } from './PitchPrototypeTab';
import { SoftwareHardwareTab } from './SoftwareHardwareTab';
import { ActivityLogTab } from './ActivityLogTab';
import { DashboardTab, StartupProfile } from './types';
import { ShieldAlert, ArrowRight, Loader2, LogOut } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/frontend/components/ui/Logo';

export default function StartupDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAssignedDashboard, setHasAssignedDashboard] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadStartupData() {
      if (authLoading) return;
      if (!user) {
        router.replace('/login?redirect=/startup/dashboard');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token ? `Bearer ${session.access_token}` : '';
        const headers: Record<string, string> = token ? { Authorization: token } : {};

        const res = await fetch('/api/v1/startups/me', { headers });
        const data = await res.json();

        if (!res.ok || !data.has_assigned_dashboard || !data.startup) {
          setHasAssignedDashboard(false);
          setIsLoading(false);
          return;
        }

        setHasAssignedDashboard(true);
        const startup = data.startup;
        const app = data.application;
        const org = data.organization;

        if (app) {
          setApplications([app]);
        }

        const fd = app?.form_data || {};
        const savedTrack = fd.startup_track || (user as any)?.user_metadata?.startup_track;
        const resolvedTrack = savedTrack || (typeof window !== 'undefined' ? localStorage.getItem('startup_track') : null) || 'both';

        setProfile({
          id: startup.id,
          name: startup.name || fd.startup_name || `${user.email?.split('@')[0]}'s Startup`,
          batch: startup.batch || app?.cohort_name || 'Batch 2026',
          tagline: startup.description || startup.solution_description || fd.oneSentencePitch || 'Incubator Accelerated Startup',
          stage: startup.stage || fd.businessStage || 'Validation Phase',
          stageProgress: 70,
          track: resolvedTrack as any,
          incubatorName: org?.name || app?.incubator_name_text || 'Incubator Hub',
        });
      } catch (err) {
        console.warn('Startup data fetch error:', err);
        setHasAssignedDashboard(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadStartupData();
  }, [user, authLoading, router]);

  const handleExportReport = () => {
    if (profile) {
      alert(`Exporting official cohort progress report for ${profile.name}...`);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      alert('Dashboard link copied to clipboard!');
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Verifying assigned dashboard access...</p>
      </div>
    );
  }

  if (hasAssignedDashboard === false || !profile) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-16 bg-[#F8FAFC]">
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">No Dashboard Assigned</h2>
            <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
              Your application has not yet been assigned a workspace dashboard by your incubator.
              Dashboard access is granted by your host incubator once your cohort application is admitted.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/programs/preincubator/status"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-colors"
            >
              <span>View Application Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F8FAFC]">
      {/* Edge-to-Edge Top Navigation Bar */}
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between transition-all shadow-xs">
        <div className="flex items-center gap-4">
          <Logo href="/" />
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Startup Workspace
            </span>
            <span className="text-xs text-slate-400 font-medium truncate max-w-[200px] lg:max-w-xs">
              {profile.incubatorName ? `Incubated at ${profile.incubatorName}` : 'Incubator Accelerated'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/programs/preincubator/status"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition border border-slate-200/80"
          >
            <span>Applications Status</span>
          </Link>

          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1A2151] to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
              {(profile.name || user?.email || 'S').charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[140px]">{profile.name}</p>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => (logout ? logout() : router.push('/login'))}
            title="Log Out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-100 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Full-Width Content Container */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-10 py-6 space-y-6">
        <StartupDashboardHeader
          profile={profile}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          applications={applications}
          milestoneCompletionText="7/10"
          onExportReport={handleExportReport}
          onShare={handleShare}
        />

        <div className="transition-all duration-200">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'pitch' && <PitchPrototypeTab />}
          {activeTab === 'tech' && <SoftwareHardwareTab track={profile.track} />}
          {activeTab === 'activity' && <ActivityLogTab />}
        </div>
      </main>
    </div>
  );
}
