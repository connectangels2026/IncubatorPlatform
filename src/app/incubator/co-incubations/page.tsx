'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import { DashboardLayout } from '@/frontend/components/layouts/DashboardLayout';
import Link from 'next/link';
import {
  Building2,
  Search,
  FileCheck,
  Clock,
  Layers,
  ArrowUpRight,
  Handshake,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Loader2,
  Eye,
  Check,
  X,
  Calendar,
} from 'lucide-react';
import StartupLogo from '@/frontend/components/ui/StartupLogo';
import { StartupDetailModal } from '@/frontend/components/startups/StartupDetailModal';
import { apiClient } from '@/services/apiClient';

interface CoIncubationRecord {
  id: string;
  startup_id: string;
  primary_incubator_id: string;
  co_incubator_id: string;
  status: 'pending' | 'active' | 'rejected' | 'ended';
  message?: string | null;
  reject_reason?: string | null;
  shared_scope?: string[] | null;
  requested_by?: string | null;
  decided_by?: string | null;
  requested_at?: string | null;
  decided_at?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  duration_months?: number | null;
  mou_signed?: boolean | null;
  mou_signed_date?: string | null;
  mou_type?: string | null;
  startup?: {
    id: string;
    startup_name?: string;
    name?: string;
    logo_url?: string | null;
    logo_color?: string | null;
    initials?: string | null;
    sector?: string | null;
    stage?: string | null;
  };
  primary_incubator?: {
    id: string;
    name: string;
    slug?: string;
    logo_url?: string | null;
  };
  co_incubator?: {
    id: string;
    name: string;
    slug?: string;
    logo_url?: string | null;
  };
}

interface PartnerGroup {
  partnerId: string;
  partnerName: string;
  partnerLogo?: string | null;
  mouSigned: boolean;
  mouSignedDate?: string | null;
  mouType?: string | null;
  startups: Array<{
    coIncubationId: string;
    status: 'pending' | 'active' | 'rejected' | 'ended';
    startupId: string;
    startupName: string;
    logoUrl?: string | null;
    logoColor?: string | null;
    initials?: string | null;
    sector?: string | null;
    stage?: string | null;
    sharedScope?: string[] | null;
    startDate?: string | null;
  }>;
}

export default function CoIncubationsPage() {
  const [coincubations, setCoincubations] = useState<CoIncubationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'partners' | 'requests' | 'startups'>('partners');
  const [requestSubTab, setRequestSubTab] = useState<'incoming' | 'sent'>('incoming');
  const [search, setSearch] = useState('');

  // Decline action state
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Partner Startup Drawer State (read-only with shared_scope)
  const [selectedPartnerStartup, setSelectedPartnerStartup] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loadingProfileId, setLoadingProfileId] = useState<string | null>(null);

  // Current incubator org id
  const currentOrgId = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/co-incubations', { params: { view: 'all' } });
      setCoincubations(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load co-incubations:', err);
      setCoincubations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Partition requests: Incoming (co_incubator_id === currentOrgId) vs Sent (primary_incubator_id === currentOrgId)
  const incomingRequests = useMemo(() => {
    return coincubations.filter((c) => !currentOrgId || c.co_incubator_id === currentOrgId);
  }, [coincubations, currentOrgId]);

  const sentRequests = useMemo(() => {
    return coincubations.filter((c) => currentOrgId && c.primary_incubator_id === currentOrgId);
  }, [coincubations, currentOrgId]);

  const incomingPendingCount = useMemo(() => {
    return incomingRequests.filter((c) => c.status === 'pending').length;
  }, [incomingRequests]);

  // Group by partner incubator for Partners tab
  const partnerGroups = useMemo<PartnerGroup[]>(() => {
    const groupsMap = new Map<string, PartnerGroup>();

    for (const item of coincubations) {
      const isPrimary = !currentOrgId || item.primary_incubator_id === currentOrgId;
      const partner = isPrimary ? item.co_incubator : item.primary_incubator;
      const partnerId = isPrimary ? item.co_incubator_id : item.primary_incubator_id;
      const partnerName = partner?.name || 'Partner Incubator';

      if (!groupsMap.has(partnerId)) {
        groupsMap.set(partnerId, {
          partnerId,
          partnerName,
          partnerLogo: partner?.logo_url,
          mouSigned: Boolean(item.mou_signed),
          mouSignedDate: item.mou_signed_date,
          mouType: item.mou_type || 'Standard',
          startups: [],
        });
      }

      const grp = groupsMap.get(partnerId)!;
      if (item.mou_signed) {
        grp.mouSigned = true;
        grp.mouSignedDate = item.mou_signed_date || grp.mouSignedDate;
      }

      const startupName = item.startup?.startup_name || item.startup?.name || 'Startup';
      grp.startups.push({
        coIncubationId: item.id,
        status: item.status,
        startupId: item.startup_id,
        startupName,
        logoUrl: item.startup?.logo_url,
        logoColor: item.startup?.logo_color,
        initials: item.startup?.initials,
        sector: item.startup?.sector,
        stage: item.startup?.stage,
        sharedScope: item.shared_scope,
        startDate: item.start_date,
      });
    }

    return Array.from(groupsMap.values());
  }, [coincubations, currentOrgId]);

  // Filtered partners based on search
  const filteredPartners = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return partnerGroups;
    return partnerGroups.filter((g) => {
      const matchPartner = g.partnerName.toLowerCase().includes(q);
      const matchStartup = g.startups.some((s) => s.startupName.toLowerCase().includes(q));
      return matchPartner || matchStartup;
    });
  }, [partnerGroups, search]);

  // Startups Tab Data:
  // 1. Shared with this incubator (current incubator is partner / co_incubator)
  const sharedWithUs = useMemo(() => {
    return coincubations.filter((c) => currentOrgId && c.co_incubator_id === currentOrgId);
  }, [coincubations, currentOrgId]);

  // 2. Your startups shared with partners (current incubator is primary)
  const sharedWithPartners = useMemo(() => {
    return coincubations.filter((c) => currentOrgId && c.primary_incubator_id === currentOrgId);
  }, [coincubations, currentOrgId]);

  // Actions: View Profile (limited to shared_scope)
  const handleViewProfile = async (coincId: string) => {
    try {
      setLoadingProfileId(coincId);
      const res = await apiClient.get(`/co-incubations/${coincId}/partner-startup`);
      setSelectedPartnerStartup(res.data?.data);
      setIsDrawerOpen(true);
    } catch (e: any) {
      console.error('Failed to open partner startup:', e);
      alert(e.response?.data?.error || 'Failed to load scoped startup profile');
    } finally {
      setLoadingProfileId(null);
    }
  };

  // Actions: Accept request
  const handleAcceptRequest = async (id: string) => {
    try {
      setActionInProgress(id);
      await apiClient.put(`/co-incubations/${id}/status`, { status: 'active' });
      setCoincubations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'active', start_date: new Date().toISOString() } : c))
      );
    } catch (err: any) {
      console.error('Accept error:', err);
      alert(err.response?.data?.error || 'Failed to accept request');
    } finally {
      setActionInProgress(null);
    }
  };

  // Actions: Decline request
  const handleConfirmDecline = async (id: string) => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining.');
      return;
    }
    try {
      setActionInProgress(id);
      await apiClient.put(`/co-incubations/${id}/status`, {
        status: 'rejected',
        reject_reason: declineReason.trim(),
      });
      setCoincubations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'rejected', reject_reason: declineReason.trim() } : c))
      );
      setDecliningId(null);
      setDeclineReason('');
    } catch (err: any) {
      console.error('Decline error:', err);
      alert(err.response?.data?.error || 'Failed to decline request');
    } finally {
      setActionInProgress(null);
    }
  };

  // Actions: End co-incubation
  const handleEndCoIncubation = async (id: string) => {
    if (!confirm('Are you sure you want to conclude this co-incubation program?')) return;
    try {
      setActionInProgress(id);
      await apiClient.put(`/co-incubations/${id}/status`, { status: 'ended' });
      setCoincubations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'ended' } : c))
      );
    } catch (err: any) {
      console.error('End program error:', err);
      alert(err.response?.data?.error || 'Failed to end program');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={[{ label: 'Co-incubations' }]}>
        <div className="space-y-6 w-full font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Co-incubations</h1>
              <p className="text-sm text-slate-500 mt-1">
                Cross-incubator alliances, shared facility access, and joint cohort tracks.
              </p>
            </div>
          </div>

          {/* Controls: Tabs & Search Bar */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-center">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('partners')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'partners'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Partners ({partnerGroups.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                  activeTab === 'requests'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Requests</span>
                {incomingPendingCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
                      activeTab === 'requests'
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {incomingPendingCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('startups')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'startups'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Startups ({sharedWithUs.length + sharedWithPartners.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search partner or startup..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* TAB 1: PARTNERS TAB */}
          {activeTab === 'partners' && (
            <div className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4 animate-pulse"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-200" />
                          <div className="space-y-1.5">
                            <div className="w-40 h-4 bg-slate-200 rounded" />
                            <div className="w-24 h-3 bg-slate-100 rounded" />
                          </div>
                        </div>
                        <div className="w-20 h-6 bg-slate-100 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPartners.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">No partner incubators found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {search.trim()
                      ? 'No co-incubator partner matches your search query.'
                      : "Establish an alliance by clicking 'Add co-incubator' in any startup's profile drawer under the Network tab."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredPartners.map((partner) => (
                    <div
                      key={partner.partnerId}
                      className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition-all"
                    >
                      {/* Partner Summary Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden">
                            {partner.partnerLogo ? (
                              <img
                                src={partner.partnerLogo}
                                alt={partner.partnerName}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Building2 className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                              {partner.partnerName}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Partner incubator • {partner.startups.length}{' '}
                              {partner.startups.length === 1 ? 'shared startup' : 'shared startups'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                              partner.mouSigned
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            <FileCheck
                              className={`w-3.5 h-3.5 ${
                                partner.mouSigned ? 'text-emerald-600' : 'text-slate-400'
                              }`}
                            />
                            <span>
                              {partner.mouSigned ? 'MOU signed' : 'Pending MOU'}
                              {partner.mouSignedDate ? ` • ${partner.mouSignedDate.split('T')[0]}` : ''}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Shared Startups Underneath */}
                      <div className="pt-3.5">
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2.5">
                          Shared startups
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {partner.startups.map((st) => (
                            <div
                              key={st.coIncubationId}
                              className="p-2.5 rounded-lg border border-slate-200/70 bg-slate-50/50 flex items-center justify-between gap-2.5 hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <StartupLogo
                                  name={st.startupName}
                                  logoUrl={st.logoUrl}
                                  logoColor={st.logoColor}
                                  initials={st.initials}
                                  className="w-7 h-7 text-[10px] rounded-md shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-slate-900 truncate">
                                    {st.startupName}
                                  </p>
                                  <p className="text-[11px] text-slate-500 truncate">
                                    {st.sector || st.stage || 'Startup'}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 border ${
                                  st.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : st.status === 'pending'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : st.status === 'rejected'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {st.status === 'active'
                                  ? 'Active'
                                  : st.status === 'pending'
                                  ? 'Pending'
                                  : st.status === 'rejected'
                                  ? 'Declined'
                                  : 'Ended'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {/* Sub-tabs: Incoming vs Sent */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setRequestSubTab('incoming')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      requestSubTab === 'incoming'
                        ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Incoming ({incomingRequests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestSubTab('sent')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      requestSubTab === 'sent'
                        ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sent ({sentRequests.length})
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  {requestSubTab === 'incoming'
                    ? 'Invitations from partner incubators'
                    : 'Invitations sent by your organization'}
                </span>
              </div>

              {loading ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white p-4 space-y-4 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <div className="w-48 h-4 bg-slate-200 rounded" />
                      <div className="w-20 h-6 bg-slate-100 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (requestSubTab === 'incoming' ? incomingRequests : sentRequests).length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                  <h3 className="text-sm font-semibold text-slate-800">
                    No {requestSubTab} co-incubation requests
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {requestSubTab === 'incoming'
                      ? 'No partner incubators have invited you to co-incubate startups yet.'
                      : 'You have not sent any pending requests.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                  {(requestSubTab === 'incoming' ? incomingRequests : sentRequests).map((req) => {
                    const startupName = req.startup?.startup_name || req.startup?.name || 'Startup';
                    const primaryName = req.primary_incubator?.name || 'Primary Incubator';
                    const partnerName = req.co_incubator?.name || 'Partner Incubator';
                    const scopes: string[] = Array.isArray(req.shared_scope) ? req.shared_scope : [];
                    const isIncoming = requestSubTab === 'incoming';
                    const isPending = req.status === 'pending';
                    const isDeclining = decliningId === req.id;

                    return (
                      <div key={req.id} className="p-4 space-y-3 hover:bg-slate-50/40 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <StartupLogo
                              name={startupName}
                              logoUrl={req.startup?.logo_url}
                              logoColor={req.startup?.logo_color}
                              initials={req.startup?.initials}
                              className="w-10 h-10 text-xs rounded-lg shrink-0 mt-0.5"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-semibold text-slate-900">{startupName}</h4>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs font-medium text-slate-600">
                                  {isIncoming ? `Invited by ${primaryName}` : `Partner: ${partnerName}`}
                                </span>
                              </div>

                              {req.message && (
                                <p className="text-xs text-slate-600 mt-1 italic">
                                  &ldquo;{req.message}&rdquo;
                                </p>
                              )}

                              {/* What is Shared & Date */}
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-[11px] text-slate-400">Shared:</span>
                                {scopes.length > 0 ? (
                                  scopes.map((scope) => (
                                    <span
                                      key={scope}
                                      className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 capitalize"
                                    >
                                      {scope}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[11px] text-slate-500">Standard profile</span>
                                )}

                                <span className="text-xs text-slate-300">|</span>
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {req.requested_at ? req.requested_at.split('T')[0] : 'Recent'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: View Profile & Status */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {/* "View profile" opens drawer in read-only mode showing only shared_scope */}
                            <button
                              type="button"
                              onClick={() => handleViewProfile(req.id)}
                              disabled={loadingProfileId === req.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition cursor-pointer"
                            >
                              {loadingProfileId === req.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Eye className="w-3 h-3 text-slate-500" />
                              )}
                              <span>View profile</span>
                            </button>

                            <span
                              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                                req.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : req.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : req.status === 'rejected'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {req.status === 'active'
                                ? 'Active'
                                : req.status === 'pending'
                                ? 'Pending'
                                : req.status === 'rejected'
                                ? 'Declined'
                                : 'Ended'}
                            </span>
                          </div>
                        </div>

                        {/* Rejection Reason if Declined */}
                        {req.status === 'rejected' && req.reject_reason && (
                          <div className="text-xs text-rose-600 bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                            <strong>Reason:</strong> {req.reject_reason}
                          </div>
                        )}

                        {/* Incoming Pending Footer Buttons: Accept & Decline (reason required) */}
                        {isIncoming && isPending && (
                          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            {isDeclining ? (
                              <div className="flex items-center gap-2 w-full">
                                <input
                                  type="text"
                                  placeholder="Reason for declining (required)..."
                                  value={declineReason}
                                  onChange={(e) => setDeclineReason(e.target.value)}
                                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                />
                                <button
                                  type="button"
                                  disabled={actionInProgress === req.id || !declineReason.trim()}
                                  onClick={() => handleConfirmDecline(req.id)}
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition cursor-pointer disabled:opacity-50"
                                >
                                  {actionInProgress === req.id ? 'Declining...' : 'Confirm decline'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDecliningId(null);
                                    setDeclineReason('');
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 ml-auto">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDecliningId(req.id);
                                    setDeclineReason('');
                                  }}
                                  disabled={actionInProgress === req.id}
                                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition cursor-pointer"
                                >
                                  Decline
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAcceptRequest(req.id)}
                                  disabled={actionInProgress === req.id}
                                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  {actionInProgress === req.id && <Loader2 className="w-3 h-3 animate-spin" />}
                                  <span>Accept</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STARTUPS TAB */}
          {activeTab === 'startups' && (
            <div className="space-y-6">
              {/* Section 1: Startups shared with this incubator (read-only, with "End") */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Shared with your incubator ({sharedWithUs.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Startups hosted by partner incubators and co-incubated under joint agreements.
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="p-6 bg-white rounded-xl border border-slate-200 animate-pulse text-xs text-slate-400">
                    Loading shared startups...
                  </div>
                ) : sharedWithUs.length === 0 ? (
                  <div className="p-8 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                    No partner startups currently co-incubated with your organization.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {sharedWithUs.map((co) => {
                      const stName = co.startup?.startup_name || co.startup?.name || 'Startup';
                      const primaryName = co.primary_incubator?.name || 'Primary Incubator';
                      const scopes: string[] = Array.isArray(co.shared_scope) ? co.shared_scope : [];

                      return (
                        <div
                          key={co.id}
                          className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <StartupLogo
                                name={stName}
                                logoUrl={co.startup?.logo_url}
                                logoColor={co.startup?.logo_color}
                                initials={co.startup?.initials}
                                className="w-10 h-10 text-xs rounded-lg shrink-0 mt-0.5"
                              />
                              <div>
                                <h4 className="text-xs font-semibold text-slate-900">{stName}</h4>
                                <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                                  Primary: {primaryName}
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {scopes.map((s) => (
                                    <span
                                      key={s}
                                      className="px-1.5 py-0.2 rounded text-[10px] font-normal bg-slate-100 text-slate-600 capitalize"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                                co.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : co.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : co.status === 'rejected'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {co.status}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => handleViewProfile(co.id)}
                              disabled={loadingProfileId === co.id}
                              className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium cursor-pointer"
                            >
                              {loadingProfileId === co.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                              )}
                              <span>View profile (read-only)</span>
                            </button>

                            {co.status === 'active' && (
                              <button
                                type="button"
                                onClick={() => handleEndCoIncubation(co.id)}
                                disabled={actionInProgress === co.id}
                                className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                              >
                                {actionInProgress === co.id ? 'Ending...' : 'End'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Your startups shared with partners */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Your startups shared with partners ({sharedWithPartners.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Portfolio startups from your cohort co-incubated with partner hubs.
                  </p>
                </div>

                {loading ? (
                  <div className="p-6 bg-white rounded-xl border border-slate-200 animate-pulse text-xs text-slate-400">
                    Loading your shared startups...
                  </div>
                ) : sharedWithPartners.length === 0 ? (
                  <div className="p-8 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                    None of your startups have been shared with co-incubators yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {sharedWithPartners.map((co) => {
                      const stName = co.startup?.startup_name || co.startup?.name || 'Startup';
                      const partnerName = co.co_incubator?.name || 'Partner Incubator';
                      const scopes: string[] = Array.isArray(co.shared_scope) ? co.shared_scope : [];

                      return (
                        <div
                          key={co.id}
                          className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <StartupLogo
                                name={stName}
                                logoUrl={co.startup?.logo_url}
                                logoColor={co.startup?.logo_color}
                                initials={co.startup?.initials}
                                className="w-10 h-10 text-xs rounded-lg shrink-0 mt-0.5"
                              />
                              <div>
                                <h4 className="text-xs font-semibold text-slate-900">{stName}</h4>
                                <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                                  Partner: {partnerName}
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {scopes.map((s) => (
                                    <span
                                      key={s}
                                      className="px-1.5 py-0.2 rounded text-[10px] font-normal bg-slate-100 text-slate-600 capitalize"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                                co.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : co.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : co.status === 'rejected'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {co.status}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-500">
                              {co.start_date ? `Active since ${co.start_date.split('T')[0]}` : 'Co-incubation program'}
                            </span>
                            {co.status === 'active' && (
                              <button
                                type="button"
                                onClick={() => handleEndCoIncubation(co.id)}
                                disabled={actionInProgress === co.id}
                                className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                              >
                                {actionInProgress === co.id ? 'Ending...' : 'End'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scoped Startup Drawer Modal (Read-Only) */}
          <StartupDetailModal
            startup={selectedPartnerStartup}
            isOpen={isDrawerOpen}
            onClose={() => {
              setIsDrawerOpen(false);
              setSelectedPartnerStartup(null);
            }}
            isReadOnly={true}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
