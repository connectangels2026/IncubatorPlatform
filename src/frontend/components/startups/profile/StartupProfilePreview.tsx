'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { StartupItem } from '../types';

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
      </div>
    </div>
  );
}
