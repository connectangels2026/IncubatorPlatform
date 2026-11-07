'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/context/AuthContext';
import { supabase } from '@/backend/lib/supabase';
import { StartupProfileMenu } from './StartupProfileMenu';
import { OverviewTab } from './OverviewTab';
import { PitchPrototypeTab } from './PitchPrototypeTab';
import { SoftwareHardwareTab } from './SoftwareHardwareTab';
import { ActivityLogTab } from './ActivityLogTab';
import { DashboardTab, StartupProfile } from './types';
import { StartupDetailModal } from './StartupDetailModal';
import {
  ShieldAlert,
  ArrowRight,
  Loader2,
  LogOut,
  Building2,
  Sparkles,
  Rocket,
  TrendingUp,
  FileText,
  Cpu,
  MessageSquare,
  Share2,
  Download,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import Logo from '@/frontend/components/ui/Logo';

export default function StartupDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false);
  const [isIncubatorDropdownOpen, setIsIncubatorDropdownOpen] = useState(false);
  const incubatorDropdownRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [rawStartup, setRawStartup] = useState<any | null>(null);

  const handleStartupUpdate = (updated: any) => {
    setRawStartup(updated);
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            name: updated.name || prev.name,
            tagline: updated.description || updated.solution_description || prev.tagline,
            stage: updated.stage || prev.stage,
          }
        : null
    );
  };
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
        setRawStartup(startup);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (incubatorDropdownRef.current && !incubatorDropdownRef.current.contains(event.target as Node)) {
        setIsIncubatorDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      {/* Single Unified Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Left: Branding & Startup Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Logo href="/" />
            <div className="hidden sm:block h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-black text-[#1A2151] text-sm sm:text-base tracking-tight truncate max-w-[120px] sm:max-w-[200px]">
                {profile.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shrink-0">
                <Rocket className="w-2.5 h-2.5 text-indigo-500" />
                <span>{profile.batch}</span>
              </span>
              <span className="hidden xl:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider shrink-0">
                {profile.track === 'both' ? 'DeepTech' : `${profile.track} Track`}
              </span>
            </div>
          </div>

          {/* Right: Actions, Modal Trigger & User Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Applied Incubators Dropdown */}
            {applications.length > 0 && (
              <div className="relative" ref={incubatorDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsIncubatorDropdownOpen((prev) => !prev)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  title="Applied incubators"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Applied</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-50 text-blue-700">
                    {applications.length}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isIncubatorDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Application Statuses
                      </p>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {applications.map((app: any) => {
                        const incName =
                          app.incubator_name_text ||
                          app.organization?.name ||
                          app.form_data?.incubatorName ||
                          'Incubator';
                        const status = app.status || 'pending';
                        const isAccepted = status === 'accepted' || status === 'admitted';
                        const isRejected = status === 'rejected';

                        return (
                          <a
                            key={app.id}
                            href={`/programs/preincubator/status?id=${app.id}`}
                            className="p-3 hover:bg-slate-50 transition flex items-center justify-between gap-3 group"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#1A2151] truncate group-hover:text-blue-600">
                                {incName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                Ref: {app.id.slice(0, 8)}...
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                isAccepted
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isRejected
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {status}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* In-Place Startup Details Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsStartupModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition border border-slate-200/80 cursor-pointer shadow-2xs"
              title="Open complete startup profile and database details"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Startup Details</span>
            </button>

            {/* Export & Share Action Buttons */}
            <button
              type="button"
              onClick={handleExportReport}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer"
              title="Export cohort progress report"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xl:inline">Export</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
              title="Share dashboard"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Share</span>
            </button>

            {/* User Profile Avatar Menu */}
            <div className="pl-1 sm:pl-2 border-l border-slate-200">
              <StartupProfileMenu
                user={user}
                startup={rawStartup}
                onStartupUpdate={handleStartupUpdate}
                onOpenStartupModal={() => setIsStartupModalOpen(true)}
                onLogout={() => (logout ? logout() : router.push('/login'))}
              />
            </div>
          </div>
        </div>

        {/* Option 1: Linear / Vercel Style Sleek Underline Sub-Navigation Line */}
        <div className="px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center justify-start sm:justify-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center gap-2 pt-3 pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Overview & KPIs</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              7/10
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pitch')}
            className={`inline-flex items-center gap-2 pt-3 pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'pitch'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pitch & Prototype</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tech')}
            className={`inline-flex items-center gap-2 pt-3 pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'tech'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Software & Hardware</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`inline-flex items-center gap-2 pt-3 pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'activity'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Activity Log</span>
          </button>
        </div>
      </header>

      {/* Main Full-Width Content Container */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-10 py-6 space-y-6">
        <div className="transition-all duration-200">
          {activeTab === 'overview' && (
            <OverviewTab
              startup={rawStartup}
              onNavigateTab={setActiveTab}
              onOpenProfile={() => setIsStartupModalOpen(true)}
            />
          )}
          {activeTab === 'pitch' && <PitchPrototypeTab />}
          {activeTab === 'tech' && <SoftwareHardwareTab track={profile.track} />}
          {activeTab === 'activity' && <ActivityLogTab />}
        </div>
      </main>

      {/* Large Near-Full-Screen Startup Detail Modal with Spacing on All Four Borders */}
      <StartupDetailModal
        isOpen={isStartupModalOpen}
        onClose={() => setIsStartupModalOpen(false)}
        startup={rawStartup}
        organization={rawStartup?.organization}
        onStartupUpdate={handleStartupUpdate}
      />
    </div>
  );
}
