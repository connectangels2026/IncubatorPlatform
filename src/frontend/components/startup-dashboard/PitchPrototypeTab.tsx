'use client';

import React, { useMemo, useState } from 'react';
import {
  FileText,
  Eye,
  ExternalLink,
  Layers,
  Sparkles,
  Upload,
  Play,
  Rocket,
} from 'lucide-react';
import { DeckRevision } from './types';
import { FileViewerModal } from '@/frontend/components/common/FileViewerModal';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function FigmaIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 2h4a4 4 0 0 1 4 4 4 4 0 0 1-4 4H8V2z" />
      <path d="M8 10h4a4 4 0 0 1 4 4 4 4 0 0 1-4 4H8v-8z" />
      <path d="M4 14a4 4 0 0 1 4-4v8a4 4 0 0 1-4-4z" />
      <path d="M4 6a4 4 0 0 1 4-4v8a4 4 0 0 1-4-4z" />
      <path d="M8 18a4 4 0 1 1-4 4 4 4 0 0 1 4-4z" />
    </svg>
  );
}

interface PitchPrototypeTabProps {
  startup?: any;
  onOpenProfile?: (section?: string) => void;
  readOnly?: boolean;
}

export function PitchPrototypeTab({ startup, onOpenProfile, readOnly = false }: PitchPrototypeTabProps) {
  const [viewerFile, setViewerFile] = useState<{ url: string; title: string; type?: 'pdf' | 'video' | 'auto' } | null>(null);

  // Safe parsing of deck revisions from startup data
  const revisions: DeckRevision[] = useMemo(() => {
    let list = startup?.deck_revisions;
    if (typeof list === 'string') {
      try {
        list = JSON.parse(list);
      } catch {
        list = [];
      }
    }
    return Array.isArray(list) ? list : [];
  }, [startup?.deck_revisions]);

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

  const getFileName = (url?: string, fallback: string = 'Document.pdf') => {
    if (!url) return fallback;
    try {
      const clean = url.split('?')[0];
      const name = clean.split('/').pop();
      return name && name.length > 0 ? decodeURIComponent(name) : fallback;
    } catch {
      return fallback;
    }
  };

  return (
    <div className="space-y-6">
      {/* Pitch Summary Section (Above the deck) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-medium text-slate-900">Pitch summary</h3>
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
          {/* Problem Statement */}
          <div>
            <span className="text-xs text-slate-500 block mb-1">Problem statement</span>
            {startup?.problem_statement ? (
              <p className="text-sm text-slate-800 leading-relaxed font-normal">
                {startup.problem_statement}
              </p>
            ) : (
              renderEmptyField('overview', 'Add problem statement')
            )}
          </div>

          {/* Solution Description */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 block mb-1">Solution description</span>
            {startup?.solution_description ? (
              <p className="text-sm text-slate-800 leading-relaxed font-normal">
                {startup.solution_description}
              </p>
            ) : (
              renderEmptyField('overview', 'Add solution description')
            )}
          </div>

          {/* Target Market, Business Model, Revenue Model Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-500 block mb-1">Target market</span>
              {startup?.target_market ? (
                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  {startup.target_market}
                </p>
              ) : (
                renderEmptyField('business', 'Add target market')
              )}
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Business model</span>
              {startup?.business_model ? (
                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  {startup.business_model}
                </p>
              ) : (
                renderEmptyField('business', 'Add business model')
              )}
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Revenue model</span>
              {startup?.revenue_model ? (
                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  {startup.revenue_model}
                </p>
              ) : (
                renderEmptyField('business', 'Add revenue model')
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Merged Documents Section: Pitch Deck, Business Plan & Revisions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-medium text-slate-900">Documents</h3>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={() => onOpenProfile?.('documents')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
            >
              Manage
            </button>
          )}
        </div>

        {/* Pitch Deck & Business Plan Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pitch Deck Card */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${startup?.pitch_deck_url ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                  }`}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 block">Pitch deck</span>
                {startup?.pitch_deck_url ? (
                  <p className="text-sm font-medium text-slate-900 truncate" title={startup.pitch_deck_url}>
                    {getFileName(startup.pitch_deck_url, 'Pitch_Deck.pdf')}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 font-normal">Not uploaded</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {startup?.pitch_deck_url ? (
                <button
                  type="button"
                  onClick={() =>
                    setViewerFile({
                      url: startup.pitch_deck_url,
                      title: `${startup.startup_name || startup.name || 'Startup'} - Pitch Deck`,
                      type: 'pdf',
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              ) : !readOnly ? (
                <button
                  type="button"
                  onClick={() => onOpenProfile?.('documents')}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Business Plan Card */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${startup?.business_plan_url ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                  }`}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-slate-500 block">Business plan</span>
                {startup?.business_plan_url ? (
                  <p className="text-sm font-medium text-slate-900 truncate" title={startup.business_plan_url}>
                    {getFileName(startup.business_plan_url, 'Business_Plan.pdf')}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 font-normal">Not uploaded</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {startup?.business_plan_url ? (
                <button
                  type="button"
                  onClick={() =>
                    setViewerFile({
                      url: startup.business_plan_url,
                      title: `${startup.startup_name || startup.name || 'Startup'} - Business Plan`,
                      type: 'pdf',
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              ) : !readOnly ? (
                <button
                  type="button"
                  onClick={() => onOpenProfile?.('documents')}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Revision History Table - Rendered only when deck_revisions has entries */}
        {revisions.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">Deck revision history</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                {revisions.length} {revisions.length === 1 ? 'version' : 'versions'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
                    <th className="pb-2.5 pr-2">Version</th>
                    <th className="pb-2.5 px-2">Date</th>
                    <th className="pb-2.5 px-2">Author</th>
                    <th className="pb-2.5 px-2">Key changes</th>
                    <th className="pb-2.5 pl-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {revisions.map((rev, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 pr-2 font-medium text-blue-600">{rev.version}</td>
                      <td className="py-2.5 px-2 font-normal text-slate-600 whitespace-nowrap">{rev.date}</td>
                      <td className="py-2.5 px-2 font-medium text-slate-800 whitespace-nowrap">{rev.author}</td>
                      <td className="py-2.5 px-2 text-slate-600 max-w-[240px] truncate">{rev.keyChanges}</td>
                      <td className="py-2.5 pl-2 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${rev.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                          {rev.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Prototype Hub & Live Demos */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-medium text-slate-900">Prototype hub &amp; live demos</h3>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Live web preview, code repositories, and user testing metrics
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live status: 99.9% uptime</span>
          </span>
        </div>

        {/* 3-Section Grid: Links, Video Walkthrough, Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5">
          {/* Section 1: Links (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            {/* GitHub */}
            {startup?.github_url ? (
              <a
                href={startup.github_url}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/60 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <GithubIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-slate-900">GitHub repository</h4>
                    <p className="text-[11px] text-slate-500 truncate max-w-[160px]">Connected codebase</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
              </a>
            ) : (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                    <GithubIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-slate-700">GitHub repository</h4>
                    <p className="text-[11px] text-slate-400">Not linked</p>
                  </div>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onOpenProfile?.('documents')}
                    className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Link
                  </button>
                )}
              </div>
            )}

            {/* Figma */}
            {startup?.figma_url ? (
              <a
                href={startup.figma_url}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/50 hover:bg-purple-50/30 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
                    <FigmaIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-slate-900">Figma design system</h4>
                    <p className="text-[11px] text-slate-500 truncate max-w-[160px]">Design prototypes</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
              </a>
            ) : (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                    <FigmaIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-slate-700">Figma design system</h4>
                    <p className="text-[11px] text-slate-400">Not linked</p>
                  </div>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onOpenProfile?.('documents')}
                    className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Link
                  </button>
                )}
              </div>
            )}

            {/* Live Web Prototype */}
            {startup?.demo_url ? (
              <a
                href={startup.demo_url}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 hover:from-blue-100 hover:to-indigo-100 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-slate-900">Live web prototype</h4>
                    <p className="text-[11px] text-blue-700 font-medium truncate max-w-[160px]">
                      {startup.demo_url.replace(/^https?:\/\//, '')}
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ) : (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-slate-700">Live web prototype</h4>
                    <p className="text-[11px] text-slate-400">Not added</p>
                  </div>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onOpenProfile?.('documents')}
                    className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Add
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Video Walkthrough Preview (4 cols) */}
          <div className="md:col-span-4 flex flex-col">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex-1 flex flex-col justify-between p-4 group">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-rose-600 text-white shadow-xs">
                  Product demo
                </span>
                <span className="text-[10px] font-mono text-slate-300 font-medium bg-slate-800/80 px-2 py-0.5 rounded">
                  Demo
                </span>
              </div>

              {/* Centered Play Button */}
              <div className="py-6 flex justify-center">
                {startup?.demo_video_url ? (
                  <button
                    type="button"
                    onClick={() =>
                      setViewerFile({
                        url: startup.demo_video_url,
                        title: `${startup.startup_name || startup.name || 'Startup'} - Product Demo Video`,
                        type: 'video',
                      })
                    }
                    className="w-14 h-14 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer"
                    title="Watch demo video"
                  >
                    <Play className="w-6 h-6 ml-1 fill-slate-900 text-slate-900" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={readOnly ? undefined : () => onOpenProfile?.('documents')}
                    disabled={readOnly}
                    className={`w-14 h-14 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-2xl transition-transform ${readOnly ? 'cursor-default opacity-80' : 'cursor-pointer group-hover:scale-110'}`}
                    title={readOnly ? 'No demo video linked' : 'Upload or link video demo'}
                  >
                    <Play className="w-6 h-6 ml-1 fill-slate-900 text-slate-900" />
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-xs font-medium text-white leading-snug">
                  Interactive product demo
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {startup?.demo_video_url ? 'Click to watch recorded walkthrough' : readOnly ? 'No video walkthrough provided' : 'Add video walkthrough link in startup details'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Beta User Testing Metrics (4 cols) */}
          <div className="md:col-span-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-xs font-medium text-slate-900">Beta user testing metrics</span>
                <span className="text-[11px] font-medium text-blue-600">48 Active testers</span>
              </div>

              <div className="space-y-3 pt-3">
                {/* Metric 1: NPS */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                    <span>Net Promoter Score (NPS)</span>
                    <span className="text-emerald-600 font-semibold">+68 (Excellent)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 w-[78%]" />
                  </div>
                </div>

                {/* Metric 2: Retention */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                    <span>Weekly retention rate</span>
                    <span className="text-indigo-600 font-semibold">88%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500 w-[88%]" />
                  </div>
                </div>

                {/* Metric 3: Task Completion */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                    <span>Task completion speed</span>
                    <span className="text-cyan-600 font-semibold">92%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-500 w-[92%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
              <span>Avg session: 18m 40s</span>
              <span className="font-medium text-slate-600">Cohort verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* In-app Document & Video Viewer Modal */}
      <FileViewerModal
        isOpen={Boolean(viewerFile)}
        onClose={() => setViewerFile(null)}
        url={viewerFile?.url}
        title={viewerFile?.title}
        subtitle={startup?.startup_name || startup?.name}
        type={viewerFile?.type || 'auto'}
      />
    </div>
  );
}
