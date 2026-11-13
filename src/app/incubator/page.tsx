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
import { IncubatorTopBar } from '@/frontend/components/incubator/IncubatorTopBar';
import StartupDashboard from '@/frontend/components/startup-dashboard/StartupDashboard';

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
  const [isStartupUser, setIsStartupUser] = useState(false);
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
      const isStartupUserRole = role === 'startup' || role === 'founder';
      const isIncubator =
        !isSuperAdmin &&
        !isStartupUserRole &&
        (role === 'admin' || role === 'incubator_admin' || role === 'incubator' || Boolean(organization?.id || (user as any)?.organization_id));

      // Super Admins and Incubator staff have direct workspace access
      if (isSuperAdmin || isIncubator) {
        return;
      }

      // If user has not chosen a role yet, strictly redirect to choose-role
      if (!role) {
        router.replace('/auth/choose-role');
        return;
      }

      // For startups / applicants: verify they have an accepted application
      try {
        const res = await fetch(`/api/v1/applications/status?email=${encodeURIComponent(user.email || '')}`);
        const data = await res.json();
        const apps: any[] = data?.applications || (data?.data ? [data.data] : []);

        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const requestedOrgId = urlParams?.get('org') || (typeof window !== 'undefined' ? localStorage.getItem('org_id') : null);

        // Check if startup has at least one accepted application across any incubator
        const anyAccepted = apps.some((app: any) => app.status === 'accepted' || app.status === 'admitted');

        if (!anyAccepted) {
          router.push('/programs/preincubator/status');
          return;
        }

        const acceptedApp =
          apps.find((app: any) => {
            const isAccepted = app.status === 'accepted' || app.status === 'admitted';
            if (!isAccepted) return false;
            if (requestedOrgId) {
              return app.organization_id === requestedOrgId || app.organization?.id === requestedOrgId;
            }
            return !!app.organization_id;
          }) || apps.find((app: any) => app.status === 'accepted' || app.status === 'admitted') || apps[0];

        // Startup role restriction: Startups belong in /startup/dashboard or /programs/preincubator/status
        const isDashboardAssigned =
          acceptedApp?.admission_status === 'dashboard_assigned' ||
          acceptedApp?.form_data?.dashboard_access_granted === true;

        if (isDashboardAssigned) {
          router.replace('/startup/dashboard');
          return;
        } else {
          router.replace('/programs/preincubator/status');
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
    router.push('/incubator/applications');
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

  if (isStartupUser) {
    router.replace('/startup/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans relative flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs font-medium">{toastMessage}</span>
          </div>
        )}

        {/* =========================================================================
            WHITE TOP NAVBAR (Clean, without the photo tab strip)
           ========================================================================= */}
        {/* Shared Unified Top Bar */}
        <IncubatorTopBar
          breadcrumbs={[{ label: 'Overview' }]}
          orgNameOverride={orgName}
        />

      {/* =========================================================================
          2. HERO & CONTENT SECTION
         ========================================================================= */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        
        {/* LIGHT HERO CARD (Max 2 buttons, no glow) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              <span>{startupName ? `${startupName} • ${orgName} workspace` : `${orgName} • Cohort portal`}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {startupName || founderName}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-3xl">
              {startupName
                ? `Your startup "${startupName}" is active in the cohort with ${orgName}. Track your milestones, mentorship sessions, and incubation progress.`
                : 'Cohort #8 is progressing through validation. You have 4 pending startup reviews and 2 mentor syncs scheduled today.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => showToast('Opened Onboard Startup Modal')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Onboard startup</span>
            </button>
            <button
              onClick={() => showToast('Schedule Office Hours initiated')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Schedule hours</span>
            </button>
          </div>
        </div>

        {/* UNIFIED STAT CARDS (smaller, neutral sub-labels, sentence case) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Active cohorts</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">4 Batches</div>
            <span className="text-[11px] text-slate-500 font-normal">Cohort #8 in progress</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Total funding raised</span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">$12.4M SAFEs</div>
            <span className="text-[11px] text-slate-500 font-normal">+18% vs last quarter</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Acceptance rate</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">3.8%</div>
            <span className="text-[11px] text-slate-500 font-normal">42 accepted / 1,100 applicants</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Demo Day countdown</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">14 Days</div>
            <span className="text-[11px] text-slate-500 font-normal">Nov 6, 2026 • Demo Hall</span>
          </div>
        </div>

        {/* SEARCH, FILTER & VIEW TOGGLE BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter startups by name, mentor, or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
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
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
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
                                <span className="truncate max-w-[140px]">{startup.mentor}</span>
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
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
                        <th className="py-3 px-4">Startup</th>
                        <th className="py-3 px-4">Sector</th>
                        <th className="py-3 px-4">Stage</th>
                        <th className="py-3 px-4">Funding target</th>
                        <th className="py-3 px-4">Lead mentor</th>
                        <th className="py-3 px-4">Lead score</th>
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
                          <td className="py-3 px-4 tabular-nums font-medium">{item.fundingAsk}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <img src={item.mentorAvatar} className="w-4 h-4 rounded-full object-cover" alt="" />
                              <span>{item.mentor}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="tabular-nums font-semibold text-emerald-600">{item.leadScore}</span>
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
                <Link href="/incubator/mentors" className="text-[10px] font-semibold text-[#0066ff] cursor-pointer hover:underline">
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
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d4ff]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-xs font-semibold text-slate-700">Demo Day milestone</span>
                <Award className="w-4 h-4 text-[#00d4ff]" />
              </div>

              <h4 className="text-sm font-semibold text-slate-900">Riyadh Venture Showcase 2026</h4>
              <p className="text-xs text-slate-500 mt-1">
                21 startups presenting to 60+ global investors.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs relative z-10">
                <span className="text-slate-400">Target Date:</span>
                <span className="font-medium text-slate-900">Nov 06, 2026</span>
              </div>

              <button
                onClick={() => showToast('Demo Day registration link generated')}
                className="w-full mt-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
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
              <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400">Quick actions</div>
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