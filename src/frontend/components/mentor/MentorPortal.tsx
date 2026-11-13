'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Building2,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  Info,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  User,
  Video,
  X,
} from 'lucide-react';
import { Sidebar, NavItem } from '@/frontend/components/layouts/Sidebar';
import { useAuth } from '@/frontend/context/AuthContext';
import { supabase } from '@/backend/lib/supabase';
import { apiClient } from '@/services/apiClient';

export type MentorRouteKey =
  | 'dashboard'
  | 'sessions'
  | 'startups'
  | 'availability'
  | 'feedback'
  | 'profile';

interface MentorPortalProps {
  initialRoute?: MentorRouteKey;
}

const EMPTY_GRID: Record<string, string[]> = {};

const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

function StatusChip({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  let classes = 'bg-slate-100 text-slate-700 border-slate-200';
  if (s === 'pending' || s === 'under review') {
    classes = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (s === 'active' || s === 'done' || s === 'confirmed' || s === 'completed') {
    classes = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (s === 'declined' || s === 'cancelled') {
    classes = 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
      {status}
    </span>
  );
}

function AvatarBadge({ name, src, size = 'md' }: { name: string; src?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'w-7 h-7 text-[11px]' : size === 'lg' ? 'w-14 h-14 text-base' : 'w-9 h-9 text-xs';
  if (src) {
    return <img src={src} alt={name} className={`${dims} rounded-lg object-cover border border-slate-200 shrink-0`} />;
  }
  const initials = (name || 'M')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
  return (
    <div className={`${dims} rounded-lg bg-blue-50 border border-blue-200 text-[#2563EB] font-bold flex items-center justify-center shrink-0`}>
      {initials}
    </div>
  );
}

export default function MentorPortal({ initialRoute }: MentorPortalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser, isLoading: authLoading, logout } = useAuth();

  const currentRoute: MentorRouteKey = useMemo(() => {
    if (initialRoute) return initialRoute;
    if (pathname?.includes('/mentor/sessions')) return 'sessions';
    if (pathname?.includes('/mentor/startups')) return 'startups';
    if (pathname?.includes('/mentor/availability')) return 'availability';
    if (pathname?.includes('/mentor/feedback')) return 'feedback';
    if (pathname?.includes('/mentor/profile')) return 'profile';
    return 'dashboard';
  }, [initialRoute, pathname]);

  const [loading, setLoading] = useState(true);
  const [hasMentorProfile, setHasMentorProfile] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [mentorData, setMentorData] = useState<any>(null);
  const [stats, setStats] = useState({
    sessionsThisMonth: 0,
    hoursUsedThisMonth: 0,
    upcoming7Days: 0,
    avgRating: 0,
    ratingCount: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
    ratingTrend: [] as number[],
    activeStartups: 0,
  });
  const [sessions, setSessions] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [actionQueue, setActionQueue] = useState<any[]>([]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Shared Schedule Modal state
  const [scheduleModalStartup, setScheduleModalStartup] = useState<any | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    startup_id: '',
    session_title: '',
    scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    start_time: '10:00',
    meeting_link: '',
    agenda: '',
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user && !authUser && !authLoading) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname || '/mentor/dashboard')}`);
        return;
      }

      const res = await apiClient.get('/mentor/dashboard');
      const data = res.data;
      setUserInfo(data.user || null);

      if (!data.hasMentorProfile) {
        setHasMentorProfile(false);
        setLoading(false);
        return;
      }

      setHasMentorProfile(true);
      setMentorData(data.mentor);
      setStats(data.stats);
      setSessions(data.sessions || []);
      setStartups(data.startups || []);
      setFeedbackList(data.feedbackList || []);
      setActionQueue(data.actionQueue || []);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname || '/mentor/dashboard')}`);
        return;
      }
      console.error('Failed to load mentor dashboard:', err);
      showToast('Failed to load mentor portal data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [authLoading, authUser, pathname, router, showToast]);

  useEffect(() => {
    if (!authLoading) {
      loadDashboard();
    }
  }, [authLoading, loadDashboard]);

  // Realtime sync on mentorship_sessions & startup_mentors for live action queue & schedule updates
  useEffect(() => {
    if (!mentorData?.id) return;
    const channel = supabase
      .channel(`mentor-portal-realtime-${mentorData.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mentorship_sessions', filter: `mentor_id=eq.${mentorData.id}` },
        () => loadDashboard()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'startup_mentors', filter: `mentor_id=eq.${mentorData.id}` },
        () => loadDashboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mentorData?.id, loadDashboard]);

  // Cmd+K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const mutateMentor = async (payload: Record<string, any>, successMsg?: string) => {
    try {
      const res = await apiClient.patch('/mentor/dashboard', payload);
      if (successMsg) showToast(successMsg);
      return res.data;
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Action failed. Please try again.', 'error');
      throw err;
    }
  };

  const handleToggleAvailable = async () => {
    if (!mentorData) return;
    const nextVal = !mentorData.is_available;
    setMentorData((prev: any) => ({ ...prev, is_available: nextVal }));
    try {
      await mutateMentor(
        { action: 'toggle_availability', is_available: nextVal },
        nextVal ? 'Now accepting new startups' : 'Paused new startup assignments'
      );
    } catch {
      setMentorData((prev: any) => ({ ...prev, is_available: !nextVal }));
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStartupId = scheduleForm.startup_id || startups[0]?.id;
    if (!targetStartupId || !scheduleForm.scheduled_date || !scheduleForm.start_time) {
      showToast('Please select a startup, date, and time.', 'error');
      return;
    }
    setSavingSchedule(true);
    try {
      await mutateMentor(
        {
          action: 'create_session',
          ...scheduleForm,
          startup_id: targetStartupId,
        },
        'Session scheduled successfully'
      );
      setScheduleModalStartup(null);
      await loadDashboard();
    } finally {
      setSavingSchedule(false);
    }
  };

  const pendingSessionCount = useMemo(
    () => sessions.filter((s) => s.status === 'Pending').length,
    [sessions]
  );
  const feedbackDueCount = useMemo(
    () => actionQueue.filter((q) => q.type === 'feedback_due').length,
    [actionQueue]
  );

  const navItems: NavItem[] = useMemo(
    () => [
      { label: 'Dashboard', href: '/mentor/dashboard', icon: LayoutDashboard },
      { label: 'Sessions', href: '/mentor/sessions', icon: CalendarIcon, count: pendingSessionCount || undefined },
      { label: 'My Startups', href: '/mentor/startups', icon: Building2 },
      { label: 'Availability', href: '/mentor/availability', icon: Clock },
      { label: 'Feedback', href: '/mentor/feedback', icon: MessageSquare, count: feedbackDueCount || undefined },
      { label: 'Profile', href: '/mentor/profile', icon: User },
    ],
    [pendingSessionCount, feedbackDueCount]
  );

  const searchResults = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    return {
      startups: startups.filter((s) => !q || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)),
      sessions: sessions.filter((s) => !q || s.title.toLowerCase().includes(q) || s.startupName.toLowerCase().includes(q)),
    };
  }, [globalSearchQuery, startups, sessions]);

  if (!loading && !hasMentorProfile) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#1A2151]">Complete your mentor application</h1>
          <p className="text-sm text-slate-600">
            Submit your background, domains of expertise, and target incubator to unlock the Mentor Portal.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/mentor/application-form"
              className="w-full py-2.5 px-4 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              Go to Mentor Application
            </Link>
            <button
              onClick={() => logout()}
              className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased flex">
      {/* Shared Website Sidebar */}
      <Sidebar
        items={navItems}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onLogout={() => logout()}
      />

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around h-14 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium ${
                isActive ? 'text-[#2563EB]' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Shell */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen pb-16 md:pb-0">
        {/* Top Bar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center text-xs md:text-sm text-slate-500 space-x-2 truncate">
              <Link href="/mentor/dashboard" className="hover:text-slate-800">
                Mentor portal
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="capitalize font-semibold text-[#1A2151]">{currentRoute}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 text-slate-500 text-xs md:text-sm px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block bg-white text-slate-600 border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setUserMenuOpen(false);
                }}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {actionQueue.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563EB] rounded-full" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100 font-semibold text-slate-900 flex justify-between">
                    <span>Notifications ({actionQueue.length})</span>
                    {actionQueue.some((q) => q.notificationId) && (
                      <button
                        type="button"
                        onClick={async () => {
                          await mutateMentor({ action: 'dismiss_notification' });
                          setActionQueue((prev) => prev.filter((q) => !q.notificationId));
                        }}
                        className="text-[#2563EB] text-[11px] font-medium hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {actionQueue.length === 0 ? (
                      <p className="p-4 text-slate-400 text-center">No unread notifications.</p>
                    ) : (
                      actionQueue.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={async () => {
                            setNotificationsOpen(false);
                            if (item.notificationId) {
                              mutateMentor({ action: 'dismiss_notification', notification_id: item.notificationId }).catch(() => {});
                              setActionQueue((prev) => prev.filter((q) => q.id !== item.id));
                            }
                            if (item.href) router.push(item.href);
                          }}
                          className="w-full text-left p-3 hover:bg-slate-50 transition-colors cursor-pointer block"
                        >
                          <p className="font-medium text-slate-900">{item.title}</p>
                          <p className="text-slate-500 mt-0.5">{item.subtitle}</p>
                          <span className="text-[10px] text-slate-400 mt-1 inline-block">{item.date}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <AvatarBadge name={userInfo?.fullName || 'Mentor'} src={userInfo?.avatar} size="sm" />
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 truncate">{userInfo?.fullName || 'Mentor'}</p>
                    <p className="text-slate-500 text-[11px] truncate">{userInfo?.email || ''}</p>
                  </div>
                  <Link
                    href="/mentor/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>View profile</span>
                  </Link>
                  <Link
                    href="/mentor/availability"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Availability settings</span>
                  </Link>
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center space-x-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Toast feedback */}
        {toast && (
          <div className="fixed bottom-20 md:bottom-6 right-6 z-50">
            <div
              className={`px-4 py-2.5 rounded-xl border shadow-lg text-xs font-medium flex items-center gap-2 ${
                toast.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-white border-emerald-200 text-slate-800'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${toast.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`} />
              <span>{toast.text}</span>
            </div>
          </div>
        )}

        {/* Main Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl p-4" />
                ))}
              </div>
              <div className="h-64 bg-white border border-slate-200 rounded-xl" />
            </div>
          ) : (
            <>
              {currentRoute === 'dashboard' && (
                <DashboardView
                  mentorData={mentorData}
                  stats={stats}
                  actionQueue={actionQueue}
                  sessions={sessions}
                  startups={startups}
                  feedbackList={feedbackList}
                  onToggleAvailable={handleToggleAvailable}
                  onMutate={mutateMentor}
                  onRefresh={loadDashboard}
                />
              )}
              {currentRoute === 'sessions' && (
                <SessionsView
                  sessions={sessions}
                  startups={startups}
                  onOpenSchedule={() => {
                    setScheduleForm((prev) => ({
                      ...prev,
                      startup_id: startups[0]?.id || '',
                      meeting_link: mentorData?.calendar_url || '',
                    }));
                    setScheduleModalStartup(startups[0] || { name: 'Startup' });
                  }}
                  onMutate={mutateMentor}
                  onRefresh={loadDashboard}
                />
              )}
              {currentRoute === 'startups' && (
                <StartupsView
                  startups={startups}
                  sessions={sessions}
                  onScheduleWithStartup={(st: any) => {
                    setScheduleForm((prev) => ({
                      ...prev,
                      startup_id: st.id,
                      meeting_link: mentorData?.calendar_url || '',
                    }));
                    setScheduleModalStartup(st);
                  }}
                />
              )}
              {currentRoute === 'availability' && (
                <AvailabilityView
                  mentorData={mentorData}
                  userInfo={userInfo}
                  sessionsCount={stats.sessionsThisMonth}
                  hoursUsed={stats.hoursUsedThisMonth}
                  onToggleAvailable={handleToggleAvailable}
                  onMutate={mutateMentor}
                  onRefresh={loadDashboard}
                />
              )}
              {currentRoute === 'feedback' && (
                <FeedbackView
                  sessions={sessions}
                  feedbackList={feedbackList}
                  avgRating={stats.avgRating}
                  ratingDistribution={stats.ratingDistribution}
                  onMutate={mutateMentor}
                  onRefresh={loadDashboard}
                />
              )}
              {currentRoute === 'profile' && (
                <ProfileView
                  userInfo={userInfo}
                  mentorData={mentorData}
                  onMutate={mutateMentor}
                  onRefresh={loadDashboard}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Search Modal (Cmd+K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="p-3 border-b border-slate-200 flex items-center space-x-2">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search startups, sessions, pages..."
                className="w-full bg-transparent text-slate-900 text-sm focus:outline-hidden"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 max-h-80 overflow-y-auto space-y-3 text-xs">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Startups ({searchResults.startups.length})
                </p>
                {searchResults.startups.length === 0 ? (
                  <p className="text-slate-400 px-2 py-1">No matching startups</p>
                ) : (
                  searchResults.startups.slice(0, 5).map((st) => (
                    <Link
                      key={st.id}
                      href="/mentor/startups"
                      onClick={() => setSearchModalOpen(false)}
                      className="p-2 hover:bg-slate-50 rounded-lg flex items-center space-x-3"
                    >
                      <AvatarBadge name={st.name} src={st.logo} size="sm" />
                      <div>
                        <p className="font-medium text-slate-900">{st.name}</p>
                        <p className="text-slate-500 text-[11px]">{st.sector} · {st.stage}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <div className="border-t border-slate-100 pt-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Quick Navigation
                </p>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSearchModalOpen(false)}
                    className="block p-2 hover:bg-blue-50 hover:text-[#2563EB] rounded-lg font-medium text-slate-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Schedule Session Modal */}
      {scheduleModalStartup && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSession}
            className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1A2151]">Schedule Mentorship Session</h3>
              <button
                type="button"
                onClick={() => setScheduleModalStartup(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Startup</label>
                <select
                  value={scheduleForm.startup_id}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, startup_id: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  required
                >
                  {startups.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Session Topic Title</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.session_title}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, session_title: e.target.value }))}
                  placeholder="e.g. GTM Strategy & Pricing Review"
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.scheduled_date}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, scheduled_date: e.target.value }))}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.start_time}
                    onChange={(e) => setScheduleForm((p) => ({ ...p, start_time: e.target.value }))}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={scheduleForm.meeting_link}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, meeting_link: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Agenda</label>
                <textarea
                  rows={2}
                  value={scheduleForm.agenda}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, agenda: e.target.value }))}
                  placeholder="Key topics to cover..."
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setScheduleModalStartup(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingSchedule || startups.length === 0}
                className="px-4 py-2 text-xs bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingSchedule && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Send Invite</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   PAGE 1: /mentor/dashboard
   ========================================================================== */
function DashboardView({
  mentorData,
  stats,
  actionQueue,
  sessions,
  startups,
  feedbackList,
  onToggleAvailable,
  onMutate,
  onRefresh,
}: any) {
  const router = useRouter();
  const [meetingLinkSessionId, setMeetingLinkSessionId] = useState<string | null>(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');

  const completeness = mentorData?.completeness ?? 0;
  const upcomingSessions = sessions.filter((s: any) => s.status === 'Confirmed' || s.status === 'Pending');
  const nextSession = upcomingSessions[0];
  const weeklyGrid = mentorData?.availability_json?.weekly_grid || EMPTY_GRID;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A2151]">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {actionQueue.length} pending {actionQueue.length === 1 ? 'action' : 'actions'} ·{' '}
            {nextSession ? `next session ${nextSession.date} at ${nextSession.startTime}` : 'no upcoming session'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
            <span className="text-xs font-medium text-slate-700 mr-2.5">Accepting startups</span>
            <button
              type="button"
              onClick={onToggleAvailable}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                mentorData?.is_available ? 'bg-[#2563EB]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  mentorData?.is_available ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <Link
            href="/mentor/availability"
            className="bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-2xs flex items-center space-x-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Edit availability</span>
          </Link>
        </div>
      </div>

      {/* Slim Progress / Review Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${
              mentorData?.is_active
                ? 'bg-blue-50 border-blue-200 text-[#2563EB]'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              {mentorData?.is_active
                ? `Active mentor at ${mentorData?.organization?.name || 'Incubator'}`
                : `Application under review by ${mentorData?.organization?.name || 'your incubator'}`}{' '}
              · Profile {completeness}% complete
            </p>
            <p className="text-xs text-slate-500">
              Keep your availability slots and SME specialization updated for founder matching.
            </p>
          </div>
        </div>
        <div className="w-full md:w-48 flex items-center space-x-2">
          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-[#2563EB] h-full rounded-full" style={{ width: `${completeness}%` }} />
          </div>
          <span className="text-xs font-semibold text-slate-700">{completeness}%</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sessions this month</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#1A2151]">{stats.sessionsThisMonth}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Scheduled &amp; completed</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Upcoming (7 days)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#1A2151]">{stats.upcoming7Days}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {nextSession ? `Next ${nextSession.date} ${nextSession.startTime}` : 'No upcoming slots'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Average rating</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-[#1A2151]">
                {stats.avgRating > 0 ? stats.avgRating : '—'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                From {stats.ratingCount} feedback {stats.ratingCount === 1 ? 'response' : 'responses'}
              </p>
            </div>
            <svg className="w-16 h-8 text-[#2563EB] stroke-current fill-none" viewBox="0 0 60 25">
              {(() => {
                const pts: number[] = Array.isArray(stats.ratingTrend) && stats.ratingTrend.length >= 2 ? stats.ratingTrend : [];
                if (pts.length < 2) {
                  return <line x1="0" y1="20" x2="60" y2="20" strokeWidth="1.5" strokeDasharray="3 3" className="text-slate-300" />;
                }
                const d = pts
                  .map((val, idx) => {
                    const x = (idx / (pts.length - 1)) * 60;
                    const y = 22 - ((Math.min(5, Math.max(1, val)) - 1) / 4) * 18;
                    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                  })
                  .join(' ');
                return <path d={d} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
              })()}
            </svg>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Portfolio startups</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#1A2151]">{stats.activeStartups}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              In {mentorData?.organization?.name || 'organization'}
            </p>
          </div>
        </div>
      </div>

      {/* Main 2/3 + Right Rail 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Needs Your Action */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#1A2151]">Needs your action</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB]">
                {actionQueue.length} pending
              </span>
            </div>

            {actionQueue.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-500">No pending requests or feedback items.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actionQueue.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm text-slate-900">{item.title}</span>
                        <span className="text-[10px] text-slate-400">· {item.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{item.subtitle}</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {item.type === 'session_confirm' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setMeetingLinkSessionId(item.sessionId);
                              setMeetingLinkInput(mentorData?.calendar_url || 'https://meet.google.com/');
                            }}
                            className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50"
                          >
                            Link
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await onMutate(
                                { action: 'update_session', session_id: item.sessionId, status: 'confirmed' },
                                'Session confirmed'
                              );
                              await onRefresh();
                            }}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Confirm
                          </button>
                        </>
                      )}

                      {item.type === 'feedback_due' && (
                        <button
                          type="button"
                          onClick={() => router.push('/mentor/feedback')}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#2563EB] text-white hover:bg-blue-700"
                        >
                          Write feedback
                        </button>
                      )}

                      {item.type === 'notification' && (
                        <button
                          type="button"
                          onClick={async () => {
                            await onMutate({ action: 'dismiss_notification', notification_id: item.notificationId });
                            await onRefresh();
                          }}
                          className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Sessions Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#1A2151]">Upcoming sessions timeline</h2>
              <Link
                href="/mentor/sessions"
                className="text-xs text-[#2563EB] font-medium hover:underline flex items-center space-x-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-500">
                No upcoming mentorship sessions scheduled yet.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 5).map((session: any) => {
                  const diffMs = session.timestamp - Date.now();
                  const durationMs = (Number(session.durationMinutes) || 60) * 60000;
                  const canJoin = Boolean(session.meetingLink) && diffMs <= 10 * 60000 && diffMs >= -durationMs;
                  const isStartingSoon = diffMs <= 10 * 60000 && diffMs >= -15 * 60000;
                  return (
                    <div
                      key={session.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start space-x-3">
                        <AvatarBadge name={session.startupName} src={session.startupLogo} />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm text-slate-900">{session.startupName}</span>
                            <span className="text-xs text-slate-400">· {session.date}</span>
                          </div>
                          <p className="text-xs font-medium text-slate-700 mt-0.5">{session.title}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-[11px] text-slate-500">{session.time}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {session.mode}
                            </span>
                            {isStartingSoon && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Join open
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
                        {session.meetingLink ? (
                          canJoin ? (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-colors bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Join</span>
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              title="Join unlocks 10 minutes before session start"
                              className="px-3 py-1.5 text-xs font-medium rounded-lg flex items-center space-x-1.5 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Join (10m before)</span>
                            </button>
                          )
                        ) : (
                          <Link
                            href="/mentor/sessions"
                            className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                          >
                            Details
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Rail */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Availability Overview</h3>
              <Link href="/mentor/availability" className="text-[11px] text-[#2563EB] font-medium hover:underline">
                Edit grid
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {DAYS.map((day) => {
                const count = (weeklyGrid[day] || []).length;
                return (
                  <Link key={day} href="/mentor/availability" className="space-y-1">
                    <span className="text-[10px] font-medium text-slate-500">{day}</span>
                    <div
                      className={`h-12 rounded-md border flex items-center justify-center text-[10px] font-semibold transition-colors ${
                        count > 0
                          ? 'bg-blue-50 border-blue-200 text-[#2563EB] hover:bg-blue-100'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {count > 0 ? `${count} slots` : 'Off'}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">My Startups</h3>
              <Link href="/mentor/startups" className="text-[11px] text-[#2563EB] font-medium hover:underline">
                View all ({startups.length})
              </Link>
            </div>
            <div className="space-y-2">
              {startups.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No active startups in portfolio yet.</p>
              ) : (
                startups.slice(0, 3).map((st: any) => (
                  <Link
                    key={st.id}
                    href="/mentor/startups"
                    className="p-2 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <AvatarBadge name={st.name} src={st.logo} size="sm" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{st.name}</p>
                        <p className="text-[10px] text-slate-500">{st.stage}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Recent Feedback</h3>
              <Link href="/mentor/feedback" className="text-[11px] text-[#2563EB] font-medium hover:underline">
                All ratings
              </Link>
            </div>
            <div className="space-y-3">
              {feedbackList.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No founder ratings received yet.</p>
              ) : (
                feedbackList.slice(0, 2).map((fb: any) => (
                  <div key={fb.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{fb.startupName}</span>
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="ml-1 text-[11px] font-bold text-slate-700">{fb.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2">&ldquo;{fb.comment}&rdquo;</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Set Meeting Link Modal */}
      {meetingLinkSessionId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-5 space-y-4">
            <h3 className="font-semibold text-slate-900">Set Meeting Link</h3>
            <p className="text-xs text-slate-500">
              Provide or update the virtual video call link before confirming the session.
            </p>
            <input
              type="url"
              value={meetingLinkInput}
              onChange={(e) => setMeetingLinkInput(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setMeetingLinkSessionId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onMutate(
                    {
                      action: 'update_session',
                      session_id: meetingLinkSessionId,
                      meeting_link: meetingLinkInput,
                      status: 'confirmed',
                    },
                    'Meeting link saved & session confirmed'
                  );
                  setMeetingLinkSessionId(null);
                  await onRefresh();
                }}
                className="px-3 py-1.5 text-xs bg-[#2563EB] text-white rounded-lg hover:bg-blue-700"
              >
                Save &amp; Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   PAGE 2: /mentor/sessions
   ========================================================================== */
function SessionsView({ sessions, startups, onOpenSchedule, onMutate, onRefresh }: any) {
  const [activeTab, setActiveTab] = useState<'Requests' | 'Upcoming' | 'Past'>('Upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedStartupFilter, setSelectedStartupFilter] = useState('All');
  const [selectedSessionDrawer, setSelectedSessionDrawer] = useState<any | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    if (selectedSessionDrawer) {
      setNotesDraft(selectedSessionDrawer.notes || '');
    }
  }, [selectedSessionDrawer]);

  const counts = useMemo(
    () => ({
      Requests: sessions.filter((s: any) => s.status === 'Pending').length,
      Upcoming: sessions.filter((s: any) => s.status === 'Confirmed').length,
      Past: sessions.filter((s: any) => s.status === 'Completed' || s.status === 'Declined').length,
    }),
    [sessions]
  );

  const filteredSessions = useMemo(() => {
    return sessions.filter((s: any) => {
      const matchTab =
        activeTab === 'Requests'
          ? s.status === 'Pending'
          : activeTab === 'Upcoming'
          ? s.status === 'Confirmed'
          : s.status === 'Completed' || s.status === 'Declined';
      const matchStartup = selectedStartupFilter === 'All' || s.startupName === selectedStartupFilter;
      return matchTab && matchStartup;
    });
  }, [sessions, activeTab, selectedStartupFilter]);

  const updateSessionStatus = async (
    id: string,
    status: 'scheduled' | 'completed' | 'declined' | 'cancelled',
    extra: Record<string, any> = {}
  ) => {
    await onMutate({ action: 'update_session', session_id: id, status, ...extra }, `Session ${status}`);
    setSelectedSessionDrawer(null);
    await onRefresh();
  };

  const [drawerMeetingLink, setDrawerMeetingLink] = useState('');
  const [drawerReschedule, setDrawerReschedule] = useState<{ date: string; start: string; end: string } | null>(null);
  const [drawerDeclineOpen, setDrawerDeclineOpen] = useState(false);
  const [drawerDeclineReason, setDrawerDeclineReason] = useState('');

  useEffect(() => {
    if (selectedSessionDrawer) {
      setDrawerMeetingLink(selectedSessionDrawer.meetingLink || '');
      setDrawerReschedule(null);
      setDrawerDeclineOpen(false);
      setDrawerDeclineReason('');
    }
  }, [selectedSessionDrawer]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A2151]">Sessions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage scheduled, requested, and completed mentorship sessions.</p>
        </div>
        <button
          type="button"
          onClick={onOpenSchedule}
          className="bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-2xs flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule session</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg self-start">
          {(['Requests', 'Upcoming', 'Past'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center space-x-2 cursor-pointer ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab ? 'bg-blue-50 text-[#2563EB]' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedStartupFilter}
            onChange={(e) => setSelectedStartupFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Startups</option>
            {startups.map((st: any) => (
              <option key={st.id} value={st.name}>
                {st.name}
              </option>
            ))}
          </select>

          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-[#2563EB] shadow-2xs' : 'text-slate-500'
              }`}
              title="List view"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded text-xs cursor-pointer ${
                viewMode === 'calendar' ? 'bg-white text-[#2563EB] shadow-2xs' : 'text-slate-500'
              }`}
              title="Calendar view"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredSessions.length === 0 ? (
              <p className="text-xs text-slate-500 col-span-3 text-center py-8">
                No {activeTab.toLowerCase()} sessions in calendar view.
              </p>
            ) : (
              filteredSessions.map((s: any) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSessionDrawer(s)}
                  className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2563EB]">{s.date}</span>
                    <StatusChip status={s.status} />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.startupName} · {s.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">No sessions found</p>
          <p className="text-xs text-slate-500 mt-1">There are no {activeTab.toLowerCase()} sessions matching your filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Startup</th>
                  <th className="py-3 px-4">Session Title</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSessions.map((session: any) => (
                  <tr
                    key={session.id}
                    onClick={() => setSelectedSessionDrawer(session)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                      <div>{session.date}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{session.time}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <AvatarBadge name={session.startupName} src={session.startupLogo} size="sm" />
                        <span className="font-semibold text-slate-900">{session.startupName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium max-w-xs truncate">{session.title}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{session.mode}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusChip status={session.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        {session.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => updateSessionStatus(session.id, 'scheduled')}
                            className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            Confirm
                          </button>
                        )}
                        {session.status === 'Confirmed' && (
                          <button
                            type="button"
                            onClick={() => updateSessionStatus(session.id, 'completed')}
                            className="px-2.5 py-1 text-xs bg-[#2563EB] text-white rounded hover:bg-blue-700"
                          >
                            Mark done
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedSessionDrawer(session)}
                          className="px-2.5 py-1 text-xs border border-slate-200 rounded hover:bg-slate-100 text-slate-600"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Session Detail Side Drawer */}
      {selectedSessionDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <StatusChip status={selectedSessionDrawer.status} />
                <button
                  type="button"
                  onClick={() => setSelectedSessionDrawer(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <h2 className="text-xl font-bold text-[#1A2151]">{selectedSessionDrawer.title}</h2>
                <div className="flex items-center space-x-3">
                  <AvatarBadge name={selectedSessionDrawer.startupName} src={selectedSessionDrawer.startupLogo} size="sm" />
                  <span className="font-semibold text-sm text-slate-800">{selectedSessionDrawer.startupName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Date &amp; Time</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {selectedSessionDrawer.date} · {selectedSessionDrawer.time}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Timezone</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedSessionDrawer.timezone}</span>
                </div>
                <div className="col-span-2 border-t border-slate-200 pt-3">
                  <span className="text-slate-400 block font-medium">Meeting Mode / Link</span>
                  {selectedSessionDrawer.meetingLink ? (
                    <a
                      href={selectedSessionDrawer.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#2563EB] font-semibold hover:underline flex items-center space-x-1 mt-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{selectedSessionDrawer.meetingLink}</span>
                    </a>
                  ) : (
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {selectedSessionDrawer.meetingLocation || selectedSessionDrawer.mode}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Agenda &amp; Topics</h3>
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedSessionDrawer.agenda || 'No agenda specified.'}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Action Points</h3>
                <div className="space-y-2">
                  {selectedSessionDrawer.actionPoints.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No action points recorded yet.</p>
                  ) : (
                    selectedSessionDrawer.actionPoints.map((ap: any, idx: number) => (
                      <div key={ap.id || idx} className="flex items-center space-x-2 text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={Boolean(ap.done)}
                          onChange={async (e) => {
                            const updated = selectedSessionDrawer.actionPoints.map((item: any, i: number) =>
                              i === idx ? { ...item, done: e.target.checked } : item
                            );
                            setSelectedSessionDrawer((p: any) => ({ ...p, actionPoints: updated }));
                            await onMutate({
                              action: 'update_session',
                              session_id: selectedSessionDrawer.id,
                              action_points: updated,
                            });
                          }}
                          className="rounded border-slate-300 text-[#2563EB]"
                        />
                        <span className={ap.done ? 'line-through text-slate-400' : ''}>{ap.text || ap}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Private Mentor Notes</h3>
                  <button
                    type="button"
                    onClick={async () => {
                      await onMutate(
                        { action: 'update_session', session_id: selectedSessionDrawer.id, session_notes: notesDraft },
                        'Notes saved'
                      );
                      await onRefresh();
                    }}
                    className="text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    Save notes
                  </button>
                </div>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Add confidential notes visible only to you..."
                  className="w-full h-24 p-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-3">
              {selectedSessionDrawer.status === 'Pending' && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Meeting link (optional before confirm)
                  </label>
                  <input
                    type="url"
                    value={drawerMeetingLink}
                    onChange={(e) => setDrawerMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              )}

              {drawerReschedule && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <p className="font-semibold text-slate-800">Reschedule Date &amp; Time</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="date"
                      value={drawerReschedule.date}
                      onChange={(e) => setDrawerReschedule({ ...drawerReschedule, date: e.target.value })}
                      className="p-1.5 border border-slate-200 rounded bg-white"
                    />
                    <input
                      type="time"
                      value={drawerReschedule.start}
                      onChange={(e) => setDrawerReschedule({ ...drawerReschedule, start: e.target.value })}
                      className="p-1.5 border border-slate-200 rounded bg-white"
                    />
                    <input
                      type="time"
                      value={drawerReschedule.end}
                      onChange={(e) => setDrawerReschedule({ ...drawerReschedule, end: e.target.value })}
                      className="p-1.5 border border-slate-200 rounded bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawerReschedule(null)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await onMutate(
                          {
                            action: 'update_session',
                            session_id: selectedSessionDrawer.id,
                            scheduled_date: drawerReschedule.date,
                            start_time: drawerReschedule.start,
                            end_time: drawerReschedule.end,
                          },
                          'Session rescheduled'
                        );
                        setSelectedSessionDrawer(null);
                        await onRefresh();
                      }}
                      className="px-3 py-1 bg-[#2563EB] text-white rounded hover:bg-blue-700"
                    >
                      Save reschedule
                    </button>
                  </div>
                </div>
              )}

              {drawerDeclineOpen && (
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg space-y-2 text-xs">
                  <p className="font-semibold text-rose-800">Decline Reason (required)</p>
                  <textarea
                    rows={2}
                    value={drawerDeclineReason}
                    onChange={(e) => setDrawerDeclineReason(e.target.value)}
                    placeholder="Reason for declining..."
                    className="w-full p-2 border border-rose-200 rounded bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawerDeclineOpen(false)}
                      className="px-2.5 py-1 text-slate-600"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!drawerDeclineReason.trim()}
                      onClick={() =>
                        updateSessionStatus(selectedSessionDrawer.id, 'declined', {
                          decline_reason: drawerDeclineReason.trim(),
                        })
                      }
                      className="px-3 py-1 bg-rose-600 disabled:bg-slate-200 text-white rounded"
                    >
                      Confirm decline
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {selectedSessionDrawer.status === 'Pending' && !drawerDeclineOpen && (
                    <button
                      type="button"
                      onClick={() => setDrawerDeclineOpen(true)}
                      className="px-3 py-1.5 text-xs text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg"
                    >
                      Decline
                    </button>
                  )}
                  {(selectedSessionDrawer.status === 'Pending' || selectedSessionDrawer.status === 'Confirmed') && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setDrawerReschedule({
                            date: selectedSessionDrawer.date,
                            start: selectedSessionDrawer.startTime || '10:00',
                            end: selectedSessionDrawer.endTime || '11:00',
                          })
                        }
                        className="px-3 py-1.5 text-xs border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700"
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSessionStatus(selectedSessionDrawer.id, 'cancelled')}
                        className="px-3 py-1.5 text-xs text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg"
                      >
                        Cancel session
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {selectedSessionDrawer.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() =>
                        updateSessionStatus(selectedSessionDrawer.id, 'scheduled', {
                          meeting_link: drawerMeetingLink,
                        })
                      }
                      className="px-4 py-2 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg"
                    >
                      Confirm session
                    </button>
                  )}
                  {selectedSessionDrawer.status === 'Confirmed' && (
                    <button
                      type="button"
                      onClick={() => updateSessionStatus(selectedSessionDrawer.id, 'completed')}
                      className="px-4 py-2 text-xs font-medium bg-[#2563EB] text-white hover:bg-blue-700 rounded-lg"
                    >
                      Mark as completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   PAGE 3: /mentor/startups
   ========================================================================== */
function StartupsView({ startups, sessions, onScheduleWithStartup }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedStartupDrawer, setSelectedStartupDrawer] = useState<any | null>(null);

  const stages = useMemo(
    () => Array.from(new Set(startups.map((s: any) => s.stage).filter(Boolean))) as string[],
    [startups]
  );

  const filtered = startups.filter((st: any) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = st.name.toLowerCase().includes(q) || st.sector.toLowerCase().includes(q);
    const matchesStage = stageFilter === 'All' || st.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1A2151]">My Startups</h1>
        <p className="text-sm text-slate-500 mt-1">Portfolio startups within your incubator cohort.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search startup name or sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Stage:</span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Stages</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">No startups found</p>
          <p className="text-xs text-slate-500 mt-1">No active cohort startups match your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((st: any) => (
            <div
              key={st.id}
              onClick={() => setSelectedStartupDrawer(st)}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 transition-all shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <AvatarBadge name={st.name} src={st.logo} />
                    <div>
                      <h3 className="font-semibold text-slate-900 text-base">{st.name}</h3>
                      <p className="text-xs text-slate-500">{st.sector}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {st.stage}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-4 line-clamp-2 leading-relaxed">{st.bio}</p>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Next session:</span>
                  <span className="font-medium text-slate-800">{st.nextSession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sessions held:</span>
                  <span className="font-semibold text-slate-800">{st.sessionsHeld} sessions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last feedback:</span>
                  <span className="text-slate-700">{st.lastFeedbackDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStartupDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Startup Overview</span>
                <button
                  type="button"
                  onClick={() => setSelectedStartupDrawer(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 flex items-center space-x-4">
                <AvatarBadge name={selectedStartupDrawer.name} src={selectedStartupDrawer.logo} size="lg" />
                <div>
                  <h2 className="text-xl font-bold text-[#1A2151]">{selectedStartupDrawer.name}</h2>
                  <p className="text-xs text-slate-500">
                    {selectedStartupDrawer.sector} · {selectedStartupDrawer.stage}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <p className="text-slate-700 leading-relaxed">{selectedStartupDrawer.bio}</p>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-slate-600">
                  <span>
                    Founder: <strong className="text-slate-900">{selectedStartupDrawer.founder}</strong>
                  </span>
                  <span className="text-[#2563EB]">{selectedStartupDrawer.email}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Metrics Snapshot</h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(selectedStartupDrawer.metrics || {}).map(([key, val]: any) => (
                    <div key={key} className="p-3 bg-white border border-slate-200 rounded-lg text-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{key}</span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Session History</h3>
                <div className="space-y-3 pl-2 border-l-2 border-slate-200 text-xs">
                  {sessions
                    .filter((s: any) => s.startupId === selectedStartupDrawer.id)
                    .map((s: any) => (
                      <div key={s.id} className="relative pl-4">
                        <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-[#2563EB] border-2 border-white" />
                        <p className="font-semibold text-slate-900">{s.title}</p>
                        <p className="text-slate-500 text-[11px]">
                          {s.date} · {s.status}
                        </p>
                      </div>
                    ))}
                  {sessions.filter((s: any) => s.startupId === selectedStartupDrawer.id).length === 0 && (
                    <p className="text-slate-400 pl-3">No mentorship sessions recorded yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const st = selectedStartupDrawer;
                  setSelectedStartupDrawer(null);
                  onScheduleWithStartup(st);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 shadow-2xs cursor-pointer"
              >
                Schedule session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   PAGE 4: /mentor/availability
   ========================================================================== */
function AvailabilityView({ mentorData, userInfo, sessionsCount, hoursUsed = 0, onToggleAvailable, onMutate, onRefresh }: any) {
  const [weeklyGrid, setWeeklyGrid] = useState<Record<string, string[]>>(
    () => mentorData?.availability_json?.weekly_grid || EMPTY_GRID
  );
  const [hoursPerMonth, setHoursPerMonth] = useState<number>(mentorData?.availability_hours_per_month || 10);
  const [timezone, setTimezone] = useState(mentorData?.timezone || 'Asia/Kolkata');
  const [meetingMode, setMeetingMode] = useState(mentorData?.preferred_meeting_mode || 'video');
  const [meetingLink, setMeetingLink] = useState(
    mentorData?.calendar_url || mentorData?.availability_json?.default_meeting_link || ''
  );
  const [vacationDate, setVacationDate] = useState(mentorData?.availability_json?.vacation_date || '');
  const [saving, setSaving] = useState(false);

  const toggleSlot = (day: string, time: string) => {
    setWeeklyGrid((prev) => {
      const daySlots = prev[day] || [];
      const exists = daySlots.includes(time);
      return {
        ...prev,
        [day]: exists ? daySlots.filter((t) => t !== time) : [...daySlots, time],
      };
    });
  };

  const copyMondayToAll = () => {
    const mon = weeklyGrid.Mon || [];
    setWeeklyGrid({
      Mon: [...mon],
      Tue: [...mon],
      Wed: [...mon],
      Thu: [...mon],
      Fri: [...mon],
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onMutate(
        {
          action: 'save_availability',
          weekly_grid: weeklyGrid,
          availability_hours_per_month: hoursPerMonth,
          timezone,
          preferred_meeting_mode: meetingMode,
          default_meeting_link: meetingLink,
          vacation_date: vacationDate,
        },
        'Availability preferences saved'
      );
      await onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const capacity = hoursPerMonth || mentorData?.availability_hours_per_month || 10;
  const usedHrs = Number((hoursUsed || 0).toFixed(1));
  const pct = Math.min(100, Math.round((usedHrs / Math.max(1, capacity)) * 100));
  const activeDays = DAYS.filter((d) => (weeklyGrid[d] || []).length > 0);
  const previewSlots = DAYS.flatMap((d) =>
    (weeklyGrid[d] || []).slice(0, 2).map((t) => `${d} ${t}`)
  ).slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A2151]">Availability</h1>
          <p className="text-sm text-slate-500 mt-1">Configure your weekly office hours and startup booking rules.</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-2xs self-start sm:self-auto inline-flex items-center gap-1.5 cursor-pointer"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Save changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
              <div>
                <h2 className="text-base font-semibold text-[#1A2151]">Weekly Time-slot Grid</h2>
                <p className="text-xs text-slate-500">Click time slots to toggle availability for founders.</p>
              </div>
              <button
                type="button"
                onClick={copyMondayToAll}
                className="px-3 py-1.5 text-xs border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium self-start sm:self-auto cursor-pointer"
              >
                Copy Monday to all days
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="py-2 text-left font-medium">Time</th>
                    {DAYS.map((day) => (
                      <th key={day} className="py-2 font-medium">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TIME_SLOTS.map((time) => (
                    <tr key={time}>
                      <td className="py-3 text-left font-mono text-slate-500">{time}</td>
                      {DAYS.map((day) => {
                        const active = weeklyGrid[day]?.includes(time);
                        return (
                          <td key={day} className="py-2 px-1">
                            <button
                              type="button"
                              onClick={() => toggleSlot(day, time)}
                              className={`w-full py-2 rounded-md font-medium text-[11px] transition-colors border cursor-pointer ${
                                active
                                  ? 'bg-blue-50 border-blue-300 text-[#2563EB] shadow-2xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              {active ? 'Available' : '—'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-[#1A2151]">Booking Preferences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+05:30)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+08:00)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST, UTC+04:00)</option>
                  <option value="Europe/London">Europe/London (GMT/BST, UTC+00:00)</option>
                  <option value="America/New_York">America/New_York (EST, UTC-05:00)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Preferred Meeting Mode</label>
                <select
                  value={meetingMode}
                  onChange={(e) => setMeetingMode(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="video">Video (Google Meet / Zoom)</option>
                  <option value="in_person">In-Person (Incubator Hub)</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Default Video Conference URL</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Hours per Month Cap</label>
                <input
                  type="number"
                  min={2}
                  max={60}
                  value={hoursPerMonth}
                  onChange={(e) => setHoursPerMonth(Math.min(60, Math.max(1, Number(e.target.value) || 2)))}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Vacation / Pause Until</label>
                <input
                  type="date"
                  value={vacationDate}
                  onChange={(e) => setVacationDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div>
                  <span className="font-semibold text-slate-900 block">Accepting Startups</span>
                  <span className="text-[11px] text-slate-500">Allow new portfolio assignments</span>
                </div>
                <button
                  type="button"
                  onClick={onToggleAvailable}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    mentorData?.is_available ? 'bg-[#2563EB]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      mentorData?.is_available ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Target Monthly Hours</h3>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-[#1A2151]">
                  {usedHrs} / {capacity} hrs
                </span>
                <span className="text-xs text-slate-500 ml-1">({sessionsCount} sessions)</span>
              </div>
              <span className="text-xs font-semibold text-[#2563EB]">{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#2563EB] h-full rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[11px] text-slate-500">
              {Math.max(0, Number((capacity - usedHrs).toFixed(1)))} hours remaining in monthly capacity.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-[#2563EB]">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Founder View Preview</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2 text-xs">
              <p className="font-semibold text-slate-900">Book 45m with {userInfo?.fullName || 'Mentor'}</p>
              <p className="text-slate-500 text-[11px]">
                Available days: {activeDays.length > 0 ? activeDays.join(', ') : 'None selected'}
              </p>
              <div className="flex gap-1.5 flex-wrap pt-1">
                {previewSlots.length > 0 ? (
                  previewSlots.map((slot) => (
                    <span
                      key={slot}
                      className="px-2 py-1 bg-white border border-blue-200 text-[#2563EB] font-medium rounded text-[10px]"
                    >
                      {slot}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400">Select weekly slots to publish times.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PAGE 5: /mentor/feedback
   ========================================================================== */
function FeedbackView({ sessions, feedbackList, avgRating, ratingDistribution, onMutate, onRefresh }: any) {
  const dueSessions = useMemo(
    () => sessions.filter((s: any) => s.status === 'Completed' && !s.mentorFeedback),
    [sessions]
  );

  const [evalSession, setEvalSession] = useState<any | null>(null);
  const [ratings, setRatings] = useState({ preparedness: 5, clarity: 5, progress: 5 });
  const [actionPoints, setActionPoints] = useState<string[]>([]);
  const [newApInput, setNewApInput] = useState('');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openEvaluate = (session: any) => {
    setEvalSession(session);
    setActionPoints((session.actionPoints || []).map((ap: any) => ap.text || String(ap)));
    setFeedbackNote(session.mentorFeedback || '');
  };

  const submitEvaluation = async () => {
    if (!evalSession) return;
    setSubmitting(true);
    try {
      await onMutate(
        {
          action: 'submit_feedback',
          session_id: evalSession.id,
          scores: ratings,
          mentor_feedback: feedbackNote || `Preparedness: ${ratings.preparedness}/5, Clarity: ${ratings.clarity}/5, Progress: ${ratings.progress}/5`,
          action_points: actionPoints.map((text, idx) => ({ id: `ap-${Date.now()}-${idx}`, text, done: false })),
        },
        'Session evaluation submitted'
      );
      setEvalSession(null);
      await onRefresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A2151]">Feedback</h1>
          <p className="text-sm text-slate-500 mt-1">Submit post-session evaluations and review founder ratings.</p>
        </div>
        {dueSessions.length > 0 && (
          <button
            type="button"
            onClick={() => openEvaluate(dueSessions[0])}
            className="bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            Write feedback
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h2 className="text-base font-semibold text-[#1A2151]">Feedback Due ({dueSessions.length})</h2>
        {dueSessions.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-500">
            All completed sessions have been evaluated.
          </div>
        ) : (
          <div className="space-y-3">
            {dueSessions.map((s: any) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3">
                  <AvatarBadge name={s.startupName} src={s.startupLogo} />
                  <div>
                    <p className="font-semibold text-sm text-slate-900">
                      {s.startupName} · {s.title}
                    </p>
                    <p className="text-xs text-slate-500">Session completed on {s.date}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openEvaluate(s)}
                  className="px-4 py-2 text-xs font-semibold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 shrink-0 cursor-pointer"
                >
                  Evaluate session
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-6">
        <h2 className="text-base font-semibold text-[#1A2151]">Ratings Received</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-center md:border-r border-slate-200">
            <span className="text-4xl font-extrabold text-[#1A2151]">{avgRating > 0 ? avgRating : '—'}</span>
            <div className="flex justify-center text-amber-400 my-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">Overall Mentor Score</span>
          </div>

          <div className="md:col-span-2 space-y-2 text-xs text-slate-600">
            {feedbackList.length === 0 ? (
              <p>Founder ratings will appear here once startups complete sessions and leave feedback.</p>
            ) : (
              <>
                <p>
                  Based on <strong className="text-slate-900">{feedbackList.length}</strong> verified founder{' '}
                  {feedbackList.length === 1 ? 'review' : 'reviews'} across your mentorship sessions.
                </p>
                <div className="space-y-1.5 pt-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = Number(ratingDistribution?.[star] || 0);
                    const totalRated = feedbackList.filter((f: any) => f.rating).length;
                    const barPct = totalRated > 0 ? Math.round((count / totalRated) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-[11px]">
                        <span className="w-8 text-slate-600 font-medium">{star} ★</span>
                        <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${barPct}%` }} />
                        </div>
                        <span className="w-7 text-right text-slate-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {feedbackList.map((fb: any) => (
            <div key={fb.id} className="p-4 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{fb.startupName}</span>
                  <span className="text-slate-400">· {fb.founderName}</span>
                </div>
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="ml-1 font-bold text-slate-800">{fb.rating}.0</span>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">&ldquo;{fb.comment}&rdquo;</p>
              <div className="flex gap-2 pt-1">
                {(fb.tags || []).map((t: string) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {evalSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-[#1A2151]">
                Evaluate Session · {evalSession.startupName}
              </h3>
              <button type="button" onClick={() => setEvalSession(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {(['preparedness', 'clarity', 'progress'] as const).map((crit) => (
                <div key={crit} className="flex items-center justify-between">
                  <span className="capitalize font-medium text-slate-700">{crit} Rating</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        onClick={() => setRatings((prev) => ({ ...prev, [crit]: star }))}
                        className={`w-5 h-5 cursor-pointer ${
                          star <= ratings[crit] ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-medium text-slate-700">Action Points for Founder</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add action item..."
                  value={newApInput}
                  onChange={(e) => setNewApInput(e.target.value)}
                  className="flex-1 p-2 border border-slate-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newApInput.trim()) {
                      setActionPoints((prev) => [...prev, newApInput.trim()]);
                      setNewApInput('');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-1 pt-1">
                {actionPoints.map((ap, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200"
                  >
                    <span>{ap}</span>
                    <button
                      type="button"
                      onClick={() => setActionPoints((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs space-y-1">
              <label className="block font-medium text-slate-700">Detailed Mentor Evaluation</label>
              <textarea
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Key takeaways and tactical advice..."
                className="w-full h-24 p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEvalSession(null)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={submitEvaluation}
                className="px-4 py-2 text-xs bg-[#2563EB] text-white font-medium rounded-lg hover:bg-blue-700 inline-flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit feedback</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   PAGE 6: /mentor/profile
   ========================================================================== */
function ProfileView({ userInfo, mentorData, onMutate, onRefresh }: any) {
  const [profileData, setProfileData] = useState({
    name: userInfo?.fullName || '',
    jobTitle: mentorData?.availability_json?.job_title || '',
    company: mentorData?.company_background || '',
    bio: mentorData?.bio || '',
    primaryExpertise: mentorData?.availability_json?.primary_expertise || mentorData?.expertise_areas?.[0] || 'B2B SaaS',
    smeSpecialization: mentorData?.availability_json?.sme_specialization || '',
    yearsExp: mentorData?.years_of_experience || 5,
    linkedin: mentorData?.linkedin_url || '',
    website: mentorData?.website || '',
    expertiseChips: Array.isArray(mentorData?.expertise_areas) ? mentorData.expertise_areas : [],
  });
  const [newChip, setNewChip] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onMutate(
        {
          action: 'save_profile',
          full_name: profileData.name,
          job_title: profileData.jobTitle,
          company_background: profileData.company,
          bio: profileData.bio,
          primary_expertise: profileData.primaryExpertise,
          sme_specialization: profileData.smeSpecialization,
          years_of_experience: profileData.yearsExp,
          linkedin_url: profileData.linkedin,
          website: profileData.website,
          expertise_areas: profileData.expertiseChips,
        },
        'Profile saved successfully'
      );
      await onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const checklist = [
    { label: 'Basic Info (Name & Title)', done: Boolean(profileData.name && profileData.jobTitle) },
    { label: 'Domain & SME Specialization', done: profileData.expertiseChips.length > 0 },
    { label: 'LinkedIn / External Link', done: Boolean(profileData.linkedin || profileData.website) },
    { label: 'Bio (>= 30 characters)', done: profileData.bio.trim().length >= 30 },
  ];
  const completeness = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A2151]">Mentor Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage public profile details and incubator SME specializations.</p>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Public preview</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-[#1A2151]">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={profileData.jobTitle}
                  onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Company / Background</label>
                <input
                  type="text"
                  value={profileData.company}
                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={profileData.linkedin}
                  onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-[#1A2151]">Domain Expertise</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Primary Domain</label>
                <input
                  type="text"
                  value={profileData.primaryExpertise}
                  onChange={(e) => setProfileData({ ...profileData, primaryExpertise: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">SME Specialization</label>
                <input
                  type="text"
                  value={profileData.smeSpecialization}
                  onChange={(e) => setProfileData({ ...profileData, smeSpecialization: e.target.value })}
                  placeholder="e.g. B2B GTM & Pricing"
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="text-xs space-y-2">
              <label className="block font-medium text-slate-700">Expertise Tags</label>
              <div className="flex gap-2 flex-wrap">
                {profileData.expertiseChips.map((chip: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-md font-medium text-[11px]"
                  >
                    <span>{chip}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setProfileData((p) => ({
                          ...p,
                          expertiseChips: p.expertiseChips.filter((_: string, i: number) => i !== idx),
                        }))
                      }
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 pt-1 max-w-sm">
                <input
                  type="text"
                  value={newChip}
                  onChange={(e) => setNewChip(e.target.value)}
                  placeholder="Add expertise tag..."
                  className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newChip.trim()) {
                      setProfileData((p) => ({
                        ...p,
                        expertiseChips: [...p.expertiseChips, newChip.trim()],
                      }));
                      setNewChip('');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-[#1A2151] text-base">Bio</label>
              <span className="text-slate-400 text-[11px]">{profileData.bio.length} / 500 characters</span>
            </div>
            <textarea
              maxLength={500}
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              className="w-full h-28 p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Profile Completeness</h3>
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-full border-4 border-[#2563EB] flex items-center justify-center font-bold text-[#1A2151] text-sm">
                {completeness}%
              </div>
              <p className="text-xs text-slate-500">
                {completeness === 100
                  ? 'Ready for tier-1 founder matching.'
                  : 'Complete remaining items to optimize startup matches.'}
              </p>
            </div>
            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-slate-700">
                  <span className={item.done ? 'line-through text-slate-400' : ''}>{item.label}</span>
                  {item.done ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 relative">
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2 flex flex-col items-center">
              <AvatarBadge name={profileData.name || 'Mentor'} src={userInfo?.avatar} size="lg" />
              <h3 className="text-lg font-bold text-[#1A2151]">{profileData.name || 'Mentor'}</h3>
              <p className="text-xs text-slate-500">
                {[profileData.jobTitle, profileData.company].filter(Boolean).join(' · ')}
              </p>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg text-center leading-relaxed">
              &ldquo;{profileData.bio || 'No bio added yet.'}&rdquo;
            </p>

            <div className="flex gap-1.5 flex-wrap justify-center pt-2">
              {profileData.expertiseChips.map((c: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[10px] font-medium"
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="w-full py-2 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                Close preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
