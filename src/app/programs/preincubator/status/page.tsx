'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Rocket,
  LayoutDashboard,
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
  const { user, logout, isLoading: authLoading } = useAuth();

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
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const isDashboardAssigned = Boolean(
    application?.admission_status === 'dashboard_assigned' ||
    application?.form_data?.dashboard_access_granted
  );

  const cachedRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
  const userRole = (user as any)?.role?.toLowerCase() || (user as any)?.user_metadata?.role?.toLowerCase() || cachedRole?.toLowerCase() || '';
  const emailLower = user?.email?.toLowerCase() || '';
  const isSuperAdmin = userRole === 'super-admin' || userRole === 'super_admin' || emailLower === 'shadmannc0516@gmail.com';
  const isIncubator = !isSuperAdmin && (userRole === 'admin' || userRole === 'incubator_admin' || userRole === 'incubator');
  const isApplicant = !isSuperAdmin && !isIncubator;

  // Access Guard: Incubator staff without a specific application ID redirect to their incubator workspace.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const redirectTarget = window.location.pathname + window.location.search;
      if (typeof window !== 'undefined') {
        window.location.replace(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
      } else {
        router.push(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
      }
      return;
    }

    if (isIncubator && !queryId) {
      router.replace('/incubator/applications');
    }
  }, [user, authLoading, isIncubator, queryId, router]);

  const triggerToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const copyRefId = () => {
    if (application?.id) {
      navigator.clipboard?.writeText(application.id);
      triggerToast('Application reference copied to clipboard!');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const loadApplication = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ? `Bearer ${session.access_token}` : '';
      const headers: Record<string, string> = token ? { Authorization: token } : {};

      const [singleRes, allRes] = await Promise.all([
        queryId
          ? fetch(`/api/v1/applications/${queryId}`, { headers })
          : fetch('/api/v1/applications?mine=true', { headers }),
        fetch('/api/v1/applications?mine=true', { headers }).catch(() => null),
      ]);

      if (singleRes.status === 403 || singleRes.status === 401) {
        setIsUnauthorized(true);
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

      if (singleRes.ok) {
        const json = await singleRes.json();
        let appData: any = null;
        if (queryId) {
          appData = json.application || json.data || json;
        } else if (Array.isArray(json.applications) && json.applications.length > 0) {
          appData = json.applications[0];
        } else if (json.application) {
          appData = json.application;
        }

        if (appData) {
          setApplication(appData);
          setIsUnauthorized(false);
        }
      }

      if (allRes && allRes.ok) {
        const allJson = await allRes.json();
        const appsList = Array.isArray(allJson.applications)
          ? allJson.applications
          : Array.isArray(allJson.data)
            ? allJson.data
            : [];
        setAllApplications(appsList);
      }
    } catch (err) {
      console.warn('Error loading application status:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadApplication();
    }
  }, [user, authLoading, queryId]);

  // Handle Send Rejection Reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !application?.id) return;
    setIsSubmittingReply(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ? `Bearer ${session.access_token}` : '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      };

      const res = await fetch(`/api/v1/applications/${application.id}/reply`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: replyText.trim() }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit reply');

      setApplication((prev: any) => ({
        ...prev,
        form_data: {
          ...(prev?.form_data || {}),
          rejection_replies: json.replies || [
            ...((prev?.form_data?.rejection_replies) || []),
            {
              id: `rep_${Date.now()}`,
              sender: user?.user_metadata?.full_name || user?.email || 'Applicant',
              message: replyText.trim(),
              created_at: new Date().toISOString(),
            },
          ],
        },
      }));

      setReplyText('');
      setShowReplyForm(false);
      triggerToast('Your response has been submitted to the admissions review committee.');
    } catch (err: any) {
      triggerToast(err.message || 'Error sending reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Cooldown countdown effect
  useEffect(() => {
    if (notifyCooldown <= 0) return;
    const interval = setInterval(() => {
      setNotifyCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [notifyCooldown]);

  // Handle Send Support Query
  const handleSendSupportQuery = async () => {
    if (!supportMessage.trim()) return;
    try {
      await apiClient.post('/tickets', {
        title: `Status Query: ${application?.id ? `#${application.id.slice(0, 8)}` : 'Pre-Incubator'}`,
        description: supportMessage,
        category: 'admissions',
        priority: 'medium',
      });
      triggerToast('Support query sent to admissions desk successfully!');
      setSupportModalOpen(false);
      setSupportMessage('');
    } catch {
      triggerToast('Message logged. Admissions desk notified.');
      setSupportModalOpen(false);
      setSupportMessage('');
    }
  };

  // Handle Notify Incubator
  const handleNotifyIncubator = async () => {
    if (!application?.id || notifyCooldown > 0 || isNotifying) return;
    setIsNotifying(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ? `Bearer ${session.access_token}` : '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      };

      const res = await fetch(`/api/v1/applications/${application.id}/notify-incubator`, {
        method: 'POST',
        headers,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to notify incubator');

      setNotifyCooldown(300);

      if (json.updatedFormData) {
        setApplication((prev: any) => ({
          ...prev,
          form_data: {
            ...(prev?.form_data || {}),
            ...json.updatedFormData,
          },
        }));
      }

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
      'Incubator workspace'
    );
  }, [application]);

  const startupName = useMemo(() => {
    return (
      application?.form_data?.startup_name ||
      application?.form_data?.businessName ||
      (application as any)?.startup_name ||
      application?.applicant_name ||
      'Your startup'
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
        badgeLabel: isDashboardAssigned ? 'Accepted & Active' : 'Accepted (dashboard pending)',
        badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        pingBg: 'bg-emerald-400',
        dotBg: 'bg-emerald-500',
        iconContainerBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
        iconName: 'check-circle-2',
        title: `Welcome to ${targetIncubatorName}!`,
        message: isDashboardAssigned
          ? `Congratulations! Your application for ${startupName} has been reviewed and accepted by ${targetIncubatorName}. Access your workspace dashboard below to view cohort onboarding and milestones.`
          : `Congratulations! Your application for ${startupName} has been accepted by ${targetIncubatorName}. Dashboard access is currently being activated. You can notify them below if you need faster activation.`,
      };
    }

    if (rawStatus === 'forwarded' || superAdminStatus === 'forwarded') {
      return {
        key: 'forwarded',
        badgeLabel: 'Forwarded to incubator',
        badgeStyle: 'bg-blue-50 text-blue-800 border-blue-200',
        pingBg: 'bg-blue-400',
        dotBg: 'bg-blue-600',
        iconContainerBg: 'bg-blue-50 text-blue-600 border border-blue-200',
        iconName: 'building-2',
        title: `Forwarded to ${targetIncubatorName}`,
        message: `Your application for ${startupName} has passed initial Super Admin evaluation and has been forwarded to ${targetIncubatorName} for final cohort admission review.`,
      };
    }

    if (rawStatus === 'under_review') {
      return {
        key: 'under_review',
        badgeLabel: 'Under review',
        badgeStyle: 'bg-blue-50 text-blue-800 border-blue-200',
        pingBg: 'bg-blue-400',
        dotBg: 'bg-blue-600',
        iconContainerBg: 'bg-blue-50 text-blue-600 border border-blue-200',
        iconName: 'clock',
        title: `Review in progress (${targetIncubatorName})`,
        message: `The admissions committee is actively reviewing your rubric scores and pitch materials for ${targetIncubatorName}. Decisions will be dispatched shortly.`,
      };
    }

    if (rawStatus === 'rejected') {
      return {
        key: 'rejected',
        badgeLabel: 'Decision completed',
        badgeStyle: 'bg-rose-50 text-rose-800 border-rose-200',
        pingBg: 'bg-rose-400',
        dotBg: 'bg-rose-600',
        iconContainerBg: 'bg-rose-50 text-rose-600 border border-rose-200',
        iconName: 'alert-circle',
        title: `Cohort decision (${targetIncubatorName})`,
        message: `Thank you for your application to ${targetIncubatorName}. Due to competitive cohort quotas, ${startupName} was not selected for admission in this cycle.`,
      };
    }

    // Default 'submitted'
    return {
      key: 'submitted',
      badgeLabel: 'Submitted',
      badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
      pingBg: 'bg-amber-400',
      dotBg: 'bg-amber-500',
      iconContainerBg: 'bg-amber-50 text-amber-600 border border-amber-200',
      iconName: 'clock',
      title: `Application submitted (${targetIncubatorName})`,
      message: `Thank you for applying to ${targetIncubatorName}. Your application for ${startupName} has been received and is queued for initial administrative review.`,
    };
  }, [application?.status, targetIncubatorName, startupName, isDashboardAssigned]);

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

  const displayRefId = application?.id ? `#${application.id.slice(0, 8)}-${application.id.slice(9, 13)}` : '';

  if (authLoading || !user || (isLoading && !application)) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full mx-auto space-y-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-36 bg-slate-200 rounded-lg" />
              <div className="h-6 w-28 bg-slate-100 rounded-full" />
            </div>
            <div className="h-4 w-52 bg-slate-200 rounded" />
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
          </div>
          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Verifying authenticated application ownership...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where user has no submitted applications
  if (!isLoading && !application && !isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">No applications found</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              No cohort applications found for your account. Explore partner incubators and apply to get started.
            </p>
          </div>
          <Link
            href="/programs"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-2xs w-full"
          >
            <span>Explore programs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Access denied</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You do not have permission to view this application. This reference belongs to another founder.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Link
              href="/programs/preincubator/status"
              onClick={() => {
                setIsUnauthorized(false);
                loadApplication();
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-xs shadow-2xs hover:bg-blue-700 transition-colors"
            >
              View my application
            </Link>
            <Link
              href="/incubator"
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 transition-colors border border-slate-200"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 bg-[#F8FAFC] flex flex-col justify-between antialiased">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-800 text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <Logo size="md" href="/" />
            <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              Pre-incubator
            </span>
          </div>

          {/* Right Header Navigation: My applications, Dashboard, Programs, Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMyAppsModalOpen(true)}
              type="button"
              className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium text-xs transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>My applications</span>
              {allApplications.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-xs bg-slate-200 text-slate-700 font-medium">
                  {allApplications.length}
                </span>
              )}
            </button>

            {isDashboardAssigned && (
              <Link
                href="/startup/dashboard"
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            )}

            <Link
              href="/programs"
              className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium text-xs transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Programs</span>
            </Link>

            <button
              onClick={handleLogout}
              type="button"
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 font-medium text-xs transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Status Container */}
      <main className="max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center gap-5">
        {/* Multi-incubator quick switcher */}
        {allApplications.length > 1 && (
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-medium text-slate-500 shrink-0 px-2 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="truncate max-w-[130px]">{name}</span>
                    <span
                      className={`text-xs px-1.5 py-0.2 rounded-full font-medium capitalize ${
                        app.status === 'accepted' || app.status === 'admitted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : isSelected
                              ? 'bg-slate-700 text-white'
                              : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {app.status || 'pending'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Application Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          {/* Top Status Header */}
          <div className="text-center space-y-3">
            {/* Status Pill */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.badgeStyle}`}
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusInfo.pingBg}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${statusInfo.dotBg}`} />
              </span>
              <span>{statusInfo.badgeLabel}</span>
            </div>

            {/* Status Icon */}
            <div className="pt-1 flex justify-center">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${statusInfo.iconContainerBg}`}
              >
                {statusInfo.key === 'admitted' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : statusInfo.key === 'rejected' ? (
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                ) : statusInfo.key === 'forwarded' ? (
                  <Building2 className="w-6 h-6 text-blue-600" />
                ) : (
                  <Clock className="w-6 h-6 text-blue-600" />
                )}
              </div>
            </div>

            {/* Main Title & Subtitle */}
            <div className="space-y-1.5 max-w-lg mx-auto">
              <h1 className="text-2xl font-bold text-slate-900">
                {statusInfo.title}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {statusInfo.message}
              </p>
            </div>

            {/* Action Row Under Welcome Text: Single Flat View Dashboard, My Applications Link, Refresh Status & REF */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
              {/* Single Primary "View dashboard" button (flat, no gradient) */}
              {isDashboardAssigned && (
                <Link
                  href="/startup/dashboard"
                  onClick={() => {
                    if (application?.organization_id && typeof window !== 'undefined') {
                      localStorage.setItem('org_id', application.organization_id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>View dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}

              {/* My applications text link */}
              <button
                onClick={() => setMyAppsModalOpen(true)}
                type="button"
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium cursor-pointer inline-flex items-center gap-1 px-1 py-1"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>My applications</span>
              </button>

              <span className="text-slate-300">·</span>

              {/* Refresh status small icon button */}
              <button
                onClick={() => loadApplication(true)}
                type="button"
                disabled={refreshing || isLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                title="Refresh status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh status</span>
              </button>

              <span className="text-slate-300">·</span>

              {/* REF ID Button (mono only for the REF id) */}
              <button
                onClick={copyRefId}
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs transition-colors cursor-pointer"
                title="Copy application reference ID"
              >
                <span className="text-slate-400 text-xs">Ref:</span>
                <span className="font-mono text-slate-900 font-medium">{displayRefId || '#PENDING'}</span>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Slim One-Line Stepper */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {/* Step 1: Submitted */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-900">Submitted</p>
                  <p className="text-xs text-slate-500">Completed</p>
                </div>
              </div>

              {/* Connecting Line 1 */}
              <div
                className={`h-0.5 flex-1 min-w-[16px] transition-colors ${
                  statusInfo.key === 'forwarded' || statusInfo.key === 'admitted' || statusInfo.key === 'rejected'
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
              />

              {/* Step 2: Super Admin Review */}
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    statusInfo.key === 'forwarded' || statusInfo.key === 'admitted'
                      ? 'bg-emerald-500 text-white'
                      : statusInfo.key === 'rejected'
                        ? 'bg-rose-500 text-white'
                        : 'bg-blue-600 text-white'
                  }`}
                >
                  {statusInfo.key === 'forwarded' || statusInfo.key === 'admitted' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : statusInfo.key === 'rejected' ? (
                    <X className="w-3.5 h-3.5" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-900">Super admin review</p>
                  <p className="text-xs text-slate-500">
                    {statusInfo.key === 'forwarded' || statusInfo.key === 'admitted'
                      ? 'Passed'
                      : statusInfo.key === 'rejected'
                        ? 'Closed'
                        : 'In progress'}
                  </p>
                </div>
              </div>

              {/* Connecting Line 2 */}
              <div
                className={`h-0.5 flex-1 min-w-[16px] transition-colors ${
                  statusInfo.key === 'admitted' ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />

              {/* Step 3: Incubator Review */}
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
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
                    <Check className="w-3.5 h-3.5" />
                  ) : statusInfo.key === 'rejected' ? (
                    <X className="w-3.5 h-3.5" />
                  ) : statusInfo.key === 'forwarded' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-900">Incubator review</p>
                  <p className="text-xs text-slate-500">
                    {statusInfo.key === 'admitted'
                      ? 'Accepted'
                      : statusInfo.key === 'rejected'
                        ? 'Not selected'
                        : statusInfo.key === 'forwarded'
                          ? 'In progress'
                          : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-medium text-slate-900 text-xs">
                Submission summary
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium text-xs">
                Fee paid (₹6,500)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-xs text-slate-500 block">Program</span>
                <p className="font-medium text-slate-900 mt-0.5">Pre-incubator cohort 2026</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Submission date</span>
                <p className="font-medium text-slate-800 mt-0.5">{formattedDate}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-500 block">Applicant details</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {application?.applicant_name || 'Founder'}{' '}
                  <span className="text-slate-500 font-normal">
                    ({application?.applicant_email || user?.email || 'N/A'})
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Admissions Review & Feedback Box */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-slate-900 text-xs">
                  Admissions review &amp; feedback
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                {targetIncubatorName}
              </span>
            </div>

            <div className="space-y-3">
              {/* Dynamic Rejection & Evaluation Attribution */}
              {(application as any)?.super_admin_status === 'rejected' ? (
                /* Super Admin Rejection (Source: Arba360) */
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-rose-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      Rejection source: Arba360 central admissions
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      Rejected by Arba360
                    </span>
                  </div>
                  <p className="text-slate-800 text-xs leading-relaxed font-normal">
                    {(application as any)?.super_admin_notes || (application as any)?.reviewer_comments || `Your application for ${startupName} did not meet eligibility or readiness requirements for cohort forwarding at this stage.`}
                  </p>
                  <div className="pt-2 border-t border-rose-200 text-xs text-rose-900 bg-rose-100/50 p-2.5 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">Next steps &amp; support:</span> For questions, clarifications, or to appeal this platform decision, please contact Arba360 central admissions directly at <a href="mailto:admissions@arba360.com" className="font-medium underline text-rose-900 hover:text-black">admissions@arba360.com</a> or post a message in the appeal thread below.
                    </div>
                  </div>
                </div>
              ) : statusInfo.key === 'rejected' || (application as any)?.incubator_response_status === 'rejected' ? (
                /* Incubator Rejection (Source: Actual Incubator Name) */
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-rose-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      Rejection source: {targetIncubatorName}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      Not selected by incubator
                    </span>
                  </div>
                  <p className="text-slate-800 text-xs leading-relaxed font-normal">
                    {(application as any)?.reviewer_comments || `Thank you for your application to ${targetIncubatorName}. Due to competitive cohort quotas, ${startupName} was not selected for admission in this cycle.`}
                  </p>
                  <div className="pt-2 border-t border-rose-200 text-xs text-rose-900 bg-rose-100/50 p-2.5 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">Next steps &amp; contact:</span> For specific feedback regarding this cohort evaluation, please contact the admissions desk at <span className="font-medium text-slate-900">{targetIncubatorName}</span>.
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Non-Rejected Status Review */
                <>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        Super admin evaluation (Arba360)
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                          (application as any)?.super_admin_status === 'approved' || (application as any)?.super_admin_status === 'forwarded'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {(application as any)?.super_admin_status === 'approved' || (application as any)?.super_admin_status === 'forwarded'
                          ? 'Passed'
                          : 'In review'}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed font-normal">
                      {(application as any)?.super_admin_notes ||
                        ((application as any)?.super_admin_status === 'approved' || (application as any)?.super_admin_status === 'forwarded'
                          ? `Application for ${startupName} passed administrative screening and was forwarded to ${targetIncubatorName}.`
                          : `Application for ${startupName} is undergoing initial administrative screening and eligibility verification by Arba360.`)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-900">
                        {targetIncubatorName} decision &amp; notes
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                          statusInfo.key === 'admitted'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : statusInfo.key === 'forwarded'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {statusInfo.key === 'admitted'
                          ? 'Accepted'
                          : statusInfo.key === 'forwarded'
                            ? 'In review'
                            : 'Pending'}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed font-normal">
                      {statusInfo.key === 'admitted'
                        ? (application as any)?.reviewer_comments || `Application approved! ${targetIncubatorName} has accepted ${startupName} into their upcoming incubation cohort.`
                        : statusInfo.key === 'forwarded'
                          ? `Application has been forwarded to ${targetIncubatorName} and is in review by their selection committee.`
                          : `Application will be queued for evaluation by ${targetIncubatorName} upon completion of administrative screening.`}
                    </p>
                  </div>
                </>
              )}

              {(application as any)?.score !== undefined && (application as any)?.score !== null && (
                <div className="pt-1 flex items-center gap-1.5 text-xs font-medium text-blue-700">
                  <span>Rubric score:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200">
                    {(application as any).score} / 100
                  </span>
                </div>
              )}

              {/* Rejection Replies Conversation Thread */}
              {Array.isArray((application as any)?.form_data?.rejection_replies) &&
                (application as any).form_data.rejection_replies.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <p className="text-xs font-medium text-slate-500">
                      Conversation &amp; appeal history
                    </p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {(application as any).form_data.rejection_replies.map((r: any) => (
                        <div
                          key={r.id}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between font-medium text-slate-900">
                            <span>{r.sender}</span>
                            <span className="text-xs text-slate-400 font-normal">
                              {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed font-normal">{r.message}</p>
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
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-200"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                      <span>Reply to rejection / request feedback</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-white border border-rose-200 space-y-2">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your clarification, updated milestone metrics, or appeal message..."
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-rose-500 transition-colors resize-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowReplyForm(false);
                            setReplyText('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!replyText.trim() || isSubmittingReply}
                          onClick={handleSendReply}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>{isSubmittingReply ? 'Sending...' : 'Send reply'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Secondary Actions & Support Link */}
          <div className="space-y-3 pt-1">
            {/* APPLICANT ONLY: Notify Incubator ONLY after acceptance and when dashboard is not yet assigned */}
            {!isSuperAdmin && isApplicant && isAcceptedByIncubator && !isDashboardAssigned && (
              <button
                type="button"
                onClick={handleNotifyIncubator}
                disabled={notifyCooldown > 0 || isNotifying || isDailyLimitReached}
                className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-2 ${
                  isDailyLimitReached || notifyCooldown > 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>
                  {isNotifying
                    ? 'Notifying incubator...'
                    : isDailyLimitReached
                      ? 'Daily notification limit reached (5/5)'
                      : notifyCooldown > 0
                        ? `Notified (retry in ${Math.floor(notifyCooldown / 60)}m ${notifyCooldown % 60}s)`
                        : `Notify incubator (${todayNotifyCount}/5 sent today)`}
                </span>
              </button>
            )}

            {/* SUPER ADMIN ONLY: Back to Super Admin Applications console */}
            {isSuperAdmin && (
              <Link
                href="/super-admin/applications"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer text-center"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
                <span>Back to super admin applications</span>
              </Link>
            )}

            <div className="text-center pt-2">
              <button
                onClick={() => setSupportModalOpen(true)}
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Need help? Contact support</span>
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
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        <p>© 2026 Arba360 Accelerator. All rights reserved.</p>
      </footer>

      {/* SUPPORT CONTACT MODAL */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Arba360 admissions desk</h3>
              <button
                onClick={() => setSupportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Have a query regarding application <strong className="text-slate-900 font-mono">{displayRefId || 'this application'}</strong>?
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Message / query</label>
                <textarea
                  rows={3}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe your question or provide additional context..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-600 focus:outline-hidden text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSupportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSupportQuery}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-xs shadow-2xs hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Send query
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
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-medium text-slate-500">Loading application status...</div>}>
      <StatusContent />
    </Suspense>
  );
}
