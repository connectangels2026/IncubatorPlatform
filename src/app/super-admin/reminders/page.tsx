'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/super-admin/Sidebar';
import {
  Clock,
  Settings,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Send,
  Plus,
} from 'lucide-react';

interface ScheduledReminder {
  id: string;
  orgName: string;
  invoiceNum: string;
  amountInr: string;
  amountUsd: string;
  dueDate: string;
  dispatchTime: string;
  status: 'Auto-scheduled' | 'Scheduled' | 'Action Needed';
  isUrgent?: boolean;
}

interface SentReminder {
  id: string;
  orgName: string;
  email: string;
  template: string;
  sentAt: string;
  status: 'Delivered & Opened' | 'Delivered';
}

const INITIAL_QUEUE: ScheduledReminder[] = [
  {
    id: '1',
    orgName: 'Nexlify Labs',
    invoiceNum: '#INV-2026-08',
    amountInr: '₹41,500',
    amountUsd: '$499',
    dueDate: 'Due in 2 days (Sep 20)',
    dispatchTime: 'Tomorrow, 09:00 AM',
    status: 'Auto-scheduled',
  },
  {
    id: '2',
    orgName: 'BioTech Ventures',
    invoiceNum: '#INV-2026-11',
    amountInr: '₹62,000',
    amountUsd: '$750',
    dueDate: 'Due today (Sep 18)',
    dispatchTime: 'Today, 02:00 PM',
    status: 'Scheduled',
  },
  {
    id: '3',
    orgName: 'SeedCamp Plus',
    invoiceNum: '#INV-2026-12',
    amountInr: '₹58,000',
    amountUsd: '$700',
    dueDate: 'Overdue by 4 days',
    dispatchTime: 'Pending Review',
    status: 'Action Needed',
    isUrgent: true,
  },
];

const INITIAL_HISTORY: SentReminder[] = [
  {
    id: '1',
    orgName: 'TechStars Hub',
    email: 'billing@techstars.io',
    template: 'Friendly Pre-Due Notice',
    sentAt: 'Sep 10, 2026 • 09:02 AM',
    status: 'Delivered & Opened',
  },
  {
    id: '2',
    orgName: 'Nexlify Labs',
    email: 'finance@nexlify.co',
    template: 'Invoice Due Today',
    sentAt: 'Sep 15, 2026 • 09:00 AM',
    status: 'Delivered',
  },
  {
    id: '3',
    orgName: 'VentureScale',
    email: 'elena@venturescale.co',
    template: 'Final Overdue Warning',
    sentAt: 'Sep 12, 2026 • 04:15 PM',
    status: 'Delivered',
  },
];

export default function PaymentRemindersPage() {
  const [automationActive, setAutomationActive] = useState(true);
  const [rule1, setRule1] = useState(true);
  const [rule2, setRule2] = useState(true);
  const [rule3, setRule3] = useState(true);
  const [queue, setQueue] = useState<ScheduledReminder[]>(INITIAL_QUEUE);
  const [history, setHistory] = useState<SentReminder[]>(INITIAL_HISTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewReminder, setPreviewReminder] = useState<ScheduledReminder | null>(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredQueue = queue.filter(
    (item) =>
      item.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.invoiceNum.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendNow = (org: ScheduledReminder) => {
    showToast(`Payment reminder dispatched to ${org.orgName} (${org.invoiceNum})`);
    setHistory((prev) => [
      {
        id: Date.now().toString(),
        orgName: org.orgName,
        email: `billing@${org.orgName.toLowerCase().replace(/\s+/g, '')}.com`,
        template: org.isUrgent ? 'Final Overdue Warning' : 'Invoice Due Today',
        sentAt: 'Just now',
        status: 'Delivered',
      },
      ...prev,
    ]);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-8 max-w-[1550px]">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Payment Reminders &amp; Dispatch Automation
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Configure automated notification triggers, dispatch manual dunning notices, and audit delivery logs.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Automation Active Toggle */}
              <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm">
                <span className="text-xs font-semibold text-slate-700">Automation Active</span>
                <button
                  type="button"
                  onClick={() => {
                    setAutomationActive(!automationActive);
                    showToast(automationActive ? 'Automation paused' : 'Automation enabled');
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    automationActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      automationActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Custom Rule Button */}
              <button
                onClick={() => setIsRuleModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom Reminder Rule</span>
              </button>
            </div>
          </header>

          {/* Section 1: Automation Rules Configuration Card */}
          <div className="mb-8">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Automation Rules Configuration Card
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Automated Reminder Triggers</span>
                </div>

                <button
                  onClick={() => setIsRuleModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition"
                >
                  <span>Configure Rules &amp; Email Templates</span>
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* 3 Rule Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                {/* Rule 1 */}
                <div className="p-4 rounded-xl border border-sky-200/80 bg-sky-50/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">Rule 1:</span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      Upcoming Notice: 3 days before due date
                    </p>
                  </div>
                  <button
                    onClick={() => setRule1(!rule1)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      rule1 ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                        rule1 ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Rule 2 */}
                <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">Rule 2:</span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      Due Date Alert: On due date at 09:00 AM
                    </p>
                  </div>
                  <button
                    onClick={() => setRule2(!rule2)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      rule2 ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                        rule2 ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Rule 3 */}
                <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-500">Rule 3:</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                        Amber
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      Overdue Notice: 3 &amp; 7 days after due date
                    </p>
                  </div>
                  <button
                    onClick={() => setRule3(!rule3)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      rule3 ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                        rule3 ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Upcoming Reminders Queue Table */}
          <div className="mb-8">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Upcoming Reminders Queue Table (active pending invoices queue)
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Upcoming Scheduled Reminders (Queue: {filteredQueue.length} Orgs)
                </h2>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter org or invoice #..."
                    className="w-full pl-3 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-6">Organization Name</th>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Amount Due</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Scheduled Dispatch</th>
                      <th className="py-3 px-4">Auto-Status</th>
                      <th className="py-3 px-6 text-right">Immediate Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-6 font-semibold text-slate-800">
                          {item.orgName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {item.invoiceNum}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {item.amountInr}{' '}
                          <span className="text-slate-400 font-normal">
                            ({item.amountUsd})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.dueDate}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.dispatchTime}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.status === 'Action Needed' ? (
                            <span className="px-2 py-0.5 rounded-md font-semibold bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                              [Action Needed]
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                              [{item.status}]
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => setPreviewReminder(item)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                              item.isUrgent
                                ? 'border-rose-300 text-rose-600 hover:bg-rose-50'
                                : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            {item.isUrgent ? 'Send Urgent Notice' : 'Send Email Now'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 3: Sent Reminders Audit History Table */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Sent Reminders Audit History Table (recent dispatches log)
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">
                  Recent Sent Reminders History (Audit Log)
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-6">Organization</th>
                      <th className="py-3 px-4">Sent To (Email)</th>
                      <th className="py-3 px-4">Template Used</th>
                      <th className="py-3 px-4">Sent Date &amp; Time</th>
                      <th className="py-3 px-6">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {history.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-6 font-semibold text-slate-800">
                          {h.orgName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          {h.email}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {h.template}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {h.sentAt}
                        </td>
                        <td className="py-3.5 px-6">
                          {h.status === 'Delivered & Opened' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Delivered &amp; Opened
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-sky-50 text-sky-700 border border-sky-200 text-[11px]">
                              Delivered
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal for Rule Config */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Custom Reminder Rule
              </h3>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Trigger Timing
                </label>
                <select className="w-full border border-slate-200 rounded-lg p-2 bg-white text-xs">
                  <option>3 days before due date</option>
                  <option>On due date</option>
                  <option>3 days after due date</option>
                  <option>7 days after due date</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Email Template
                </label>
                <select className="w-full border border-slate-200 rounded-lg p-2 bg-white text-xs">
                  <option>Friendly Pre-Due Notice</option>
                  <option>Invoice Due Today</option>
                  <option>Final Overdue Warning</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-5">
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast('Custom reminder rule added to automation queue.');
                  setIsRuleModalOpen(false);
                }}
                className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Email Modal */}
      {previewReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {previewReminder.isUrgent ? 'Urgent Dunning Notice Preview' : 'Payment Reminder Notice Preview'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  To: billing@{previewReminder.orgName.toLowerCase().replace(/\s+/g, '')}.com
                </p>
              </div>
              <button
                onClick={() => setPreviewReminder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 font-sans text-slate-800">
              <p className="font-semibold">
                Subject: Action Required: Overdue Invoice {previewReminder.invoiceNum} for {previewReminder.orgName}
              </p>
              <div className="border-t border-slate-200 pt-2 space-y-1 text-slate-600">
                <p>Dear {previewReminder.orgName} Team,</p>
                <p>
                  Your account has an outstanding invoice {previewReminder.invoiceNum} of {previewReminder.amountInr} ({previewReminder.amountUsd}) {previewReminder.dueDate}.
                </p>
                <p>Please settle this invoice using the secure link below:</p>
                <p className="text-blue-600 font-mono text-[11px]">https://pay.arba.internal/inv/{previewReminder.invoiceNum.replace('#', '')}</p>
                <p className="pt-2">Sincerely,<br />Arba Incubator Finance</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setPreviewReminder(null)}
                className="px-3.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSendNow(previewReminder);
                  setPreviewReminder(null);
                }}
                className={`px-4 py-1.5 font-bold rounded-lg text-white shadow-sm transition ${
                  previewReminder.isUrgent ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm &amp; Send Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <span className="text-emerald-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
