'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Award,
  Users,
  CheckCircle2,
  FileText,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Video,
  ExternalLink,
  AlertCircle,
  Upload,
  Building2,
  Globe,
  Loader2,
  Eye,
  GraduationCap,
  Star,
  X,
} from 'lucide-react';
import { MilestoneItem, ScheduleEventItem } from './types';
import { FileViewerModal } from '@/frontend/components/common/FileViewerModal';
import { apiClient } from '@/services/apiClient';
import { supabase } from '@/backend/lib/supabase';

const SCOPE_LABELS: Record<string, string> = {
  lab: 'Lab & equipment',
  mentors: 'Mentors',
  funding: 'Funding',
  profile: 'Profile',
  financials: 'Financials',
};

function getDomainOnly(url?: string): string {
  if (!url) return '';
  return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
}

interface MergedMember {
  name: string;
  role: string;
  email?: string;
  avatar?: string;
}

interface OverviewTabProps {
  startup?: any;
  onNavigateTab?: (tab: any) => void;
  onOpenProfile?: (section?: string) => void;
  onStartupUpdate?: (updated: any) => void;
  readOnly?: boolean;
}

export function OverviewTab({
  startup,
  onNavigateTab,
  onOpenProfile,
  onStartupUpdate,
  readOnly = false,
}: OverviewTabProps) {
  const [milestones, setMilestones] = useState<MilestoneItem[]>(() => {
    return Array.isArray(startup?.milestones) ? startup.milestones : [];
  });
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEventItem[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [coIncubations, setCoIncubations] = useState<any[]>([]);
  const [isLoadingCoIncubations, setIsLoadingCoIncubations] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [availableMentors, setAvailableMentors] = useState<any[]>([]);
  const [loadingMentorSlots, setLoadingMentorSlots] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(0);
  const [bookingTopic, setBookingTopic] = useState('');
  const [bookingAgenda, setBookingAgenda] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<ScheduleEventItem | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', start: '', end: '' });
  const [feedbackTarget, setFeedbackTarget] = useState<ScheduleEventItem | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewerFile, setViewerFile] = useState<{ url: string; title: string; type?: 'pdf' | 'video' | 'auto' } | null>(null);

  // Sync with prop updates - only defined by incubator
  useEffect(() => {
    if (Array.isArray(startup?.milestones)) {
      setMilestones(startup.milestones);
    }
  }, [startup?.milestones]);

  // Fetch active co-incubations for this startup
  useEffect(() => {
    let isMounted = true;
    async function loadCoIncubations() {
      if (!startup?.id) {
        setIsLoadingCoIncubations(false);
        return;
      }
      try {
        const res = await apiClient.get(`/startups/${startup.id}/co-incubations`);
        if (isMounted && res.data?.success && Array.isArray(res.data.data)) {
          const active = res.data.data.filter((item: any) => item.status?.toLowerCase() === 'active');
          setCoIncubations(active);
        }
      } catch (err) {
        console.warn('Failed to load co-incubations in OverviewTab:', err);
      } finally {
        if (isMounted) setIsLoadingCoIncubations(false);
      }
    }
    loadCoIncubations();
    return () => {
      isMounted = false;
    };
  }, [startup?.id]);

  const reloadSchedule = async () => {
    if (!startup?.id) return;
    try {
      const res = await apiClient.get(`/startups/${startup.id}/schedule`);
      if (res.data?.success && Array.isArray(res.data.schedule)) {
        setScheduleEvents(res.data.schedule);
      }
    } catch (err) {
      console.warn('Failed to reload schedule events:', err);
    }
  };

  // Fetch upcoming schedule (events + mentor sessions merged by date)
  useEffect(() => {
    let isMounted = true;
    async function loadSchedule() {
      if (!startup?.id) return;
      try {
        const res = await apiClient.get(`/startups/${startup.id}/schedule`);
        if (isMounted && res.data?.success && Array.isArray(res.data.schedule)) {
          setScheduleEvents(res.data.schedule);
        }
      } catch (err) {
        console.warn('Failed to load schedule events:', err);
      } finally {
        if (isMounted) setIsLoadingSchedule(false);
      }
    }
    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, [startup?.id, startup?.organization_id]);

  // Realtime sync on mentorship_sessions & startup_mentors for live schedule updates
  useEffect(() => {
    if (!startup?.id) return;
    const channel = supabase
      .channel(`startup-overview-realtime-${startup.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mentorship_sessions', filter: `startup_id=eq.${startup.id}` },
        () => reloadSchedule()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'startup_mentors', filter: `startup_id=eq.${startup.id}` },
        () => reloadSchedule()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [startup?.id]);

  // Fetch active mentors & open slots when Request Mentor Session modal opens
  useEffect(() => {
    if (!isRequestModalOpen || !startup?.id) return;
    let active = true;
    async function loadMentorSlots() {
      try {
        setLoadingMentorSlots(true);
        setBookingError(null);
        const res = await apiClient.get(`/startups/${startup.id}/mentor-slots`);
        const list = Array.isArray(res.data?.mentors) ? res.data.mentors : [];
        if (active) {
          setAvailableMentors(list);
          if (list.length > 0) {
            setSelectedMentorId(list[0].mentor_id);
            setSelectedSlotIdx(0);
          } else {
            setSelectedMentorId('');
          }
        }
      } catch (err: any) {
        if (active) setBookingError(err?.response?.data?.error || 'Could not load mentor availability.');
      } finally {
        if (active) setLoadingMentorSlots(false);
      }
    }
    loadMentorSlots();
    return () => {
      active = false;
    };
  }, [isRequestModalOpen, startup?.id]);

  const completedCount = milestones.filter((m) => m.completed).length;
  const totalCount = milestones.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleMilestone = (id: string) => {
    if (readOnly) return;
    const updated = milestones.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m));
    setMilestones(updated);
    onStartupUpdate?.({ milestones: updated });
    setToastMessage('Milestone progress updated.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const customerCount = Number(startup?.customer_count || 0);
  const hasPitchDeck = Boolean(startup?.pitch_deck_url);

  // Safe parsing for team JSONB
  const parseTeamList = (raw: any): Array<{ name?: string; fullName?: string; role?: string; avatar?: string; email?: string }> => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter((item) => item && typeof item === 'object');
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item === 'object') : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Merged founder_name, cofounders[], and team_members[] deduped by email (or name)
  const mergedTeam: MergedMember[] = useMemo(() => {
    const list: MergedMember[] = [];
    const seen = new Set<string>();

    const addMember = (name?: string, role?: string, email?: string, avatar?: string) => {
      const cleanName = (name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanName && !cleanEmail) return;

      const key = cleanEmail || cleanName.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      list.push({
        name: cleanName || cleanEmail,
        role: role || 'Team member',
        email: cleanEmail || undefined,
        avatar: avatar || undefined,
      });
    };

    // 1. Primary Founder
    if (startup?.founder_name || startup?.founder_email) {
      addMember(startup.founder_name, 'Founder', startup.founder_email, startup.founder_avatar);
    }

    // 2. Co-founders
    const cofounders = parseTeamList(startup?.cofounders);
    for (const cf of cofounders) {
      addMember(cf.name || cf.fullName, cf.role || 'Co-founder', cf.email, cf.avatar);
    }

    // 3. Team members
    const teamMembers = parseTeamList(startup?.team_members);
    for (const tm of teamMembers) {
      addMember(tm.name || tm.fullName, tm.role || 'Team member', tm.email, tm.avatar);
    }

    return list;
  }, [startup]);

  const teamCount = mergedTeam.length > 0 ? mergedTeam.length : Number(startup?.team_size || 1);
  const stageName = startup?.stage?.trim() || 'Not started';
  const computedStageProgress: number | null = useMemo(() => {
    if (typeof startup?.stage_progress === 'number') {
      return startup.stage_progress;
    }
    if (totalCount > 0) {
      return Math.round((completedCount / totalCount) * 100);
    }
    return null;
  }, [startup?.stage_progress, completedCount, totalCount]);

  const renderEmptyField = (section: string, addLabel: string = 'Add') => (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
      <span>Not added yet</span>
      {!readOnly && (
        <button
          type="button"
          onClick={() => onOpenProfile?.(section)}
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium cursor-pointer"
        >
          + {addLabel}
        </button>
      )}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Stage Tracker */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-slate-500">Stage tracker</span>
              <Award className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{stageName}</h3>
              {computedStageProgress !== null ? (
                <span className="text-xs font-semibold text-blue-600">
                  {computedStageProgress}%
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400">
                  Not started
                </span>
              )}
            </div>
            {startup?.sector ? (
              <p className="text-xs text-slate-500 mt-1">
                Sector: <span className="font-medium text-slate-700">{startup.sector}</span>
              </p>
            ) : null}
            {computedStageProgress !== null && (
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${computedStageProgress}%` }}
                />
              </div>
            )}
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Funding raised</span>
            <span className="font-semibold text-slate-900 font-mono">
              ${Number(startup?.funding_raised || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Traction & Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-slate-500">Monthly recurring (MRR)</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                ${Number(startup?.mrr || startup?.monthly_revenue || 0).toLocaleString()}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${customerCount > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
              >
                {customerCount} {customerCount === 1 ? 'Customer' : 'Customers'}
              </span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Annual run rate (ARR)</span>
            <span className="font-semibold text-slate-900 font-mono">
              ${Number(startup?.annual_revenue || (startup?.mrr ? startup.mrr * 12 : 0)).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 3: Milestone Velocity */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-slate-500">Milestone velocity</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {completedCount} of {totalCount} Completed
              </h3>
              <span className="text-xs font-semibold text-blue-600">{progressPercent}%</span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100">
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Pitch Deck Status */}
        {hasPitchDeck ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-500">Pitch deck status</span>
                <FileText className="w-4 h-4 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Pitch deck linked</h3>
              <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ready for investor review</span>
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
              <button
                type="button"
                onClick={() =>
                  setViewerFile({
                    url: startup.pitch_deck_url,
                    title: `${startup.startup_name || startup.name || 'Startup'} - Pitch Deck`,
                    type: 'pdf',
                  })
                }
                className="text-blue-600 hover:text-blue-700 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View deck</span>
                <Eye className="w-3.5 h-3.5" />
              </button>
              <span className="font-normal text-slate-600">{teamCount} {teamCount === 1 ? 'member' : 'members'}</span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/50 rounded-2xl border border-amber-200 shadow-2xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-amber-700 mb-2">
                <span className="text-xs font-medium text-amber-800">Pitch deck status</span>
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-amber-950">Deck not uploaded</h3>
              <p className="text-xs font-medium text-amber-800 flex items-center gap-1 mt-1">
                <span>Investor deck required for cohort review</span>
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-amber-200/70 flex items-center justify-between text-xs font-medium text-amber-900">
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => onOpenProfile?.('documents')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
              ) : (
                <span className="text-amber-800 italic">Upload pending</span>
              )}
              <span className="font-normal text-slate-600">{teamCount} {teamCount === 1 ? 'member' : 'members'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Overview & KPIs: Company Snapshot, Team, and Co-incubation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {/* Company Snapshot Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-medium text-slate-900">Company snapshot</h3>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => onOpenProfile?.('overview')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-500 block mb-1">Description</span>
              {startup?.description ? (
                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  {startup.description}
                </p>
              ) : (
                renderEmptyField('overview', 'Add description')
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-500 block mb-1">Founder</span>
                {startup?.founder_name ? (
                  <p className="text-sm font-medium text-slate-900">
                    {startup.founder_name}
                  </p>
                ) : (
                  renderEmptyField('team', 'Add founder')
                )}
              </div>

              <div>
                <span className="text-xs text-slate-500 block mb-1">Website</span>
                {startup?.website ? (
                  <a
                    href={startup.website.startsWith('http') ? startup.website : `https://${startup.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1.5 truncate max-w-[220px]"
                    title={startup.website}
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{getDomainOnly(startup.website)}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  renderEmptyField('basic', 'Add website')
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Team Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-medium text-slate-900">Team</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 shrink-0 whitespace-nowrap">
                {mergedTeam.length} {mergedTeam.length === 1 ? 'member' : 'members'}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onOpenProfile?.('team')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Plain rows with dividers, no nested cards */}
          {mergedTeam.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto pr-1">
              {mergedTeam.map((member, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center shrink-0 border border-slate-200">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-400">
              <span>No team members added yet. </span>
              <button
                type="button"
                onClick={() => onOpenProfile?.('team')}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                + Add team
              </button>
            </div>
          )}
        </div>

        {/* Co-incubation Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-medium text-slate-900">Co-incubation</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                {coIncubations.length > 0 ? `${coIncubations.length} Active` : 'None'}
              </span>
            </div>

            {isLoadingCoIncubations ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-indigo-600" />
                <p className="text-xs">Loading co-incubation...</p>
              </div>
            ) : coIncubations.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-800">No co-incubation yet</p>
                <p className="text-xs text-slate-400 max-w-[220px] mx-auto">
                  Active co-incubation partnerships with partner incubators will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 divide-y divide-slate-100 max-h-[260px] overflow-y-auto pr-1">
                {coIncubations.map((item) => {
                  const partnerName = item.co_incubator?.name || item.co_incubator_name || 'Partner incubator';
                  const scopes: string[] = Array.isArray(item.shared_scope) ? item.shared_scope : [];
                  return (
                    <div key={item.id} className="pt-3.5 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {item.co_incubator?.logo_url ? (
                            <img
                              src={item.co_incubator.logo_url}
                              alt={partnerName}
                              className="w-6 h-6 rounded-md object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 font-semibold text-[11px]">
                              {partnerName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <p className="text-sm font-semibold text-slate-900 truncate">{partnerName}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Active
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 font-medium block mb-1">What they provide</span>
                        {scopes.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {scopes.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {SCOPE_LABELS[s] || s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Incubation support</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Roadmap + Right Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Roadmap): 8 cols */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-medium text-slate-900">Incubator milestone roadmap</h2>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Toggle checkboxes to update cohort progress dynamically
              </p>
            </div>
            {totalCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/70 shrink-0 whitespace-nowrap">
                Progress: {completedCount}/{totalCount}
              </span>
            )}
          </div>

          {/* Milestone Checklist or Empty State */}
          {totalCount === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">
                Your incubator hasn't set milestones yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Milestones will appear here once assigned by your program managers.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 pt-4 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin">
              {milestones.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleMilestone(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${item.completed
                    ? 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${item.completed
                        ? 'bg-indigo-600 text-white'
                        : 'border-2 border-slate-300 hover:border-indigo-500'
                        }`}
                    >
                      {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold truncate ${item.completed ? 'text-slate-500 line-through' : 'text-slate-800'
                          }`}
                      >
                        {item.title}
                      </p>
                      {item.assignedMentor && (
                        <div className="flex items-center gap-2 mt-1">
                          {item.assignedMentor.avatar && (
                            <img
                              src={item.assignedMentor.avatar}
                              alt={item.assignedMentor.name}
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.assignedMentor.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-600 mb-0.5">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Co-incubation Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-medium text-slate-900">Co-incubation</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                {coIncubations.length > 0 ? `${coIncubations.length} Active` : 'None'}
              </span>
            </div>

            {isLoadingCoIncubations ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-indigo-600" />
                <p className="text-xs">Loading co-incubation...</p>
              </div>
            ) : coIncubations.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-800">No co-incubation yet</p>
                <p className="text-xs text-slate-400 max-w-[220px] mx-auto">
                  Active co-incubation partnerships with partner incubators will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 divide-y divide-slate-100 max-h-[260px] overflow-y-auto pr-1">
                {coIncubations.map((item) => {
                  const partnerName = item.co_incubator?.name || item.co_incubator_name || 'Partner incubator';
                  const scopes: string[] = Array.isArray(item.shared_scope) ? item.shared_scope : [];
                  return (
                    <div key={item.id} className="pt-3.5 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {item.co_incubator?.logo_url ? (
                            <img
                              src={item.co_incubator.logo_url}
                              alt={partnerName}
                              className="w-6 h-6 rounded-md object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 font-semibold text-[11px]">
                              {partnerName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <p className="text-sm font-semibold text-slate-900 truncate">{partnerName}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Active
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 font-medium block mb-1">What they provide</span>
                        {scopes.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {scopes.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {SCOPE_LABELS[s] || s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Incubation support</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Upcoming Schedule): 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-medium text-slate-900">Upcoming schedule</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 shrink-0 whitespace-nowrap">
                {scheduleEvents.length} events
              </span>
            </div>

            {/* Events List */}
            <div className="space-y-3.5 pt-4">
              {isLoadingSchedule ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  <p className="text-xs">Loading schedule...</p>
                </div>
              ) : scheduleEvents.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">No upcoming events</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    Cohort events and mentor sessions will appear here once scheduled.
                  </p>
                </div>
              ) : (
                scheduleEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${ev.type === 'Workshop'
                            ? 'bg-purple-100 text-purple-800'
                            : ev.type === '1-on-1 Session'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                            }`}
                        >
                          {ev.type}
                        </span>
                        {ev.status && ev.source === 'mentorship_session' && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              ev.status === 'scheduled'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ev.status}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold">{ev.timing}</span>
                    </div>

                    <h4 className="text-xs font-bold text-[#1A2151] leading-snug">{ev.title}</h4>

                    <div className="flex items-center justify-between pt-1 text-[11px] gap-2">
                      <span className="text-slate-500 font-medium truncate max-w-[150px]">
                        {ev.speaker || 'Host Incubator'}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {!readOnly && ev.source === 'mentorship_session' && ev.status === 'completed' && (
                          <button
                            type="button"
                            onClick={() => {
                              setFeedbackTarget(ev);
                              setRatingValue(ev.startup_rating || 5);
                              setRatingComment(ev.startup_feedback || '');
                            }}
                            className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                          >
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{ev.startup_rating ? `${ev.startup_rating}/5 · View feedback` : 'View feedback & Rate'}</span>
                          </button>
                        )}
                        {!readOnly && ev.source === 'mentorship_session' && ev.status !== 'completed' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setRescheduleTarget(ev);
                                setRescheduleForm({
                                  date: ev.scheduled_date || '',
                                  start: ev.start_time || '10:00',
                                  end: ev.end_time || '11:00',
                                });
                              }}
                              className="text-slate-600 hover:text-blue-600 font-semibold cursor-pointer"
                            >
                              Reschedule
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await apiClient.delete(`/mentorship-sessions/${ev.id}`);
                                  setToastMessage('Session cancelled');
                                  setTimeout(() => setToastMessage(null), 2500);
                                  await reloadSchedule();
                                } catch (err: any) {
                                  setToastMessage(err?.response?.data?.error || 'Could not cancel session');
                                  setTimeout(() => setToastMessage(null), 3000);
                                }
                              }}
                              className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {ev.link && ev.link !== '#' ? (
                          (() => {
                            if (ev.source === 'mentorship_session') {
                              const startMs = ev.starts_at ? new Date(ev.starts_at).getTime() : NaN;
                              const diffMs = Number.isNaN(startMs) ? 0 : startMs - Date.now();
                              const isWindowOpen = ev.status === 'scheduled' && diffMs <= 10 * 60000 && diffMs >= -90 * 60000;
                              if (!isWindowOpen) {
                                return (
                                  <span
                                    title="Join unlocks 10 minutes before session start"
                                    className="text-slate-400 font-medium text-[11px] cursor-not-allowed"
                                  >
                                    {ev.status === 'completed' ? 'Completed' : 'Join (10m before)'}
                                  </span>
                                );
                              }
                            }
                            return (
                              <a
                                href={ev.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800"
                              >
                                <span>Join</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </a>
                            );
                          })()
                        ) : (
                          ev.source !== 'mentorship_session' && (
                            <span className="text-slate-400 font-medium text-[11px]">Online</span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Request 1-on-1 Button */}
          {!readOnly && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Request Mentor 1-on-1 Session</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Simple Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#101638] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* In-app Document & Video Viewer Modal */}
      <FileViewerModal
        isOpen={Boolean(viewerFile)}
        onClose={() => setViewerFile(null)}
        url={viewerFile?.url}
        title={viewerFile?.title}
        type={viewerFile?.type || 'auto'}
      />

      {/* Request Mentor 1-on-1 Session Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1A2151]">Request Mentor 1-on-1 Session</h3>
                <p className="text-xs text-slate-500 mt-0.5">Book an open slot from your active mentors</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bookingError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {bookingError}
              </div>
            )}

            {loadingMentorSlots ? (
              <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                <span>Checking mentor open slots...</span>
              </div>
            ) : availableMentors.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                <p className="font-semibold text-slate-700">No active mentors available yet</p>
                <p>Once an allocated mentor accepts your assignment and enables slots, you can book here.</p>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const chosenMentor = availableMentors.find((m) => m.mentor_id === selectedMentorId);
                  const chosenSlot = chosenMentor?.open_slots?.[selectedSlotIdx];
                  if (!chosenMentor || !chosenSlot) {
                    setBookingError('Please select an available slot.');
                    return;
                  }
                  setSubmittingBooking(true);
                  setBookingError(null);
                  try {
                    await apiClient.post('/mentorship-sessions', {
                      startup_id: startup.id,
                      mentor_id: chosenMentor.mentor_id,
                      scheduled_date: chosenSlot.date,
                      start_time: chosenSlot.start_time,
                      end_time: chosenSlot.end_time,
                      session_title: bookingTopic.trim() || `1-on-1 Session with ${chosenMentor.name}`,
                      agenda: bookingAgenda.trim() || undefined,
                      meeting_mode: chosenMentor.preferred_meeting_mode || 'video',
                    });
                    setIsRequestModalOpen(false);
                    setBookingTopic('');
                    setBookingAgenda('');
                    setToastMessage('Session requested! Waiting for mentor confirmation.');
                    setTimeout(() => setToastMessage(null), 3200);
                    await reloadSchedule();
                  } catch (err: any) {
                    setBookingError(err?.response?.data?.error || 'Could not request session.');
                  } finally {
                    setSubmittingBooking(false);
                  }
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Active Mentor</label>
                  <select
                    value={selectedMentorId}
                    onChange={(e) => {
                      setSelectedMentorId(e.target.value);
                      setSelectedSlotIdx(0);
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {availableMentors.map((m) => (
                      <option key={m.mentor_id} value={m.mentor_id}>
                        {m.name} ({m.domain}) — {m.remaining_slots_this_month} slots left this month
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Open Time Slot</label>
                  {(() => {
                    const activeM = availableMentors.find((m) => m.mentor_id === selectedMentorId);
                    const slots = activeM?.open_slots || [];
                    if (slots.length === 0) {
                      return (
                        <p className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                          This mentor has no open slots in the next 14 days.
                        </p>
                      );
                    }
                    return (
                      <select
                        value={selectedSlotIdx}
                        onChange={(e) => setSelectedSlotIdx(Number(e.target.value))}
                        className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                      >
                        {slots.map((slot: any, idx: number) => (
                          <option key={`${slot.date}-${slot.start_time}`} value={idx}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    required
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    placeholder="e.g. GTM Pricing & Pilot Conversion"
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Agenda / Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={bookingAgenda}
                    onChange={(e) => setBookingAgenda(e.target.value)}
                    placeholder="Questions or metrics to discuss..."
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      submittingBooking ||
                      !(availableMentors.find((m) => m.mentor_id === selectedMentorId)?.open_slots?.length > 0)
                    }
                    className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-lg inline-flex items-center gap-1.5"
                  >
                    {submittingBooking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Request Session</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reschedule Modal for Startup Schedule */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await apiClient.put(`/mentorship-sessions/${rescheduleTarget.id}`, {
                  scheduled_date: rescheduleForm.date,
                  start_time: rescheduleForm.start,
                  end_time: rescheduleForm.end,
                });
                setRescheduleTarget(null);
                setToastMessage('Session rescheduled & mentor notified');
                setTimeout(() => setToastMessage(null), 3000);
                await reloadSchedule();
              } catch (err: any) {
                setToastMessage(err?.response?.data?.error || 'Could not reschedule session');
                setTimeout(() => setToastMessage(null), 3200);
              }
            }}
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-3 text-xs"
          >
            <h3 className="text-sm font-bold text-[#1A2151]">Reschedule Session</h3>
            <p className="text-slate-500">{rescheduleTarget.title}</p>
            <input
              type="date"
              required
              value={rescheduleForm.date}
              onChange={(e) => setRescheduleForm((p) => ({ ...p, date: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                required
                value={rescheduleForm.start}
                onChange={(e) => setRescheduleForm((p) => ({ ...p, start: e.target.value }))}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
              <input
                type="time"
                required
                value={rescheduleForm.end}
                onChange={(e) => setRescheduleForm((p) => ({ ...p, end: e.target.value }))}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Save Reschedule
              </button>
            </div>
          </form>
        </div>
      )}

      {feedbackTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmittingRating(true);
              try {
                await apiClient.post(`/mentorship-sessions/${feedbackTarget.id}/feedback`, {
                  rating: ratingValue,
                  feedback: ratingComment,
                });
                setFeedbackTarget(null);
                setToastMessage('Rating submitted & mentor notified');
                setTimeout(() => setToastMessage(null), 3000);
                await reloadSchedule();
              } catch (err: any) {
                setToastMessage(err?.response?.data?.error || 'Could not submit rating');
                setTimeout(() => setToastMessage(null), 3200);
              } finally {
                setSubmittingRating(false);
              }
            }}
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-[#1A2151]">Session Feedback &amp; Rating</h3>
                <p className="text-[11px] text-slate-500">{feedbackTarget.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedbackTarget.mentor_feedback && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="font-semibold text-slate-800">Mentor Feedback</p>
                <p className="text-slate-600 leading-relaxed">{feedbackTarget.mentor_feedback}</p>
                {feedbackTarget.mentor_feedback_scores && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(feedbackTarget.mentor_feedback_scores).map(([k, v]) => (
                      <span key={k} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-medium capitalize text-slate-700">
                        {k}: {String(v)}/5
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-800">Rate this session (1-5)</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingValue(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-bold text-slate-700">{ratingValue} / 5</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-800">Your review comment</label>
              <textarea
                rows={3}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="How helpful was this mentorship session?"
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFeedbackTarget(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submittingRating}
                className="px-4 py-1.5 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                {submittingRating ? 'Saving...' : 'Submit rating'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
