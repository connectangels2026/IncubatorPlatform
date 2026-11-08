'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  ExternalLink,
  MessageSquare,
  Edit3,
  Copy,
  Check,
  Download,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  FileCheck,
  Video,
  Lock,
  Loader2,
} from 'lucide-react';
import { StartupItem } from '../types';
import { apiClient } from '@/services/apiClient';

interface StartupProfilePreviewProps {
  startup: StartupItem;
  editingSection: 'incubation' | 'milestones' | null;
  onStartEdit: (section: 'incubation' | 'milestones') => void;
  draftForm: any;
  onDraftChange: (key: string, val: any) => void;
  onRequestChange: (sectionName: string) => void;
}

export function StartupProfilePreview({
  startup,
  editingSection,
  onStartEdit,
  draftForm,
  onDraftChange,
  onRequestChange,
}: StartupProfilePreviewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [videoSubmission, setVideoSubmission] = useState<any>(null);
  const [videoSignedUrl, setVideoSignedUrl] = useState<string | null>(null);
  const [startupName, setStartupName] = useState<string>(startup?.name || 'Startup');
  const [isDecidingVideo, setIsDecidingVideo] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (startup?.id) {
      const orgId =
        startup.organization_id ||
        (typeof window !== 'undefined' ? localStorage.getItem('org_id') : null);

      apiClient
        .get(`/startups/${startup.id}/video-submission`, {
          params: orgId ? { org_id: orgId } : undefined,
        })
        .then((res) => {
          if (isMounted && res.data?.success) {
            setVideoSubmission(res.data.submission || null);
            setVideoSignedUrl(res.data.video_url || null);
            if (res.data.startup_name) setStartupName(res.data.startup_name);
          }
        })
        .catch((err) => {
          console.warn('Failed to load startup video submission:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [startup?.id, startup?.organization_id]);

  const handleDecideVideo = async (status: 'approved' | 'rejected') => {
    if (!startup?.id) return;
    if (status === 'rejected' && !rejectReason.trim()) {
      alert('Please enter a reason for rejecting the demo video.');
      return;
    }

    setIsDecidingVideo(true);
    try {
      const orgId =
        startup.organization_id ||
        (typeof window !== 'undefined' ? localStorage.getItem('org_id') : null);

      const res = await apiClient.post(
        `/startups/${startup.id}/video-submission`,
        {
          action: 'decide',
          status,
          reason: status === 'rejected' ? rejectReason.trim() : undefined,
        },
        {
          params: orgId ? { org_id: orgId } : undefined,
        }
      );
      if (res.data?.success) {
        setVideoSubmission(res.data.submission);
        if (res.data.published_url) {
          setVideoSignedUrl(res.data.published_url);
        }
        setShowRejectInput(false);
        setRejectReason('');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update video submission.');
    } finally {
      setIsDecidingVideo(false);
    }
  };

  const handleCopy = (key: string, value?: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskValue = (val?: string) => {
    if (!val || val === '—' || val === 'N/A') return '—';
    const clean = val.trim();
    if (clean.length <= 4) return clean;
    return '••••••••' + clean.slice(-4);
  };

  const isEditingIncubation = editingSection === 'incubation';
  const isEditingMilestones = editingSection === 'milestones';

  // Milestones array handling
  const milestonesList = isEditingMilestones
    ? (draftForm.milestones || [])
    : (startup.milestones && Array.isArray(startup.milestones) && startup.milestones.length > 0
      ? startup.milestones
      : [
        { id: '1', title: 'Cohort admission & onboarding', status: 'Completed', date: '2026-01-15' },
        { id: '2', title: 'Advisory council initial review', status: 'In Progress', date: '2026-03-30' },
        { id: '3', title: 'Pilot deployment & commercial MOU', status: 'Pending', date: '2026-06-15' },
      ]);

  const handleAddMilestone = () => {
    const next = [
      ...milestonesList,
      { id: Date.now().toString(), title: 'New milestone', status: 'Pending', date: '' },
    ];
    onDraftChange('milestones', next);
  };

  const handleUpdateMilestone = (index: number, field: string, val: any) => {
    const next = [...milestonesList];
    next[index] = { ...next[index], [field]: val };
    onDraftChange('milestones', next);
  };

  const handleRemoveMilestone = (index: number) => {
    const next = milestonesList.filter((_: any, i: number) => i !== index);
    onDraftChange('milestones', next);
  };

  return (
    <div className="space-y-6">
      {/* 1. Basic Information & Product Architecture (View-only for incubator) */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Basic information
            </h4>
            <p className="text-[11px] text-slate-500">
              Founder-submitted startup narrative, value proposition, and market focus.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRequestChange('Basic information')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-md transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Request change</span>
          </button>
        </div>

        {/* 3-column field grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4">
          <div>
            <span className="block text-xs font-medium text-slate-500">Sector & domain</span>
            <p className="text-sm font-medium text-slate-900 mt-0.5">{startup.sector || '—'}</p>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Founded date</span>
            <p className="text-sm font-medium text-slate-900 mt-0.5">{startup.founded_date || '2024'}</p>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Website URL</span>
            {startup.website ? (
              <a
                href={startup.website.startsWith('http') ? startup.website : `https://${startup.website}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-indigo-600 hover:underline inline-flex items-center gap-1 truncate max-w-[200px] mt-0.5"
              >
                <span className="truncate">{startup.website.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <p className="text-sm font-medium text-slate-400 mt-0.5">—</p>
            )}
          </div>
        </div>

        {/* Plain labeled text blocks for Problem & Solution */}
        <div className="space-y-4 pt-2">
          <div>
            <span className="block text-xs font-medium text-slate-500">Problem statement</span>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mt-1 font-normal">
              {startup.problem_statement || startup.problem || 'Under validation with pilot partners.'}
            </p>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-500">Solution description</span>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mt-1 font-normal">
              {startup.solution_description || startup.solution || startup.pitch || 'Autonomous software architecture and proprietary workflows.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <span className="block text-xs font-medium text-slate-500">Target market & TAM</span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mt-1 font-normal">
                {startup.target_market || startup.market || 'High-growth Enterprise & B2B Technology.'}
              </p>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-500">Business & revenue model</span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mt-1 font-normal">
                {startup.business_model || startup.revenue_model || 'B2B SaaS subscription with annual platform tiers.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Incubation Program Details (Editable by incubator staff) */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                Incubation details
              </h4>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                Incubator managed
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Program cohort, lifecycle milestone, track designation, and active tenure.
            </p>
          </div>
          {!isEditingIncubation && (
            <button
              type="button"
              onClick={() => onStartEdit('incubation')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 rounded-md transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {isEditingIncubation ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-indigo-50/30 rounded-xl border border-indigo-100">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Lifecycle stage</label>
              <select
                value={draftForm.lifecycle_stage || 'Incubating'}
                onChange={(e) => onDraftChange('lifecycle_stage', e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Idea">Idea</option>
                <option value="Incubating">Incubating</option>
                <option value="Accelerating">Accelerating</option>
                <option value="Graduated">Graduated</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Cohort / batch</label>
              <input
                type="text"
                value={draftForm.cohort || draftForm.batch || ''}
                onChange={(e) => {
                  onDraftChange('cohort', e.target.value);
                  onDraftChange('batch', e.target.value);
                }}
                placeholder="e.g. Cohort 2026 Spring"
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Track</label>
              <input
                type="text"
                value={draftForm.track || ''}
                onChange={(e) => onDraftChange('track', e.target.value)}
                placeholder="e.g. AI & SaaS Enterprise"
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Active program status</label>
              <select
                value={draftForm.is_active !== false ? 'true' : 'false'}
                onChange={(e) => onDraftChange('is_active', e.target.value === 'true')}
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="true">Active in incubator</option>
                <option value="false">Inactive / Paused</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Incubation start date</label>
              <input
                type="date"
                value={draftForm.incubation_start_date ? draftForm.incubation_start_date.split('T')[0] : ''}
                onChange={(e) => onDraftChange('incubation_start_date', e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Incubation end date</label>
              <input
                type="date"
                value={draftForm.incubation_end_date ? draftForm.incubation_end_date.split('T')[0] : ''}
                onChange={(e) => onDraftChange('incubation_end_date', e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="block text-xs font-medium text-slate-500">Lifecycle stage</span>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {startup.lifecycle_stage || 'Incubating'}
              </p>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-500">Cohort / batch</span>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {startup.cohort || startup.batch || 'Cohort 2026'}
              </p>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-500">Track</span>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {startup.track || 'General Technology'}
              </p>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-500">Program status</span>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {startup.is_active !== false ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-500">Start date</span>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {startup.incubation_start_date ? startup.incubation_start_date.split('T')[0] : '2026-01-01'}
              </p>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-500">End date</span>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {startup.incubation_end_date ? startup.incubation_end_date.split('T')[0] : '2026-12-31'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Program Milestones (Editable by incubator staff) */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                Incubator milestones
              </h4>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                Incubator managed
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Key programmatic milestones and graduation checkpoints.
            </p>
          </div>
          {!isEditingMilestones && (
            <button
              type="button"
              onClick={() => {
                onDraftChange('milestones', milestonesList);
                onStartEdit('milestones');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 rounded-md transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {isEditingMilestones ? (
          <div className="space-y-3 p-4 bg-indigo-50/30 rounded-xl border border-indigo-100">
            {milestonesList.map((m: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <input
                  type="text"
                  value={m.title}
                  onChange={(e) => handleUpdateMilestone(idx, 'title', e.target.value)}
                  placeholder="Milestone title"
                  className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <select
                  value={m.status}
                  onChange={(e) => handleUpdateMilestone(idx, 'status', e.target.value)}
                  className="text-xs px-2 py-1 border border-slate-200 rounded bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <input
                  type="date"
                  value={m.date || ''}
                  onChange={(e) => handleUpdateMilestone(idx, 'date', e.target.value)}
                  className="text-xs px-2 py-1 border border-slate-200 rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(idx)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddMilestone}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline pt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add milestone
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white">
            {milestonesList.map((milestone: any, idx: number) => {
              const isDone = milestone.status === 'Completed';
              const isInProgress = milestone.status === 'In Progress';
              return (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                    />
                    <span className="font-medium text-slate-800">{milestone.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${isDone
                        ? 'bg-emerald-50 text-emerald-700'
                        : isInProgress
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {milestone.status}
                    </span>
                    {milestone.date && (
                      <span className="text-[11px] text-slate-400">{milestone.date}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Legal & Corporate Registration (View-only, Masked IDs) */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Legal & compliance
            </h4>
            <p className="text-[11px] text-slate-500">
              Government registration credentials and statutory identification (masked).
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRequestChange('Legal & compliance')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-md transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Request change</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="block text-xs font-medium text-slate-500">Entity type</span>
            <p className="text-sm font-medium text-slate-900 mt-0.5">
              {startup.registration_type || 'Private Limited'}
            </p>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-500">PAN</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-mono font-medium text-slate-900">
                {maskValue(startup.pan_number)}
              </span>
              {startup.pan_number && (
                <button
                  type="button"
                  onClick={() => handleCopy('pan', startup.pan_number)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title="Copy full PAN"
                >
                  {copiedKey === 'pan' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-500">GST</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-mono font-medium text-slate-900">
                {maskValue(startup.gst_number)}
              </span>
              {startup.gst_number && (
                <button
                  type="button"
                  onClick={() => handleCopy('gst', startup.gst_number)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title="Copy full GST"
                >
                  {copiedKey === 'gst' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-500">CIN</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-mono font-medium text-slate-900">
                {maskValue(startup.cin_number || startup.registration_number)}
              </span>
              {(startup.cin_number || startup.registration_number) && (
                <button
                  type="button"
                  onClick={() => handleCopy('cin', startup.cin_number || startup.registration_number)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title="Copy full CIN"
                >
                  {copiedKey === 'cin' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Documents & Official Collateral (View-only) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
              Documents & collateral
            </h4>
            <p className="text-[11px] text-slate-500">
              Official investor decks and operational business plans.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRequestChange('Documents & decks')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-md transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Request change</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white">
          {/* Pitch Deck Row */}
          <div className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Official pitch deck</p>
                <p className="text-[11px] text-slate-500">Latest investor presentation</p>
              </div>
            </div>
            {startup.pitch_deck_url ? (
              <a
                href={startup.pitch_deck_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View deck</span>
              </a>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Uploaded in portal</span>
            )}
          </div>

          {/* Business Plan Row */}
          <div className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Business model & financials plan</p>
                <p className="text-[11px] text-slate-500">Unit economics and financial roadmap</p>
              </div>
            </div>
            {startup.business_plan_url ? (
              <a
                href={startup.business_plan_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View plan</span>
              </a>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Under review</span>
            )}
          </div>
        </div>

        {/* Video review card (Incubator Management) */}
        <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-600" />
              <h5 className="text-xs font-semibold text-slate-900">Video review</h5>
            </div>
            {videoSubmission?.status === 'approved' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Approved
              </span>
            ) : videoSubmission?.status === 'pending' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3" />
                Pending review
              </span>
            ) : videoSubmission?.status === 'rejected' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                <AlertCircle className="w-3 h-3" />
                Rejected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                No submission
              </span>
            )}
          </div>

          {videoSubmission?.status === 'pending' ? (
            <div className="space-y-3 pt-1">
              {/* Startup name and submitted date */}
              <div className="flex items-center justify-between text-xs text-slate-600 pb-1 border-b border-slate-200/60">
                <div>
                  <span className="text-slate-500 text-[11px]">Startup: </span>
                  <span className="font-semibold text-slate-800">{startupName || startup.name}</span>
                </div>
                {videoSubmission.submitted_at && (
                  <div>
                    <span className="text-slate-500 text-[11px]">Submitted: </span>
                    <span className="font-medium text-slate-700">
                      {new Date(videoSubmission.submitted_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Video Player with signed URL */}
              {videoSignedUrl ? (
                <div className="rounded-lg overflow-hidden bg-black/90 aspect-video max-h-56 flex items-center justify-center border border-slate-300">
                  <video
                    src={videoSignedUrl}
                    controls
                    preload="metadata"
                    className="w-full h-full max-h-56 object-contain"
                  >
                    Your browser does not support HTML5 video.
                  </video>
                </div>
              ) : (
                <div className="p-4 bg-white rounded-lg border border-slate-200 text-center text-xs text-slate-500">
                  <Video className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span>Loading video stream...</span>
                </div>
              )}

              {showRejectInput ? (
                <div className="space-y-2 p-3 bg-white rounded-lg border border-rose-200">
                  <label className="block text-xs font-semibold text-rose-900">
                    Reason for rejection (required)
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why the video was not approved and what needs to be improved..."
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                  />
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectInput(false);
                        setRejectReason('');
                      }}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isDecidingVideo || !rejectReason.trim()}
                      onClick={() => handleDecideVideo('rejected')}
                      className="px-3 py-1 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded transition cursor-pointer"
                    >
                      {isDecidingVideo ? 'Rejecting...' : 'Confirm rejection'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    disabled={isDecidingVideo}
                    className="px-3.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecideVideo('approved')}
                    disabled={isDecidingVideo}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-2xs cursor-pointer"
                  >
                    {isDecidingVideo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    <span>Approve</span>
                  </button>
                </div>
              )}
            </div>
          ) : videoSubmission?.status === 'approved' ? (
            <div className="space-y-2 pt-1 border-t border-slate-200/60">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Published and visible on startup profile &amp; website
                </span>
                {videoSubmission.reviewed_by && (
                  <span className="text-[10px] text-slate-400">By {videoSubmission.reviewed_by}</span>
                )}
              </div>
              {videoSubmission.published_url && (
                <div className="flex justify-end">
                  <a
                    href={videoSubmission.published_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline"
                  >
                    <span>View public video</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ) : videoSubmission?.status === 'rejected' ? (
            <div className="space-y-2 pt-1 border-t border-slate-200/60">
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                <span className="font-semibold block text-[11px]">Reason for rejection:</span>
                <span>{videoSubmission.reason || 'Video did not meet guidelines.'}</span>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDecideVideo('approved')}
                  disabled={isDecidingVideo}
                  className="text-xs text-indigo-600 hover:underline font-medium cursor-pointer"
                >
                  Re-evaluate &amp; approve
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-1">
              No product demo video has been submitted for review yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
