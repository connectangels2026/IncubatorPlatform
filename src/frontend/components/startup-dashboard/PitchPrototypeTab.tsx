'use client';

import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Eye,
  Download,
  Share2,
  Clock,
  Play,
  Github,
  Figma,
  Rocket,
  ExternalLink,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';
import { DeckRevision } from './types';

const SAMPLE_REVISIONS: DeckRevision[] = [
  {
    version: 'v2.4',
    date: 'Oct 27, 2026',
    author: 'Alex Rivera',
    keyChanges: 'Updated unit economics & TAM slides',
    status: 'Approved',
  },
  {
    version: 'v2.2',
    date: 'Oct 18, 2026',
    author: 'Sarah Chen',
    keyChanges: 'Refined competitor matrix grid',
    status: 'Archived',
  },
  {
    version: 'v2.0',
    date: 'Oct 02, 2026',
    author: 'Alex Rivera',
    keyChanges: 'Added technical architecture page',
    status: 'Archived',
  },
  {
    version: 'v1.0',
    date: 'Sep 12, 2026',
    author: 'David Park',
    keyChanges: 'Initial cohort application draft',
    status: 'Archived',
  },
];

export function PitchPrototypeTab() {
  const [revisions, setRevisions] = useState<DeckRevision[]>(SAMPLE_REVISIONS);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const newRev: DeckRevision = {
        version: `v2.${revisions.length + 1}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: 'Founder',
        keyChanges: `Uploaded ${file.name}`,
        status: 'Approved',
      };
      setRevisions([newRev, ...revisions]);
      setIsUploading(false);
      setToastMessage(`Uploaded ${file.name} successfully!`);
      setTimeout(() => setToastMessage(null), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Active Pitch Deck + Deck Revision History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Active Pitch Deck (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-[#1A2151]">Active Pitch Deck</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                v2.4 Active
              </span>
            </div>

            {/* Active File Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 font-black text-xs flex items-center justify-center shrink-0">
                  PDF
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A2151]">NexusAI_Pitch_Q3.pdf</h4>
                  <p className="text-[11px] text-slate-500 font-medium">14.2 MB • Updated 2 days ago</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70">
                <button
                  type="button"
                  onClick={() => alert('Opening preview of pitch deck...')}
                  className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-2xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert('Downloading pitch deck PDF...')}
                  className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert('Shareable link copied to clipboard!')}
                  className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-2xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="mt-4">
            <label className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all bg-slate-50/50 hover:bg-indigo-50/20 cursor-pointer">
              <input
                type="file"
                accept=".pdf,.pptx"
                onChange={handleSimulateUpload}
                disabled={isUploading}
                className="sr-only"
              />
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#1A2151]">
                {isUploading ? 'Uploading file...' : 'Upload New Revision'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">PDF or PPTX up to 50MB</span>
            </label>
          </div>
        </div>

        {/* Right Card: Deck Revision History (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-[#1A2151]">Deck Revision History</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600">
              {revisions.length} Version Snapshots
            </span>
          </div>

          {/* Revision Table */}
          <div className="overflow-x-auto pt-3 flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="pb-3 pr-2">Version</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">Author</th>
                  <th className="pb-3 px-2">Key Changes</th>
                  <th className="pb-3 pl-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {revisions.map((rev) => (
                  <tr key={rev.version} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 pr-2 font-black text-blue-600">{rev.version}</td>
                    <td className="py-3 px-2 font-medium text-slate-600 whitespace-nowrap">{rev.date}</td>
                    <td className="py-3 px-2 font-semibold text-[#1A2151] whitespace-nowrap">{rev.author}</td>
                    <td className="py-3 px-2 text-slate-600 max-w-[220px] truncate">{rev.keyChanges}</td>
                    <td className="py-3 pl-2 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                          rev.status === 'Approved'
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
      </div>

      {/* Bottom Card: Prototype Hub & Live Demos */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-[#1A2151]">Prototype Hub & Live Demos</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live web preview, code repositories, and user testing metrics
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Status: 99.9% Uptime</span>
          </span>
        </div>

        {/* 3-Section Grid: Left Links, Middle Video Preview, Right Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5">
          {/* Section 1: Links (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/60 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A2151]">GitHub Repository</h4>
                  <p className="text-[11px] text-slate-500">142 commits • main branch</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
            </a>

            {/* Figma */}
            <a
              href="https://figma.com"
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/50 hover:bg-purple-50/30 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
                  <Figma className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A2151]">Figma Design System</h4>
                  <p className="text-[11px] text-slate-500">28 component variants v3</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
            </a>

            {/* Live Web Prototype */}
            <a
              href="https://nexusai-labs.io"
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 hover:from-blue-100 hover:to-indigo-100 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Rocket className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A2151]">Live Web Prototype</h4>
                  <p className="text-[11px] text-blue-700 font-semibold">app.nexusai-labs.io</p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          </div>

          {/* Section 2: Video Walkthrough Preview (4 cols) */}
          <div className="md:col-span-4 flex flex-col">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex-1 flex flex-col justify-between p-4 group">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                  Product Demo
                </span>
                <span className="text-[10px] font-mono text-slate-300 font-bold bg-slate-800/80 px-2 py-0.5 rounded">
                  03:45
                </span>
              </div>

              {/* Centered Play Button */}
              <div className="py-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => alert('Playing interactive product demo...')}
                  className="w-14 h-14 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer"
                >
                  <Play className="w-6 h-6 ml-1 fill-slate-900 text-slate-900" />
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white leading-snug">
                  Interactive AI Agent Walk-through
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Recorded for YC & Incubator Gate Review
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Beta User Testing Metrics (4 cols) */}
          <div className="md:col-span-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-xs font-black text-[#1A2151]">Beta User Testing Metrics</span>
                <span className="text-[11px] font-extrabold text-blue-600">48 Active Testers</span>
              </div>

              <div className="space-y-3 pt-3">
                {/* Metric 1: NPS */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>Net Promoter Score (NPS)</span>
                    <span className="text-emerald-600 font-black">+68 (Excellent)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 w-[78%]" />
                  </div>
                </div>

                {/* Metric 2: Retention */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>Weekly Retention Rate</span>
                    <span className="text-indigo-600 font-black">88%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500 w-[88%]" />
                  </div>
                </div>

                {/* Metric 3: Task Completion */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>Task Completion Speed</span>
                    <span className="text-cyan-600 font-black">92%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-500 w-[92%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
              <span>Avg Session: 18m 40s</span>
              <a href="#" className="font-bold text-blue-600 hover:text-blue-800">
                View Stats
              </a>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#101638] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold animate-in fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
