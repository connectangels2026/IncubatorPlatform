'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Filter,
  Star,
  CheckCircle2,
  Calendar,
  Send,
  User,
  Quote,
} from 'lucide-react';
import { ActivityLogItem } from './types';

const INITIAL_LOGS: ActivityLogItem[] = [
  {
    id: 'l1',
    title: 'Seed Pitch Deck v2.4 Approved by Investment Committee',
    tag: 'Pitch Approval',
    author: 'Marcus Vance (Lead Mentor)',
    timestamp: 'Yesterday at 4:15 PM',
    quote:
      'The refined financial slides and unit economics breakdown look super crisp. Stage 2 pitch gate cleared! Proceeding to Demo Day lineup.',
    scores: { team: 5, traction: 4, market: 5, tech: 5 },
    reply: {
      author: 'Alex Rivera',
      role: 'CEO',
      timestamp: 'Yesterday at 5:00 PM',
      message: "Thanks Marcus! Updating slide 12 with yesterday's ARR update now.",
    },
  },
  {
    id: 'l2',
    title: '1-on-1 Product Review with Dr. Aris Thorne',
    tag: 'Mentor Feedback',
    author: 'Dr. Aris Thorne',
    timestamp: '3 days ago',
    quote:
      'Focus heavily on the latency benchmarks between Gemini 1.5 Pro and your local custom fine-tune. Enterprise buyers will care most about token throughput cost efficiency.',
    scores: { team: 5, traction: 4, market: 4, tech: 5 },
  },
  {
    id: 'l3',
    title: 'Formlabs Form 3+ 3D Printer Reserved for 8 Hours',
    tag: 'Lab Reservation',
    author: 'David Park (CTO)',
    timestamp: '4 days ago',
  },
  {
    id: 'l4',
    title: 'Stage 2 Validation Gate Evaluation Passed',
    tag: 'Milestone',
    author: 'Incubator Academic Committee',
    timestamp: '1 week ago',
    quote: 'Customer validation feedback threshold of 50 interviews successfully surpassed.',
    scores: { team: 5, traction: 5, market: 5, tech: 5 },
  },
];

export function ActivityLogTab() {
  const [logs, setLogs] = useState<ActivityLogItem[]>(INITIAL_LOGS);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [replyInput, setReplyInput] = useState<{ [id: string]: string }>({});
  const [showNewLogModal, setShowNewLogModal] = useState(false);
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogNote, setNewLogNote] = useState('');

  const filteredLogs = logs.filter((item) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Mentors') return item.tag === 'Mentor Feedback';
    if (selectedFilter === 'Milestones') return item.tag === 'Milestone';
    if (selectedFilter === 'Submissions') return item.tag === 'Pitch Approval';
    if (selectedFilter === 'Lab') return item.tag === 'Lab Reservation';
    return true;
  });

  const handleSendReply = (logId: string) => {
    const text = replyInput[logId];
    if (!text?.trim()) return;

    setLogs((prev) =>
      prev.map((item) => {
        if (item.id === logId) {
          return {
            ...item,
            reply: {
              author: 'Founder',
              role: 'CEO',
              timestamp: 'Just now',
              message: text.trim(),
            },
          };
        }
        return item;
      })
    );

    setReplyInput((prev) => ({ ...prev, [logId]: '' }));
  };

  const handleCreateLog = () => {
    if (!newLogTitle.trim()) return;
    const newItem: ActivityLogItem = {
      id: `l_${Date.now()}`,
      title: newLogTitle.trim(),
      tag: 'Mentor Feedback',
      author: 'Founder Note',
      timestamp: 'Just now',
      quote: newLogNote.trim() || undefined,
    };
    setLogs([newItem, ...logs]);
    setNewLogTitle('');
    setNewLogNote('');
    setShowNewLogModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-[#1A2151]">
                Incubator Interaction & Audit Log
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Timeline of mentor reviews, stage approvals, and team logs
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNewLogModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Activity</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto pb-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {['All', 'Mentors', 'Milestones', 'Submissions', 'Lab'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline Feed */}
      <div className="space-y-4">
        {filteredLogs.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4 transition-all hover:shadow-xs"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 border border-slate-200">
                <User className="w-5 h-5 text-slate-500" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-black text-[#1A2151]">{item.title}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      item.tag === 'Pitch Approval'
                        ? 'bg-purple-100 text-purple-800'
                        : item.tag === 'Mentor Feedback'
                        ? 'bg-blue-100 text-blue-800'
                        : item.tag === 'Lab Reservation'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  By <span className="font-semibold text-slate-700">{item.author}</span> •{' '}
                  {item.timestamp}
                </p>
              </div>
            </div>

            {/* Quote Box (If feedback note exists) */}
            {item.quote && (
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs text-slate-700 leading-relaxed font-medium">
                "{item.quote}"
              </div>
            )}

            {/* Mentor Assessment Scores (If present) */}
            {item.scores && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                  Mentor Assessment Scores:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium">Team</span>
                    <span className="font-black text-slate-900 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {item.scores.team}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium">Traction</span>
                    <span className="font-black text-slate-900 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {item.scores.traction}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium">Market</span>
                    <span className="font-black text-slate-900 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {item.scores.market}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium">Tech</span>
                    <span className="font-black text-slate-900 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {item.scores.tech}/5
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Founder Reply (Thread) */}
            {item.reply ? (
              <div className="p-3.5 rounded-xl bg-blue-50/50 border-l-4 border-l-blue-600 border border-blue-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#1A2151]">
                    {item.reply.author} ({item.reply.role})
                  </span>
                  <span className="text-[10px] text-slate-400">{item.reply.timestamp}</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">{item.reply.message}</p>
              </div>
            ) : (
              /* Inline Reply Input */
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Post an update or reply to mentor feedback..."
                  value={replyInput[item.id] || ''}
                  onChange={(e) =>
                    setReplyInput((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply(item.id)}
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleSendReply(item.id)}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Log Activity Modal */}
      {showNewLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101638]/50 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-black text-[#1A2151]">Log New Cohort Activity</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Activity Title</label>
                <input
                  type="text"
                  value={newLogTitle}
                  onChange={(e) => setNewLogTitle(e.target.value)}
                  placeholder="e.g. Conducted customer discovery session with Lead VC"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Notes & Key Outcomes</label>
                <textarea
                  rows={3}
                  value={newLogNote}
                  onChange={(e) => setNewLogNote(e.target.value)}
                  placeholder="Add meeting notes, feedback, or milestone takeaways..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewLogModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateLog}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md"
              >
                Save Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
