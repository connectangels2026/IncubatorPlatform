'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Rocket,
  FolderOpen,
  GraduationCap,
  Coins,
  Briefcase,
  ClipboardCheck,
  CalendarPlus,
  FileEdit,
  FileDown,
  ArrowUp,
  ArrowRight,
  X,
  Video,
  LogOut,
  UserCheck,
  Clock,
  LayoutDashboard,
  Menu,
  RefreshCw,
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
} from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import { useAuth } from '@/frontend/context/AuthContext';
import Logo from '@/frontend/components/ui/Logo';
import { Sidebar } from '@/frontend/components/layouts/Sidebar';
import { supabase } from '@/backend/lib/supabase';
import { apiClient } from '@/services/apiClient';

interface ApplicationItem {
  id: string;
  name: string;
  sector: string;
  type: string;
  score: number;
  status: 'submitted' | 'under_review' | 'admitted' | 'rejected';
  date: string;
  email: string;
}

interface PendingDecision {
  id: string;
  name: string;
  score: number;
  type: string;
  recommendation: string;
}

interface MentorshipSession {
  mentor: string;
  role: string;
  startup: string;
  time: string;
  link: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { logout } = useAuth();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Data Loading & API State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalStartups: 128,
    totalStartupsGrowth: '+12%',
    applicationsReceived: 42,
    applicationsGrowth: '+8%',
    pendingEvaluation: 18,
    activeStartups: 38,
    admittedStartups: 24,
    graduatedStartups: 66,
    fundingRaised: '$14.2M',
    fundingGrowth: '+$2.1M',
    jobsCreated: '850+',
    jobsGrowth: '+45 this mo',
  });

  const [applications, setApplications] = useState<ApplicationItem[]>([
    { id: 'APP-1042', name: 'NexHealth AI', sector: 'Biotech', type: 'Incubator', score: 88, status: 'submitted', date: 'Sep 24, 2026', email: 'sarah@nexhealth.ai' },
    { id: 'APP-1041', name: 'PayFlow Finance', sector: 'Fintech', type: 'Pre-Incubator', score: 64, status: 'under_review', date: 'Sep 23, 2026', email: 'alex@payflow.co' },
    { id: 'APP-1040', name: 'NeuroMed Tech', sector: 'HealthTech', type: 'Incubator', score: 92, status: 'admitted', date: 'Sep 21, 2026', email: 'emily@neuromed.io' },
    { id: 'APP-1039', name: 'UrbanFarms', sector: 'AgriTech', type: 'Pre-Incubator', score: 45, status: 'rejected', date: 'Sep 19, 2026', email: 'dan@urbanfarms.org' },
    { id: 'APP-1038', name: 'CloudScale OS', sector: 'SaaS', type: 'Incubator', score: 79, status: 'under_review', date: 'Sep 18, 2026', email: 'team@cloudscale.io' },
  ]);
  const [pendingDecisions, setPendingDecisions] = useState<PendingDecision[]>([
    { id: 'APP-1041', name: 'PayFlow Finance', score: 64, type: 'Pre-Incubator', recommendation: 'Borderline - Requires interview' },
    { id: 'APP-1038', name: 'CloudScale OS', score: 79, type: 'Incubator', recommendation: 'Recommended for Admission' },
    { id: 'APP-1042', name: 'NexHealth AI', score: 88, type: 'Incubator', recommendation: 'High Priority Admission' },
  ]);
  const [mentorshipSessions, setMentorshipSessions] = useState<MentorshipSession[]>([
    { mentor: 'Dr. Marcus Vance', role: 'Fintech Specialist', startup: 'PayFlow Finance', time: 'Today, 3:00 PM', link: 'https://meet.google.com' },
    { mentor: 'Elena Rostova', role: 'AI Advisor', startup: 'NexHealth AI', time: 'Tomorrow, 10:00 AM', link: 'https://meet.google.com' },
    { mentor: 'David Chen', role: 'Venture Partner', startup: 'NeuroMed Tech', time: 'Sep 28, 2:30 PM', link: 'https://meet.google.com' },
  ]);

  // Fetch dashboard report analytics from GET /api/v1/reports/dashboard
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ? `Bearer ${session.access_token}` : 'Bearer mock-admin';
      const res = await apiClient.get('/reports/dashboard', {
        headers: {
          Authorization: token,
          'x-org-id': '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
        },
      });
      const json = res.data;
      const payload = json?.data || json;
      if (payload.metrics) {
        setMetrics(payload.metrics);
      } else if (payload.summary) {
        setMetrics((prev) => ({
          ...prev,
          totalStartups: payload.summary.total_startups ?? prev.totalStartups,
          applicationsReceived: payload.summary.total_applications ?? prev.applicationsReceived,
          fundingRaised: payload.summary.total_funding_raised
            ? `$${(payload.summary.total_funding_raised / 1000000).toFixed(1)}M`
            : prev.fundingRaised,
          jobsCreated: payload.summary.total_jobs_created
            ? `${payload.summary.total_jobs_created}+`
            : prev.jobsCreated,
        }));
      }
      if (payload.applications && payload.applications.length > 0) setApplications(payload.applications);
      if (payload.pendingDecisions && payload.pendingDecisions.length > 0) setPendingDecisions(payload.pendingDecisions);
      if (payload.mentorshipSessions && payload.mentorshipSessions.length > 0) setMentorshipSessions(payload.mentorshipSessions);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Unable to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Notification center state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchLiveNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications?limit=30', {
        headers: {
          'Authorization': 'Bearer mock-admin',
          'x-org-id': '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
        },
      });
      if (res.data?.data) {
        // Deduplicate notifications by ID and title::message signature
        const seen = new Set<string>();
        const unique = (res.data.data as any[]).filter((n) => {
          const key = `${n.title}::${n.message}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setLiveNotifications(unique);
        setUnreadCount(unique.filter((n) => !n.is_read).length);
      }
    } catch {
      // Fallback
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`, { is_read: true }, {
        headers: {
          'Authorization': 'Bearer mock-admin',
          'x-org-id': '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
        },
      });
      setLiveNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Fallback
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const unread = liveNotifications.filter((n) => !n.is_read);
      await Promise.all(
        unread.map((n) =>
          apiClient.put(`/notifications/${n.id}/read`, { is_read: true }, {
            headers: {
              'Authorization': 'Bearer mock-admin',
              'x-org-id': '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
            },
          })
        )
      );
      setLiveNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchLiveNotifications();

    // Subscribe to Supabase real-time database changes
    const channel = supabase
      .channel('realtime-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        () => {
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'startups' },
        () => {
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          fetchLiveNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Modals state
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalApp, setEvalApp] = useState<ApplicationItem | null>(null);
  const [evalScores, setEvalScores] = useState({ team: 22, market: 20, tech: 21, traction: 18 });
  const [evalDecision, setEvalDecision] = useState<'under_review' | 'admitted' | 'rejected'>('admitted');
  const [evalNotes, setEvalNotes] = useState('');

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleMentor, setScheduleMentor] = useState('Dr. Marcus Vance (Fintech Specialist)');
  const [scheduleStartup, setScheduleStartup] = useState('NexHealth AI');
  const [scheduleDate, setScheduleDate] = useState('2026-09-28');
  const [scheduleTime, setScheduleTime] = useState('14:00');

  // Helpers
  const showToast = (text: string, type: 'success' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesFilter = currentFilter === 'all' || app.status === currentFilter;
      const matchesSearch =
        !searchQuery ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [applications, currentFilter, searchQuery]);

  const openEval = (app: ApplicationItem) => {
    setEvalApp(app);
    setEvalScores({ team: 22, market: 20, tech: 21, traction: 18 });
    setEvalDecision(app.status === 'submitted' ? 'under_review' : app.status as any);
    setEvalModalOpen(true);
  };

  const handleEvalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalApp) return;

    const total = evalScores.team + evalScores.market + evalScores.tech + evalScores.traction;

    setApplications((prev) =>
      prev.map((a) => (a.id === evalApp.id ? { ...a, score: total, status: evalDecision } : a))
    );
    setPendingDecisions((prev) => prev.filter((p) => p.id !== evalApp.id));
    setEvalModalOpen(false);
    showToast(`Updated evaluation & decision for ${evalApp.name}.`, 'success');

    // Create persistent in-app notification
    try {
      const res = await apiClient.post(
        '/notifications',
        {
          title: `Application Decision: ${evalDecision.toUpperCase()}`,
          message: `Evaluation submitted for ${evalApp.name}: Status is now ${evalDecision.toUpperCase()} with total score of ${total}/100.`,
          notification_type: 'application_decision',
          send_in_app: true,
          send_email: true,
        },
        {
          headers: {
            Authorization: 'Bearer mock-admin',
            'x-org-id': '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
          },
        }
      );
      const newNotif = res.data?.data || res.data?.notification;
      if (newNotif) {
        setLiveNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
        setUnreadCount((prev) => prev + 1);
      }
      fetchLiveNotifications();
    } catch (err) {
      console.warn('Failed to dispatch evaluation notification:', err);
    }
  };

  const quickDecision = async (id: string, decision: 'admitted' | 'rejected') => {
    const targetApp = applications.find((a) => a.id === id);
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: decision } : a)));
    setPendingDecisions((prev) => prev.filter((p) => p.id !== id));
    showToast(`Application ${decision === 'admitted' ? 'Admitted' : 'Rejected'} successfully!`, 'info');

    try {
      const res = await apiClient.post(
        '/notifications',
        {
          title: `Application Decision: ${decision.toUpperCase()}`,
          message: `Application for ${targetApp?.name || 'Startup'} was ${decision.toUpperCase()}.`,
          notification_type: 'application_decision',
          send_in_app: true,
          send_email: true,
        },
        {
          headers: {
            Authorization: 'Bearer mock-admin',
            'x-org-id': '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
          },
        }
      );
      const newNotif = res.data?.data || res.data?.notification;
      if (newNotif) {
        setLiveNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
        setUnreadCount((prev) => prev + 1);
      }
      fetchLiveNotifications();
    } catch (err) {
      console.warn('Failed to dispatch quick decision notification:', err);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mentorName = scheduleMentor.split('(')[0].trim();
    setMentorshipSessions((prev) => [
      {
        mentor: mentorName,
        role: 'Advisor',
        startup: scheduleStartup,
        time: `${scheduleDate} at ${scheduleTime}`,
        link: 'https://meet.google.com',
      },
      ...prev,
    ]);
    setScheduleModalOpen(false);
    showToast(`Mentorship session scheduled with ${scheduleStartup}!`, 'success');

    // Create persistent in-app notification
    try {
      const res = await apiClient.post(
        '/notifications',
        {
          title: `Mentorship Session Booked: ${scheduleStartup}`,
          message: `Confirmed mentorship session with ${mentorName} for ${scheduleStartup} on ${scheduleDate} at ${scheduleTime}.`,
          notification_type: 'mentorship_booking',
          send_in_app: true,
          send_email: true,
        },
        {
          headers: {
            Authorization: 'Bearer mock-admin',
            'x-org-id': '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
          },
        }
      );
      const newNotif = res.data?.data || res.data?.notification;
      if (newNotif) {
        setLiveNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
        setUnreadCount((prev) => prev + 1);
      }
      fetchLiveNotifications();
    } catch (err) {
      console.warn('Failed to dispatch schedule notification:', err);
    }
  };

  const downloadReports = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Startup Name,Sector,Type,Score,Status,Date\n' +
      applications.map((e) => `${e.id},${e.name},${e.sector},${e.type},${e.score},${e.status},${e.date}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Arba360_Applications_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported applications report as CSV.', 'success');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white shadow-xl bg-slate-900 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
            <span className={toastMessage.type === 'success' ? 'text-emerald-400' : 'text-sky-400'}>●</span>
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Sidebar Component with hover animation and icon-only logo */}
        <Sidebar
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-xs">
            <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-1.5 -ml-1.5 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold text-slate-700 hidden sm:inline-block">
                  Dashboard
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Notifications Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      if (!notificationsOpen) fetchLiveNotifications();
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
                    aria-label="View notifications"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-4 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllNotificationsAsRead}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition"
                              title="Mark all as read"
                            >
                              <CheckCheck className="w-3 h-3" />
                              <span>Mark all read</span>
                            </button>
                          )}
                          <button
                            onClick={() => setNotificationsOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-xs p-1 rounded-md hover:bg-slate-100 transition"
                            title="Close"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                        {liveNotifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          liveNotifications.map((n) => (
                            <div
                              key={n.id}
                              className={`py-3 px-2.5 rounded-xl transition flex items-start justify-between gap-3 ${
                                !n.is_read ? 'bg-blue-50/60 border border-blue-100/50' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                                  {!n.is_read && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="shrink-0 pt-0.5">
                                {!n.is_read ? (
                                  <button
                                    onClick={() => markNotificationAsRead(n.id)}
                                    className="p-1.5 rounded-lg text-blue-600 hover:text-emerald-600 hover:bg-emerald-50 bg-white border border-slate-200 hover:border-emerald-300 shadow-2xs transition group"
                                    title="Mark as read"
                                    aria-label="Mark as read"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </button>
                                ) : (
                                  <span className="p-1.5 block text-slate-300" title="Read">
                                    <CheckCheck className="w-3.5 h-3.5 text-slate-300" />
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/programs">
                  <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs">
                    Programs
                  </Button>
                </Link>
                <Link href="/" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="text-slate-700 hover:bg-slate-100 text-xs">
                    Home
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 gap-1.5 transition text-xs"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </Button>
              </div>
            </div>
          </nav>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Dashboard Title Banner & Quick Actions Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Command Center</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of active cohort metrics, applicant pipelines, and scheduled sessions.
              </p>
            </div>

            {/* Primary Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={fetchDashboardData}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs disabled:opacity-50 transition"
                title="Refresh dashboard data"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button
                onClick={() => openEval(applications[0])}
                disabled={applications.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs disabled:opacity-50 transition"
              >
                <ClipboardCheck className="w-4 h-4" /> Review Applications
              </button>
              <button
                onClick={() => setScheduleModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs transition"
              >
                <CalendarPlus className="w-4 h-4 text-blue-600" /> Schedule Mentor
              </button>
              <button
                onClick={() => applications[1] && openEval(applications[1])}
                disabled={applications.length < 2}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs disabled:opacity-50 transition"
              >
                <FileEdit className="w-4 h-4 text-amber-500" /> Startup Review
              </button>
              <button
                onClick={downloadReports}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition"
              >
                <FileDown className="w-4 h-4" /> Export Reports
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-rose-900">{error}</p>
                  <p className="text-[11px] text-rose-600">Failed to load real-time cohort and analytics reports from /api/v1/reports/dashboard.</p>
                </div>
              </div>
              <button
                onClick={fetchDashboardData}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}

          {/* 5 Key Metric KPI Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs animate-pulse space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-3.5 bg-slate-200 rounded" />
                    <div className="w-8 h-8 rounded-lg bg-slate-100" />
                  </div>
                  <div className="w-20 h-7 bg-slate-200 rounded" />
                  <div className="w-28 h-3 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* KPI 1: Total Startups */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Total Startups</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                    <Rocket className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">{metrics.totalStartups}</span>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    <ArrowUp className="w-3 h-3" /> {metrics.totalStartupsGrowth}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">vs previous cohort</p>
              </div>

              {/* KPI 2: Applications Received */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Applications (This Mo)</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">{metrics.applicationsReceived}</span>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    <ArrowUp className="w-3 h-3" /> {metrics.applicationsGrowth}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{metrics.pendingEvaluation} pending evaluation</p>
              </div>

              {/* KPI 3: Pipeline Breakdown */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Active / Admitted / Grad</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-blue-600">{metrics.activeStartups}</span>
                  <span className="text-xs text-slate-400">/</span>
                  <span className="text-lg font-bold text-emerald-600">{metrics.admittedStartups}</span>
                  <span className="text-xs text-slate-400">/</span>
                  <span className="text-lg font-bold text-slate-700">{metrics.graduatedStartups}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Active | Admitted | Graduated</p>
              </div>

              {/* KPI 4: Funding Raised */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Funding Raised</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">{metrics.fundingRaised}</span>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {metrics.fundingGrowth}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">across all startups</p>
              </div>

              {/* KPI 5: Jobs Created */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Jobs Created</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">{metrics.jobsCreated}</span>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                    {metrics.jobsGrowth}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Direct & indirect workforce</p>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Recent Applications Table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                {/* Table Header Toolbar */}
                <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
                    <p className="text-xs text-slate-500">Review incoming submissions and assign initial scores.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search inside table */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search applications..."
                        className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'submitted', label: 'Submitted' },
                        { id: 'under_review', label: 'In Review' },
                        { id: 'admitted', label: 'Admitted' },
                        { id: 'rejected', label: 'Rejected' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setCurrentFilter(f.id)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-md transition ${
                            currentFilter === f.id
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Startup</th>
                        <th className="py-3 px-4">Program Type</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {isLoading ? (
                        [1, 2, 3, 4, 5].map((i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-slate-200 rounded-md" />
                                <div className="space-y-1">
                                  <div className="w-24 h-3 bg-slate-200 rounded" />
                                  <div className="w-16 h-2 bg-slate-100 rounded" />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4"><div className="w-16 h-3 bg-slate-200 rounded" /></td>
                            <td className="py-3 px-4"><div className="w-12 h-4 bg-slate-200 rounded" /></td>
                            <td className="py-3 px-4"><div className="w-16 h-4 bg-slate-200 rounded-full" /></td>
                            <td className="py-3 px-4"><div className="w-16 h-3 bg-slate-200 rounded" /></td>
                            <td className="py-3 px-4 text-right"><div className="w-12 h-6 bg-slate-200 rounded ml-auto" /></td>
                          </tr>
                        ))
                      ) : filteredApplications.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-slate-400">
                            No applications found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredApplications.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 font-medium text-slate-900">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                  {app.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 leading-none">{app.name}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {app.sector} • {app.id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-500">{app.type}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                  app.score >= 80
                                    ? 'text-emerald-600 bg-emerald-50'
                                    : app.score >= 60
                                    ? 'text-amber-600 bg-amber-50'
                                    : 'text-rose-600 bg-rose-50'
                                }`}
                              >
                                {app.score}/100
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${
                                  app.status === 'admitted'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : app.status === 'under_review'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : app.status === 'rejected'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {app.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400">{app.date}</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => openEval(app)}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition"
                              >
                                Evaluate
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Showing <strong>{filteredApplications.length}</strong> of <strong>{applications.length}</strong>{' '}
                    submissions
                  </span>
                  <Link
                    href="/dashboard/applications"
                    className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                  >
                    View full application database <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Pending Decisions & Urgent Reviews Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <h2 className="text-base font-bold text-slate-900">Pending Final Decisions</h2>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                    {pendingDecisions.length} Need Action
                  </span>
                </div>

                <div className="space-y-3">
                  {isLoading ? (
                    [1, 2].map((i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 animate-pulse flex items-center justify-between">
                        <div className="space-y-1.5">
                          <div className="w-24 h-3 bg-slate-200 rounded" />
                          <div className="w-44 h-2.5 bg-slate-100 rounded" />
                        </div>
                        <div className="flex gap-1.5">
                          <div className="w-12 h-6 bg-slate-200 rounded" />
                          <div className="w-12 h-6 bg-slate-200 rounded" />
                        </div>
                      </div>
                    ))
                  ) : pendingDecisions.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No pending decisions remaining.</p>
                  ) : (
                    pendingDecisions.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                              Score: {item.score}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.recommendation}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => quickDecision(item.id, 'admitted')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded transition shadow-2xs"
                          >
                            Admit
                          </button>
                          <button
                            onClick={() => quickDecision(item.id, 'rejected')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-200 text-slate-700 hover:bg-rose-600 hover:text-white rounded transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Column: Upcoming Mentorship & Activity Log */}
            <div className="space-y-6">
              {/* Upcoming Mentorship Sessions */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" /> Mentorship Sessions
                  </h2>
                  <button
                    onClick={() => setScheduleModalOpen(true)}
                    className="text-xs text-blue-600 font-medium hover:underline"
                  >
                    + New
                  </button>
                </div>

                <div className="space-y-3.5">
                  {isLoading ? (
                    [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 animate-pulse"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200" />
                          <div className="space-y-1">
                            <div className="w-24 h-3 bg-slate-200 rounded" />
                            <div className="w-20 h-2 bg-slate-100 rounded" />
                          </div>
                        </div>
                        <div className="w-14 h-3 bg-slate-200 rounded" />
                      </div>
                    ))
                  ) : mentorshipSessions.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No mentorship sessions scheduled.</p>
                  ) : (
                    mentorshipSessions.map((session, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {session.mentor.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900">{session.mentor}</p>
                            <p className="text-[10px] text-slate-500">
                              Startup: <strong className="text-slate-700">{session.startup}</strong>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] block font-medium text-slate-600">{session.time}</span>
                          <a
                            href={session.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-semibold mt-0.5"
                          >
                            <Video className="w-3 h-3" /> Join Call
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activity Stream */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Clock className="w-4 h-4 text-slate-400" /> Audit & Activity Log
                </h2>

                <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
                  <div className="relative">
                    <span className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white"></span>
                    <p className="text-slate-800 font-medium">
                      <strong className="font-bold">NexHealth AI</strong> was admitted to Cohort 2026-B.
                    </p>
                    <span className="text-[10px] text-slate-400">12 mins ago by Director</span>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></span>
                    <p className="text-slate-800 font-medium">
                      <strong className="font-bold">PayFlow Finance</strong> evaluation score updated to 64/100.
                    </p>
                    <span className="text-[10px] text-slate-400">1 hour ago by Evaluation Rubric</span>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white"></span>
                    <p className="text-slate-800 font-medium">
                      <strong className="font-bold">Dr. Marcus Vance</strong> scheduled a session with NeuroMed Tech.
                    </p>
                    <span className="text-[10px] text-slate-400">3 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Modal 1: Evaluation & Scoring Dialog */}
        {evalModalOpen && evalApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Evaluate: {evalApp.name}</h3>
                  <p className="text-xs text-slate-500">
                    {evalApp.sector} • {evalApp.id}
                  </p>
                </div>
                <button onClick={() => setEvalModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEvalSubmit} className="p-5 space-y-4">
                {/* Criteria Sliders */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Team & Execution</span>
                      <span className="text-blue-600 font-bold">{evalScores.team}/25</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={evalScores.team}
                      onChange={(e) => setEvalScores({ ...evalScores, team: Number(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Market Opportunity & TAM</span>
                      <span className="text-blue-600 font-bold">{evalScores.market}/25</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={evalScores.market}
                      onChange={(e) => setEvalScores({ ...evalScores, market: Number(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Tech Innovation & Moat</span>
                      <span className="text-blue-600 font-bold">{evalScores.tech}/25</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={evalScores.tech}
                      onChange={(e) => setEvalScores({ ...evalScores, tech: Number(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Traction & Business Model</span>
                      <span className="text-blue-600 font-bold">{evalScores.traction}/25</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={evalScores.traction}
                      onChange={(e) => setEvalScores({ ...evalScores, traction: Number(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Total Score Gauge Banner */}
                <div className="bg-slate-100 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Total Calculated Score</span>
                  <span className="text-lg font-extrabold text-blue-600">
                    {evalScores.team + evalScores.market + evalScores.tech + evalScores.traction}/100
                  </span>
                </div>

                {/* Decision Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Admission Decision</label>
                  <select
                    value={evalDecision}
                    onChange={(e) => setEvalDecision(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="under_review">Keep Under Review</option>
                    <option value="admitted">Admit to Incubator</option>
                    <option value="rejected">Reject Application</option>
                  </select>
                </div>

                {/* Feedback Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Reviewer Feedback Notes</label>
                  <textarea
                    rows={3}
                    value={evalNotes}
                    onChange={(e) => setEvalNotes(e.target.value)}
                    placeholder="Enter evaluation notes and recommendations..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEvalModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  >
                    Save Evaluation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Schedule Mentor Session Modal */}
        {scheduleModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Schedule Mentor Session</h3>
                <button onClick={() => setScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Select Mentor</label>
                  <select
                    value={scheduleMentor}
                    onChange={(e) => setScheduleMentor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  >
                    <option>Dr. Marcus Vance (Fintech Specialist)</option>
                    <option>Elena Rostova (AI & ML Advisor)</option>
                    <option>David Chen (Growth & Venture Capital)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Select Startup</label>
                  <select
                    value={scheduleStartup}
                    onChange={(e) => setScheduleStartup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  >
                    <option>NexHealth AI</option>
                    <option>PayFlow Finance</option>
                    <option>NeuroMed Tech</option>
                    <option>UrbanFarms</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium">
                    Confirm Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
          </div>
      </div>
    </ProtectedRoute>
  );
}