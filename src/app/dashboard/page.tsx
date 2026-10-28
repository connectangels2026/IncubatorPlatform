'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Bell,
  Plus,
  Calendar,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  DollarSign,
  Layers,
  FileText,
  Briefcase,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  User as UserIcon,
  Sparkles,
  X,
  Check,
  Filter,
  Zap,
  MoreHorizontal,
  ChevronDown,
  Activity,
  Award,
  Globe,
  Copy,
  LayoutGrid,
  List,
  ArrowUpRight,
  Shield,
  Sliders,
  SlidersHorizontal,
  FolderPlus,
  Mail,
  UserCheck,
  Database,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';
import { apiClient } from '@/services/apiClient';
import { supabase } from '@/backend/lib/supabase';
import Logo from '@/frontend/components/ui/Logo';
import { Sidebar } from '@/frontend/components/layouts/Sidebar';

// --- TYPES ---
type NavTab = 'programs' | 'pipeline' | 'mentors' | 'demodays';
type ViewMode = 'kanban' | 'list';
type Stage = 'Ideation' | 'Validation' | 'Scaling' | 'Demo Day Ready';

interface Startup {
  id: string;
  name: string;
  logo: string;
  sector: 'Fintech' | 'Healthtech' | 'AI/SaaS' | 'Clean Energy';
  stage: Stage;
  leadScore: number;
  fundingAsk: string;
  mentor: string;
  mentorAvatar: string;
  progress: number;
  batch: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, organization, logout } = useAuth();

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<NavTab>('pipeline');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('All');
  
  // Modals & Popups
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHubSwitcherOpen, setIsHubSwitcherOpen] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile and Hub Switcher Refs for outside click
  const profileRef = useRef<HTMLDivElement>(null);
  const hubSwitcherRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Tenant & Startup Dynamic State
  const [startupName, setStartupName] = useState<string | null>(null);
  const [activeOrgName, setActiveOrgName] = useState<string>(organization?.name || 'Incubator Workspace');
  const [activeOrgSlug, setActiveOrgSlug] = useState<string>(organization?.slug || 'hub');

  const orgName = activeOrgName;
  const orgSlug = activeOrgSlug;
  const founderName = organization?.founder_name || user?.email?.split('@')[0] || 'Founder';
  const founderEmail = organization?.founder_email || user?.email || 'director@incubator.org';

  // Sync active organization name from context
  useEffect(() => {
    if (organization?.name) {
      setActiveOrgName(organization.name);
      setActiveOrgSlug(organization.slug || 'hub');
    }
  }, [organization]);

  // Security Guard: Incubator managers have direct access; only startups without an accepted app are redirected to the review page
  useEffect(() => {
    const verifyAccess = async () => {
      if (!user) return;
      const role = (user as any)?.role?.toLowerCase() || (user as any)?.user_metadata?.role?.toLowerCase() || '';
      
      const isSuperAdmin =
        role === 'super-admin' ||
        role === 'super_admin' ||
        user?.email?.toLowerCase() === 'shadmannc0516@gmail.com';
      const isIncubator =
        !isSuperAdmin &&
        (role === 'admin' || role === 'incubator_admin' || role === 'incubator');

      // Super Admins and Incubator staff have direct workspace access
      if (isSuperAdmin || isIncubator) {
        return;
      }

      // For startups / applicants: verify they have an accepted application
      try {
        const res = await fetch(`/api/v1/applications/status?email=${encodeURIComponent(user.email || '')}`);
        const data = await res.json();
        const apps: any[] = data?.applications || (data?.data ? [data.data] : []);

        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const requestedOrgId = urlParams?.get('org') || (typeof window !== 'undefined' ? localStorage.getItem('org_id') : null);

        const acceptedApp = apps.find((app: any) => {
          const isAccepted = app.status === 'accepted' || app.status === 'admitted';
          if (!isAccepted) return false;
          if (requestedOrgId) {
            return app.organization_id === requestedOrgId || app.organization?.id === requestedOrgId;
          }
          return !!app.organization_id;
        });

        if (!acceptedApp) {
          router.push('/programs/preincubator/status');
          return;
        }

        // Dynamically resolve startup's actual name and linked incubator
        const resolvedStartupName =
          acceptedApp.form_data?.startup_name ||
          acceptedApp.form_data?.name ||
          acceptedApp.form_data?.businessName ||
          acceptedApp.form_data?.companyName ||
          acceptedApp.startup?.name ||
          `${acceptedApp.applicant_name}'s Startup`;

        setStartupName(resolvedStartupName);

        const incubatorOrgName =
          acceptedApp.organization?.name ||
          acceptedApp.incubator_name_text ||
          acceptedApp.form_data?.targetIncubator?.name ||
          acceptedApp.form_data?.incubatorName;

        if (incubatorOrgName) {
          setActiveOrgName(incubatorOrgName);
          setActiveOrgSlug(acceptedApp.organization?.slug || 'hub');
        }
      } catch (err) {
        console.warn('Dashboard access verification error:', err);
        router.push('/programs/preincubator/status');
      }
    };

    verifyAccess();
  }, [user, organization, router]);

  // Sample Startups Data
  const [startups, setStartups] = useState<Startup[]>([
    {
      id: 'ST-101',
      name: 'OmniHealth AI',
      logo: '🧬',
      sector: 'Healthtech',
      stage: 'Ideation',
      leadScore: 94,
      fundingAsk: '$1.2M SAFEs',
      mentor: 'Dr. Tariq Al-Hassan',
      mentorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      progress: 35,
      batch: 'Batch 8'
    },
    {
      id: 'ST-102',
      name: 'VerdeGrid Bio',
      logo: '⚡',
      sector: 'Clean Energy',
      stage: 'Ideation',
      leadScore: 88,
      fundingAsk: '$800K Pre-Seed',
      mentor: 'Elena Rostova',
      mentorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
      progress: 25,
      batch: 'Batch 8'
    },
    {
      id: 'ST-103',
      name: 'FinFlow Pay',
      logo: '💳',
      sector: 'Fintech',
      stage: 'Validation',
      leadScore: 92,
      fundingAsk: '$2.5M Seed',
      mentor: 'Faisal Al-Khouri',
      mentorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      progress: 60,
      batch: 'Batch 7'
    },
    {
      id: 'ST-104',
      name: 'LogiChainX',
      logo: '📦',
      sector: 'AI/SaaS',
      stage: 'Validation',
      leadScore: 81,
      fundingAsk: '$650K SAFEs',
      mentor: 'Sarah Jenkins',
      mentorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      progress: 50,
      batch: 'Batch 8'
    },
    {
      id: 'ST-105',
      name: 'QuantumSec',
      logo: '🛡️',
      sector: 'AI/SaaS',
      stage: 'Scaling',
      leadScore: 97,
      fundingAsk: '$4.0M Series A',
      mentor: 'Michael Chang',
      mentorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      progress: 82,
      batch: 'Batch 6'
    },
    {
      id: 'ST-106',
      name: 'SolarPulse',
      logo: '☀️',
      sector: 'Clean Energy',
      stage: 'Scaling',
      leadScore: 89,
      fundingAsk: '$1.8M Seed',
      mentor: 'Amina Al-Mansoor',
      mentorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      progress: 75,
      batch: 'Batch 7'
    },
    {
      id: 'ST-107',
      name: 'PayPulse MENA',
      logo: '💎',
      sector: 'Fintech',
      stage: 'Demo Day Ready',
      leadScore: 99,
      fundingAsk: '$3.2M Series A',
      mentor: 'Dr. Tariq Al-Hassan',
      mentorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      progress: 95,
      batch: 'Batch 6'
    },
    {
      id: 'ST-108',
      name: 'CureGene Therapeutics',
      logo: '🧬',
      sector: 'Healthtech',
      stage: 'Demo Day Ready',
      leadScore: 96,
      fundingAsk: '$5.0M Series A',
      mentor: 'Prof. Arthur P.',
      mentorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      progress: 90,
      batch: 'Batch 6'
    }
  ]);

  // Outside click handler for profile & hub switcher dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (hubSwitcherRef.current && !hubSwitcherRef.current.contains(target)) {
        setIsHubSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard Shortcuts (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdKOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCmdKOpen(false);
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show toast utility
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Copy Public URL Slug
  const handleCopySlug = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/incubators/${orgSlug}` : `https://arba360.io/incubators/${orgSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    showToast('Public hub URL copied to clipboard!');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  // Notifications API integration
  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const res = await apiClient.get('/notifications?limit=30');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setNotifications(res.data.data);
        const unread = typeof res.data.unread_count === 'number'
          ? res.data.unread_count
          : res.data.data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('dashboard-notifications-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      try {
        await apiClient.put(`/notifications/${notif.id}/read`, { is_read: true });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.warn('Failed to mark notification as read:', err);
      }
    }

    setIsNotificationsOpen(false);

    // Open applications review
    router.push('/dashboard/applications');
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await Promise.all(
        unread.map((n) => apiClient.put(`/notifications/${n.id}/read`, { is_read: true }).catch(() => {}))
      );
    } catch (e) {
      console.warn('Error marking all notifications as read:', e);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filtered Startups
  const filteredStartups = startups.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.mentor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSectorFilter === 'All' || item.sector === selectedSectorFilter;
    return matchesSearch && matchesSector;
  });

  const stages: Stage[] = ['Ideation', 'Validation', 'Scaling', 'Demo Day Ready'];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans relative flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Ambient background glow spots */}
        <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[600px] h-[350px] bg-[#00d4ff]/10 blur-[130px] pointer-events-none rounded-full z-0" />
        <div className="fixed top-20 right-10 w-[500px] h-[400px] bg-[#0066ff]/10 blur-[140px] pointer-events-none rounded-full z-0" />
        <div className="fixed bottom-10 left-1/3 w-[700px] h-[300px] bg-[#1A2151]/5 blur-[120px] pointer-events-none rounded-full z-0" />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1A2151] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#00d4ff]/30 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#00d4ff] animate-ping" />
            <span className="text-xs font-medium">{toastMessage}</span>
          </div>
        )}

        {/* =========================================================================
            WHITE TOP NAVBAR (Clean, without the photo tab strip)
           ========================================================================= */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between transition-all">
          {/* Left: Incubator Name & Hub Switcher */}
          <div className="relative" ref={hubSwitcherRef}>
            <button
              onClick={() => setIsHubSwitcherOpen(!isHubSwitcherOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition group cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1A2151] to-[#0066ff] flex items-center justify-center text-white shrink-0 shadow-2xs">
                <Building2 className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-slate-800 tracking-tight truncate max-w-[200px] sm:max-w-[280px]">
                    {startupName || orgName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                    {startupName ? `Incubated at ${orgName}` : `arba360.io/incubators/${orgSlug}`}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                </div>
              </div>
            </button>

            {/* Hub Switcher Dropdown */}
            {isHubSwitcherOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Incubator Hub
                </div>
                
                <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/60 flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#1A2151] flex items-center justify-center text-white shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-[#00d4ff]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{orgName}</p>
                      <p className="text-[10px] text-blue-600 font-mono">Current Workspace</p>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => {
                      setIsHubSwitcherOpen(false);
                      handleCopySlug();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-700 transition cursor-pointer text-left"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Public Incubator Portal</span>
                  </button>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsHubSwitcherOpen(false)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-700 transition cursor-pointer text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Incubator Profile & Settings</span>
                  </Link>

                  <Link
                    href="/auth/incubator-plans"
                    onClick={() => setIsHubSwitcherOpen(false)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-50 text-blue-600 font-semibold transition cursor-pointer text-left"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create / Register New Hub</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Section: Cmd+K, Tier Badge, Notifications, Radiant Avatar */}
          <div className="flex items-center gap-3">
            {/* Quick Search Trigger (Cmd+K) */}
            <button
              onClick={() => setIsCmdKOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-600 transition group cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Search hub...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-300 rounded text-slate-500 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Tier Badge */}
            <Link
              href="/auth/incubator-plans"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 shadow-2xs hover:border-blue-300 transition"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Pro Cluster</span>
            </Link>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  if (!isNotificationsOpen) fetchNotifications();
                }}
                className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                  </span>
                )}
              </button>

              {/* Notification Flyout */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#1A2151] border border-[#00d4ff]/30 text-white shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-200">Notifications</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        unreadCount > 0 
                          ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {unreadCount} New
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] text-[#00d4ff] hover:underline cursor-pointer transition font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2 py-2 pr-1">
                    {isLoadingNotifications && notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">Loading notifications...</p>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-6">
                        <Bell className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No notifications yet</p>
                        <p className="text-[10px] text-slate-500 mt-1">Forwarded applications from Super Admin will appear here.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`flex gap-3 text-xs p-2.5 rounded-xl transition cursor-pointer border text-left ${
                            !n.is_read
                              ? 'bg-blue-950/40 border-[#00d4ff]/30 hover:bg-blue-900/50'
                              : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 opacity-80'
                          }`}
                        >
                          <div className="mt-1 flex-shrink-0">
                            {!n.is_read ? (
                              <div className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-sm shadow-[#00d4ff]" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-slate-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`font-semibold truncate ${!n.is_read ? 'text-white' : 'text-slate-300'}`}>
                                {n.title}
                              </p>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 flex-shrink-0">
                                {formatTimeAgo(n.created_at)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            {n.notification_type === 'application_forwarded' && (
                              <div className="mt-2 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                  Forwarded Startup
                                </span>
                                <span className="text-[10px] text-[#00d4ff] flex items-center gap-0.5 font-medium hover:underline">
                                  Review Application <ChevronRight className="w-3 h-3" />
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RADIANT CIRCULAR PROFILE AVATAR TRIGGER */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="relative p-[2px] rounded-full bg-gradient-to-tr from-[#00d4ff] via-[#0066ff] to-[#00d4ff] shadow-lg shadow-[#00d4ff]/30 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#1A2151] p-[1.5px] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                    alt={founderName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#1A2151] rounded-full shadow-xs" />
              </button>

              {/* MODAL PROFILE FLYOUT CARD */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-[#1A2151] border border-[#00d4ff]/30 text-white shadow-2xl overflow-hidden z-50">
                  
                  {/* Gradient Top Banner */}
                  <div className="h-24 bg-gradient-to-r from-[#1A2151] via-[#0066ff] to-[#00d4ff] relative p-4 flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-mono font-medium text-[#00d4ff] border border-white/10">
                      INCUBATOR ADMIN
                    </span>
                    <button
                      onClick={() => setIsProfileOpen(false)}
                      className="p-1 rounded-full bg-black/30 hover:bg-black/50 text-slate-200 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Circular Avatar Overlapping Header */}
                  <div className="px-6 pb-6 relative">
                    <div className="-mt-12 mb-3 flex items-end justify-between">
                      <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-[#00d4ff] to-[#0066ff] shadow-xl">
                        <img
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
                          alt={founderName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#1A2151]"
                        />
                      </div>
                      <button
                        onClick={handleCopySlug}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-slate-200 transition cursor-pointer"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00d4ff]" />}
                        <span>{copiedUrl ? 'Copied' : 'Hub URL'}</span>
                      </button>
                    </div>

                    {/* User Info */}
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        <span>{founderName}</span>
                        <CheckCircle2 className="w-4 h-4 text-[#00d4ff] fill-[#00d4ff]/20" />
                      </h3>
                      <p className="text-xs text-slate-300 font-medium">{founderEmail}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{orgName}</span>
                      </p>
                    </div>

                    {/* Public URL Slug Badge */}
                    <div className="mt-3 p-2 rounded-xl bg-[#0d1230] border border-slate-700/60 flex items-center justify-between text-xs font-mono text-slate-300">
                      <span className="truncate text-slate-400">arba360.io/incubators/{orgSlug}</span>
                      <button onClick={handleCopySlug} className="text-[#00d4ff] hover:text-white ml-2 cursor-pointer">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Live Subscription Status Banner */}
                    <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-[#0066ff]/20 via-[#00d4ff]/10 to-transparent border border-[#00d4ff]/30 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#00d4ff]">
                          <Zap className="w-3.5 h-3.5 fill-[#00d4ff]" />
                          <span>Pro Cluster Active</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Annual Billing • 20% Saved</p>
                      </div>
                      <Link
                        href="/auth/incubator-plans"
                        className="px-3 py-1 rounded-lg bg-[#0066ff] hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
                      >
                        Plans
                      </Link>
                    </div>

                    {/* Usage Quota Meters */}
                    <div className="mt-4 space-y-2.5">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hub Resource Usage</div>
                      
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                          <span>Active Startups</span>
                          <span className="font-mono text-[#00d4ff]">42 / 100</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#0066ff] to-[#00d4ff] rounded-full" style={{ width: '42%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                          <span>Verified Mentors</span>
                          <span className="font-mono text-[#00d4ff]">18 / 25</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-[#00d4ff] rounded-full" style={{ width: '72%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Links */}
                    <div className="mt-5 pt-4 border-t border-slate-700/80 space-y-1">
                      <Link
                        href="/dashboard/settings"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Incubator Settings</span>
                      </Link>
                      <Link
                        href="/dashboard/mentors"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
                      >
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>Team & Mentors</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition mt-1 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Log Out</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

      {/* =========================================================================
          2. HERO & CONTENT SECTION
         ========================================================================= */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-8 relative z-10">
        
        {/* HERO BANNER WITH DEEP NAVY GRADIENT */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#1A2151] via-[#151a42] to-[#0d1230] p-6 sm:p-8 text-white border border-[#00d4ff]/20 shadow-xl overflow-hidden">
          
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Greetings Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#00d4ff] mb-2">
                <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-ping" />
                <span>{startupName ? `${startupName} • ${orgName} Workspace` : `${orgName} • Cohort Portal`}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {startupName || founderName} 👋
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                {startupName
                  ? `Your startup "${startupName}" is active in the cohort with ${orgName}. Track your milestones, mentorship sessions, and incubation progress.`
                  : 'Cohort #8 is progressing through Validation. You have 4 pending startup reviews and 2 mentor syncs scheduled today.'}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => showToast('Opened Onboard Startup Modal')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#00d4ff] text-white text-xs font-bold shadow-lg shadow-[#0066ff]/30 hover:opacity-95 transition hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Startup</span>
              </button>
              <button
                onClick={() => showToast('Schedule Office Hours initiated')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold backdrop-blur-md transition cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#00d4ff]" />
                <span>Schedule Hours</span>
              </button>
              <button
                onClick={() => showToast('Exporting CRM dataset to CSV...')}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Export CRM</span>
              </button>
            </div>
          </div>

          {/* LIVE STATS TICKER ROW */}
          <div className="mt-8 pt-6 border-t border-slate-700/60 grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Active Cohorts</span>
                <Layers className="w-4 h-4 text-[#00d4ff]" />
              </div>
              <div className="text-xl font-bold text-white mt-1">4 Batches</div>
              <span className="text-[10px] text-emerald-400 font-medium">Cohort #8 in Progress</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Funding Raised</span>
                <DollarSign className="w-4 h-4 text-[#00d4ff]" />
              </div>
              <div className="text-xl font-bold text-white mt-1">$12.4M SAFEs</div>
              <span className="text-[10px] text-[#00d4ff] font-medium">+18% vs last quarter</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Acceptance Rate</span>
                <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
              </div>
              <div className="text-xl font-bold text-white mt-1">3.8%</div>
              <span className="text-[10px] text-slate-400 font-medium">42 accepted / 1,100 applicants</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Demo Day Countdown</span>
                <Clock className="w-4 h-4 text-[#00d4ff]" />
              </div>
              <div className="text-xl font-bold text-white mt-1">14 Days</div>
              <span className="text-[10px] text-amber-400 font-medium">Nov 6, 2026 • Demo Hall</span>
            </div>

          </div>
        </div>

        {/* SEARCH, FILTER & VIEW TOGGLE BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter startups by name, mentor, or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066ff] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sector Filters & View Mode Toggle */}
          <div className="flex items-center gap-3 justify-between sm:justify-end">
            
            {/* Sector Pill Filter */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-xs">
              {['All', 'Fintech', 'Healthtech', 'AI/SaaS', 'Clean Energy'].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSectorFilter(sec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    selectedSectorFilter === sec
                      ? 'bg-[#1A2151] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

            {/* View Mode Toggle (Kanban vs List) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-white text-[#0066ff] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Kanban Board View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-[#0066ff] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* STARTUP PIPELINE BOARD / LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Pipeline Column */}
          <div className="lg:col-span-3 space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0066ff]" />
                <h2 className="text-lg font-bold text-[#1A2151]">Cohort Startup Pipeline</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                  {filteredStartups.length} Active
                </span>
              </div>
            </div>

            {/* KANBAN BOARD VIEW */}
            {viewMode === 'kanban' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stages.map((stage) => {
                  const stageStartups = filteredStartups.filter((s) => s.stage === stage);
                  return (
                    <div
                      key={stage}
                      className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200/80 flex flex-col min-h-[500px]"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 px-1">
                        <span className="text-xs font-bold text-[#1A2151]">{stage}</span>
                        <span className="w-5 h-5 rounded-full bg-white text-slate-700 text-[10px] font-bold flex items-center justify-center border border-slate-200">
                          {stageStartups.length}
                        </span>
                      </div>

                      {/* Cards Container */}
                      <div className="space-y-3 flex-1 overflow-y-auto">
                        {stageStartups.map((startup) => (
                          <div
                            key={startup.id}
                            className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-md transition group cursor-pointer hover:border-[#0066ff]/40"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                  {startup.logo}
                                </span>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0066ff] transition">
                                    {startup.name}
                                  </h4>
                                  <span className="text-[10px] text-slate-500 font-medium">{startup.sector}</span>
                                </div>
                              </div>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono font-bold">
                                Score {startup.leadScore}
                              </span>
                            </div>

                            {/* Funding & Progress */}
                            <div className="mt-3 space-y-2">
                              <div className="flex justify-between items-center text-[11px] text-slate-600">
                                <span>Target Ask:</span>
                                <span className="font-semibold text-slate-800">{startup.fundingAsk}</span>
                              </div>

                              <div>
                                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                  <span>Milestone Progress</span>
                                  <span>{startup.progress}%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#0066ff] to-[#00d4ff] rounded-full"
                                    style={{ width: `${startup.progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Footer / Mentor Avatar */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <img
                                  src={startup.mentorAvatar}
                                  alt={startup.mentor}
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                                <span className="truncate max-w-[100px]">{startup.mentor}</span>
                              </div>
                              <span className="text-slate-400">{startup.batch}</span>
                            </div>
                          </div>
                        ))}

                        {stageStartups.length === 0 && (
                          <div className="py-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                            No startups in {stage}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Startup</th>
                        <th className="py-3 px-4">Sector</th>
                        <th className="py-3 px-4">Stage</th>
                        <th className="py-3 px-4">Funding Target</th>
                        <th className="py-3 px-4">Lead Mentor</th>
                        <th className="py-3 px-4">Lead Score</th>
                        <th className="py-3 px-4">Progress</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredStartups.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <span>{item.logo}</span>
                            <span>{item.name}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{item.sector}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                              {item.stage}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium">{item.fundingAsk}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <img src={item.mentorAvatar} className="w-4 h-4 rounded-full object-cover" alt="" />
                              <span>{item.mentor}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-emerald-600">{item.leadScore}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-24">
                              <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                                <span>{item.progress}%</span>
                              </div>
                              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#0066ff] rounded-full"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => showToast(`Reviewing ${item.name}`)}
                              className="text-[#0066ff] hover:text-[#1A2151] font-semibold text-xs cursor-pointer"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Section (1/4 width) - MENTORS & COHORT HIGHLIGHTS */}
          <div className="space-y-6">
            
            {/* Active Mentors Widget */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#1A2151] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#0066ff]" />
                  <span>Featured Mentors</span>
                </h3>
                <Link href="/dashboard/mentors" className="text-[10px] font-semibold text-[#0066ff] cursor-pointer hover:underline">
                  View All (18)
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'Dr. Tariq Al-Hassan',
                    role: 'Fintech & Regulatory',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                    slots: '2 Slots Left'
                  },
                  {
                    name: 'Elena Rostova',
                    role: 'VC Partner • CleanTech',
                    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
                    slots: 'Available Today'
                  },
                  {
                    name: 'Faisal Al-Khouri',
                    role: 'Scaleup Advisor',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                    slots: 'Busy'
                  }
                ].map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2.5">
                      <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.role}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {m.slots}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Hub Events Widget */}
            <div className="bg-[#1A2151] rounded-2xl p-5 border border-[#00d4ff]/20 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d4ff]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-xs font-bold text-[#00d4ff] uppercase tracking-wider">Demo Day Milestone</span>
                <Award className="w-4 h-4 text-[#00d4ff]" />
              </div>

              <h4 className="text-sm font-bold text-white relative z-10">Riyadh Venture Showcase 2026</h4>
              <p className="text-xs text-slate-300 mt-1 relative z-10">
                21 startups presenting to 60+ global investors.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs relative z-10">
                <span className="text-slate-400">Target Date:</span>
                <span className="font-mono font-bold text-[#00d4ff]">Nov 06, 2026</span>
              </div>

              <button
                onClick={() => showToast('Demo Day registration link generated')}
                className="w-full mt-4 py-2 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#00d4ff] text-white text-xs font-bold shadow-md hover:opacity-95 transition cursor-pointer"
              >
                Manage RSVP List
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* =========================================================================
          INTERACTIVE COMMAND PALETTE MODAL (Cmd + K)
         ========================================================================= */}
      {isCmdKOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-lg bg-[#1A2151] rounded-2xl border border-[#00d4ff]/30 text-white shadow-2xl overflow-hidden">
            
            {/* Input Header */}
            <div className="p-4 border-b border-slate-700/80 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#00d4ff]" />
              <input
                type="text"
                placeholder="Type a command or search startups, mentors, reports..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
                autoFocus
              />
              <button onClick={() => setIsCmdKOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="p-3 space-y-1 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</div>
              <button
                onClick={() => {
                  setIsCmdKOpen(false);
                  showToast('Opened Onboard Startup Modal');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#00d4ff]" />
                <span>Onboard New Startup to Cohort</span>
              </button>
              <button
                onClick={() => {
                  setIsCmdKOpen(false);
                  showToast('Scheduling mentor session');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 transition cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-[#0066ff]" />
                <span>Assign Mentor Session</span>
              </button>
              <button
                onClick={() => {
                  setIsCmdKOpen(false);
                  showToast('Exporting analytics report');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 transition cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Generate Cohort Performance Report</span>
              </button>
            </div>

            <div className="p-3 border-t border-slate-700/80 text-[10px] text-slate-400 flex justify-between bg-[#0d1230]">
              <span>Use <strong>ESC</strong> to exit</span>
              <span>Arba360 Console v4.2</span>
            </div>

          </div>
        </div>
      )}

      </div>
    </div>
  );
}