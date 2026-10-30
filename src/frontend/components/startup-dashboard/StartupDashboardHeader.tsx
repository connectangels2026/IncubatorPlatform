'use client';

import React from 'react';
import {
  Sparkles,
  Rocket,
  Download,
  Share2,
  TrendingUp,
  Layers,
  Cpu,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { DashboardTab, StartupProfile } from './types';

interface HeaderProps {
  profile: StartupProfile;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  milestoneCompletionText?: string;
  onExportReport?: () => void;
  onShare?: () => void;
}

export function StartupDashboardHeader({
  profile,
  activeTab,
  onTabChange,
  milestoneCompletionText = '7/10',
  onExportReport,
  onShare,
}: HeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top Banner Row */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Startup Brand & Identity */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/70 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#1A2151] tracking-tight">
                {profile.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                <Rocket className="w-3 h-3 text-indigo-500" />
                <span>{profile.batch}</span>
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                {profile.track === 'both' ? 'DeepTech (HW+SW)' : `${profile.track} Track`}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {profile.tagline}
            </p>
          </div>
        </div>

        {/* Stage Progress & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Progress Bar Widget */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 min-w-[200px]">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5">
              <span>{profile.stage}</span>
              <span className="text-blue-600 font-extrabold">{profile.stageProgress}% to Seed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${profile.stageProgress}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportReport}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Report</span>
            </button>

            <button
              type="button"
              onClick={onShare}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Navigation Tabs Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onTabChange('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#101638] text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          <span>Overview & KPIs</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {milestoneCompletionText}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('pitch')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'pitch'
              ? 'bg-[#101638] text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>Pitch & Prototype</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('tech')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'tech'
              ? 'bg-[#101638] text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Software & Hardware</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'activity'
              ? 'bg-[#101638] text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
          <span>Activity Log & Feedback</span>
        </button>
      </div>
    </div>
  );
}
