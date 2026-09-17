'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Building2,
  Ban,
  AlertTriangle,
  UserPlus,
  Search,
  Bell,
  Sliders,
  FileText,
  Mail,
  TrendingUp,
  LayoutDashboard,
  Shield,
  X,
  CheckCircle2,
  Send,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const [activeFilter, setActiveFilter] = useState<'month' | 'quarter' | 'year'>('month');
  const [activeModal, setActiveModal] = useState<'pending' | 'reminders' | 'pricing' | null>(null);
  const [reminderSent, setReminderSent] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/super-admin/dashboard')
      .then((res) => res.json())
      .then((data) => setDashboardData(data))
      .catch((err) => console.error('Error loading dashboard KPIs:', err));
  }, []);

  // SVG Area Chart points for 12 months
  // Chart viewBox: 0 0 700 240
  // Y range: 0 -> 220 (0 is at bottom 210, 4000 is at top 30)
  // X range: 50 -> 680
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Smooth curve path matching the image curve exactly
  const linePath = 'M 50,195 C 100,165 130,170 170,160 C 210,150 240,120 280,128 C 320,136 340,160 380,150 C 420,140 460,90 510,85 C 550,80 570,125 610,105 C 640,90 660,75 680,68';
  const areaPath = `${linePath} L 680,210 L 50,210 Z`;

  return (
    <div className="min-h-screen bg-[#f3f5f8] text-slate-800 font-sans select-none antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Cluster Pill */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-sm">
                A
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Arba Incubator
              </span>
            </Link>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Cluster • Live</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center relative w-96">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-full focus:outline-none focus:border-cyan-500 shadow-2xs transition"
            />
          </div>

          {/* Right Profile & Alert */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-2xs">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                1
              </span>
            </button>

            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden sm:block text-xs font-semibold text-slate-800">Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title & Filter Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Super Admin Platform Overview
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Global multi-tenant governance, revenue, and organization health.
              </p>
            </div>
          </div>

          {/* Time Filter Pill */}
          <div className="inline-flex rounded-full bg-white border border-slate-200 p-1 shadow-2xs self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('month')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                activeFilter === 'month'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setActiveFilter('quarter')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                activeFilter === 'quarter'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Quarter
            </button>
            <button
              onClick={() => setActiveFilter('year')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                activeFilter === 'year'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Year
            </button>
          </div>
        </div>

        {/* 5 KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Revenue</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">$2,998</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs">
              <span className="text-slate-400">this month</span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[11px]">
                +14.2% ↗
              </span>
            </div>
          </div>

          {/* Card 2: Active Organizations */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Active Organizations</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">5</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Active pulse</span>
            </div>
          </div>

          {/* Card 3: Blocked Organizations */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Blocked Organizations</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">1</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <Ban className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold">
                Action Needed
              </span>
            </div>
          </div>

          {/* Card 4: Overdue Payments */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Overdue Payments</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">2</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[11px] font-semibold">
                2 Invoices Pending
              </span>
            </div>
          </div>

          {/* Card 5: New Signups */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">New Signups</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">3</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-400 font-medium">
              <span>this month</span>
            </div>
          </div>
        </div>

        {/* Charts Row: Revenue Trend (Left) & Free vs Paid Ratio (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 12-Month Revenue Trend (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
            <h2 className="text-sm font-bold text-slate-900 mb-4">12-Month Revenue Trend</h2>

            <div className="relative w-full h-64">
              {/* Y-Axis Labels */}
              <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-[11px] text-slate-400 font-medium select-none">
                <span>$4,000</span>
                <span>$3,000</span>
                <span>$2,000</span>
                <span>$1,000</span>
                <span>0</span>
              </div>

              {/* Chart SVG */}
              <div className="ml-12 h-full flex flex-col justify-between">
                <div className="relative flex-1 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 240" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                        <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="60%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path d={areaPath} fill="url(#areaGradient)" />

                    {/* Stroke line */}
                    <path
                      d={linePath}
                      fill="none"
                      stroke="url(#strokeGradient)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Vertical guide line at Sep point */}
                    <line
                      x1="510"
                      y1="85"
                      x2="510"
                      y2="210"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />

                    {/* Sep point marker dot */}
                    <circle cx="510" cy="85" r="5" fill="#06b6d4" stroke="#ffffff" strokeWidth="2.5" />
                  </svg>

                  {/* Floating tooltip matching image */}
                  <div className="absolute left-[70%] -top-2 transform -translate-x-1/2 bg-white rounded-xl border border-slate-200 px-3.5 py-1.5 shadow-lg shadow-cyan-500/10 text-center pointer-events-none">
                    <p className="text-xs font-extrabold text-slate-900 leading-tight">$2,998</p>
                    <p className="text-[10px] text-slate-400 font-medium">in September</p>
                  </div>
                </div>

                {/* X-Axis Months */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                  {months.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Free vs Paid Ratio (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
            <h2 className="text-sm font-bold text-slate-900 mb-2">Free vs Paid Ratio</h2>

            {/* Donut Chart matching image */}
            <div className="relative flex items-center justify-center my-6">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 36 36">
                {/* Background arc: Free (40%) */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="#cbd5e1"
                  strokeWidth="4"
                  strokeDasharray="40 60"
                  strokeDashoffset="-60"
                  strokeLinecap="round"
                />
                {/* Foreground arc: Paid (60%) */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="#00c5ff"
                  strokeWidth="4"
                  strokeDasharray="57 43"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00c5ff]" />
                <span className="text-slate-700">Paid (60%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="text-slate-500">Free (40%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: View Pending Payments */}
          <button
            onClick={() => setActiveModal('pending')}
            className="flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition shadow-xs group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:text-blue-600 transition">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                View Pending Payments
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
              2 overdue
            </span>
          </button>

          {/* Action 2: Send Payment Reminders */}
          <button
            onClick={() => setActiveModal('reminders')}
            className="flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition shadow-xs group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:text-cyan-600 transition">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                Send Payment Reminders
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
              Batch Email
            </span>
          </button>

          {/* Action 3: Manage Pricing Tiers */}
          <button
            onClick={() => setActiveModal('pricing')}
            className="flex items-center justify-between px-5 py-4 rounded-2xl border-2 border-cyan-400 bg-cyan-50/40 hover:bg-cyan-50/70 transition shadow-xs group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition">
                <Sliders className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Manage Pricing Tiers
              </span>
            </div>
          </button>
        </div>

        {/* Real-time Platform Activity Feed Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 mb-3.5">Real-time Platform Activity Feed</h3>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
            {/* Item 1 */}
            <div className="flex items-center gap-2">
              <span className="text-slate-700">Acme Ventures upgraded to Pro Tier ($499/mo)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                Emerald
              </span>
            </div>

            <div className="hidden lg:block w-[1px] h-4 bg-slate-200" />

            {/* Item 2 */}
            <div className="flex items-center gap-2">
              <span className="text-slate-700">Alpha Tech suspended due to overdue invoice #1084</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                Overdue
              </span>
            </div>

            <div className="hidden lg:block w-[1px] h-4 bg-slate-200" />

            {/* Item 3 */}
            <div className="flex items-center gap-2">
              <span className="text-slate-700">Beta Hub registered as a new organization</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                New Org
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Modals for Quick Actions */}
      {activeModal === 'pending' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Pending & Overdue Invoices</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">SeedCamp Plus — #INV-2026-11</p>
                  <p className="text-[11px] text-rose-600 font-semibold">Overdue by 3 days • $700.00</p>
                </div>
                <button
                  onClick={() => alert('Payment reminder sent!')}
                  className="text-xs font-semibold px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                >
                  Demand Pay
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">BioTech Ventures — #INV-2026-12</p>
                  <p className="text-[11px] text-amber-600 font-semibold">Due in 2 days • $750.00</p>
                </div>
                <button
                  onClick={() => alert('Invoice copy sent!')}
                  className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Send Copy
                </button>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'reminders' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-slate-900">Send Payment Reminders</h3>
              </div>
              <button onClick={() => { setActiveModal(null); setReminderSent(false); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 text-center">
              {reminderSent ? (
                <div className="py-4 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900">Reminders Dispatched!</h4>
                  <p className="text-xs text-slate-500">Sent automated batch emails to 2 organizations with pending invoices.</p>
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  <p className="text-xs text-slate-600">
                    Send automated email notifications with payment links to all organizations with unpaid balances.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700 border border-slate-200">
                    <p>• <strong>Recipients:</strong> 2 Organizations</p>
                    <p>• <strong>Total Overdue:</strong> $1,450.00</p>
                  </div>
                </div>
              )}
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => { setActiveModal(null); setReminderSent(false); }}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition"
              >
                {reminderSent ? 'Done' : 'Cancel'}
              </button>
              {!reminderSent && (
                <button
                  onClick={() => setReminderSent(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-lg shadow-sm hover:from-blue-700 hover:to-cyan-600 transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Batch Email
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeModal === 'pricing' && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-slate-900">Manage Pricing Tiers</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Free Community Tier</p>
                  <p className="text-[11px] text-slate-500">Up to 10 Startups</p>
                </div>
                <span className="text-xs font-extrabold text-slate-800">$0/mo</span>
              </div>
              <div className="p-3.5 rounded-xl border border-cyan-300 bg-cyan-50/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Incubator Pro</p>
                  <p className="text-[11px] text-slate-500">Up to 100 Startups</p>
                </div>
                <span className="text-xs font-extrabold text-blue-700">$499/mo</span>
              </div>
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Enterprise Cluster</p>
                  <p className="text-[11px] text-slate-500">Unlimited Startups</p>
                </div>
                <span className="text-xs font-extrabold text-blue-800">$1,299/mo</span>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-lg shadow-sm hover:from-blue-700 hover:to-cyan-600 transition"
              >
                Save Tier Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
