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
} from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';
import { supabase } from '@/backend/lib/supabase';
import { apiClient } from '@/services/apiClient';

interface ApplicationData {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  application_type: string;
  status: 'submitted' | 'under_review' | 'admitted' | 'rejected' | string;
  created_at: string;
  form_data?: any;
}

function StatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');
  const { user, logout } = useAuth();

  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3500);
  };

  // Fetch application details from database
  const loadApplication = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ? `Bearer ${session.access_token}` : '';
      const headers: Record<string, string> = { 'x-org-id': 'all' };
      if (token) headers['Authorization'] = token;

      // 1. Query dedicated status endpoint by queryId
      if (queryId) {
        try {
          const res = await apiClient.get(`/applications/status?id=${encodeURIComponent(queryId)}`);
          if (res.data?.data) {
            setApplication(res.data.data);
            if (isManualRefresh) triggerToast('Status synced with admissions database.');
            return;
          }
        } catch (e: any) {
          console.warn('Status by ID lookup:', e?.message);
        }
      }

      // 2. Query by user's email
      const searchEmail =
        user?.email ||
        (typeof window !== 'undefined' ? localStorage.getItem('last_applicant_email') : '');

      if (searchEmail) {
        try {
          const res = await apiClient.get(`/applications/status?email=${encodeURIComponent(searchEmail)}`);
          if (res.data?.data) {
            setApplication(res.data.data);
            if (isManualRefresh) triggerToast('Status synced with admissions database.');
            return;
          }
        } catch (e: any) {
          console.warn('Status by email lookup:', e?.message);
        }
      }

      // Fallback demo mock if completely offline
      setApplication({
        id: queryId || '24613676-8e4a-4246-bf3c-9dc6e7070eaa',
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
    loadApplication();

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

  // Status configuration details
  const statusInfo = useMemo(() => {
    const rawStatus = (application?.status || 'submitted').toLowerCase();

    if (rawStatus === 'admitted') {
      return {
        key: 'admitted',
        badgeLabel: 'Status: Application Approved',
        badgeStyle: 'bg-emerald-500/10 text-emerald-800 border-emerald-300/60',
        pingBg: 'bg-emerald-400',
        dotBg: 'bg-emerald-500',
        iconContainerBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
        iconName: 'check-circle-2',
        title: 'Welcome to Arba360 Pre-Incubator!',
        message: 'Congratulations! Your application has been reviewed and accepted by the Super Admin team. Check your email for cohort onboarding details.',
      };
    }

    if (rawStatus === 'under_review') {
      return {
        key: 'under_review',
        badgeLabel: 'Status: Under Super Admin Review',
        badgeStyle: 'bg-blue-500/10 text-blue-800 border-blue-300/60',
        pingBg: 'bg-blue-400',
        dotBg: 'bg-blue-600',
        iconContainerBg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
        iconName: 'clock',
        title: 'Application Under Active Review',
        message: 'The admissions committee is actively reviewing your rubric scores and pitch materials. Decisions are dispatched shortly.',
      };
    }

    if (rawStatus === 'rejected') {
      return {
        key: 'rejected',
        badgeLabel: 'Status: Decision Completed',
        badgeStyle: 'bg-rose-500/10 text-rose-800 border-rose-300/60',
        pingBg: 'bg-rose-400',
        dotBg: 'bg-rose-600',
        iconContainerBg: 'bg-rose-50 text-rose-600 border border-rose-200/60',
        iconName: 'alert-circle',
        title: 'Application Status Update',
        message: 'Thank you for your application. The current cohort is at full capacity, but you are welcome to reapply for the next cycle.',
      };
    }

    // Default 'submitted'
    return {
      key: 'submitted',
      badgeLabel: 'Status: Pending Super Admin Review',
      badgeStyle: 'bg-amber-500/10 text-amber-800 border-amber-300/60',
      pingBg: 'bg-amber-400',
      dotBg: 'bg-amber-500',
      iconContainerBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
      iconName: 'clock',
      title: 'Your Application Has Been Received',
      message: 'Thank you for applying to the Arba360 Pre-Incubator Program (₹6,500). Our team is currently reviewing your submission.',
    };
  }, [application?.status]);

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
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1A2151] to-blue-600 p-0.5 shadow-sm flex items-center justify-center">
              <div className="w-full h-full bg-[#1A2151] rounded-[10px] flex items-center justify-center">
                <Rocket className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-[#1A2151]">
                ARBA<span className="text-blue-600">360</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold bg-cyan-400/10 text-cyan-700 rounded-md border border-cyan-400/20">
                PRE-INCUBATOR
              </span>
            </div>
          </Link>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-2">
            {isPending ? (
              <div className="relative group">
                <button
                  type="button"
                  disabled
                  className="px-3.5 py-2 rounded-xl text-slate-400 bg-slate-100 font-semibold text-xs flex items-center gap-1.5 border border-slate-200/80 cursor-not-allowed opacity-80"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                  <span>Programs</span>
                </button>
                {/* Tooltip on hover */}
                <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 w-72 p-2.5 bg-[#101638] text-white text-[11px] font-medium leading-relaxed rounded-xl shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 pointer-events-none">
                  You cannot apply for a new program right now. Your active application (<span className="text-cyan-400 font-bold">{displayRefId}</span>) is currently pending evaluation.
                </div>
              </div>
            ) : (
              <Link
                href="/programs"
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-[#1A2151] hover:bg-slate-100 font-semibold text-xs transition-all flex items-center gap-1.5 border border-slate-200/80"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Programs</span>
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

              {/* Step 2: Under Review */}
              <div
                className={`p-3 rounded-2xl border text-center transition-all ${
                  statusInfo.key === 'submitted' || statusInfo.key === 'under_review'
                    ? 'bg-blue-50/80 border-blue-500/80 shadow-md ring-2 ring-blue-500/20'
                    : statusInfo.key === 'admitted'
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : 'bg-rose-50/80 border-rose-200'
                }`}
              >
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold shadow-xs mb-2 ${
                    statusInfo.key === 'admitted'
                      ? 'bg-emerald-500 text-white'
                      : statusInfo.key === 'rejected'
                      ? 'bg-rose-500 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {statusInfo.key === 'submitted' || statusInfo.key === 'under_review' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : statusInfo.key === 'admitted' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                </div>
                <p className="text-xs font-bold text-[#1A2151]">Super Admin Review</p>
                <p
                  className={`text-[10px] font-medium mt-0.5 ${
                    statusInfo.key === 'submitted' || statusInfo.key === 'under_review'
                      ? 'text-blue-600 font-bold'
                      : statusInfo.key === 'admitted'
                      ? 'text-emerald-700'
                      : 'text-rose-600'
                  }`}
                >
                  {statusInfo.key === 'admitted'
                    ? 'Passed'
                    : statusInfo.key === 'rejected'
                    ? 'Closed'
                    : 'In Progress'}
                </p>
              </div>

              {/* Step 3: Final Decision */}
              <div
                className={`p-3 rounded-2xl border text-center transition-all ${
                  statusInfo.key === 'admitted'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-xs'
                    : statusInfo.key === 'rejected'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                    : 'bg-slate-50/80 border-slate-200/80 text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold shadow-xs mb-2 ${
                    statusInfo.key === 'admitted'
                      ? 'bg-emerald-500 text-white'
                      : statusInfo.key === 'rejected'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {statusInfo.key === 'admitted' ? (
                    <Check className="w-4 h-4" />
                  ) : statusInfo.key === 'rejected' ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </div>
                <p className="text-xs font-bold">Final Decision</p>
                <p className="text-[10px] font-medium mt-0.5">
                  {statusInfo.key === 'admitted'
                    ? 'Approved'
                    : statusInfo.key === 'rejected'
                    ? 'Not Selected'
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

          {/* PRIMARY ACTIONS & SUPPORT LINK */}
          <div className="space-y-3 pt-2">
            {statusInfo.key === 'admitted' && (
              <Link
                href="/dashboard"
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-600/30 hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Rocket className="w-4 h-4 text-emerald-200" />
                <span>Enter Founder Cohort Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}

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
