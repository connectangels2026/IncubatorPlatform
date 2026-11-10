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
} from 'lucide-react';
import StartupLogo from '@/frontend/components/ui/StartupLogo';

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
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const orgId = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
        const res = await fetch('/api/v1/co-incubations?view=all', {
          headers: {
            ...(orgId ? { 'x-org-id': orgId } : {}),
          },
        });
        if (res.ok) {
          const json = await res.json();
          setCoincubations(json.data || []);
        } else {
          setCoincubations([]);
        }
      } catch (err) {
        console.error('Failed to load co-incubations:', err);
        setCoincubations([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute pending requests count for badge
  const pendingRequests = useMemo(() => {
    return coincubations.filter((c) => c.status === 'pending');
  }, [coincubations]);

  // Group by partner incubator for Partners tab
  const partnerGroups = useMemo<PartnerGroup[]>(() => {
    const orgId = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
    const groupsMap = new Map<string, PartnerGroup>();

    for (const item of coincubations) {
      // Determine partner side: if current org is primary, partner is co_incubator; else primary_incubator
      const isPrimary = !orgId || item.primary_incubator_id === orgId;
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
  }, [coincubations]);

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

  // Unique startups list for Startups tab
  const startupList = useMemo(() => {
    const sMap = new Map<string, { startup: any; partners: any[] }>();
    for (const c of coincubations) {
      const sid = c.startup_id;
      const startupName = c.startup?.startup_name || c.startup?.name || 'Startup';
      if (!sMap.has(sid)) {
        sMap.set(sid, {
          startup: {
            id: sid,
            name: startupName,
            logo_url: c.startup?.logo_url,
            logo_color: c.startup?.logo_color,
            initials: c.startup?.initials,
            sector: c.startup?.sector,
            stage: c.startup?.stage,
          },
          partners: [],
        });
      }
      sMap.get(sid)!.partners.push({
        coIncubationId: c.id,
        partnerName: c.co_incubator?.name || 'Partner',
        status: c.status,
        startDate: c.start_date,
      });
    }
    const arr = Array.from(sMap.values());
    const q = search.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter((item) => item.startup.name.toLowerCase().includes(q));
  }, [coincubations, search]);

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={[{ label: 'Co-incubations' }]}>
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header (No 'Add co-incubation' button as required) */}
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
                {pendingRequests.length > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
                      activeTab === 'requests'
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pendingRequests.length}
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
                Startups ({startupList.length})
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
                // Loading Skeletons
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
                      <div className="pt-3 border-t border-slate-100 flex gap-2">
                        <div className="w-32 h-7 bg-slate-100 rounded-lg" />
                        <div className="w-32 h-7 bg-slate-100 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPartners.length === 0 ? (
                // Empty State
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
                // Partner Cards
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

                        {/* MOU Status Chip */}
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

                              {/* Status Chip */}
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
              {loading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                  Loading requests...
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                  <h3 className="text-sm font-semibold text-slate-800">No open requests</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    There are no pending co-incubation requests awaiting review.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                      <div className="flex items-start gap-3">
                        <StartupLogo
                          name={req.startup?.startup_name || req.startup?.name || 'Startup'}
                          logoUrl={req.startup?.logo_url}
                          logoColor={req.startup?.logo_color}
                          initials={req.startup?.initials}
                          className="w-9 h-9 text-xs rounded-lg shrink-0 mt-0.5"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">
                              {req.startup?.startup_name || req.startup?.name}
                            </span>
                            <span className="text-xs text-slate-400">→</span>
                            <span className="text-xs font-medium text-slate-700">
                              {req.co_incubator?.name || 'Partner'}
                            </span>
                          </div>
                          {req.message && (
                            <p className="text-xs text-slate-600 mt-1 italic">&ldquo;{req.message}&rdquo;</p>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[11px] text-slate-400">Shared scope:</span>
                            {(Array.isArray(req.shared_scope) ? req.shared_scope : []).map((scope) => (
                              <span
                                key={scope}
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 capitalize"
                              >
                                {scope}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Pending approval
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STARTUPS TAB */}
          {activeTab === 'startups' && (
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                  Loading startups...
                </div>
              ) : startupList.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                  <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                  <h3 className="text-sm font-semibold text-slate-800">No co-incubated startups</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect startups with co-incubators from the startup profile drawer.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {startupList.map(({ startup, partners }) => (
                    <div
                      key={startup.id}
                      className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <StartupLogo
                          name={startup.name}
                          logoUrl={startup.logo_url}
                          logoColor={startup.logo_color}
                          initials={startup.initials}
                          className="w-9 h-9 text-xs rounded-lg shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-slate-900">{startup.name}</h4>
                          <p className="text-[11px] text-slate-500">
                            {startup.sector || 'Startup'} • {startup.stage || 'MVP'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[11px] font-medium text-slate-400 uppercase">Partners</p>
                        {partners.map((p) => (
                          <div
                            key={p.coIncubationId}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-slate-50 text-slate-700"
                          >
                            <span className="font-medium text-slate-800">{p.partnerName}</span>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                                p.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : p.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : p.status === 'rejected'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
