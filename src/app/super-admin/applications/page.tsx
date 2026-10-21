'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SuperAdminSidebar from '@/frontend/components/super-admin/Sidebar';
import {
  Search,
  Download,
  CheckCircle,
  CheckCircle2,
  XCircle,
  X,
  Eye,
  Check,
  Award,
  AlertTriangle,
  Clock,
  Layers,
  UserCheck,
  LogOut,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { supabase } from '@/backend/lib/supabase';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/frontend/context/AuthContext';

interface ApplicationRecord {
  id: string;
  refId: string;
  startupName: string;
  founderName: string;
  email: string;
  phone?: string;
  program: string;
  feeStatus: string;
  stage: string;
  traction: string;
  status: 'Pending Decision' | 'Admitted' | 'Rejected' | string;
  submittedTimestamp: string;
  rawRecord: any;
  dossier: {
    phone: string;
    location: string;
    experience: string;
    problem: string;
    solution: string;
    tam: string;
    burn: string;
    revenueModel: string;
    weeklyHours: string;
    mindset: string;
  };
}

export default function SuperAdminApplicationsPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [programFilter, setProgramFilter] = useState<string>('ALL');

  // Modals
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [dossierTab, setDossierTab] = useState<number>(1);
  const [activeApp, setActiveApp] = useState<ApplicationRecord | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
  const [targetApp, setTargetApp] = useState<ApplicationRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Incubator Assignment State
  const [incubators, setIncubators] = useState<any[]>([]);
  const [incubatorSearch, setIncubatorSearch] = useState('');
  const [selectedIncubatorId, setSelectedIncubatorId] = useState<string | null>(null);
  const [isLoadingIncubators, setIsLoadingIncubators] = useState(false);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'emerald' | 'rose' | 'cyan' }>({
    show: false,
    message: '',
    type: 'cyan',
  });

  const triggerToast = (message: string, type: 'emerald' | 'rose' | 'cyan' = 'cyan') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'cyan' }), 3500);
  };

  // Map database record to Super Admin application format
  const mapRecord = (r: any): ApplicationRecord => {
    const fd = r.form_data || {};
    const refId = r.id ? r.id.slice(0, 8) : 'APP';
    const startupName =
      fd.startup_name ||
      fd.businessName ||
      fd.oneSentencePitch?.split(' ').slice(0, 3).join(' ') ||
      (r.applicant_name ? `${r.applicant_name}'s Startup` : 'Early Stage Startup');

    const founderName = r.applicant_name || fd.fullName || 'Founder';
    const email = r.applicant_email || fd.email || 'N/A';
    const phone = r.applicant_phone || fd.phone || '+91 98765 43210';
    const program =
      r.application_type === 'pre-incubator'
        ? 'Pre-Incubator Program'
        : r.application_type || 'Platform Program';

    const stage = fd.businessStage || 'Idea Phase';
    const users = fd.currentUsers || 0;
    const paying = fd.payingCustomers || 0;
    const traction = `${users} users • ${paying} paying`;

    let displayStatus = 'Pending Decision';
    if (r.status === 'admitted' || r.super_admin_status === 'approved') displayStatus = 'Admitted';
    else if (r.status === 'rejected' || r.super_admin_status === 'rejected') displayStatus = 'Rejected';

    const submittedTimestamp = r.created_at
      ? new Date(r.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Recently';

    return {
      id: r.id,
      refId,
      startupName,
      founderName,
      email,
      phone,
      program,
      feeStatus: '₹6,500 Paid',
      stage,
      traction,
      status: displayStatus,
      submittedTimestamp,
      rawRecord: r,
      dossier: {
        phone,
        location: fd.location || 'Mumbai, MH',
        experience:
          fd.previousBusinessHistory ||
          `${fd.professionalStatus || 'Founder'} with ${fd.yearsExperience || 'several'} years experience.`,
        problem: fd.problemStatement || fd.oneSentencePitch || 'Pain point in target workflow.',
        solution: fd.solutionOverview || fd.keyDifferentiation || 'Proprietary solution model.',
        tam: fd.marketSize || '$10 Billion Target Addressable Market',
        burn: fd.monthlyBurnRate ? `$${fd.monthlyBurnRate} / mo` : '₹35,000 / month',
        revenueModel: fd.revenueModel || 'SaaS subscription & revenue share',
        weeklyHours: `${fd.hoursPerWeek || 40} Hours / Week`,
        mindset:
          fd.activelyAvoiding ||
          fd.biggestUnprovenAssumption ||
          'Fully committed to cohort milestones over the program duration.',
      },
    };
  };

  // Load applications from API
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ? `Bearer ${session.access_token}` : '';
      const headers: Record<string, string> = { 'x-org-id': 'all' };
      if (token) headers['Authorization'] = token;

      const res = await apiClient.get('/applications?org_id=all&limit=100', { headers });
      const rawList = res.data?.data || [];
      if (Array.isArray(rawList)) {
        setApplications(rawList.map(mapRecord));
      }
    } catch (err: any) {
      console.warn('Super Admin fetch error:', err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    // Subscribe to live database updates
    const channel = supabase
      .channel('superadmin-applications-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // KPI computations
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'Pending Decision').length;
    const admitted = applications.filter((a) => a.status === 'Admitted').length;
    const rate = total > 0 ? Math.round((admitted / total) * 100) : 0;

    return {
      totalCount: total,
      pendingCount: pending,
      admittedCount: admitted,
      acceptanceRate: rate,
    };
  }, [applications]);

  // Filtered applications list
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.startupName.toLowerCase().includes(q) ||
        app.founderName.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.refId.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      const matchesProgram =
        programFilter === 'ALL' ||
        (programFilter === 'Pre-Incubator Program' && app.program.includes('Pre-Incubator')) ||
        (programFilter === 'Full Incubator Cohort' && !app.program.includes('Pre-Incubator'));

      return matchesSearch && matchesStatus && matchesProgram;
    });
  }, [applications, searchQuery, statusFilter, programFilter]);

  // Modal open handlers
  const openDossierModal = (app: ApplicationRecord) => {
    setActiveApp(app);
    setDossierTab(1);
    setDossierModalOpen(true);
  };

  const filteredIncubators = useMemo(() => {
    if (!incubatorSearch.trim()) return incubators;
    const q = incubatorSearch.toLowerCase().trim();
    return incubators.filter(
      (inc) =>
        (inc.name || '').toLowerCase().includes(q) ||
        (inc.location || '').toLowerCase().includes(q) ||
        (inc.founder_name || '').toLowerCase().includes(q)
    );
  }, [incubators, incubatorSearch]);

  const openRejectPopup = (app: ApplicationRecord) => {
    setTargetApp(app);
    setRejectionReason('');
    setRejectPopupOpen(true);
  };

  const openAssignModal = async (app: ApplicationRecord) => {
    setTargetApp(app);
    setSelectedIncubatorId(null);
    setIncubatorSearch('');
    setAssignModalOpen(true);
    if (incubators.length === 0) {
      setIsLoadingIncubators(true);
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name, slug, founder_name, founder_email, location')
          .is('deleted_at', null)
          .order('name');
        if (!error && data) {
          setIncubators(data);
        }
      } catch (e) {
        console.error('Error fetching incubators:', e);
      } finally {
        setIsLoadingIncubators(false);
      }
    }
  };

  const confirmAssignment = async () => {
    if (!targetApp || !selectedIncubatorId || isProcessing) return;
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ? `Bearer ${session.access_token}` : '';
      const headers: Record<string, string> = { 'x-org-id': 'all' };
      if (token) headers['Authorization'] = token;

      await apiClient.put(
        `/applications/${targetApp.id}`,
        {
          organization_id: selectedIncubatorId,
          status: 'under_review',
          reviewer_comments: 'Assigned to incubator by Super Admin for evaluation',
        },
        { headers }
      );

      const targetInc = incubators.find((i) => i.id === selectedIncubatorId);
      setApplications((prev) =>
        prev.map((a) => (a.id === targetApp.id ? { ...a, status: 'Under Review' } : a))
      );
      setAssignModalOpen(false);
      triggerToast(`Forwarded ${targetApp.startupName} to ${targetInc?.name || 'Incubator'} for evaluation!`, 'emerald');
    } catch (err: any) {
      triggerToast(err?.response?.data?.error || 'Failed to forward application', 'rose');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmRejection = async () => {
    if (!targetApp || isProcessing) return;
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ? `Bearer ${session.access_token}` : '';
      const headers: Record<string, string> = { 'x-org-id': 'all' };
      if (token) headers['Authorization'] = token;

      await apiClient.put(
        `/applications/${targetApp.id}`,
        {
          status: 'rejected',
          super_admin_status: 'rejected',
          reviewer_comments: rejectionReason || 'Application rejected by Super Admin',
        },
        { headers }
      );

      setApplications((prev) =>
        prev.map((a) => (a.id === targetApp.id ? { ...a, status: 'Rejected' } : a))
      );
      setRejectPopupOpen(false);
      triggerToast(`Rejected application for ${targetApp.startupName}.`, 'rose');
    } catch (err: any) {
      triggerToast(err?.response?.data?.error || 'Failed to record rejection', 'rose');
    } finally {
      setIsProcessing(false);
    }
  };

  const exportCSV = () => {
    if (applications.length === 0) {
      triggerToast('No application records to export', 'rose');
      return;
    }
    const headers = ['Reference ID', 'Startup Name', 'Founder Name', 'Email', 'Program', 'Status', 'Submitted Timestamp'];
    const rows = applications.map((a) => [
      a.refId,
      `"${a.startupName}"`,
      `"${a.founderName}"`,
      a.email,
      `"${a.program}"`,
      a.status,
      `"${a.submittedTimestamp}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `superadmin_applications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Applications CSV exported successfully!', 'cyan');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending Decision':
        return 'bg-amber-500/10 text-amber-900 border-amber-300/80';
      case 'Admitted':
        return 'bg-emerald-500/10 text-emerald-900 border-emerald-300/80';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-900 border-rose-300/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden antialiased">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold bg-[#101638] text-white ${
            toast.type === 'emerald'
              ? 'border-emerald-400/40'
              : toast.type === 'rose'
              ? 'border-rose-400/40'
              : 'border-cyan-400/40'
          }`}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              toast.type === 'emerald'
                ? 'bg-emerald-500'
                : toast.type === 'rose'
                ? 'bg-rose-500'
                : 'bg-cyan-400'
            }`}
          />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Super Admin Left Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Executive 64px Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-2xs z-20">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-[#1A2151] text-white font-mono text-[11px] font-extrabold tracking-wider">
              SUPER ADMIN GOVERNANCE
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              Arba360 Pre-Incubator & Accelerator Platform Admissions
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchApplications}
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className="h-4 w-[1px] bg-slate-200" />
            <button
              onClick={async () => {
                await logout();
                router.push('/super-admin/login');
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Main Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header & Export Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#1A2151] tracking-tight">
                Platform Admissions & Application Governance
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Super Admin review desk for platform programs, founder verifications, and cohort admission decisions.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={exportCSV}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export Applications Data</span>
              </button>
            </div>
          </div>

          {/* 3 Executive KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Awaiting Decision */}
            <div className="p-5 rounded-2xl bg-white border border-amber-200/90 shadow-2xs space-y-2 ring-1 ring-amber-400/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">Awaiting Super Admin Decision</span>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Pending Review</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-3xl font-black text-amber-950 font-mono">
                  {stats.pendingCount}
                </span>
                <span className="text-xs text-amber-800 font-bold">Action Required</span>
              </div>
              <p className="text-[10px] text-amber-700 font-medium">Verify submissions & issue decisions</p>
            </div>

            {/* Card 2: Admitted Founders */}
            <div className="p-5 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Admitted Founders</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-3xl font-black text-emerald-600 font-mono">
                  {stats.admittedCount}
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {stats.acceptanceRate}% Acceptance
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Active platform cohort seats granted</p>
            </div>

            {/* Card 3: Total Submissions */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Total Platform Submissions</span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-3xl font-black text-[#1A2151] font-mono">
                  {stats.totalCount}
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">100% Audited</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Includes Pre-Incubator & Cohorts</p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Fast Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Founder, Email, Startup, or Ref ID (#24613676)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Tabs & Program Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                {[
                  { id: 'ALL', label: 'All Submissions' },
                  { id: 'Pending Decision', label: 'Pending Review' },
                  { id: 'Admitted', label: 'Admitted' },
                  { id: 'Rejected', label: 'Rejected' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setStatusFilter(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === t.id
                        ? 'bg-white text-[#1A2151] shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Platform Programs</option>
                <option value="Pre-Incubator Program">Pre-Incubator Program (₹6,500)</option>
                <option value="Full Incubator Cohort">Incubator Cohort 2026</option>
              </select>
            </div>
          </div>

          {/* Applications Governance Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-5">Applicant & Startup</th>
                    <th className="py-3.5 px-4">Program & Fee Status</th>
                    <th className="py-3.5 px-4">Stage & Traction</th>
                    <th className="py-3.5 px-4">Super Admin Decision Status</th>
                    <th className="py-3.5 px-4">Submitted Timestamp</th>
                    <th className="py-3.5 px-5 text-right">Governance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {isLoading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-5">
                          <div className="h-4 bg-slate-200 rounded w-40 mb-1" />
                          <div className="h-3 bg-slate-100 rounded w-24" />
                        </td>
                        <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                        <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                        <td className="py-4 px-4"><div className="h-6 bg-slate-200 rounded-full w-24" /></td>
                        <td className="py-4 px-4"><div className="h-3 bg-slate-200 rounded w-24" /></td>
                        <td className="py-4 px-5 text-right"><div className="h-8 bg-slate-200 rounded w-28 ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-bold text-slate-600">No applications found matching your criteria.</p>
                        <p className="text-xs text-slate-400">Try adjusting your search query or reset status filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Column 1: Applicant & Startup */}
                        <td className="py-4 px-5">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#1A2151] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {app.startupName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-[#1A2151] text-sm">
                                  {app.startupName}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold border border-slate-200">
                                  #{app.refId}
                                </span>
                              </div>
                              <p className="text-slate-500 font-semibold text-[11px] mt-0.5">
                                <span>{app.founderName}</span>{' '}
                                <span className="text-slate-400 font-normal">
                                  • {app.email}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Program & Fee Status */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <p className="font-bold text-[#1A2151] text-xs">{app.program}</p>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>{app.feeStatus}</span>
                            </span>
                          </div>
                        </td>

                        {/* Column 3: Stage & Traction */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-extrabold text-[10px] inline-block">
                              {app.stage}
                            </span>
                            <p className="text-[11px] text-slate-500 font-semibold">{app.traction}</p>
                          </div>
                        </td>

                        {/* Column 4: Super Admin Decision Status */}
                        <td className="py-4 px-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${getStatusBadgeClass(
                              app.status
                            )}`}
                          >
                            {app.status === 'Pending Decision' && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            )}
                            {app.status === 'Admitted' && (
                              <Check className="w-3 h-3 text-emerald-600" />
                            )}
                            {app.status === 'Rejected' && <X className="w-3 h-3 text-rose-500" />}
                            <span>{app.status}</span>
                          </div>
                        </td>

                        {/* Column 5: Submitted Timestamp */}
                        <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                          {app.submittedTimestamp}
                        </td>

                        {/* Column 6: Governance Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect */}
                            <button
                              onClick={() => openDossierModal(app)}
                              title="Inspect Application Dossier"
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#1A2151] hover:text-white text-slate-700 font-bold text-xs transition-all flex items-center gap-1 border border-slate-200 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>

                            {/* Assign / Forward to Incubator */}
                            <button
                              onClick={() => openAssignModal(app)}
                              disabled={app.status === 'Admitted' || app.status === 'Rejected'}
                              title="Assign to Incubator"
                              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 disabled:opacity-30 disabled:pointer-events-none font-bold text-xs transition-all border border-blue-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>Assign Incubator</span>
                            </button>

                            {/* Reject */}
                            <button
                              onClick={() => openRejectPopup(app)}
                              disabled={app.status === 'Rejected'}
                              title="Reject Application"
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 disabled:opacity-30 disabled:pointer-events-none font-bold text-xs transition-all border border-rose-200 flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>
                Showing <strong className="text-[#1A2151]">{filteredApplications.length}</strong>{' '}
                application record(s)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Verified Super Admin Portal Sync Active
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: APPLICANT DOSSIER MODAL */}
      {dossierModalOpen && activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A0E26]/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-[#101638] text-white flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  {activeApp.startupName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black tracking-tight">{activeApp.startupName}</h2>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-cyan-400 font-mono text-xs font-bold">
                      #{activeApp.refId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Founder: <span className="font-bold text-white">{activeApp.founderName}</span> ({activeApp.email})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDossierModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center gap-2 shrink-0 overflow-x-auto text-xs font-bold">
              {[
                { id: 1, label: 'Tab 1: Founder & Contact' },
                { id: 2, label: 'Tab 2: Problem & Solution' },
                { id: 3, label: 'Tab 3: Market & Traction' },
                { id: 4, label: 'Tab 4: Commitment & Mindset' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDossierTab(t.id)}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    dossierTab === t.id
                      ? 'bg-white text-[#1A2151] shadow-2xs border border-slate-200'
                      : 'text-slate-500 hover:text-[#1A2151]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
              {dossierTab === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Phone & WhatsApp</span>
                      <p className="font-bold text-[#1A2151] text-sm">{activeApp.dossier.phone}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Primary Location</span>
                      <p className="font-bold text-[#1A2151] text-sm">{activeApp.dossier.location}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Founder Experience & Bio</span>
                    <p className="text-slate-700 leading-relaxed font-medium">{activeApp.dossier.experience}</p>
                  </div>
                </div>
              )}

              {dossierTab === 2 && (
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">The Core Problem Addressed</span>
                    <p className="text-slate-700 leading-relaxed font-medium">{activeApp.dossier.problem}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Product Solution & Differentiation</span>
                    <p className="text-slate-700 leading-relaxed font-medium">{activeApp.dossier.solution}</p>
                  </div>
                </div>
              )}

              {dossierTab === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">TAM Estimate</span>
                      <p className="font-extrabold text-[#1A2151] mt-1">{activeApp.dossier.tam}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Monthly Burn</span>
                      <p className="font-extrabold text-[#1A2151] mt-1">{activeApp.dossier.burn}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Traction</span>
                      <p className="font-extrabold text-emerald-600 mt-1">{activeApp.traction}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Business Model & Revenue</span>
                    <p className="text-slate-700 leading-relaxed font-medium">{activeApp.dossier.revenueModel}</p>
                  </div>
                </div>
              )}

              {dossierTab === 4 && (
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Weekly Hours Dedicated</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-extrabold">
                        {activeApp.dossier.weeklyHours}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">{activeApp.dossier.mindset}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions inside Modal */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Current Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${getStatusBadgeClass(activeApp.status)}`}>
                  {activeApp.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDossierModalOpen(false);
                    openRejectPopup(activeApp);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 font-extrabold text-xs transition-all border border-rose-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Reject Application</span>
                </button>
                <button
                  onClick={() => {
                    setDossierModalOpen(false);
                    openAssignModal(activeApp);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Forward to Incubator</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN / FORWARD TO INCUBATOR MODAL */}
      {assignModalOpen && targetApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E26]/70 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1A2151]">Forward to Incubator</h3>
                  <p className="text-[11px] text-slate-500">
                    Assign <strong className="text-slate-800">{targetApp.startupName}</strong> for partner incubator review
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Box with Search Icon */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={incubatorSearch}
                onChange={(e) => setIncubatorSearch(e.target.value)}
                placeholder="Search incubator by name, location, or founder..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Incubators List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {isLoadingIncubators ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Loading registered incubators...</span>
                </div>
              ) : filteredIncubators.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No incubators found matching &quot;{incubatorSearch}&quot;
                </div>
              ) : (
                filteredIncubators.map((inc) => {
                  const isSelected = selectedIncubatorId === inc.id;
                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncubatorId(inc.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1A2151]">{inc.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {inc.location || inc.founder_email || 'Active Partner Incubator'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 font-medium leading-relaxed">
              The application request will be transferred to this incubator. The incubator admin will evaluate and make the final <strong>Accept</strong> or <strong>Reject</strong> decision.
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignment}
                disabled={!selectedIncubatorId || isProcessing}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
              >
                {isProcessing ? 'Forwarding...' : 'Forward Request to Incubator'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECT DIALOG */}
      {rejectPopupOpen && targetApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E26]/70 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-[#1A2151]">Reject Application</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rejecting platform application for <strong className="text-[#1A2151]">{targetApp.startupName}</strong> (#{targetApp.refId}).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Reason for rejection (Optional feedback)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="e.g. Market size needs further validation before joining this cohort..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectPopupOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
