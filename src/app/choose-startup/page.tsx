'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/frontend/context/AuthContext';
import { apiClient } from '@/services/apiClient';
import StartupLogo from '@/frontend/components/ui/StartupLogo';
import Logo from '@/frontend/components/ui/Logo';
import {
  Building2,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogOut,
  FolderOpen,
  Users,
  Search,
  Rocket,
  CheckCircle2,
} from 'lucide-react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';

interface StartupItem {
  id: string;
  name: string;
  sector: string;
  stage: string;
  incubator_name: string;
  cohort?: string;
  members_count?: number;
  funding?: string;
  is_active?: boolean;
  has_assigned_dashboard?: boolean;
  logo_url?: string | null;
  initials?: string | null;
  organization_id?: string | null;
}

const getStageBadgeClasses = (stage: string = '') => {
  const s = stage.trim().toLowerCase();
  if (s.includes('mvp')) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200/90';
  }
  if (s.includes('pre-revenue') || s.includes('prerevenue')) {
    return 'bg-amber-50 text-amber-700 border-amber-200/90';
  }
  if (s.includes('growth')) {
    return 'bg-teal-50 text-teal-700 border-teal-200/90';
  }
  if (s.includes('revenue')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200/90';
  }
  // Idea / Default
  return 'bg-slate-100 text-slate-700 border-slate-200/90';
};

function ChooseStartupContent() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();

  const [startups, setStartups] = useState<StartupItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoadingId, setSelectedLoadingId] = useState<string | null>(null);
  const [unassignedNotices, setUnassignedNotices] = useState<Record<string, string>>({});
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Search filter for 4+ startups
  const [searchQuery, setSearchQuery] = useState('');

  // Avatar Dropdown Menu
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Protect /choose-startup for logged-in founders only
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/choose-startup');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAvatarDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAvatarDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchStartups = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch assigned startups for logged-in founder
      const res = await apiClient.get('/founder/startups');
      const list = res.data?.startups || res.data?.data || [];
      setStartups(list);
      if (typeof window !== 'undefined') {
        localStorage.setItem('founder_startups_count', String(list.length));
      }
    } catch (err: any) {
      console.error('Failed to fetch founder startups:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load startups');
      setStartups([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStartups();
  }, [fetchStartups]);

  const handleSelectStartup = async (startup: StartupItem) => {
    if (selectedLoadingId) return;

    // If already known to not have an assigned dashboard
    if (startup.has_assigned_dashboard === false || unassignedNotices[startup.id]) {
      setUnassignedNotices((prev) => ({
        ...prev,
        [startup.id]: 'No assigned dashboard',
      }));
      setActionNotice(`No assigned dashboard for "${startup.name}". Please wait for your incubator to assign access.`);
      return;
    }

    setSelectedLoadingId(startup.id);
    setActionNotice(null);

    try {
      // Verify server-side and set selected startup cookie/session
      await apiClient.post('/founder/select-startup', { startupId: startup.id });

      if (typeof window !== 'undefined') {
        localStorage.setItem('selected_startup_id', startup.id);
        localStorage.setItem('selected_startup_name', startup.name);
        if (startup.organization_id) {
          localStorage.setItem('org_id', startup.organization_id);
        }
      }

      // Redirect to existing dashboard route
      await router.push('/startup/dashboard');
    } catch (err: any) {
      console.error('Failed to select startup:', err);
      const statusCode = err.response?.status;
      const errMsg = err.response?.data?.error || err.message || '';

      if (
        statusCode === 403 ||
        errMsg.toLowerCase().includes('dashboard') ||
        errMsg.toLowerCase().includes('assigned')
      ) {
        setUnassignedNotices((prev) => ({
          ...prev,
          [startup.id]: 'No assigned dashboard',
        }));
        setStartups((prev) =>
          prev.map((s) => (s.id === startup.id ? { ...s, has_assigned_dashboard: false } : s))
        );
        setActionNotice(`No assigned dashboard for "${startup.name}". Please wait for your incubator to assign access.`);
      } else {
        setActionNotice(errMsg || 'Failed to select startup');
      }
      setSelectedLoadingId(null);
    }
  };

  const firstName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    (user?.email ? user.email.split('@')[0] : 'Founder');

  const initials = (() => {
    const raw =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split('@')[0] ||
      'F';
    const parts = raw.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return raw.slice(0, 2).toUpperCase();
  })();

  const filteredStartups = startups.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.sector.toLowerCase().includes(q) ||
      s.incubator_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* 1. Header with Teal Initials Avatar & Dropdown */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo href="/" />

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsAvatarDropdownOpen((prev) => !prev)}
              aria-expanded={isAvatarDropdownOpen}
              className="w-9 h-9 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center transition-all shadow-2xs ring-2 ring-white hover:ring-teal-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              title={user?.email || 'Account'}
            >
              {initials}
            </button>

            {isAvatarDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Signed in as
                  </p>
                  <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                    {user?.email || 'founder@domain.com'}
                  </p>
                </div>
                <div className="pt-1 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarDropdownOpen(false);
                      if (logout) logout();
                      else router.push('/login');
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container - Centered vertically when 3 or fewer cards */}
      <main
        className={`flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col ${
          !isLoading && startups.length <= 3 ? 'justify-center my-auto' : ''
        }`}
      >
        {/* 2. Hero Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">
              Welcome back, {firstName}
            </p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Choose a startup
              </h1>
              {!isLoading && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  {startups.length} startup{startups.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Select which startup dashboard to open
            </p>
          </div>

          {/* 6. Search box shown when 4+ startups */}
          {!isLoading && startups.length >= 4 && (
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search startups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          )}
        </div>

        {/* Action Notice Banner */}
        {actionNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 flex items-center justify-between text-xs font-medium animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-amber-600 hover:text-amber-800 font-bold ml-4 p-1 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* State 1: Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 flex flex-col justify-between animate-pulse"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-200" />
                    <div className="w-20 h-6 rounded-full bg-slate-200" />
                  </div>
                  <div className="mt-5 space-y-2">
                    <div className="w-3/4 h-5 rounded-md bg-slate-200" />
                    <div className="w-1/2 h-4 rounded-md bg-slate-100" />
                  </div>
                  <div className="mt-6 w-full h-8 rounded-lg bg-slate-100" />
                </div>
                <div className="mt-6 w-full h-10 rounded-xl bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* State 2: Error State with Retry */}
        {!isLoading && error && (
          <div className="w-full max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Failed to load startups</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {error || 'Unable to retrieve your startup dashboards. Please try again.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={fetchStartups}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* State 3: Empty State */}
        {!isLoading && !error && filteredStartups.length === 0 && (
          <div className="w-full max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                {searchQuery ? 'No matching startups' : 'No dashboards assigned yet'}
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {searchQuery
                  ? `No startups matched "${searchQuery}". Try a different keyword.`
                  : 'You do not have any admitted startup dashboards yet. Once an incubator assigns a workspace to your application, it will appear here.'}
              </p>
            </div>
            <div className="pt-2">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Clear search
                </button>
              ) : (
                <Link
                  href="/programs/preincubator/status"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Check Application Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* State 4: Startups Card Grid (3 columns desktop, 1 column mobile) */}
        {!isLoading && !error && filteredStartups.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStartups.map((startup, idx) => {
              const isCurrentLoading = selectedLoadingId === startup.id;
              const isOtherLoading = selectedLoadingId !== null && !isCurrentLoading;

              return (
                <div
                  key={startup.id}
                  onClick={() => handleSelectStartup(startup)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectStartup(startup);
                    }
                  }}
                  style={{ animationDelay: `${idx * 75}ms` }}
                  className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-200 p-6 flex flex-col justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    isOtherLoading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div>
                    {/* Top Row: Logo, Active dot, & Stage Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <StartupLogo
                        name={startup.name}
                        logoUrl={startup.logo_url}
                        initials={startup.initials}
                        className="w-12 h-12 rounded-xl text-sm font-bold shadow-2xs border border-slate-200/70"
                      />

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {/* Status dot */}
                        {startup.has_assigned_dashboard === false || unassignedNotices[startup.id] ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>No Dashboard</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active</span>
                          </span>
                        )}

                        {/* Stage Badge with better contrast */}
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${getStageBadgeClasses(
                            startup.stage
                          )}`}
                        >
                          {startup.stage || 'MVP'}
                        </span>
                      </div>
                    </div>

                    {/* Startup Name & Sector in darker gray */}
                    <div className="mt-4">
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors truncate">
                        {startup.name}
                      </h2>
                      <p className="text-xs font-semibold text-slate-600 mt-1 line-clamp-1">
                        {startup.sector || 'Technology & Software'}
                      </p>
                    </div>

                    {/* Batch Pill */}
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                        <Rocket className="w-3 h-3 text-indigo-500" />
                        <span>Batch {startup.cohort || '2024'}</span>
                      </span>
                    </div>

                    {/* Plain inline incubator row (no background) */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-medium">
                        {startup.incubator_name || 'Assigned Incubator'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {/* Footer Row: {n} members & Funding $X */}
                    <div className="border-t border-slate-100 mt-5 pt-3.5 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{startup.members_count || 4} members</span>
                      </div>
                      <div className="font-semibold text-slate-700">
                        Funding {startup.funding || '$500K'}
                      </div>
                    </div>

                    {/* 4. Button: Outline by default, fills solid blue on card hover */}
                    <div className="mt-4">
                      {startup.has_assigned_dashboard === false || unassignedNotices[startup.id] ? (
                        <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold shadow-2xs">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>No assigned dashboard</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isOtherLoading || isCurrentLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectStartup(startup);
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-600 bg-white text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 text-xs font-semibold shadow-2xs transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isCurrentLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Opening Dashboard...</span>
                            </>
                          ) : (
                            <>
                              <span>View Dashboard</span>
                              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ChooseStartupPage() {
  return (
    <ProtectedRoute>
      <ChooseStartupContent />
    </ProtectedRoute>
  );
}
