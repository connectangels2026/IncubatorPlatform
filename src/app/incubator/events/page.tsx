'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import { DashboardLayout } from '@/frontend/components/layouts/DashboardLayout';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Video,
  Clock,
  Users,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';

interface EventItem {
  id: string;
  title: string;
  event_type: 'Demo Day' | 'Workshop' | 'Pitch Session' | 'Networking';
  event_date: string;
  start_time: string;
  end_time: string;
  mode: 'online' | 'in_person' | 'hybrid';
  location?: string;
  meeting_link?: string;
  attendees_count: number;
  capacity?: number;
  description?: string;
}

const defaultEvents: EventItem[] = [
  {
    id: 'evt_1',
    title: 'Cohort 2026-A Demo Day & Investor Showcase',
    event_type: 'Demo Day',
    event_date: '2026-10-15',
    start_time: '14:00',
    end_time: '18:00',
    mode: 'hybrid',
    location: 'Main Auditorium, Innovation Hub',
    meeting_link: 'https://zoom.us/j/demo-day-2026',
    attendees_count: 85,
    capacity: 120,
    description: 'Final pitch presentations by top 12 graduating startups before 50+ VCs and angel syndicates.',
  },
  {
    id: 'evt_2',
    title: 'Term Sheet & Cap Table Masterclass',
    event_type: 'Workshop',
    event_date: '2026-10-08',
    start_time: '16:00',
    end_time: '17:30',
    mode: 'online',
    meeting_link: 'https://meet.google.com/cap-table-deepdive',
    attendees_count: 28,
    capacity: 40,
    description: 'Deep dive into convertible notes, valuation caps, and liquidation preferences for seed rounds.',
  },
  {
    id: 'evt_3',
    title: 'Founder-to-Founder Networking Mixer',
    event_type: 'Networking',
    event_date: '2026-10-22',
    start_time: '18:00',
    end_time: '20:30',
    mode: 'in_person',
    location: 'Rooftop Cafe, Incubator Campus',
    attendees_count: 42,
    capacity: 60,
    description: 'Casual evening networking and peer knowledge sharing across all cohort batches.',
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<'Demo Day' | 'Workshop' | 'Pitch Session' | 'Networking'>('Workshop');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:30');
  const [mode, setMode] = useState<'online' | 'in_person' | 'hybrid'>('online');
  const [meetingLink, setMeetingLink] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const orgId = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
        const res = await fetch('/api/v1/events', {
          headers: {
            Authorization: 'Bearer mock-admin',
            ...(orgId ? { 'x-org-id': orgId } : {}),
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setEvents(json.data);
          }
        }
      } catch (err) {
        // Fallback
      }
    }
    fetchEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;
    setLoading(true);

    const payload = {
      title,
      event_type: eventType,
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      mode,
      meeting_link: meetingLink,
      description,
      attendees_count: 0,
      capacity: 50,
    };

    try {
      const orgId = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
      const res = await fetch('/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-admin',
          ...(orgId ? { 'x-org-id': orgId } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        setEvents((prev) => [json.data, ...prev]);
      } else {
        const newLocal: EventItem = {
          id: 'evt_' + Date.now(),
          ...payload,
        };
        setEvents((prev) => [newLocal, ...prev]);
      }
    } catch (err) {
      const newLocal: EventItem = {
        id: 'evt_' + Date.now(),
        ...payload,
      };
      setEvents((prev) => [newLocal, ...prev]);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setTitle('');
      setEventDate('');
      setDescription('');
      setMeetingLink('');
    }
  };

  const isPastEvent = (eventDateStr: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const evDate = new Date(eventDateStr);
      evDate.setHours(0, 0, 0, 0);
      return evDate.getTime() < today.getTime();
    } catch {
      return false;
    }
  };

  const filtered = events
    .filter((ev) => {
      const matchesSearch =
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        (ev.description || '').toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || ev.event_type.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const aDate = new Date(a.event_date).getTime();
      const bDate = new Date(b.event_date).getTime();
      const now = Date.now();
      const aUpcoming = aDate >= now;
      const bUpcoming = bDate >= now;
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      return aDate - bDate;
    });

  return (
    <ProtectedRoute>
      <DashboardLayout
        breadcrumbs={[{ label: 'Events' }]}
      >
        <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Events
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Host demo days, investor pitch sessions, regulatory webinars, and founder mixers.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create event</span>
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search event title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['all', 'Demo Day', 'Workshop', 'Pitch Session', 'Networking'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t === 'all' ? 'All events' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Events Cards */}
        <div className="space-y-3">
          {filtered.map((ev) => {
            const past = isPastEvent(ev.event_date);
            return (
              <div
                key={ev.id}
                className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-700 flex flex-col items-center justify-center flex-shrink-0 border border-slate-200/80">
                    <span className="text-[10px] uppercase text-slate-500 font-medium">
                      {new Date(ev.event_date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-base font-semibold leading-none mt-0.5">
                      {new Date(ev.event_date).getUTCDate()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-normal px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80">
                        {ev.event_type}
                      </span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {ev.start_time} - {ev.end_time}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-sm">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-xs text-slate-500 mt-1 max-w-2xl line-clamp-2">
                        {ev.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        {ev.mode === 'online' ? (
                          <>
                            <Video className="w-3.5 h-3.5 text-blue-500" /> Virtual session
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> {ev.location || 'In-person'}
                          </>
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{ev.attendees_count}</span> registered
                        {ev.capacity ? ` / ${ev.capacity}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                  {ev.meeting_link && !past ? (
                    <a
                      href={ev.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 px-3.5 py-1.5 rounded-lg transition"
                    >
                      <span>Join link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : past ? (
                    <span className="text-xs font-normal text-slate-400 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                      Past event
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No events found</h3>
            <p className="text-xs text-slate-500 mt-1">Schedule your next cohort workshop or demo day.</p>
          </div>
        )}

        {/* Modal: Create Event */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Schedule New Event</h2>
              <p className="text-xs text-slate-500 mb-5">
                Organize cohort demo days, workshops, or founder mixers.
              </p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 VC Pitch Day"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value="Demo Day">Demo Day</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Pitch Session">Pitch Session</option>
                      <option value="Networking">Networking</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Link</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief agenda or instructions for founders..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs font-semibold px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
