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
import StartupLogo from '@/frontend/components/ui/StartupLogo';
import {
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Rocket,
  TrendingUp,
  FileText,
  Cpu,
  MessageSquare,
  Share2,
  Download,
  MoreHorizontal,
  Pencil,
} from 'lucide-react';
import Link from 'next/link';
import Logo from '@/frontend/components/ui/Logo';

interface StartupDashboardProps {
  startupId?: string;
  initialStartup?: any;
  readOnly?: boolean;
  onEditAsIncubator?: () => void;
  backUrl?: string;
}

export default function StartupDashboard({
  startupId,
  initialStartup,
  readOnly = false,
  onEditAsIncubator,
  backUrl = '/incubator/startups',
}: StartupDashboardProps = {}) {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'more' | 'profile' | null>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [rawStartup, setRawStartup] = useState<any | null>(null);

  const handleOpenProfileSection = (section: string = 'basic') => {
    if (readOnly) return;
    setIsStartupModalOpen(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('edit-startup-section', { detail: section }));
    }, 120);
  };

  const handleStartupUpdate = (updated: any) => {
    setRawStartup(updated);
    setProfile((prev) =>
      prev
        ? {
          ...prev,
          name: updated.startup_name || updated.name || prev.name,
          tagline: updated.tagline || updated.description || updated.solution_description || prev.tagline,
          stage: updated.stage || prev.stage,
          logo_url: updated.logo_url !== undefined ? updated.logo_url : prev.logo_url,
          logo_color: updated.logo_color !== undefined ? updated.logo_color : prev.logo_color,
          initials: updated.initials !== undefined ? updated.initials : prev.initials,
        }
        : null
    );
  };
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAssignedDashboard, setHasAssignedDashboard] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadStartupData() {
      if (initialStartup) {
        setRawStartup(initialStartup);
        setProfile({
          id: initialStartup.id,
          name: initialStartup.startup_name || initialStartup.name || 'Startup',
          batch: initialStartup.cohort || initialStartup.batch || 'Batch 2026',
          tagline: initialStartup.tagline || initialStartup.description || 'Accelerated Startup',
          stage: initialStartup.stage || 'Validation Phase',
          stageProgress: typeof initialStartup.stage_progress === 'number' ? initialStartup.stage_progress : 70,
          track: (initialStartup.track || 'both') as any,
          incubatorName: initialStartup.organization?.name || 'Incubator Hub',
          logo_url: initialStartup.logo_url || null,
          logo_color: initialStartup.logo_color || null,
          initials: initialStartup.initials || null,
        });
        setHasAssignedDashboard(true);
        setIsLoading(false);
        return;
      }

      if (authLoading) return;
      if (!user) {
        router.replace('/login?redirect=/startup/dashboard');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token ? `Bearer ${session.access_token}` : '';
        const headers: Record<string, string> = token ? { Authorization: token } : {};

        // If startupId is provided, fetch specific startup (incubator preview mode)
        const endpoint = startupId ? `/api/v1/startups/${startupId}` : '/api/v1/startups/me';
        const res = await fetch(endpoint, { headers });
        const data = await res.json();

        if (startupId) {
          if (!res.ok || !data.success || !data.data) {
            setHasAssignedDashboard(false);
            setIsLoading(false);
            return;
          }

          const st = data.data;
          setRawStartup(st);
          setProfile({
            id: st.id,
            name: st.startup_name || st.name || 'Startup',
            batch: st.cohort || st.batch || 'Batch 2026',
            tagline: st.tagline || st.description || 'Accelerated Startup',
            stage: st.stage || 'Validation Phase',
            stageProgress: typeof st.stage_progress === 'number' ? st.stage_progress : 70,
            track: (st.track || 'both') as any,
            incubatorName: st.organization?.name || 'Incubator Hub',
            logo_url: st.logo_url || null,
            logo_color: st.logo_color || null,
            initials: st.initials || null,
          });
          setHasAssignedDashboard(true);
        } else {
          // Standard founder /dashboard
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
            tagline: startup?.tagline || startup?.description || fd.oneSentencePitch || 'Incubator Accelerated Startup',
            stage: startup?.stage || fd.businessStage || 'Validation Phase',
            stageProgress: typeof startup?.stage_progress === 'number' ? startup.stage_progress : 70,
            track: resolvedTrack as any,
            incubatorName: org?.name || app?.incubator_name_text || 'Incubator Hub',
            logo_url: startup?.logo_url || null,
            logo_color: startup?.logo_color || null,
            initials: startup?.initials || null,
          });
        }
      } catch (err) {
        console.warn('Startup data fetch error:', err);
        setHasAssignedDashboard(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadStartupData();
  }, [user, authLoading, router, startupId, initialStartup]);

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
    if (!activeDropdown) return;

    function handleClickOutside(event: MouseEvent) {
      if (activeDropdown === 'more') {
        if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDropdown]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-[400px] w-full flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">
          {readOnly ? 'Loading startup preview...' : 'Verifying assigned dashboard access...'}
        </p>
      </div>
    );
  }

  if (hasAssignedDashboard === false || !profile) {
    if (readOnly) {
      return (
        <div className="min-h-[400px] w-full flex flex-col justify-center items-center px-4 py-16 bg-[#F8FAFC]">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Startup Not Found</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This startup could not be found or does not belong to your incubator organization.
            </p>
            <div className="pt-2">
              <Link
                href={backUrl}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Startups</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

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
      {/* Slim banner at the top for read-only preview */}
      {readOnly && (
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="font-medium">
              Previewing <span className="font-semibold">{profile.name}</span> · read-only
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={backUrl}
              className="text-amber-800 hover:text-amber-950 font-medium hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to profile</span>
            </Link>
            {onEditAsIncubator && (
              <button
                type="button"
                onClick={onEditAsIncubator}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit as incubator</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Single White Header with One Bottom Border */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Startup Name + Cohort & Track Badges */}
          <div className="flex items-center gap-3 min-w-0">
            {readOnly ? (
              <StartupLogo
                name={profile.name}
                logoUrl={profile.logo_url}
                logoColor={profile.logo_color}
                initials={profile.initials}
                className="w-9 h-9 rounded-xl text-xs font-semibold"
              />
            ) : (
              <Logo href="/" />
            )}
            <div className="h-5 w-px bg-slate-200 shrink-0" />
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight truncate max-w-[200px] sm:max-w-sm">
              {profile.name}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80 shrink-0">
              <Rocket className="w-3 h-3 text-indigo-500" />
              <span>{profile.batch}</span>
            </span>
            <span className="hidden sm:inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
              {profile.track === 'both' ? 'DeepTech' : `${profile.track} Track`}
            </span>
          </div>

          {/* Right: Export + Share + ⋯ Menu + Avatar (Hidden in readOnly mode) */}
          {!readOnly ? (
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Export (secondary) */}
              <button
                type="button"
                onClick={handleExportReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition shadow-xs cursor-pointer"
                title="Export cohort progress report"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Share (primary, or secondary on activity log tab) */}
              <button
                type="button"
                onClick={handleShare}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium text-sm transition shadow-xs cursor-pointer ${activeTab === 'activity'
                  ? 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                title="Share dashboard"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* ⋯ Menu */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown((prev) => (prev === 'more' ? null : 'more'))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition shadow-xs cursor-pointer flex items-center justify-center"
                  title="More options"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {activeDropdown === 'more' && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        setIsStartupModalOpen(true);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <Pencil className="w-4 h-4 text-slate-500" />
                      <span>Startup Details</span>
                    </button>

                    {applications.length > 0 && (
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <div className="px-3.5 py-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
                          <span>Applied Incubators</span>
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                            {applications.length}
                          </span>
                        </div>
                        <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
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
                                onClick={() => setActiveDropdown(null)}
                                className="px-3.5 py-2 hover:bg-slate-50 transition flex items-center justify-between gap-2 group"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-slate-800 truncate group-hover:text-blue-600">
                                    {incName}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    Ref: {app.id.slice(0, 8)}...
                                  </p>
                                </div>
                                <span
                                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${isAccepted
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
              </div>

              {/* Avatar Menu */}
              <div className="pl-1 border-l border-slate-200">
                <StartupProfileMenu
                  user={user}
                  startup={rawStartup}
                  onStartupUpdate={handleStartupUpdate}
                  onOpenStartupModal={() => setIsStartupModalOpen(true)}
                  onLogout={() => (logout ? logout() : router.push('/login'))}
                  isOpen={activeDropdown === 'profile'}
                  onToggle={() => setActiveDropdown((prev) => (prev === 'profile' ? null : 'profile'))}
                  onClose={() => setActiveDropdown(null)}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                Read-only preview
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Tabs Directly Below, Left-Aligned & Sticky */}
      <nav className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 h-11 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`h-full inline-flex items-center gap-2 text-sm font-medium border-b-2 transition-colors cursor-pointer shrink-0 ${activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview &amp; KPIs</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-semibold shrink-0 whitespace-nowrap ${activeTab === 'overview'
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
            className={`h-full inline-flex items-center gap-2 text-sm font-medium border-b-2 transition-colors cursor-pointer shrink-0 ${activeTab === 'pitch'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>Pitch &amp; Prototype</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tech')}
            className={`h-full inline-flex items-center gap-2 text-sm font-medium border-b-2 transition-colors cursor-pointer shrink-0 ${activeTab === 'tech'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Software &amp; Hardware</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`h-full inline-flex items-center gap-2 text-sm font-medium border-b-2 transition-colors cursor-pointer shrink-0 ${activeTab === 'activity'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Activity Log</span>
          </button>
        </div>
      </nav>

      {/* Main Container Sharing Exact Same max-w-7xl mx-auto px-6 */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="transition-all duration-200">
          {activeTab === 'overview' && (
            <OverviewTab
              startup={rawStartup}
              onNavigateTab={setActiveTab}
              onOpenProfile={(section) => handleOpenProfileSection(section || 'basic')}
              readOnly={readOnly}
            />
          )}
          {activeTab === 'pitch' && (
            <PitchPrototypeTab
              startup={rawStartup}
              onOpenProfile={(section) => handleOpenProfileSection(section || 'documents')}
              readOnly={readOnly}
            />
          )}
          {activeTab === 'tech' && (
            <SoftwareHardwareTab
              track={profile.track}
              startup={rawStartup}
              onStartupUpdate={handleStartupUpdate}
              readOnly={readOnly}
            />
          )}
          {activeTab === 'activity' && <ActivityLogTab readOnly={readOnly} />}
        </div>
      </main>

      {/* Large Near-Full-Screen Startup Detail Modal - only when NOT readOnly */}
      {!readOnly && (
        <StartupDetailModal
          isOpen={isStartupModalOpen}
          onClose={() => setIsStartupModalOpen(false)}
          startup={rawStartup}
          organization={rawStartup?.organization}
          onStartupUpdate={handleStartupUpdate}
        />
      )}
    </div>
  );
}
