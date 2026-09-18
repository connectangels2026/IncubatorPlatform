'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/super-admin/Sidebar';

interface Invoice {
  id: string;
  invoiceNumber: string;
  orgName: string;
  amountInr: string;
  amountUsd: string;
  invoiceDate: string;
  dueDate: string;
  status: 'Paid' | 'Overdue / Unpaid' | 'Failed' | 'Cancelled';
  actionLabel?: string;
}

const INITIAL_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    orgName: 'TechStars Hub',
    amountInr: '₹1,08,000',
    amountUsd: '$1,299',
    invoiceDate: 'Sep 12, 2026',
    dueDate: 'Oct 12, 2026',
    status: 'Paid',
    actionLabel: 'Resend',
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    orgName: 'Nexlify Labs',
    amountInr: '₹41,500',
    amountUsd: '$499',
    invoiceDate: 'Sep 05, 2026',
    dueDate: 'Sep 20, 2026',
    status: 'Overdue / Unpaid',
    actionLabel: 'Send Reminder',
  },
  {
    id: '3',
    invoiceNumber: 'INV-003',
    orgName: 'VentureScale',
    amountInr: '₹41,500',
    amountUsd: '$499',
    invoiceDate: 'Aug 15, 2026',
    dueDate: 'Aug 30, 2026',
    status: 'Failed',
    actionLabel: 'Retry',
  },
  {
    id: '4',
    invoiceNumber: 'INV-004',
    orgName: 'Growth Accelerate',
    amountInr: '₹41,500',
    amountUsd: '$499',
    invoiceDate: 'Sep 01, 2026',
    dueDate: 'Oct 01, 2026',
    status: 'Paid',
  },
  {
    id: '5',
    invoiceNumber: 'INV-005',
    orgName: 'Idea Catalyst',
    amountInr: '₹1,08,000',
    amountUsd: '$1,299',
    invoiceDate: 'Sep 10, 2026',
    dueDate: 'Oct 10, 2026',
    status: 'Paid',
  },
];

export default function SuperAdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [selectedIds, setSelectedIds] = useState<string[]>(['2', '3']);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(invoices.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.orgName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Paid' && inv.status === 'Paid') ||
      (statusFilter === 'Overdue' && inv.status === 'Overdue / Unpaid') ||
      (statusFilter === 'Failed' && inv.status === 'Failed');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Invoices &amp; Billing
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Production Cluster</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-600">Live</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice #, organization..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 w-64 md:w-80 shadow-sm transition"
              />
            </div>

            {/* Generate Invoice Button */}
            <button
              onClick={() => setIsGenerateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium text-sm rounded-lg hover:from-sky-600 hover:to-blue-700 shadow-sm shadow-blue-500/20 active:scale-95 transition"
            >
              <span className="text-base font-bold leading-none">+</span>
              <span>Generate Invoice</span>
            </button>
          </div>
        </header>

        {/* 3 KPI Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          {/* Card 1: Total Revenue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                Total Revenue (This Month)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  ₹2,49,990
                </span>
                <span className="text-sm font-semibold text-slate-500">($2,998)</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                +14.2% vs last month
              </span>

              {/* Sparkline curve */}
              <div className="w-28 h-10">
                <svg className="w-full h-full" viewBox="0 0 100 35" fill="none">
                  <path
                    d="M 0,28 Q 20,25 35,18 T 65,15 T 85,8 T 100,5"
                    fill="none"
                    stroke="url(#sparkline-grad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0,28 Q 20,25 35,18 T 65,15 T 85,8 T 100,5 L 100,35 L 0,35 Z"
                    fill="url(#sparkline-fill)"
                    opacity="0.25"
                  />
                  <defs>
                    <linearGradient id="sparkline-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                    <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Outstanding Amount Due */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                Outstanding Amount Due
              </span>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                ₹1,20,500
              </div>
            </div>

            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
                <span>⚠️</span>
                <span>2 Overdue Invoices</span>
              </span>
            </div>
          </div>

          {/* Card 3: Donut Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            {/* SVG Donut */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="13"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="4.5"
                />
                {/* Enterprise 60% */}
                <circle
                  cx="18"
                  cy="18"
                  r="13"
                  fill="transparent"
                  stroke="#06b6d4"
                  strokeWidth="4.5"
                  strokeDasharray="49 100"
                  strokeDashoffset="0"
                />
                {/* Pro 30% */}
                <circle
                  cx="18"
                  cy="18"
                  r="13"
                  fill="transparent"
                  stroke="#2563eb"
                  strokeWidth="4.5"
                  strokeDasharray="24.5 100"
                  strokeDashoffset="-49"
                />
                {/* Free 10% */}
                <circle
                  cx="18"
                  cy="18"
                  r="13"
                  fill="transparent"
                  stroke="#64748b"
                  strokeWidth="4.5"
                  strokeDasharray="8.2 100"
                  strokeDashoffset="-73.5"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2 text-sm font-medium pr-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span>
                <span className="text-slate-600">Enterprise</span>
                <span className="font-bold text-slate-900 ml-auto">60%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
                <span className="text-slate-600">Pro</span>
                <span className="font-bold text-slate-900 ml-auto">30%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-500"></span>
                <span className="text-slate-600">Free</span>
                <span className="font-bold text-slate-900 ml-auto">10%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Toolbar */}
        <section className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
            >
              <option value="All">Status: All (Paid, Unpaid, Failed, Cancelled)</option>
              <option value="Paid">Status: Paid</option>
              <option value="Overdue">Status: Overdue / Unpaid</option>
              <option value="Failed">Status: Failed</option>
            </select>

            <select className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer">
              <option>Date Range: Last 30 Days</option>
              <option>Date Range: Last 90 Days</option>
              <option>Date Range: Year to Date</option>
            </select>

            <select className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer">
              <option>Amount: All Tiers</option>
              <option>Above ₹50,000</option>
              <option>Below ₹50,000</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <button
                onClick={() => {
                  setInvoices(invoices.map((i) => (selectedIds.includes(i.id) ? { ...i, status: 'Paid' } : i)));
                  showToast(`${selectedIds.length} invoices marked as Paid.`);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 rounded-lg shadow-sm hover:bg-emerald-100 transition"
              >
                <span>✓</span>
                <span>Mark Paid ({selectedIds.length})</span>
              </button>
            )}

            <button
              onClick={() => showToast(`Payment reminders sent to ${selectedIds.length} organizations.`)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition"
            >
              <span>✉️</span>
              <span>Send Payment Reminder</span>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {selectedIds.length} selected
              </span>
            </button>

            <button
              onClick={() => showToast('Invoices exported as CSV file.')}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export to CSV</span>
            </button>
          </div>
        </section>

        {/* Invoices Data Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Invoices Data Table</h2>
            <span className="text-xs text-slate-400 font-medium">
              Click row to view invoice details modal.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === invoices.length}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Invoice Number</th>
                  <th className="py-3 px-4">Organization Name</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Invoice Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInvoices.map((inv) => {
                  const isChecked = selectedIds.includes(inv.id);
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition ${
                        isChecked ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRow(inv.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {inv.orgName}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {inv.amountInr}{' '}
                        <span className="text-xs text-slate-400 font-normal">
                          ({inv.amountUsd})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {inv.invoiceDate}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {inv.dueDate}
                      </td>

                      <td className="py-3.5 px-4">
                        {inv.status === 'Paid' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Paid
                          </span>
                        )}
                        {inv.status === 'Overdue / Unpaid' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Overdue / Unpaid
                          </span>
                        )}
                        {inv.status === 'Failed' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Failed
                          </span>
                        )}
                      </td>

                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="View PDF"
                            onClick={() => showToast(`Generating PDF for ${inv.invoiceNumber}...`)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </button>

                          {inv.actionLabel && (
                            <button
                              onClick={() => showToast(`${inv.actionLabel} initiated for ${inv.invoiceNumber}`)}
                              className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                            >
                              {inv.actionLabel}
                            </button>
                          )}

                          <button
                            title="More options"
                            className="p-1 text-slate-400 hover:text-slate-700"
                          >
                            •••
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <div>Showing 1-25 of 84 invoices</div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span>Rows:</span>
                <select className="border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 bg-white">
                  <option>25 per page</option>
                  <option>50 per page</option>
                  <option>100 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">
                  Previous
                </button>
                <button className="px-2.5 py-1 rounded bg-sky-500 text-white font-bold">
                  1
                </button>
                <button className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">
                  2
                </button>
                <button className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">
                  3
                </button>
                <button className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Invoice Detail Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Invoice {selectedInvoice.invoiceNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Organization: {selectedInvoice.orgName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-700 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="my-5 space-y-3 text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-bold text-slate-900">
                    {selectedInvoice.amountInr} ({selectedInvoice.amountUsd})
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Invoice Date:</span>
                  <span className="font-medium text-slate-800">{selectedInvoice.invoiceDate}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="font-medium text-slate-800">{selectedInvoice.dueDate}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-semibold text-slate-900">{selectedInvoice.status}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    showToast(`Invoice ${selectedInvoice.invoiceNumber} marked as Paid.`);
                    setSelectedInvoice(null);
                  }}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-lg transition"
                >
                  Mark as Paid
                </button>
                <button
                  onClick={() => {
                    showToast(`Downloading PDF for ${selectedInvoice.invoiceNumber}...`);
                    setSelectedInvoice(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded-lg transition"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generate Invoice Modal */}
        {isGenerateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Generate New Invoice</h3>
                <button
                  onClick={() => setIsGenerateOpen(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="my-4 space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Select Organization
                  </label>
                  <select className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white">
                    <option>TechStars Hub</option>
                    <option>Nexlify Labs</option>
                    <option>VentureScale</option>
                    <option>Growth Accelerate</option>
                    <option>Idea Catalyst</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Amount (INR)
                  </label>
                  <input
                    type="text"
                    defaultValue="₹41,500"
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    defaultValue="2026-10-18"
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsGenerateOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    showToast('New invoice INV-006 generated successfully.');
                    setIsGenerateOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
                >
                  Create Invoice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Notification Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
            <span className="text-emerald-400">✓</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
}
