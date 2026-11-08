'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  ChevronDown,
  Loader2,
  Copy,
  Check,
  Building2,
  Users,
  Briefcase,
  Clock,
  Sparkles,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { StartupItem, AllocatedMentor, AllocatedInvestor, CoIncubatorItem } from './types';
import { StartupProfilePreview } from './profile/StartupProfilePreview';
import { TeamContactSection } from './profile/TeamContactSection';
import { NetworkTabSection } from './profile/NetworkTabSection';
import { ActivityTabSection } from './profile/ActivityTabSection';
import { RequestChangeModal } from './profile/RequestChangeModal';
import StartupLogo from '@/frontend/components/ui/StartupLogo';
import { apiClient } from '@/services/apiClient';
import { mutate as globalMutate } from 'swr';

interface StartupDetailModalProps {
  startup: StartupItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAllocateMentorClick: (startup: StartupItem) => void;
  onRemoveMentor: (startupId: string, mentorId: string) => void;
  onAllocateInvestorClick: (startup: StartupItem) => void;
  onUpdateInvestorInterest: (startupId: string, investorId: string, level: AllocatedInvestor['interestLevel']) => void;
  onRemoveInvestor: (startupId: string, investorId: string) => void;
  onAddCoIncubatorClick: (startup: StartupItem) => void;
  onSignMOUClick: (startup: StartupItem, partner: CoIncubatorItem) => void;
  onRemoveCoIncubator: (startupId: string, partnerId: string) => void;
  onUpdateStartup?: (updated: StartupItem) => void;
}

const STAGES = ['Idea', 'MVP', 'Pre-revenue', 'Revenue', 'Growth', 'Scale'] as const;

const STAGE_PROGRESS_MAP: Record<string, number> = {
  idea: 16,
  mvp: 33,
  'pre-revenue': 50,
  prerevenue: 50,
  revenue: 66,
  growth: 83,
  scale: 100,
};

const STATUS_OPTIONS = ['Active', 'Pending', 'Inactive', 'Exited'] as const;

export const StartupDetailModal: React.FC<StartupDetailModalProps> = ({
  startup,
  isOpen,
  onClose,
  onAllocateMentorClick,
  onRemoveMentor,
  onAllocateInvestorClick,
  onUpdateInvestorInterest,
  onRemoveInvestor,
  onAddCoIncubatorClick,
  onSignMOUClick,
  onRemoveCoIncubator,
  onUpdateStartup,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'network' | 'activity'>('overview');
  const [fullStartup, setFullStartup] = useState<StartupItem | null>(null);
  const [liveMentors, setLiveMentors] = useState<AllocatedMentor[]>([]);
  const [liveInvestors, setLiveInvestors] = useState<AllocatedInvestor[]>([]);
  const [liveCoIncubators, setLiveCoIncubators] = useState<CoIncubatorItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Inline section editing state (restricted to incubator editable fields)
  const [editingSection, setEditingSection] = useState<'incubation' | 'milestones' | null>(null);
  const [draftForm, setDraftForm] = useState<any>({});

  // Request change modal
  const [requestChangeModalOpen, setRequestChangeModalOpen] = useState(false);
  const [requestChangeField, setRequestChangeField] = useState('Basic information');

  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize initial & fetch live
  useEffect(() => {
    if (!isOpen || !startup) return;
    setFullStartup(startup);
    setActiveTab('overview');
    setEditingSection(null);
    setLiveMentors(startup.allocatedMentors || []);
    setLiveInvestors(startup.allocatedInvestors || []);
    setLiveCoIncubators(startup.coIncubators || []);

    const fetchDetailAllocationsAndProfile = async () => {
      setIsLoadingDetails(true);
      try {
        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const orgIdFromUrl = searchParams?.get('org');
        const orgIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
        const orgId = orgIdFromUrl || orgIdFromStorage || startup.organization_id;
        const queryParams = orgId ? { org_id: orgId } : undefined;

        const [pRes, mRes, iRes, cRes] = await Promise.allSettled([
          apiClient.get(`/startups/${startup.id}`, { params: queryParams }),
          apiClient.get(`/startups/${startup.id}/mentors`, { params: queryParams }),
          apiClient.get(`/startups/${startup.id}/investors`, { params: queryParams }),
          apiClient.get(`/startups/${startup.id}/co-incubations`, { params: queryParams }),
        ]);

        if (pRes.status === 'fulfilled' && pRes.value.data?.data) {
          const d = pRes.value.data.data;
          setFullStartup((prev) => ({
            ...(prev || startup),
            ...d,
            name: d.startup_name || d.name || prev?.name || '',
            startup_name: d.startup_name || d.name || prev?.startup_name || '',
            tagline: d.description || prev?.tagline || '',
            pitch: d.description || prev?.pitch || '',
            problem: d.problem_statement || prev?.problem || '',
            problem_statement: d.problem_statement || prev?.problem_statement || '',
            solution: d.solution_description || prev?.solution || '',
            solution_description: d.solution_description || prev?.solution_description || '',
            market: d.target_market || prev?.market || '',
            target_market: d.target_market || prev?.target_market || '',
            founder: d.founder_name || prev?.founder || '',
            founder_name: d.founder_name || prev?.founder_name || '',
            founderEmail: d.founder_email || d.email || prev?.founderEmail || '',
            founder_email: d.founder_email || d.email || prev?.founder_email || '',
            founderPhone: d.founder_phone || prev?.founderPhone || '',
            founder_phone: d.founder_phone || prev?.founder_phone || '',
            customers: d.customer_count ?? prev?.customers ?? 0,
            customer_count: d.customer_count ?? prev?.customer_count ?? 0,
            mrr: d.mrr || d.monthly_revenue || prev?.mrr || 0,
            arr: d.annual_revenue || (d.mrr ? d.mrr * 12 : 0) || prev?.arr || 0,
            funding: d.funding_raised ? `$${Number(d.funding_raised).toLocaleString()}` : (prev?.funding || '$0'),
            funding_raised: d.funding_raised || prev?.funding_raised || 0,
            teamMembers: Array.isArray(d.team_members) && d.team_members.length > 0 ? d.team_members : (prev?.teamMembers || prev?.team || []),
            activity_logs: d.activity_logs || prev?.activity_logs || [],
          }));
        }

        if (mRes.status === 'fulfilled' && Array.isArray(mRes.value.data?.data)) {
          setLiveMentors(mRes.value.data.data);
        }
        if (iRes.status === 'fulfilled' && Array.isArray(iRes.value.data?.data)) {
          setLiveInvestors(iRes.value.data.data);
        }
        if (cRes.status === 'fulfilled' && Array.isArray(cRes.value.data?.data)) {
          setLiveCoIncubators(cRes.value.data.data);
        }
      } catch (e) {
        // preserve fallback items gracefully
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetailAllocationsAndProfile();
  }, [isOpen, startup?.id]);

  // Keep live items aligned with prop mutations
  useEffect(() => {
    if (startup) {
      if (startup.allocatedMentors) setLiveMentors(startup.allocatedMentors);
      if (startup.allocatedInvestors) setLiveInvestors(startup.allocatedInvestors);
      if (startup.coIncubators) setLiveCoIncubators(startup.coIncubators);
    }
  }, [startup?.allocatedMentors, startup?.allocatedInvestors, startup?.coIncubators]);

  // Close status dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveStartup = async (updatedFields: Partial<StartupItem>) => {
    if (!startup) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const orgIdFromUrl = searchParams?.get('org');
      const orgIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
      const orgId = orgIdFromUrl || orgIdFromStorage || startup.organization_id;

      const res = await apiClient.put(`/startups/${startup.id}`, updatedFields, {
        params: orgId ? { org_id: orgId } : undefined,
      });

      const savedData = res.data?.data || updatedFields;
      const merged: StartupItem = {
        ...startup,
        ...(fullStartup || {}),
        ...updatedFields,
        ...savedData,
      };

      setFullStartup(merged);
      onUpdateStartup?.(merged);

      // Invalidate SWR caches globally across open views
      globalMutate(`/startups/${startup.id}`, merged, false);
      globalMutate('/startups/me', merged, false);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      setEditingSection(null);
    } catch (err: any) {
      console.error('Failed to save startup changes:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to save startup changes';
      setSaveError(msg);
      setTimeout(() => setSaveError(null), 4000);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (section: 'incubation' | 'milestones') => {
    const s = fullStartup || startup;
    if (!s) return;
    setEditingSection(section);
    if (section === 'incubation') {
      setDraftForm({
        lifecycle_stage: s.lifecycle_stage || 'Incubating',
        cohort: s.cohort || s.batch || 'Cohort 2026',
        batch: s.cohort || s.batch || 'Cohort 2026',
        track: s.track || 'General Technology',
        is_active: s.is_active !== false,
        incubation_start_date: s.incubation_start_date || '',
        incubation_end_date: s.incubation_end_date || '',
      });
    } else if (section === 'milestones') {
      setDraftForm({
        milestones: s.milestones && Array.isArray(s.milestones) ? [...s.milestones] : [],
      });
    }
  };

  const handleDraftChange = (key: string, val: any) => {
    setDraftForm((prev: any) => ({ ...prev, [key]: val }));
  };

  const handleSaveInlineEdit = async () => {
    await handleSaveStartup(draftForm);
  };

  const handleCancelInlineEdit = () => {
    setEditingSection(null);
    setDraftForm({});
  };

  const handleOpenRequestChange = (fieldName: string) => {
    setRequestChangeField(fieldName);
    setRequestChangeModalOpen(true);
  };

  const handleRequestChangeSuccess = (field: string, note: string) => {
    // Append locally to activity logs for immediate feedback
    const newLog = {
      id: Date.now().toString(),
      action: 'startup_change_requested',
      description: `Change requested: [${field}] ${note}`,
      triggered_by: 'Incubator Staff',
      created_at: new Date().toISOString(),
      metadata: { field, note },
    };
    setFullStartup((prev) => prev ? {
      ...prev,
      activity_logs: [newLog, ...(prev.activity_logs || [])],
    } : null);
  };

  const handleCopyId = () => {
    if (!startup) return;
    navigator.clipboard.writeText(startup.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (!isOpen || !startup) return null;

  const activeStartup = fullStartup || startup;
  const displayName = activeStartup.startup_name || activeStartup.name || 'Startup';
  const displayTagline = activeStartup.tagline || activeStartup.pitch || activeStartup.description || 'Cohort portfolio member';

  // Compute stage progress
  const currentStageKey = (activeStartup.stage || 'Idea').toLowerCase().replace(/\s+/g, '-');
  const stageProgress = STAGE_PROGRESS_MAP[currentStageKey] || 33;
  const currentStageIndex = STAGES.findIndex(
    (s) => s.toLowerCase() === (activeStartup.stage || 'Idea').toLowerCase()
  );

  // Financial metrics for neutral stat strip
  const mrrVal = Number(activeStartup.mrr || activeStartup.monthly_revenue || 0);
  const arrVal = Number(activeStartup.arr || activeStartup.annual_revenue || mrrVal * 12);
  const fundingVal = activeStartup.funding || (activeStartup.funding_raised ? `$${Number(activeStartup.funding_raised).toLocaleString()}` : '$0');
  const customerCount = activeStartup.customers ?? activeStartup.customer_count ?? 0;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm transition-opacity font-sans animate-in fade-in duration-150">
      <div
        className={`w-full ${
          isExpanded ? 'max-w-full' : 'max-w-3xl'
        } bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden transition-all duration-200 animate-in slide-in-from-right duration-250`}
      >
        {/* 1. Unified Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <StartupLogo
              name={displayName}
              logoUrl={activeStartup.logo_url}
              logoColor={activeStartup.logo_color}
              initials={activeStartup.initials}
              className="w-10 h-10 rounded-xl text-sm shrink-0 border border-slate-200/80 shadow-2xs"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight truncate">
                  {displayName}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700">
                  {activeStartup.stage || 'MVP'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600">
                  {activeStartup.cohort || 'Cohort 2026'}
                </span>

                {/* Status Dropdown (Editable by incubator staff) */}
                <div className="relative inline-block" ref={statusDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>{activeStartup.status || 'Active'}</span>
                    <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                  </button>

                  {statusDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                      {STATUS_OPTIONS.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setStatusDropdownOpen(false);
                            handleSaveStartup({ status: st });
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                            activeStartup.status === st
                              ? 'bg-indigo-50 text-indigo-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{st}</span>
                          {activeStartup.status === st && <Check className="w-3 h-3 text-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                {displayTagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            {isLoadingDetails && (
              <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-medium mr-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                Syncing
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isExpanded ? 'Restore width' : 'Expand full width'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. 6-Stage Stepper & Neutral 4-Column Stat Strip */}
        <div className="border-b border-slate-200/80 bg-white shrink-0">
          {/* Stage Stepper */}
          <div className="px-6 pt-3.5 pb-2.5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-slate-500">
                Development lifecycle: <strong className="text-slate-900 font-semibold">{activeStartup.stage || 'MVP'}</strong>
              </span>
              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {stageProgress}% progress
              </span>
            </div>

            {/* Stepper Steps */}
            <div className="grid grid-cols-6 gap-1 relative items-center">
              {STAGES.map((step, idx) => {
                const isCurrent = (activeStartup.stage || 'Idea').toLowerCase() === step.toLowerCase();
                const isPassed = currentStageIndex >= idx;

                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => handleSaveStartup({ stage: step })}
                    className="flex flex-col items-center group cursor-pointer text-center"
                    title={`Set stage to ${step}`}
                  >
                    <div
                      className={`w-full h-1.5 rounded-full transition-all ${
                        isCurrent
                          ? 'bg-indigo-600'
                          : isPassed
                          ? 'bg-indigo-300'
                          : 'bg-slate-200 group-hover:bg-slate-300'
                      }`}
                    />
                    <span
                      className={`text-[10px] mt-1.5 truncate max-w-full font-medium transition-colors ${
                        isCurrent
                          ? 'text-indigo-600 font-semibold'
                          : isPassed
                          ? 'text-slate-700'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {step}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Neutral 4-Column Stat Strip */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Monthly MRR</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 tabular-nums">
                ${mrrVal.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Annual ARR</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 tabular-nums">
                ${arrVal.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Capital raised</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 tabular-nums">
                {fundingVal}
              </p>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Active customers</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 tabular-nums">
                {customerCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Tab Navigation (Single Indigo Accent) */}
        <div className="flex items-center gap-6 px-6 border-b border-slate-200 bg-white text-xs overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'team'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            Team and contact
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('network')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'network'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            Network
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium">
              {liveMentors.length + liveInvestors.length + liveCoIncubators.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'activity'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            Activity
            {(activeStartup.activity_logs?.length || 0) > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium">
                {activeStartup.activity_logs?.length}
              </span>
            )}
          </button>
        </div>

        {/* 4. Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeTab === 'overview' && (
            <StartupProfilePreview
              startup={activeStartup}
              editingSection={editingSection}
              onStartEdit={handleStartEdit}
              draftForm={draftForm}
              onDraftChange={handleDraftChange}
              onRequestChange={handleOpenRequestChange}
            />
          )}

          {activeTab === 'team' && (
            <TeamContactSection
              startup={activeStartup}
              onRequestChange={handleOpenRequestChange}
            />
          )}

          {activeTab === 'network' && (
            <NetworkTabSection
              startup={activeStartup}
              mentors={liveMentors}
              investors={liveInvestors}
              coIncubators={liveCoIncubators}
              onAllocateMentorClick={onAllocateMentorClick}
              onRemoveMentor={onRemoveMentor}
              onAllocateInvestorClick={onAllocateInvestorClick}
              onUpdateInvestorInterest={onUpdateInvestorInterest}
              onRemoveInvestor={onRemoveInvestor}
              onAddCoIncubatorClick={onAddCoIncubatorClick}
              onSignMOUClick={onSignMOUClick}
              onRemoveCoIncubator={onRemoveCoIncubator}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityTabSection
              startup={activeStartup}
              onRequestChange={handleOpenRequestChange}
            />
          )}
        </div>

        {/* 5. Sticky Inline Edit Footer (Rendered ONLY while editing a section) */}
        {editingSection ? (
          <div className="px-6 py-3 border-t border-slate-200 bg-indigo-50/70 flex items-center justify-between text-xs shrink-0 animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">
                Editing {editingSection === 'incubation' ? 'incubation details' : 'milestones'}
              </span>
              {saveError && (
                <span className="text-rose-600 font-medium">{saveError}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelInlineEdit}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInlineEdit}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors shadow-2xs disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save changes
              </button>
            </div>
          </div>
        ) : (
          /* 6. Standard Drawer Footer */
          <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono text-[11px] transition-colors cursor-pointer"
                title="Copy startup ID"
              >
                <span>ID: {activeStartup.id.slice(0, 8)}...</span>
                {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 animate-in fade-in duration-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Saved</span>
                </span>
              )}
              {saveError && (
                <span className="text-rose-600 text-xs font-medium">{saveError}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/incubator/startups/${activeStartup.id}/preview`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Preview</span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* 7. Request Change Modal */}
        <RequestChangeModal
          isOpen={requestChangeModalOpen}
          onClose={() => setRequestChangeModalOpen(false)}
          startupId={activeStartup.id}
          startupName={displayName}
          initialField={requestChangeField}
          onSuccess={handleRequestChangeSuccess}
        />
      </div>
    </div>
  );
};
