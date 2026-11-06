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
import { ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function StartupDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
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

        if (!res.ok || !data.has_assigned_dashboard) {
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
          id: startup?.id || app?.id || 'startup',
          name: startup?.startup_name || startup?.name || fd.startup_name || fd.businessName || `${user.email?.split('@')[0]}'s Startup`,
          batch: app?.cohort_name || 'Batch 2026',
          tagline: startup?.description || fd.oneSentencePitch || 'Incubator Accelerated Startup',
          stage: startup?.stage || fd.businessStage || 'Validation Phase',
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Verifying assigned dashboard access...</p>
      </div>
    );
  }

  if (hasAssignedDashboard === false || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center space-y-6">
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
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header with Navigation Pills */}
      <StartupDashboardHeader
        profile={profile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        applications={applications}
        milestoneCompletionText="7/10"
        onExportReport={handleExportReport}
        onShare={handleShare}
      />

      {/* Active Tab View */}
      <div className="transition-all duration-200">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'pitch' && <PitchPrototypeTab />}
        {activeTab === 'tech' && <SoftwareHardwareTab track={profile.track} />}
        {activeTab === 'activity' && <ActivityLogTab />}
      </div>
    </div>
  );
}
