'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/super-admin/Sidebar';
import {
  TrendingUp,
  CreditCard,
  Ban,
  Building,
  UserCheck,
  Download,
  Activity,
  Search,
} from 'lucide-react';

interface AuditEvent {
  id: string;
  code: string;
  type: string;
  category: 'upgrade' | 'payment' | 'security' | 'tenant' | 'user';
  title: string;
  tags: { label: string; value?: string; variant?: 'default' | 'purple' | 'cyan' | 'slate' }[];
  timestamp: string;
}

const INITIAL_EVENTS: AuditEvent[] = [
  {
    id: '1',
    code: '#EVT-8941',
    type: 'Upgrade Event',
    category: 'upgrade',
    title: 'NurtureCave upgraded from Free to Pro Tier',
    tags: [
      { label: 'Organization: NurtureCave' },
      { label: 'Plan: $499/mo' },
      { label: 'Triggered by: Super Admin', variant: 'purple' },
    ],
    timestamp: 'Sep 1, 2026 • 11:24 AM',
  },
  {
    id: '2',
    code: '#EVT-8942',
    type: 'Payment Received',
    category: 'payment',
    title: 'Payment received ₹999.00 from XYZ Accelerator',
    tags: [
      { label: 'Invoice #INV-2026-14' },
      { label: 'Method: Stripe Auto-debit' },
      { label: 'Triggered by: System Automation', variant: 'slate' },
    ],
    timestamp: 'Sep 5, 2026 • 09:12 AM',
  },
  {
    id: '3',
    code: '#EVT-8943',
    type: 'Security Suspension',
    category: 'security',
    title: 'ABC Foundation blocked for non-payment',
    tags: [
      { label: 'Reason: Overdue invoice #1042 (>30 days)' },
      { label: 'Triggered by: Super Admin', variant: 'purple' },
    ],
    timestamp: 'Sep 10, 2026 • 04:45 PM',
  },
  {
    id: '4',
    code: '#EVT-8944',
    type: 'New Tenant Creation',
    category: 'tenant',
    title: 'New organization created: Startup Hub',
    tags: [
      { label: 'Admin: founder@startuphub.io' },
      { label: 'Plan: Free Community' },
      { label: 'Triggered by: Org Admin', variant: 'cyan' },
    ],
    timestamp: 'Sep 12, 2026 • 02:30 PM',
  },
  {
    id: '5',
    code: '#EVT-8945',
    type: 'User Profile Change',
    category: 'user',
    title: 'Rajesh changed email address from rajesh@old.com to rajesh@new.com',
    tags: [
      { label: 'Security notice dispatched' },
      { label: 'Triggered by: User / Admin', variant: 'slate' },
    ],
    timestamp: 'Sep 15, 2026 • 08:18 AM',
  },
];

export default function SuperAdminActivityLogsPage() {
  const [events, setEvents] = useState<AuditEvent[]>(INITIAL_EVENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [isLiveFeed, setIsLiveFeed] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [dateRangeFilter, setDateRangeFilter] = useState('30d');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.tags.some((t) => t.label.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAction =
      actionFilter === 'All' ||
      (actionFilter === 'upgrades' && evt.category === 'upgrade') ||
      (actionFilter === 'payments' && evt.category === 'payment') ||
      (actionFilter === 'blocks' && evt.category === 'security') ||
      (actionFilter === 'creations' && evt.category === 'tenant');

    return matchesSearch && matchesAction;
  });

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-8 max-w-[1400px]">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Platform Activity &amp; Audit Logs
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Immutable real-time audit stream of all tenant lifecycle events, administrative overrides, and payment transactions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Live Feed Toggle */}
              <button
                onClick={() => {
                  setIsLiveFeed(!isLiveFeed);
                  showToast(isLiveFeed ? 'Live feed paused' : 'Live feed activated');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition shadow-sm ${
                  isLiveFeed
                    ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                <Activity className={`w-3.5 h-3.5 ${isLiveFeed ? 'animate-pulse' : ''}`} />
                <span>Live Feed: {isLiveFeed ? 'ON' : 'OFF'}</span>
              </button>

              {/* Export to CSV */}
              <button
                onClick={() => showToast('Activity logs exported to audit_trail_2026.csv')}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export to CSV</span>
              </button>
            </div>
          </header>

          {/* Search & Filter Bar Container */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm my-4 space-y-3">
            {/* Top Search Line */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by organization, admin email, or event description..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>

              <div className="px-3 py-1.5 bg-slate-100/80 rounded-lg text-xs font-bold text-slate-600 shrink-0">
                Showing {filteredEvents.length} audit events
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="bg-white border border-slate-200 font-medium text-slate-700 px-3 py-1.5 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="All">Action Type: All (Upgrades, Payments, Blocks, Creations)</option>
                <option value="upgrades">Upgrades</option>
                <option value="payments">Payments</option>
                <option value="blocks">Blocks &amp; Security</option>
                <option value="creations">Tenant Creations</option>
              </select>

              <select className="bg-white border border-slate-200 font-medium text-slate-700 px-3 py-1.5 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500">
                <option>Organization: All Tenants</option>
                <option>NurtureCave</option>
                <option>XYZ Accelerator</option>
                <option>ABC Foundation</option>
                <option>Startup Hub</option>
              </select>

              <select className="bg-white border border-slate-200 font-medium text-slate-700 px-3 py-1.5 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500">
                <option>Triggered By: All (System, Super Admin, Org Admin)</option>
                <option>Super Admin</option>
                <option>System Automation</option>
                <option>Org Admin</option>
              </select>

              <select className="bg-white border border-slate-200 font-medium text-slate-700 px-3 py-1.5 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 ml-auto">
                <option>Date Range: Last 30 Days</option>
                <option>Date Range: Last 90 Days</option>
                <option>Date Range: Year to Date</option>
              </select>
            </div>
          </div>

          {/* Timeline Feed Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mt-6">
            <div className="space-y-8 relative before:absolute before:inset-0 before:left-[19px] before:w-[2px] before:bg-slate-100 before:top-4 before:bottom-4">
              {filteredEvents.map((evt) => {
                // Color and Icon determination
                let iconColor = 'bg-emerald-500 text-white';
                let IconComponent = TrendingUp;

                if (evt.category === 'payment') {
                  iconColor = 'bg-cyan-500 text-white';
                  IconComponent = CreditCard;
                } else if (evt.category === 'security') {
                  iconColor = 'bg-rose-500 text-white';
                  IconComponent = Ban;
                } else if (evt.category === 'tenant') {
                  iconColor = 'bg-blue-600 text-white';
                  IconComponent = Building;
                } else if (evt.category === 'user') {
                  iconColor = 'bg-slate-600 text-white';
                  IconComponent = UserCheck;
                }

                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="relative flex items-start gap-5 group cursor-pointer hover:bg-slate-50/70 p-2.5 rounded-xl transition"
                    title="Click to view raw event payload"
                  >
                    {/* Circle Node Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm ${iconColor}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            {evt.type}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {evt.title}
                        </h3>

                        {/* Badges Line */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          {evt.tags.map((tag, idx) => {
                            let badgeStyle =
                              'bg-slate-100 text-slate-700 border-slate-200';
                            if (tag.variant === 'purple') {
                              badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';
                            } else if (tag.variant === 'cyan') {
                              badgeStyle = 'bg-cyan-50 text-cyan-700 border-cyan-200';
                            } else if (tag.variant === 'slate') {
                              badgeStyle = 'bg-slate-100 text-slate-800 border-slate-200';
                            }

                            return (
                              <span
                                key={idx}
                                className={`px-2.5 py-0.5 rounded-md font-medium border text-[11px] ${badgeStyle}`}
                              >
                                {tag.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Timestamp & Event ID */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-medium text-slate-400">
                          {evt.timestamp} •{' '}
                          <span className="font-mono text-slate-500 font-semibold">
                            {evt.code}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-6 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <div>Showing 1 to 25 of 248 audit entries</div>

              <div className="flex items-center gap-1">
                <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                  Previous
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-sky-500 text-white font-bold">
                  1
                </button>
                <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                  2
                </button>
                <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                  3
                </button>
                <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Event Payload Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Event Inspection • {selectedEvent.code}
                </h3>
                <p className="text-[11px] text-slate-400">{selectedEvent.title}</p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-3">
              <span className="text-slate-500 font-medium">Raw JSON Audit Payload:</span>
              <pre className="mt-1.5 p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed">
{JSON.stringify(
  {
    event_id: selectedEvent.code,
    type: selectedEvent.type,
    category: selectedEvent.category,
    summary: selectedEvent.title,
    timestamp: selectedEvent.timestamp,
    tags: selectedEvent.tags,
    cluster_node: 'prod-us-central1-04',
    signature_verified: true,
  },
  null,
  2
)}
              </pre>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedEvent, null, 2));
                  showToast('Audit event payload copied to clipboard');
                  setSelectedEvent(null);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
              >
                Copy Payload
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <span className="text-emerald-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
