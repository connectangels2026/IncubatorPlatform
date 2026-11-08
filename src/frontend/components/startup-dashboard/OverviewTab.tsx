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
} from 'lucide-react';
import { MilestoneItem, ScheduleEventItem } from './types';

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
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with prop updates - only defined by incubator
  useEffect(() => {
    if (Array.isArray(startup?.milestones)) {
      setMilestones(startup.milestones);
    }
  }, [startup?.milestones]);

  // Fetch upcoming schedule (events + mentor sessions merged by date)
  useEffect(() => {
    let isMounted = true;
    async function loadSchedule() {
      if (!startup?.id) return;
      try {
        const res = await fetch(`/api/v1/startups/${startup.id}/schedule`);
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.schedule)) {
          setScheduleEvents(json.schedule);
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
              <a
                href={startup.pitch_deck_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline font-semibold inline-flex items-center gap-1"
              >
                <span>View deck</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
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

      {/* Overview & KPIs: Company Snapshot & Team Cards (aligned to top, no stretched empty space) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
                    <div className="flex items-center justify-between">
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
                      <span className="text-[11px] text-slate-500 font-semibold">{ev.timing}</span>
                    </div>

                    <h4 className="text-xs font-bold text-[#1A2151] leading-snug">{ev.title}</h4>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-500 font-medium truncate max-w-[180px]">
                        {ev.speaker || 'Host Incubator'}
                      </span>
                      {ev.link && ev.link !== '#' ? (
                        <a
                          href={ev.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800"
                        >
                          <span>Join</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-medium text-[11px]">Online</span>
                      )}
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
    </div>
  );
}
