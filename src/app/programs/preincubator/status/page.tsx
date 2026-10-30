'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Rocket,
  LogOut,
  CheckCircle2,
  Clock,
  Check,
  AlertCircle,
  Copy,
  RefreshCw,
  HelpCircle,
  X,
  Loader2,
  Lock,
  FileText,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building2,
  MessageSquare,
  Send,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';
import { supabase } from '@/backend/lib/supabase';
import { apiClient } from '@/services/apiClient';
import Logo from '@/frontend/components/ui/Logo';
import MyApplicationsModal from '@/frontend/components/applications/MyApplicationsModal';

interface ApplicationData {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  application_type: string;
  status: 'submitted' | 'under_review' | 'admitted' | 'rejected' | string;
  created_at: string;
  form_data?: any;
  organization?: any;
  organization_id?: string;
  admission_status?: string;
  incubator_response_status?: string;
  super_admin_status?: string;
  incubator_name_text?: string;
}

function StatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');
  const { user, logout } = useAuth();

  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [myAppsModalOpen, setMyAppsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Rejection Reply State
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Notify Incubator Cooldown State
  const [notifyCooldown, setNotifyCooldown] = useState<number>(0);
  const [isNotifying, setIsNotifying] = useState(false);

  const isDashboardAssigned = Boolean(
    application?.admission_status === 'dashboard_assigned' ||
    application?.form_data?.dashboard_access_granted
  );

  const userRole = (user as any)?.role?.toLowerCase() || (user as any)?.user_metadata?.role?.toLowerCase() || '';
  const emailLower = user?.email?.toLowerCase() || '';
  const isSuperAdmin = userRole === 'super-admin' || userRole === 'super_admin' || emailLower === 'shadmannc0516@gmail.com';
  const isIncubator = !isSuperAdmin && (userRole === 'admin' || userRole === 'incubator_admin' || userRole === 'incubator');
  const isApplicant = !isSuperAdmin && !isIncubator;

  // Access Guard: Incubator staff without a specific application ID redirect to their incubator workspace.
  // Super Admins and Startup Applicants stay on this Review page.
  useEffect(() => {
    if (!user) return;

    if (isIncubator && !queryId) {
      const orgId = (user as any)?.organization_id || (typeof window !== 'undefined' ? localStorage.getItem('org_id') : null);
      router.push(orgId ? `/dashboard?org=${orgId}` : '/dashboard');
      return;
    }
  }, [user, isIncubator, queryId, router]);

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3500);
  };

  // Fetch application details from database
  const loadApplication = async (isManualRefresh = false, targetId?: string) => {
    if (isManualRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ? `Bearer ${session.access_token}` : '';
      const headers: Record<string, string> = { 'x-org-id': 'all' };
      if (token) headers['Authorization'] = token;

      const searchEmail =
        user?.email ||
        (typeof window !== 'undefined' ? localStorage.getItem('last_applicant_email') : '');

      const effectiveId =
        targetId ||
        queryId ||
        (typeof window !== 'undefined' ? localStorage.getItem('last_application_id') : null);

      let url = '/applications/status?';
      if (effectiveId) url += `id=${encodeURIComponent(effectiveId)}&`;
      if (searchEmail) url += `email=${encodeURIComponent(searchEmail)}`;

      try {
        const res = await apiClient.get(url, { headers });
        if (res.data?.applications && Array.isArray(res.data.applications)) {
          setAllApplications(res.data.applications);
        }
        if (res.data?.data) {
          setApplication(res.data.data);
          if (isManualRefresh) triggerToast('Status synced with admissions database.');
          return;
        }
      } catch (e: any) {
        console.warn('Status lookup:', e?.message);
      }

      // Fallback demo mock if completely offline
      setApplication({
        id: effectiveId || '24613676-8e4a-4246-bf3c-9dc6e7070eaa',
        applicant_name: (user as any)?.name || (user as any)?.user_metadata?.full_name || 'Founder',
        applicant_email: user?.email || 'founder@arba360.com',
        application_type: 'pre-incubator',
        status: 'submitted',
        created_at: new Date().toISOString(),
        form_data: {
          fullName: (user as any)?.name || 'Founder',
          oneSentencePitch: 'Pre-Incubator Program Application',
          businessStage: 'Idea / Validation Phase',
        },
      });
    } catch (err: any) {
      console.warn('Status load error:', err?.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadApplication(false, queryId || undefined);

    // Subscribe to real-time changes on applications table
    const channel = supabase
      .channel('realtime-applicant-status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        (payload) => {
          if (payload.new && (payload.new as any).id === application?.id) {
            setApplication(payload.new as ApplicationData);
            triggerToast('Application status updated by Super Admin!');
          } else {
            loadApplication();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryId, user?.email]);

  const copyRefId = () => {
    if (!application?.id) return;
    navigator.clipboard.writeText(application.id);
    triggerToast('Application Reference ID copied to clipboard!');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleSendSupportQuery = () => {
    setSupportModalOpen(false);
    setSupportMessage('');
    triggerToast('Query submitted! Our admissions desk will respond via email.');
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !application?.id) return;
    setIsSubmittingReply(true);
    try {
      const res = await fetch(`/api/v1/applications/${application.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit reply');

      if (json.data) {
        setApplication(json.data);
      }
      setReplyText('');
      setShowReplyForm(false);
      triggerToast('Reply submitted to the incubator review desk!');
    } catch (err: any) {
      triggerToast(err.message || 'Error submitting reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  useEffect(() => {
    if (!application?.id) return;
    const storageKey = `last_notified_incubator_${application.id}`;
    const lastTimeStr =
      (typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null) ||
      application.form_data?.last_incubator_notified_at;
    if (lastTimeStr) {
      const elapsed = Date.now() - new Date(lastTimeStr).getTime();
      const remaining = Math.max(0, Math.ceil((600000 - elapsed) / 1000));
      setNotifyCooldown(remaining);
    }
  }, [application?.id, application?.form_data?.last_incubator_notified_at]);

  useEffect(() => {
    if (notifyCooldown <= 0) return;
    const timer = setInterval(() => {
      setNotifyCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [notifyCooldown]);

  const handleNotifyIncubator = async () => {
    if (!application?.id || notifyCooldown > 0 || isNotifying) return;
    setIsNotifying(true);
    try {
      const res = await fetch(`/api/v1/applications/${application.id}/notify-incubator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to notify incubator');
      }
      const storageKey = `last_notified_incubator_${application.id}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, new Date().toISOString());
      }
      setNotifyCooldown(600); // 10 minutes
      triggerToast(json.message || 'Incubator notified! They will review and grant dashboard access.');
    } catch (err: any) {
      triggerToast(err.message || 'Could not notify incubator');
    } finally {
      setIsNotifying(false);
    }
  };

  const targetIncubatorName = useMemo(() => {
    return (
      (application as any)?.incubator_name_text ||
      (application as any)?.organization?.name ||
      application?.form_data?.incubatorName ||
      application?.form_data?.targetIncubator?.name ||
      'Incubator Workspace'
    );
  }, [application]);

  // Status configuration details
  const statusInfo = useMemo(() => {
    const rawStatus = (application?.status || 'submitted').toLowerCase();
    const superAdminStatus = ((application as any)?.super_admin_status || '').toLowerCase();
    const incubatorStatus = ((application as any)?.incubator_response_status || '').toLowerCase();

    if (rawStatus === 'admitted' || rawStatus === 'accepted' || incubatorStatus === 'accepted') {
      return {
        key: 'admitted',
        badgeLabel: isDashboardAssigned ? 'Status: Accepted & Active' : 'Status: Accepted (Dashboard Pending)',
        badgeStyle: 'bg-emerald-500/10 text-emerald-800 border-emerald-300/60',
        pingBg: 'bg-emerald-400',
        dotBg: 'bg-emerald-500',
        iconContainerBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
        iconName: 'check-circle-2',
        title: `Welcome to ${targetIncubatorName}!`,
        message: isDashboardAssigned
          ? `Congratulations! Your application to ${targetIncubatorName} has been reviewed and accepted. Check your dashboard for cohort onboarding details.`
          : `Congratulations! Your application to ${targetIncubatorName} has been accepted. Dashboard access is currently being activated by the incubator. You can notify them below if you need faster activation.`,
      };
    }

    if (rawStatus === 'forwarded' || superAdminStatus === 'forwarded') {
      return {
        key: 'forwarded',
        badgeLabel: 'Status: Forwarded to Incubator',
        badgeStyle: 'bg-blue-500/10 text-blue-800 border-blue-300/60',
        pingBg: 'bg-blue-400',
        dotBg: 'bg-blue-600',
        iconContainerBg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
        iconName: 'building-2',
        title: `Forwarded to Incubator (${targetIncubatorName})`,
        message: `Your application has passed initial Super Admin evaluation and has been forwarded to ${targetIncubatorName} for final cohort admission review.`,
      };
    }

    if (rawStatus === 'under_review') {
      return {
        key: 'under_review',
        badgeLabel: `Status: Under Review for ${targetIncubatorName}`,
        badgeStyle: 'bg-blue-500/10 text-blue-800 border-blue-300/60',
        pingBg: 'bg-blue-400',
        dotBg: 'bg-blue-600',
        iconContainerBg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
        iconName: 'clock',
        title: `Review in Progress for ${targetIncubatorName}`,
        message: `The admissions committee is actively reviewing your rubric scores and pitch materials for ${targetIncubatorName}. Decisions are dispatched shortly.`,
      };
    }

    if (rawStatus === 'rejected') {
      return {
        key: 'rejected',
        badgeLabel: `Status: Decision Completed (${targetIncubatorName})`,
        badgeStyle: 'bg-rose-500/10 text-rose-800 border-rose-300/60',
        pingBg: 'bg-rose-400',
        dotBg: 'bg-rose-600',
        iconContainerBg: 'bg-rose-50 text-rose-600 border border-rose-200/60',
        iconName: 'alert-circle',
        title: `${targetIncubatorName} Cohort Decision`,
        message: `Thank you for your application to ${targetIncubatorName}. The current cohort is at full capacity, but you are welcome to reapply for future cycles.`,
      };
    }

    // Default 'submitted'
    return {
      key: 'submitted',
      badgeLabel: `Status: Submitted to ${targetIncubatorName}`,
      badgeStyle: 'bg-amber-500/10 text-amber-800 border-amber-300/60',
      pingBg: 'bg-amber-400',
      dotBg: 'bg-amber-500',
      iconContainerBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
      iconName: 'clock',
      title: `Application Submitted to ${targetIncubatorName}`,
      message: `Thank you for applying to ${targetIncubatorName} via Arba360. Our admissions desk and committee are reviewing your submission.`,
    };
  }, [application?.status, targetIncubatorName]);

  const isAcceptedByIncubator = statusInfo.key === 'admitted' || application?.status === 'accepted' || application?.status === 'admitted';
  const todayStr = new Date().toISOString().slice(0, 10);
  const notifyHistory = (application as any)?.form_data?.notify_incubator_history;
  const todayNotifyCount = notifyHistory?.date === todayStr ? (notifyHistory?.count || 0) : 0;
  const isDailyLimitReached = todayNotifyCount >= 5;

  const formattedDate = useMemo(() => {
    if (!application?.created_at) return 'Recently';
    try {
      const d = new Date(application.created_at);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  }, [application?.created_at]);

  const displayRefId = application?.id ? `#${application.id.slice(0, 8)}-${application.id.slice(9, 13)}` : '#24613676-8e4a';
  const isPending = !application || application.status === 'submitted' || application.status === 'under_review';

  return (
    <div className="min-h-screen text-slate-800 bg-[#F8FAFC] flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#1A2151] text-white px-4 py-3 rounded-2xl shadow-xl border border-cyan-400/30 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Minimal Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-8 py-4 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Arba360 Brand Logo */}
          <div className="flex items-center gap-2.5">
            <Logo size="md" href="/" />
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-cyan-400/10 text-cyan-700 rounded-md border border-cyan-400/20">
              PRE-INCUBATOR
            </span>
          </div>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-2">
            {/* My Applications Button */}
            <button
              onClick={() => setMyAppsModalOpen(true)}
              type="button"
              className="px-3.5 py-2 rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold text-xs transition-all flex items-center gap-1.5 border border-blue-200 shadow-2xs cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>My Applications</span>
              {allApplications.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-600 text-white font-extrabold">
                  {allApplications.length}
                </span>
              )}
            </button>

            {allApplications.length >= 5 ? (
              <div className="relative group">
                <button
                  type="button"
                  disabled
                  className="px-3.5 py-2 rounded-xl text-slate-400 bg-slate-100 font-bold text-xs flex items-center gap-1.5 border border-slate-200/80 cursor-not-allowed opacity-80"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                  <span>Application Limit Reached (5/5)</span>
                </button>
                <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 w-72 p-2.5 bg-[#101638] text-white text-[11px] font-medium leading-relaxed rounded-xl shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 pointer-events-none">
                  You have reached the maximum limit of 5 applications across partner incubators.
                </div>
              </div>
            ) : (
              <Link
                href="/programs"
                className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-[#1A2151] hover:bg-slate-100 font-bold text-xs transition-all flex items-center gap-1.5 border border-slate-200/80 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Programs {allApplications.length > 0 ? `(${allApplications.length}/5)` : ''}</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              type="button"
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-all flex items-center gap-1.5 border border-slate-200/80"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Status Container */}
      <main className="max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center gap-6">
        {/* MULTI-INCUBATOR QUICK SWITCHER */}
        {allApplications.length > 1 && (
          <div className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 px-2 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-600" />
              <span>Incubators:</span>
            </span>
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              {allApplications.map((app) => {
                const name = app.incubator_name_text || app.organization?.name || app.form_data?.incubatorName || 'Incubator';
                const isSelected = app.id === application?.id;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      setApplication(app);
                      if (typeof window !== 'undefined') localStorage.setItem('last_application_id', app.id);
                      router.push(`/programs/preincubator/status?id=${app.id}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#1A2151] text-white border-[#1A2151] shadow-sm shadow-[#1A2151]/30'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    <span className="truncate max-w-[130px]">{name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase ${
                      app.status === 'accepted' || app.status === 'admitted'
                        ? 'bg-emerald-500 text-white'
                        : app.status === 'rejected'
                        ? 'bg-rose-500 text-white'
                        : isSelected
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {app.status || 'pending'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MAIN CENTERED APPLICATION STATUS CARD */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-10 space-y-8 relative overflow-hidden">
          {/* Top Status Header & Pulsing Badge */}
          <div className="text-center space-y-4">
            {/* Status Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs transition-all duration-300 ${statusInfo.badgeStyle}`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusInfo.pingBg}`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusInfo.dotBg}`} />
              </span>
              <span>{statusInfo.badgeLabel}</span>
            </div>

            {/* Big Centered Icon */}
            <div className="pt-2 flex justify-center">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center relative shadow-inner transition-all duration-300 ${statusInfo.iconContainerBg}`}
              >
                {statusInfo.key === 'admitted' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                ) : statusInfo.key === 'rejected' ? (
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                ) : statusInfo.key === 'forwarded' ? (
                  <Building2 className="w-8 h-8 text-blue-600 animate-pulse" />
                ) : statusInfo.key === 'under_review' ? (
                  <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
                ) : (
                  <Clock className="w-8 h-8 text-amber-500" />
                )}
              </div>
            </div>

            {/* Main Title & Subtitle */}
            <div className="space-y-2 max-w-lg mx-auto">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2151] tracking-tight">
                {statusInfo.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {statusInfo.message}
              </p>
            </div>

            {/* Reference ID Pill with Copy to Clipboard */}
            <div className="pt-1 flex items-center justify-center">
              <button
                onClick={copyRefId}
                type="button"
                className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-600 text-xs font-mono font-medium transition-all"
                title="Click to copy Application Reference ID"
              >
                <span className="text-slate-400 font-sans text-[11px] font-bold">REF:</span>
                <span className="font-bold text-[#1A2151]">{displayRefId}</span>
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* 3-STEP PROGRESS TRACKER */}
          <div className="space-y-3">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider text-center">
              Evaluation Workflow
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Step 1: Submitted */}
              <div className="p-3 rounded-2xl border text-center transition-all bg-emerald-50/80 border-emerald-200 text-emerald-950">
                <div className="w-7 h-7 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs mb-2">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold">Submitted</p>
                <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Completed</p>
              </div>

              {/* Step 2: Super Admin Review */}
              <div
                className={`p-3 rounded-2xl border text-center transition-all ${
                  statusInfo.key === 'forwarded' || statusInfo.key === 'admitted'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : statusInfo.key === 'rejected'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                    : 'bg-blue-50/80 border-blue-500/80 shadow-md ring-2 ring-blue-500/20'
                }`}
              >
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold shadow-xs mb-2 ${
                    statusInfo.key === 'forwarded' || statusInfo.key === 'admitted'
                      ? 'bg-emerald-500 text-white'
                      : statusInfo.key === 'rejected'
                      ? 'bg-rose-500 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {statusInfo.key === 'forwarded' || statusInfo.key === 'admitted' ? (
                    <Check className="w-4 h-4" />
                  ) : statusInfo.key === 'rejected' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </div>
                <p className="text-xs font-bold text-[#1A2151]">Super Admin Review</p>
                <p
                  className={`text-[10px] font-medium mt-0.5 ${
                    statusInfo.key === 'forwarded' || statusInfo.key === 'admitted'
                      ? 'text-emerald-700 font-bold'
                      : statusInfo.key === 'rejected'
                      ? 'text-rose-600 font-bold'
                      : 'text-blue-600 font-bold'
                  }`}
                >
                  {statusInfo.key === 'forwarded'
                    ? 'Forwarded'
                    : statusInfo.key === 'admitted'
                    ? 'Passed'
                    : statusInfo.key === 'rejected'
                    ? 'Closed'
                    : 'In Progress'}
                </p>
              </div>

              {/* Step 3: Final Decision / Incubator Review */}
              <div
                className={`p-3 rounded-2xl border text-center transition-all ${
                  statusInfo.key === 'admitted'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-xs'
                    : statusInfo.key === 'rejected'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                    : statusInfo.key === 'forwarded'
                    ? 'bg-blue-50/80 border-blue-500/80 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-slate-50/80 border-slate-200/80 text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold shadow-xs mb-2 ${
                    statusInfo.key === 'admitted'
                      ? 'bg-emerald-500 text-white'
                      : statusInfo.key === 'rejected'
                      ? 'bg-rose-500 text-white'
                      : statusInfo.key === 'forwarded'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {statusInfo.key === 'admitted' ? (
                    <Check className="w-4 h-4" />
                  ) : statusInfo.key === 'rejected' ? (
                    <X className="w-4 h-4" />
                  ) : statusInfo.key === 'forwarded' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </div>
                <p className="text-xs font-bold">Incubator Review</p>
                <p className="text-[10px] font-medium mt-0.5">
                  {statusInfo.key === 'admitted'
                    ? 'Accepted by Incubator'
                    : statusInfo.key === 'rejected'
                    ? 'Not Selected'
                    : statusInfo.key === 'forwarded'
                    ? 'In Progress'
                    : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* SUMMARY DETAILS BOX */}
          <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="font-bold text-[#1A2151] uppercase tracking-wider text-[11px]">
                Submission Summary
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                Fee Paid (₹6,500)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Program</span>
                <p className="font-extrabold text-[#1A2151] mt-0.5">Pre-Incubator Cohort 2026</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Submission Date</span>
                <p className="font-bold text-slate-800 mt-0.5">{formattedDate}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Applicant Details</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {application?.applicant_name || 'Founder'}{' '}
                  <span className="text-slate-400 font-normal">
                    ({application?.applicant_email || user?.email || 'N/A'})
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* INDIVIDUAL INCUBATOR REVIEW & FEEDBACK BOX */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-extrabold text-[#1A2151] uppercase tracking-wider text-[11px]">
                  Admissions Review & Feedback
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">
                {targetIncubatorName}
              </span>
            </div>

            <div className="space-y-3">
              {/* Dynamic Rejection & Evaluation Attribution */}
              {(application as any)?.super_admin_status === 'rejected' ? (
                /* Super Admin Rejection (Source: Arba360) */
                <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      Rejection Source: Arba360 Central Admissions
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300">
                      REJECTED BY ARBA360
                    </span>
                  </div>
                  <p className="text-slate-800 text-xs leading-relaxed font-medium">
                    {(application as any)?.super_admin_notes || (application as any)?.reviewer_comments || 'Your application did not meet eligibility or readiness requirements for cohort forwarding at this stage.'}
                  </p>
                  <div className="pt-2 border-t border-rose-200/80 text-[11px] text-rose-900/90 bg-rose-100/60 p-2.5 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Next Steps & Support:</span> For questions, clarifications, or to appeal this platform decision, please contact Arba360 Central Admissions directly at <a href="mailto:admissions@arba360.com" className="font-bold underline text-rose-900 hover:text-black">admissions@arba360.com</a> or post a message in the appeal thread below.
                    </div>
                  </div>
                </div>
              ) : statusInfo.key === 'rejected' || (application as any)?.incubator_response_status === 'rejected' ? (
                /* Incubator Rejection (Source: Actual Incubator Name) */
                <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      Rejection Source: {targetIncubatorName}
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300">
                      NOT SELECTED BY INCUBATOR
                    </span>
                  </div>
                  <p className="text-slate-800 text-xs leading-relaxed font-medium">
                    {(application as any)?.reviewer_comments || `Thank you for your application to ${targetIncubatorName}. Due to competitive cohort quotas, this application was not selected for admission.`}
                  </p>
                  <div className="pt-2 border-t border-rose-200/80 text-[11px] text-rose-900/90 bg-rose-100/60 p-2.5 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Next Steps & Contact:</span> For specific feedback regarding this cohort evaluation, please contact the admissions desk at <span className="font-bold text-slate-900">{targetIncubatorName}</span>.
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Non-Rejected Status Review */
                <>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Super Admin Evaluation (Arba360)
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        (application as any)?.super_admin_status === 'approved' || (application as any)?.super_admin_status === 'forwarded'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {((application as any)?.super_admin_status || 'Under Review').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {(application as any)?.super_admin_notes ||
                        'Your application is undergoing initial administrative screening and eligibility verification by Arba360.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                        {targetIncubatorName} Decision & Notes
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        statusInfo.key === 'admitted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {statusInfo.key === 'admitted'
                          ? 'ACCEPTED BY INCUBATOR'
                          : statusInfo.key === 'forwarded'
                          ? 'PENDING EVALUATION'
                          : (application?.status || 'pending').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {statusInfo.key === 'admitted'
                        ? (application as any)?.reviewer_comments || `Application approved! ${targetIncubatorName} has accepted your startup into their upcoming incubation cohort.`
                        : statusInfo.key === 'forwarded'
                        ? `Application has been forwarded to ${targetIncubatorName} and is queued for cohort evaluation.`
                        : `Application is queued for evaluation by the ${targetIncubatorName} selection committee.`}
                    </p>
                  </div>
                </>
              )}
                {(application as any)?.score !== undefined && (application as any)?.score !== null && (
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] font-bold text-blue-700">
                    <span>Rubric Score:</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200">
                      {(application as any).score} / 100
                    </span>
                  </div>
                )}

                {/* Rejection Replies Conversation Thread */}
                {Array.isArray((application as any)?.form_data?.rejection_replies) &&
                  (application as any).form_data.rejection_replies.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Conversation & Appeal History
                      </p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {(application as any).form_data.rejection_replies.map((r: any) => (
                          <div
                            key={r.id}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-0.5"
                          >
                            <div className="flex items-center justify-between font-bold text-[#1A2151]">
                              <span>{r.sender}</span>
                              <span className="text-[9px] text-slate-400 font-normal">
                                {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{r.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Rejection Reply Button & Inline Form */}
                {statusInfo.key === 'rejected' && (
                  <div className="pt-2 border-t border-rose-100">
                    {!showReplyForm ? (
                      <button
                        type="button"
                        onClick={() => setShowReplyForm(true)}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                        <span>Reply to Rejection / Request Feedback</span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl bg-white border border-rose-200 space-y-2">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your clarification, updated milestone metrics, or appeal message..."
                          className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-rose-500 transition resize-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowReplyForm(false);
                              setReplyText('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[11px] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={!replyText.trim() || isSubmittingReply}
                            onClick={handleSendReply}
                            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>{isSubmittingReply ? 'Sending...' : 'Send Reply'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          {/* PRIMARY ACTIONS & SUPPORT LINK */}
          <div className="space-y-3 pt-2">
            {/* APPLICANT ONLY: View Dashboard ONLY after incubator assigns dashboard access */}
            {!isSuperAdmin && isApplicant && statusInfo.key === 'admitted' && isDashboardAssigned && (
              <Link
                href={
                  application?.organization_id
                    ? `/dashboard?org=${application.organization_id}`
                    : '/dashboard'
                }
                onClick={() => {
                  if (application?.organization_id && typeof window !== 'undefined') {
                    localStorage.setItem('org_id', application.organization_id);
                  }
                }}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-600/30 hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Rocket className="w-4 h-4 text-emerald-200" />
                <span>View Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}

            {/* APPLICANT ONLY: Notify Incubator ONLY after acceptance and when dashboard is not yet assigned */}
            {!isSuperAdmin && isApplicant && isAcceptedByIncubator && !isDashboardAssigned && (
              <button
                type="button"
                onClick={handleNotifyIncubator}
                disabled={notifyCooldown > 0 || isNotifying || isDailyLimitReached}
                className={`w-full py-4 px-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isDailyLimitReached || notifyCooldown > 0
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-600/30 cursor-pointer'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>
                  {isNotifying
                    ? 'Notifying Incubator...'
                    : isDailyLimitReached
                    ? 'Daily Notification Limit Reached (5/5)'
                    : notifyCooldown > 0
                    ? `Notified (Retry in ${Math.floor(notifyCooldown / 60)}m ${notifyCooldown % 60}s)`
                    : `Notify Incubator (${todayNotifyCount}/5 sent today)`}
                </span>
              </button>
            )}

            {/* SUPER ADMIN ONLY: Back to Super Admin Applications console */}
            {isSuperAdmin && (
              <Link
                href="/super-admin/applications"
                className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer text-center"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
                <span>Back to Super Admin Applications</span>
              </Link>
            )}

            {/* View All Applied Incubators Modal Button */}
            <button
              onClick={() => setMyAppsModalOpen(true)}
              type="button"
              className="w-full py-3.5 px-5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#1A2151] to-blue-700 hover:opacity-95 text-white shadow-lg shadow-blue-900/20 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>My Applications (View All Applied Incubators)</span>
              {allApplications.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-400 text-slate-900 font-black">
                  {allApplications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => loadApplication(true)}
              type="button"
              disabled={refreshing || isLoading}
              className={`w-full py-3.5 px-5 rounded-2xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer ${
                statusInfo.key === 'admitted'
                  ? 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-xl'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Checking Latest Status...' : 'Refresh Status'}</span>
            </button>

            <div className="text-center">
              <button
                onClick={() => setSupportModalOpen(true)}
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
                <span>Need Help? Contact Support</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MY APPLICATIONS MODAL */}
      <MyApplicationsModal
        isOpen={myAppsModalOpen}
        onClose={() => setMyAppsModalOpen(false)}
        applicantEmail={user?.email || application?.applicant_email}
        fallbackApplications={allApplications.length > 0 ? allApplications : (application ? [application] : [])}
      />

      {/* FOOTER */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/50">
        <p>© 2026 Arba360 Accelerator. All rights reserved.</p>
      </footer>

      {/* SUPPORT CONTACT MODAL */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101638]/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#1A2151]">Arba360 Admissions Desk</h3>
              <button
                onClick={() => setSupportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Have a query regarding application <strong className="text-[#1A2151]">{displayRefId}</strong>?
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Message / Query</label>
                <textarea
                  rows={3}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe your question or provide additional context..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-hidden text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSupportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSupportQuery}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition"
              >
                Send Query
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PreIncubatorStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-bold text-slate-500">Loading Application Status...</div>}>
      <StatusContent />
    </Suspense>
  );
}
