'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/context/AuthContext';
import { apiClient } from '@/services/apiClient';
import { StartupDashboardHeader } from './StartupDashboardHeader';
import { OverviewTab } from './OverviewTab';
import { PitchPrototypeTab } from './PitchPrototypeTab';
import { SoftwareHardwareTab } from './SoftwareHardwareTab';
import { ActivityLogTab } from './ActivityLogTab';
import { DashboardTab, StartupProfile } from './types';

const FALLBACK_PROFILE: StartupProfile = {
  id: 'ST-101',
  name: 'NexusAI Labs',
  batch: 'Batch 2026',
  tagline: 'Autonomous Enterprise Context Intelligence Engine',
  stage: 'Validation Phase',
  stageProgress: 70,
  track: 'both',
  incubatorName: 'Arba360 Central Hub',
};

export default function StartupDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [profile, setProfile] = useState<StartupProfile>(FALLBACK_PROFILE);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStartupData() {
      if (!user?.email) return;

      try {
        const res = await fetch(`/api/v1/applications/status?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        const appsList: any[] = data?.applications || (data?.data ? [data.data] : []);
        setApplications(appsList);

        // Find accepted application first for profile context
        const app = appsList.find((a: any) => a.status === 'accepted' || a.status === 'admitted') || data?.data || appsList[0];

        if (app) {
          const fd = app.form_data || {};
          const savedTrack = fd.startup_track || (user as any)?.user_metadata?.startup_track;

          // If no track selected yet, prompt user via /choose-role
          if (!savedTrack && typeof window !== 'undefined' && !localStorage.getItem('startup_track')) {
            router.replace('/choose-role');
            return;
          }

          const resolvedTrack = savedTrack || localStorage.getItem('startup_track') || 'both';

          setProfile({
            id: app.id,
            name:
              fd.startup_name ||
              fd.businessName ||
              (app.applicant_name ? `${app.applicant_name}'s Startup` : 'NexusAI Labs'),
            batch: app.cohort_name || 'Batch 2026',
            tagline: fd.oneSentencePitch || 'Autonomous Enterprise Context Intelligence Engine',
            stage: fd.businessStage || 'Validation Phase',
            stageProgress: 70,
            track: resolvedTrack as any,
            incubatorName: app.incubator_name_text || app.organization?.name || 'Arba360 Central Hub',
          });
        }
      } catch (err) {
        console.warn('Startup data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStartupData();
  }, [user, router]);

  const handleExportReport = () => {
    alert(`Exporting official cohort progress report for ${profile.name}...`);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      alert('Dashboard link copied to clipboard!');
    }
  };

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
