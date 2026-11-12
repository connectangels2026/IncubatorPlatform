'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MessageSquare,
  Plus,
  Send,
  User,
  Loader2,
  X,
} from 'lucide-react';
import { supabase } from '@/backend/lib/supabase';

export interface StartupActivityRecord {
  id: string;
  startup_id: string;
  parent_id?: string | null;
  author_id?: string | null;
  author_name?: string | null;
  author_role?: string | null;
  type: string;
  title?: string | null;
  body: string;
  scores?: {
    team?: number;
    traction?: number;
    market?: number;
    tech?: number;
  } | null;
  created_at: string;
  replies?: StartupActivityRecord[];
}

interface ActivityLogTabProps {
  startup?: any;
  readOnly?: boolean;
}

export function ActivityLogTab({ startup, readOnly = false }: ActivityLogTabProps = {}) {
  const startupId = startup?.id || 'me';
  const [activities, setActivities] = useState<StartupActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [replyInput, setReplyInput] = useState<{ [id: string]: string }>({});
  const [showNewLogModal, setShowNewLogModal] = useState(false);
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogNote, setNewLogNote] = useState('');
  const [newLogType, setNewLogType] = useState('note');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch activities from database
  const loadActivities = useCallback(async () => {
    if (!startup?.id) return;
    try {
      const res = await fetch(`/api/v1/startups/${startup.id}/activity`);
      const json = await res.json();
      if (json.success && Array.isArray(json.activities)) {
        setActivities(json.activities);
      }
    } catch (err) {
      console.warn('Failed to fetch activity log:', err);
    } finally {
      setIsLoading(false);
    }
  }, [startup?.id]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Supabase Realtime synchronization on startup_activity table
  useEffect(() => {
    if (!startup?.id) return;

    const channelName = `activity-realtime-${startup.id}-${Math.random().toString(36).slice(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'startup_activity',
          filter: `startup_id=eq.${startup.id}`,
        },
        () => {
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [startup?.id, loadActivities]);

  // Threading: nest replies under parent activities
  const threadedLogs = useMemo(() => {
    const rootItems: StartupActivityRecord[] = [];
    const replyMap = new Map<string, StartupActivityRecord[]>();

    for (const act of activities) {
      if (act.parent_id) {
        const existing = replyMap.get(act.parent_id) || [];
        existing.push(act);
        replyMap.set(act.parent_id, existing);
      } else {
        rootItems.push(act);
      }
    }

    // Attach replies sorted oldest-first within each thread
    return rootItems.map((root) => ({
      ...root,
      replies: (replyMap.get(root.id) || []).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    }));
  }, [activities]);

  const filteredLogs = useMemo(() => {
    if (selectedFilter === 'All') return threadedLogs;
    if (selectedFilter === 'Mentors') {
      return threadedLogs.filter(
        (it) =>
          it.type === 'feedback' ||
          it.type === 'mentor_feedback' ||
          it.author_role === 'Mentor' ||
          it.author_role === 'Incubator'
      );
    }
    if (selectedFilter === 'Milestones') {
      return threadedLogs.filter((it) => it.type === 'milestone');
    }
    if (selectedFilter === 'Submissions') {
      return threadedLogs.filter((it) => it.type === 'pitch_review' || it.type === 'submission');
    }
    if (selectedFilter === 'Notes') {
      return threadedLogs.filter((it) => it.type === 'note' || it.type === 'update');
    }
    return threadedLogs;
  }, [threadedLogs, selectedFilter]);

  const handleSendReply = async (parentId: string) => {
    const text = replyInput[parentId];
    if (!text?.trim() || !startup?.id) return;

    try {
      const res = await fetch(`/api/v1/startups/${startup.id}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_id: parentId,
          type: 'reply',
          body: text.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.activity) {
        setActivities((prev) => [...prev, json.activity]);
        setReplyInput((prev) => ({ ...prev, [parentId]: '' }));
      }
    } catch (err) {
      console.warn('Failed to post reply:', err);
    }
  };

  const handleCreateLog = async () => {
    if (!newLogNote.trim() || !startup?.id || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/startups/${startup.id}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newLogTitle.trim() || 'Activity Update',
          type: newLogType,
          body: newLogNote.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.activity) {
        setActivities((prev) => [json.activity, ...prev]);
        setNewLogTitle('');
        setNewLogNote('');
        setShowNewLogModal(false);
      }
    } catch (err) {
      console.warn('Failed to create activity log:', err);
    } finally {
      setIsSubmitting(false);
    }
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
            {['All', 'Mentors', 'Milestones', 'Submissions', 'Notes'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedFilter(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${selectedFilter === tab
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

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-500">Loading activity timeline...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3 p-8">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No activity logged yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Share updates, log milestone notes, or receive feedback from your incubator mentor.
          </p>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowNewLogModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post first note</span>
            </button>
          )}
        </div>
      ) : (
        /* Activity Timeline Feed with Vertical Connecting Line */
        <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-px before:bg-slate-200">
          {filteredLogs.map((item) => (
            <div key={item.id} className="relative">
              {/* Timeline Dot */}
              <div className="absolute -left-6 top-4 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-white" />

              {/* Lighter Card: border-slate-200, p-4, 32px avatar */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200 font-semibold text-xs">
                    {(item.author_name || 'U').trim().charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                        {item.title || 'Activity Note'}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium ${item.type === 'pitch_review'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/70'
                          : item.type === 'feedback' || item.type === 'mentor_feedback'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/70'
                            : item.type === 'milestone'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                      >
                        {item.type === 'pitch_review'
                          ? 'Pitch review'
                          : item.type === 'feedback' || item.type === 'mentor_feedback'
                            ? 'Mentor feedback'
                            : item.type === 'milestone'
                              ? 'Milestone'
                              : 'Note'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      By <span className="font-medium text-slate-700">{item.author_name || 'Founder'}</span>
                      {item.author_role && ` (${item.author_role})`} ·{' '}
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                </div>

                {/* Body Text */}
                {item.body && (
                  <p className="text-xs text-slate-700 leading-relaxed pl-11 whitespace-pre-wrap">
                    {item.body}
                  </p>
                )}

                {/* Mentor Assessment Scores if present */}
                {item.scores && Object.keys(item.scores).length > 0 && (
                  <div className="pl-11 pt-1">
                    <div className="text-xs font-medium text-slate-600">
                      {item.scores.team && <span>Team <b className="text-slate-900">{item.scores.team}/5</b> · </span>}
                      {item.scores.traction && <span>Traction <b className="text-slate-900">{item.scores.traction}/5</b> · </span>}
                      {item.scores.market && <span>Market <b className="text-slate-900">{item.scores.market}/5</b> · </span>}
                      {item.scores.tech && <span>Tech <b className="text-slate-900">{item.scores.tech}/5</b></span>}
                    </div>
                  </div>
                )}

                {/* Threaded Replies */}
                {item.replies && item.replies.length > 0 && (
                  <div className="ml-11 space-y-2 border-l-2 border-l-blue-600 pl-3 pt-1">
                    {item.replies.map((reply) => (
                      <div key={reply.id} className="text-xs space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {reply.author_name || 'User'}
                            {reply.author_role && ` (${reply.author_role})`}
                          </span>
                          <span className="text-slate-400">
                            · {reply.created_at ? new Date(reply.created_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{reply.body}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Reply Input */}
                {!readOnly && (
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
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Activity Modal */}
      {showNewLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101638]/50 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-[#1A2151]">Log New Activity Note</h3>
              <button
                type="button"
                onClick={() => setShowNewLogModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Activity Type</label>
                <select
                  value={newLogType}
                  onChange={(e) => setNewLogType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                >
                  <option value="note">General Update / Note</option>
                  <option value="milestone">Milestone Achievement</option>
                  <option value="feedback">Mentor Feedback</option>
                  <option value="pitch_review">Pitch & Deck Review</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Activity Title</label>
                <input
                  type="text"
                  value={newLogTitle}
                  onChange={(e) => setNewLogTitle(e.target.value)}
                  placeholder="e.g. Conducted customer discovery interview with lead customer"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Notes & Details *</label>
                <textarea
                  rows={4}
                  value={newLogNote}
                  onChange={(e) => setNewLogNote(e.target.value)}
                  placeholder="Add meeting notes, milestone takeaways, or key metrics..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewLogModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateLog}
                disabled={isSubmitting || !newLogNote.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Activity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
