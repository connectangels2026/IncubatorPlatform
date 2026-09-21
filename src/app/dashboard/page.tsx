'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  LayoutDashboard,
  Building2,
  Sparkles,
  GraduationCap,
  FileText,
  Wallet,
  IndianRupee,
  Users,
  MessagesSquare,
  Calendar,
  ClipboardCheck,
  ListChecks,
  TrendingUp,
  TrendingDown,
  Trophy,
  ChevronRight,
  Award,
  Boxes,
  Target,
} from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';

const PERIODS = ['This Month', 'This Quarter', 'This Year'];

export default function DashboardPage() {
  const [period, setPeriod] = useState(PERIODS[1]);

  const stats = [
    {
      icon: Building2,
      label: 'Total Startups',
      value: '128',
      delta: '+12',
      caption: 'vs last year',
      trend: 'up',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
    {
      icon: FileText,
      label: 'Applications Received',
      value: '342',
      delta: '+38',
      caption: 'this month',
      trend: 'up',
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-600',
    },
    {
      icon: Wallet,
      label: 'Funding Raised',
      value: '$4.2M',
      delta: '+$1.1M',
      caption: 'this year',
      trend: 'up',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
    },
    {
      icon: IndianRupee,
      label: 'Revenue Generated',
      value: '₹18.5 Cr',
      delta: '+22%',
      caption: 'vs last period',
      trend: 'up',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
    },
    {
      icon: Users,
      label: 'Jobs Created',
      value: '640',
      delta: '+45',
      caption: 'this quarter',
      trend: 'up',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600',
    },
    {
      icon: MessagesSquare,
      label: 'Mentorship Sessions',
      value: '1,204',
      delta: '+96',
      caption: 'this month',
      trend: 'up',
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-600',
    },
  ];

  const startupStatus = [
    { label: 'Active', value: 64, color: 'bg-blue-500' },
    { label: 'Incubating', value: 38, color: 'bg-cyan-500' },
    { label: 'Graduated', value: 26, color: 'bg-purple-500' },
  ];

  const sectorData = [
    { label: 'SaaS & Software', value: 34, color: 'bg-blue-500' },
    { label: 'FinTech', value: 22, color: 'bg-cyan-500' },
    { label: 'Health & Biotech', value: 15, color: 'bg-emerald-500' },
    { label: 'E-commerce & Retail', value: 13, color: 'bg-purple-500' },
    { label: 'AI & Data', value: 11, color: 'bg-orange-500' },
    { label: 'Others', value: 5, color: 'bg-pink-500' },
  ];

  const stageData = [
    { label: 'Idea', value: 32, color: 'bg-blue-400' },
    { label: 'Validation', value: 41, color: 'bg-cyan-400' },
    { label: 'MVP', value: 27, color: 'bg-emerald-400' },
    { label: 'Early Revenue', value: 18, color: 'bg-purple-400' },
    { label: 'Growth', value: 8, color: 'bg-orange-400' },
    { label: 'Scaling', value: 2, color: 'bg-pink-400' },
  ];

  const applicationsTrend = [42, 58, 51, 74, 68, 89, 96, 84, 102, 118, 126, 134];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const maxApp = Math.max(...applicationsTrend);

  const events = [
    {
      title: 'Demo Day — Cohort 12',
      date: 'Sep 24, 2026',
      icon: Trophy,
      color: 'bg-purple-500',
      type: 'Incubator',
    },
    {
      title: 'Investor Pitch Night',
      date: 'Oct 08, 2026',
      icon: TrendingUp,
      color: 'bg-blue-500',
      type: 'Funding',
    },
    {
      title: 'Founder Bootcamp Workshop',
      date: 'Oct 15, 2026',
      icon: Sparkles,
      color: 'bg-cyan-500',
      type: 'Pre-Incubator',
    },
    {
      title: 'Mentor Networking Mixer',
      date: 'Oct 22, 2026',
      icon: MessagesSquare,
      color: 'bg-emerald-500',
      type: 'Community',
    },
  ];

  const pendingApprovals = [
    { name: 'GreenSight AI', type: 'Incubator Application', days: '2 days', priority: 'High' },
    { name: 'PayBridge', type: 'Funding Request Review', days: '3 days', priority: 'High' },
    { name: 'NourishBox', type: 'Pre-Incubator Application', days: '5 days', priority: 'Medium' },
    { name: 'UrbanFarm Pvt Ltd', type: 'Reporting Review', days: '7 days', priority: 'Medium' },
    { name: 'SkillVault', type: 'Graduation Review', days: '9 days', priority: 'Low' },
  ];

  const tasks = [
    { title: 'Schedule cohort interviews', count: 12, done: 7 },
    { title: 'Review pending applications', count: 18, done: 11 },
    { title: 'Prepare monthly investor report', count: 5, done: 2 },
    { title: 'Approve mentorship session logs', count: 24, done: 19 },
  ];

  const kpis = [
    { label: 'Graduation Rate', value: '82%', delta: '+4%', trend: 'up' },
    { label: 'Funding Success Rate', value: '71%', delta: '+6%', trend: 'up' },
    { label: 'Startup Survival (2yr)', value: '88%', delta: '+2%', trend: 'up' },
    { label: 'Avg. Revenue Growth', value: '32%', delta: '+3%', trend: 'up' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Arba Incubator
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/programs">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                Programs
              </Button>
            </Link>
            <Link href="/" className="hidden sm:block">
              <Button variant="ghost" className="text-slate-700 hover:bg-slate-100">
                Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Dashboard <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">& Analytics</span>
              </h1>
            </div>
            <p className="text-lg text-slate-600">
              Track startup performance, program health, and key incubator KPIs in one place.
            </p>
          </div>

          {/* Period selector */}
          <div className="flex rounded-lg border border-slate-300 bg-white p-1 self-start">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${period === p
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex p-2.5 rounded-lg ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    stat.trend === 'up'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.delta}
                </span>
              </div>
              <div className="text-2xl font-bold tracking-tight leading-none">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-slate-500 mt-2">
                {stat.label}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {stat.caption}
              </div>
            </div>
          ))}
        </div>

        {/* Status breakdown + Trend chart */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Startup status */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-600" />
              Startup Status
            </h2>
            <div className="space-y-4">
              {startupStatus.map((s, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-slate-500">{s.value} startups</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded-full transition-all duration-700`}
                      style={{ width: `${(s.value / 128) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between text-sm">
              <span className="text-slate-500">Incubating across</span>
              <span className="font-semibold text-blue-600">2 cohorts</span>
            </div>
          </div>

          {/* Applications trend */}
          <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
                Applications Received — 2026
              </h2>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                +21% vs last year
              </span>
            </div>
            <div className="flex items-end gap-2 h-44">
              {applicationsTrend.map((val, idx) => {
                const isCurrent = idx === currentMonth;
                const isFuture = idx > currentMonth;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition">
                      {val}
                      {isFuture ? ' (forecast)' : ''}
                    </span>
                    <div
                      className={`w-full rounded-t-md transition-all duration-700 ${
                        isCurrent
                          ? 'bg-gradient-to-t from-blue-600 to-cyan-400 ring-2 ring-blue-400/40 ring-offset-1'
                          : isFuture
                            ? 'bg-slate-200 group-hover:bg-slate-300'
                            : 'bg-blue-500/15 group-hover:bg-blue-500/40'
                      }`}
                      style={{ height: `${(val / maxApp) * 100}%` }}
                    ></div>
                    <span
                      className={`text-[10px] hidden sm:block ${
                        isCurrent ? 'text-blue-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {months[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-blue-600 to-cyan-400 inline-block"></span>
                {months[currentMonth]} — current month
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block"></span>
                Upcoming months (forecast)
              </span>
            </div>
          </div>
        </div>

        {/* Sector + Stage */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Sector breakdown */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Startups by Sector
            </h2>
            <div className="space-y-4">
              {sectorData.map((s, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-slate-500">{s.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded-full transition-all duration-700`}
                      style={{ width: `${s.value * 2.5}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage breakdown */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              Startups by Stage
            </h2>
            <div className="space-y-4">
              {stageData.map((s, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-slate-500">{s.value} startups</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded-full transition-all duration-700`}
                      style={{ width: `${(s.value / 41) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Events + Approvals */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Upcoming events */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Upcoming Events
              </h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {events.map((evt, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition"
                >
                  <div className={`w-10 h-10 rounded-lg ${evt.color} flex items-center justify-center text-white flex-shrink-0`}>
                    <evt.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{evt.title}</div>
                    <div className="text-sm text-slate-500">{evt.date}</div>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
                    {evt.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending approvals */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-rose-600" />
                Pending Approvals
              </h2>
              <span className="text-xs font-medium bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full">
                {pendingApprovals.length} awaiting review
              </span>
            </div>
            <div className="space-y-3">
              {pendingApprovals.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-sm text-slate-500">{item.type}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs font-semibold ${item.priority === 'High' ? 'text-rose-600' : item.priority === 'Medium' ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                      {item.priority}
                    </div>
                    <div className="text-xs text-slate-400">{item.days}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs + Tasks */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Performance KPIs */}
          <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Performance KPIs
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {kpis.map((kpi, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-sm text-slate-500 mb-1">{kpi.label}</div>
                  <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {kpi.delta}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-cyan-600" />
                  My Tasks
                </h3>
                <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                  4 open checklists
                </span>
              </div>
              <div className="space-y-3">
                {tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-24 text-sm text-slate-600 font-medium flex-shrink-0 truncate">{task.title}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-700"
                        style={{ width: `${(task.done / task.count) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-500 w-12 text-right flex-shrink-0">
                      {task.done}/{task.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white shadow-xl shadow-blue-500/20 flex flex-col">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Reports & Export
            </h2>
            <p className="text-sm text-white/80 mb-6">
              Download the latest incubator performance report for {period.toLowerCase()}.
            </p>
            <div className="space-y-2 mb-auto">
              {['Startup Portfolio Report', 'Funding & Revenue Summary', 'Mentorship Session Logs', 'Cohort Progress Report'].map((r, idx) => (
                <button
                  key={idx}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium"
                >
                  {r}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
            <Button className="mt-6 w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold">
              View Full Report
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>&copy; 2026 Incubator Platform. All rights reserved.</p>
          <p className="mt-1">Admin Dashboard & Analytics</p>
        </div>
      </footer>
    </div>
    </ProtectedRoute>
  );
}