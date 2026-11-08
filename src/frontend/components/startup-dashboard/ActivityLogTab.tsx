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

interface ActivityLogTabProps {
  startup?: any;
  readOnly?: boolean;
}

export function ActivityLogTab({ startup, readOnly = false }: ActivityLogTabProps = {}) {
  const [logs, setLogs] = useState<ActivityLogItem[]>(() => {
    if (Array.isArray(startup?.activity_logs) && startup.activity_logs.length > 0) {
      return startup.activity_logs.map((l: any, idx: number) => ({
        id: l.id || `real-${idx}`,
        title: l.description || l.action || 'Activity Event',
        tag: l.action === 'startup_updated' ? 'Update' : l.action === 'startup_change_requested' ? 'Change Request' : 'Milestone',
        author: l.triggered_by || 'User',
        timestamp: l.created_at ? new Date(l.created_at).toLocaleDateString() : 'Recent',
        quote: l.description || '',
      }));
    }
    return INITIAL_LOGS;
  });

  React.useEffect(() => {
    if (Array.isArray(startup?.activity_logs) && startup.activity_logs.length > 0) {
      setLogs(
        startup.activity_logs.map((l: any, idx: number) => ({
          id: l.id || `real-${idx}`,
          title: l.description || l.action || 'Activity Event',
          tag: l.action === 'startup_updated' ? 'Update' : l.action === 'startup_change_requested' ? 'Change Request' : 'Milestone',
          author: l.triggered_by || 'User',
          timestamp: l.created_at ? new Date(l.created_at).toLocaleDateString() : 'Recent',
          quote: l.description || '',
        }))
      );
    }
  }, [startup?.activity_logs]);
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
      {/* Compact Top Header Row */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Left: Title + Filter Pills */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Activity Log</h2>
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-200" />

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {['All', 'Mentors', 'Milestones', 'Submissions', 'Lab'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedFilter(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
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

        {/* Right: Log New Activity (hidden in readOnly mode) */}
        {!readOnly && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowNewLogModal(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log New Activity</span>
            </button>
          </div>
        )}
      </div>

      {/* Activity Timeline Feed with Vertical Connecting Line */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-px before:bg-slate-200">
        {filteredLogs.map((item) => (
          <div key={item.id} className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-6 top-4 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-white" />

            {/* Lighter Card: border-slate-200, p-4, 32px avatar, no heavy radius */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
              {/* Header */}
              <div className="flex items-start gap-3">
                {/* 32px Avatar */}
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                  <User className="w-4 h-4 text-slate-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{item.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                        item.tag === 'Pitch Approval'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/70'
                          : item.tag === 'Mentor Feedback'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/70'
                          : item.tag === 'Lab Reservation'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                      }`}
                    >
                      {item.tag === 'Pitch Approval'
                        ? 'Pitch approval'
                        : item.tag === 'Mentor Feedback'
                        ? 'Mentor feedback'
                        : item.tag === 'Lab Reservation'
                        ? 'Lab reservation'
                        : 'Milestone'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    By <span className="font-medium text-slate-700">{item.author}</span> · {item.timestamp}
                  </p>
                </div>
              </div>

              {/* Quote Box as Plain Italic Text */}
              {item.quote && (
                <p className="text-xs text-slate-600 italic leading-relaxed pl-11">
                  “{item.quote}”
                </p>
              )}

              {/* Mentor Assessment Scores: Compact Row */}
              {item.scores && (
                <div className="pl-11 pt-1">
                  <div className="text-xs font-medium text-slate-600">
                    Team <span className="font-semibold text-slate-900">{item.scores.team}/5</span> · Traction{' '}
                    <span className="font-semibold text-slate-900">{item.scores.traction}/5</span> · Market{' '}
                    <span className="font-semibold text-slate-900">{item.scores.market}/5</span> · Tech{' '}
                    <span className="font-semibold text-slate-900">{item.scores.tech}/5</span>
                  </div>
                </div>
              )}

              {/* Founder Reply (Thread) - keeps the blue left border */}
              {item.reply ? (
                <div className="ml-11 border-l-2 border-l-blue-600 pl-3 py-1 text-xs space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {item.reply.author} ({item.reply.role})
                    </span>
                    <span className="text-slate-400">· {item.reply.timestamp}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{item.reply.message}</p>
                </div>
              ) : !readOnly ? (
                /* Inline Reply Input */
                <div className="pl-11 pt-1 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Post a reply..."
                    value={replyInput[item.id] || ''}
                    onChange={(e) =>
                      setReplyInput((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply(item.id)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendReply(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1 transition shadow-xs cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                </div>
              ) : null}
            </div>
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

