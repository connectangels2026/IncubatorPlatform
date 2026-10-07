import Link from 'next/link';
import {
  ArrowRight, ShieldCheck, Calendar, Layers, Users, Globe,
  FileCheck2, Rocket, TrendingUp, Handshake, FolderKanban,
  GraduationCap, Network, BarChart3, Check, ClipboardList,
  Sparkles, Star,
} from 'lucide-react';
import { Counter, ScrollRevealInit } from '@/frontend/components/landing/LandingAnimations';
import Logo from '@/frontend/components/ui/Logo';

export const metadata = {
  title: 'Arba360 — Enterprise Incubator Management Platform',
  description: 'Launch and manage your incubator ecosystem — startups, mentors, investors, and co-incubation programs, all in one auditable platform.',
};

export default function Home() {
  return (
    <div className="antialiased overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#EDF2FA', color: '#1A2151' }}>
      <ScrollRevealInit />

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Logo size="lg" href="/" />

            {/* Center Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {['Platform', 'Features', 'Mentors', 'Investors', 'About'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-600 hover:text-[#1A2151] transition-colors">
                  {item}
                </a>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-semibold hover:text-[#2563EB] transition-colors px-3 py-2" style={{ color: '#1A2151' }}>
                Sign In
              </Link>
              <Link href="/signup" className="text-sm font-semibold text-white px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5" style={{ backgroundColor: '#1A2151' }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ── HERO ── */}
        <section id="platform" className="relative overflow-hidden" style={{ backgroundColor: '#EDF2FA' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">

              {/* Left */}
              <div className="lg:col-span-6 px-6 sm:px-8 lg:px-12 py-12 lg:py-20 flex flex-col justify-center animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#2563EB]/30 text-[#2563EB] text-xs font-semibold shadow-sm mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Innovation &amp; Incubation Platform</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight leading-[1.15] mb-6" style={{ color: '#1A2151' }}>
                  Manage Startups.<br />
                  Connect Mentors.<br />
                  <span className="text-gradient-brand">Drive Growth.</span>
                </h1>
                <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-xl mb-8">
                  Launch and manage your incubator ecosystem — startups, mentors, investors, and co-incubation programs, all in one auditable platform.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                  <Link href="/signup" className="inline-flex justify-center items-center px-7 py-3.5 rounded-xl text-white text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200" style={{ backgroundColor: '#1A2151' }}>
                    Get Started <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <a href="#features" className="inline-flex justify-center items-center px-7 py-3.5 rounded-xl bg-white border-2 text-base font-semibold hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-200" style={{ borderColor: 'rgba(26,33,81,0.2)', color: '#1A2151' }}>
                    Platform Overview
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Trusted by incubators running accelerators, grants &amp; partner networks</span>
                </div>
              </div>

              {/* Right — Light Visual (matches screenshot) */}
              <div className="lg:col-span-6 relative flex items-center justify-center p-6 sm:p-8 lg:p-10 overflow-hidden min-h-[560px] animate-fade-in-right" style={{ backgroundColor: '#EDF2FA' }}>
                {/* Concentric circles */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 600" fill="none" stroke="rgba(37,99,235,0.12)">
                  <circle cx="300" cy="300" r="100" />
                  <circle cx="300" cy="300" r="180" />
                  <circle cx="300" cy="300" r="260" />
                  <circle cx="300" cy="300" r="340" />
                </svg>

                {/* Dashboard Card */}
                <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-xl p-4 border border-slate-200/60 z-10 transition-transform duration-300 hover:scale-[1.01]">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 pb-3 mb-3 border-b border-slate-100 text-center">
                    {[['33','Startups'],['12','Mentors'],['5','Investors']].map(([n,l]) => (
                      <div key={l} className="py-1.5">
                        <span className="block text-lg font-extrabold" style={{ color: '#1A2151' }}>{n}</span>
                        <span className="text-[10px] font-medium text-slate-400">{l}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-12 gap-3">
                    {/* Active Cohort */}
                    <div className="col-span-7">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Active Cohort</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">All Cohorts ▾</span>
                          <span className="text-[9px] font-semibold" style={{ color: '#2563EB' }}>View All →</span>
                        </div>
                      </div>
                      {/* Table header */}
                      <div className="grid grid-cols-3 text-[8px] font-bold uppercase text-slate-400 px-1 mb-1">
                        <span>Startup</span><span>Sector</span><span>Status</span>
                      </div>
                      {[
                        { name: 'NexaAi Tech', sub: 'Dr. Sarah K.', sector: 'Fintech', badge: 'Incubating', bg: 'bg-emerald-100', text: 'text-emerald-800' },
                        { name: 'BioHealth Labs', sub: 'Mark Reynolds', sector: 'Fintech', badge: 'Seed Funded', bg: 'bg-blue-100', text: 'text-blue-800' },
                        { name: 'CleanGrid Power', sub: 'Elena Rostova', sector: 'Fintech', badge: 'Co-Incubation', bg: 'bg-purple-100', text: 'text-purple-800' },
                      ].map((r) => (
                        <div key={r.name} className="grid grid-cols-3 items-center p-1.5 rounded-lg hover:bg-slate-50 transition-colors text-xs mb-0.5">
                          <div>
                            <p className="font-semibold text-[10px]" style={{ color: '#1A2151' }}>{r.name}</p>
                            <p className="text-[9px] text-slate-400">{r.sub}</p>
                          </div>
                          <span className="text-[9px] text-slate-500">{r.sector}</span>
                          <span className={`px-1.5 py-0.5 rounded-full ${r.bg} ${r.text} text-[8px] font-semibold text-center`}>{r.badge}</span>
                        </div>
                      ))}
                    </div>

                    {/* Portfolio Growth */}
                    <div className="col-span-5 flex flex-col p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Portfolio Growth</p>
                      <p className="text-[8px] text-slate-400 mb-2">Milestones</p>
                      {/* Donut */}
                      <div className="relative w-14 h-14 flex items-center justify-center mx-auto mb-2">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path stroke="#e2e8f0" strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path stroke="#2563EB" strokeDasharray="75, 100" strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute text-[11px] font-extrabold" style={{ color: '#1A2151' }}>78%</span>
                      </div>
                      {/* Mini line chart */}
                      <svg viewBox="0 0 80 30" className="w-full" fill="none">
                        <polyline points="0,28 15,22 30,18 45,12 60,8 75,3" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="0,28 15,22 30,18 45,12 60,8 75,3 75,30 0,30" fill="url(#grad)" opacity="0.15" />
                        <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#2563EB" stopOpacity="0" /></linearGradient></defs>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="animate-float-1 absolute top-6 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-xl shadow-md border border-emerald-100 flex items-center gap-2 z-20 whitespace-nowrap">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div><p className="text-[11px] font-bold" style={{ color: '#1A2151' }}>Mentor Matched</p><p className="text-[9px] text-slate-400">Fintech Cohort #4</p></div>
                </div>
                <div className="animate-float-2 absolute bottom-8 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-xl shadow-md border border-blue-100 flex items-center gap-2 z-20 whitespace-nowrap">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#2563EB' }}>
                    <ClipboardList className="w-3.5 h-3.5" />
                  </div>
                  <div><p className="text-[11px] font-bold" style={{ color: '#1A2151' }}>New Application</p><p className="text-[9px] text-slate-400">AI DeepTech Program</p></div>
                </div>
                <div className="animate-float-3 absolute top-6 right-4 sm:right-6 bg-white px-3 py-2 rounded-xl shadow-md border border-purple-100 flex items-center gap-2 z-20 whitespace-nowrap">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    <Handshake className="w-3.5 h-3.5" />
                  </div>
                  <div><p className="text-[11px] font-bold" style={{ color: '#1A2151' }}>Co-incubation Active</p><p className="text-[9px] text-slate-400">2 Partner Networks</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="bg-white border-y border-slate-200/80 py-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              {[
                { Icon: Rocket, color: 'text-blue-600', bg: 'bg-blue-50', count: 200, suffix: '+', label: 'Startups Supported' },
                { Icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', count: 50, suffix: '+', label: 'Expert Mentors' },
                { Icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', count: 30, suffix: '+', label: 'Active Investors' },
                { Icon: Handshake, color: 'text-cyan-600', bg: 'bg-cyan-50', count: 15, suffix: '', label: 'Co-incubation Programs' },
              ].map(({ Icon, color, bg, count, suffix, label }) => (
                <div key={label} className="flex items-center justify-center gap-4 px-4 pt-4 sm:pt-0 scroll-reveal">
                  <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold tracking-tight" style={{ color: '#1A2151' }}>
                      <Counter end={count} suffix={suffix} />
                    </p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-20 lg:py-24" style={{ backgroundColor: '#EDF2FA' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#2563EB' }}>Enterprise Capability</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 mb-4" style={{ color: '#1A2151' }}>
                Everything you need to run a world-class incubator
              </h2>
              <p className="text-slate-600 text-lg">End-to-end tooling engineered for incubator directors, cohort managers, startups, and enterprise ecosystem partners.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { Icon: FolderKanban, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', hover: 'hover:text-[#2563EB]', title: 'Startup Portfolio Management', desc: 'Track cohorts, applications, milestones, and startup progress in one place. Automated reporting keeps stakeholders informed without spreadsheets.' },
                { Icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', hover: 'hover:text-emerald-600', title: 'Mentorship Hub', desc: 'Connect startups with General Mentors and Subject Matter Experts (SME). Smart matching pairings based on domain, skill gap, and founder needs.' },
                { Icon: Network, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', hover: 'hover:text-purple-600', title: 'Co-Incubation Programs', desc: 'Launch and manage joint incubation partnerships and cross-institution programs effortlessly with shared permission controls and audit logs.' },
                { Icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', hover: 'hover:text-amber-600', title: 'Analytics Dashboard', desc: 'Real-time insights on portfolio performance, mentor engagement, economic outcomes, and grant utilization for board level presentation.' },
              ].map(({ Icon, color, bg, border, hover, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 border border-slate-100 group scroll-reveal">
                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 rounded-2xl ${bg} border ${border} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${color}`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 transition-colors ${hover}`} style={{ color: '#1A2151' }}>{title}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUSTED BY ── */}
        <section className="bg-white py-12 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Trusted by leading incubators &amp; accelerators worldwide</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              {[
                { bg: 'bg-slate-200 text-[#1A2151]', abbr: 'V', name: 'VentureHub' },
                { bg: 'bg-slate-200 text-[#2563EB]', abbr: 'N', name: 'Nexus Labs' },
                { bg: 'bg-slate-200 text-emerald-600', abbr: 'G', name: 'GlobalX' },
                { bg: 'bg-slate-200 text-purple-600', abbr: 'I', name: 'InnoFoundry' },
                { bg: 'bg-slate-200 text-cyan-600', abbr: 'A', name: 'Apex Spark' },
                { bg: 'bg-slate-200 text-amber-600', abbr: 'C', name: 'Catalyst Network' },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-2 font-bold text-slate-600 text-lg">
                  <div className={`w-8 h-8 rounded-lg ${p.bg} flex items-center justify-center font-black text-xs`}>{p.abbr}</div>
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MENTOR SPOTLIGHT ── */}
        <section id="mentors" className="py-20 lg:py-24" style={{ backgroundColor: '#EDF2FA' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#2563EB' }}>Expert Network</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 mb-4" style={{ color: '#1A2151' }}>Connect with World-Class Mentors</h2>
              <p className="text-slate-600 text-lg">Empower your founders with direct access to vetted industry pioneers, seasoned founders, and functional SMEs.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80', name: 'Dr. Sarah Jenkins', role: 'Ex-VP Product @ FinTech Global', badge: 'SME Expert', badgeBg: 'bg-blue-50 text-[#2563EB] border-blue-200', tags: ['Product','SaaS','Scaleup'] },
                { img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', name: 'Marcus Vance', role: 'Serial Founder & Angel Investor', badge: 'General Mentor', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200', tags: ['Fundraising','Go-To-Market'] },
                { img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80', name: 'Aisha Patel', role: 'Chief AI Strategist @ DeepTech Labs', badge: 'SME Expert', badgeBg: 'bg-blue-50 text-[#2563EB] border-blue-200', tags: ['AI & ML','IP & Patents'] },
                { img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80', name: "David O'Connor", role: 'Partner @ Horizon Ventures', badge: 'General Mentor', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200', tags: ['Series A','Unit Economics'] },
              ].map((m) => (
                <div key={m.name} className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-slate-100 flex flex-col justify-between group scroll-reveal">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.img} alt={m.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#2563EB]/20 shadow group-hover:scale-105 transition-transform duration-300" />
                      <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${m.badgeBg}`}>{m.badge}</span>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-[#2563EB] transition-colors" style={{ color: '#1A2151' }}>{m.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-4">{m.role}</p>
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {m.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">[{t}]</span>
                      ))}
                    </div>
                  </div>
                  <Link href="/login" className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-[#1A2151] hover:text-white hover:shadow-md text-[#1A2151] font-semibold text-xs transition-all duration-200 border border-slate-200 flex items-center justify-center gap-1.5">
                    Schedule Session <Calendar className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INVESTOR NETWORK ── */}
        <section id="investors" className="py-20 lg:py-24 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#2563EB' }}>Capital Matching</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight" style={{ color: '#1A2151' }}>Connect Startups with the Right Investors</h2>
                <p className="text-slate-600 text-base leading-relaxed">Arba360&apos;s curated dealroom enables program directors to showcase high-performing startups to active seed funds, angel syndicates, and corporate venture capital arms with verified KPI data.</p>
                <div className="space-y-3.5 text-sm font-medium pt-2" style={{ color: '#1A2151' }}>
                  {[
                    'Milestone-backed dealroom profiles with real-time analytics',
                    'Direct warm introduction workflows & term sheet tracking',
                    'Automated investor update digest distribution',
                  ].map((pt) => (
                    <div key={pt} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:text-[#1A2151]" style={{ color: '#2563EB' }}>
                  Explore Investor Dealroom Demo →
                </Link>
              </div>
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { abbr: 'AP', bg: 'bg-[#1A2151]', name: 'Apex Partners', type: 'Seed to Series A Fund', ticket: '$250K - $1.5M', tags: ['B2B SaaS','Fintech'] },
                  { abbr: 'NV', bg: 'bg-[#2563EB]', name: 'NextGen Ventures', type: 'Pre-Seed Angel Syndicate', ticket: '$50K - $250K', tags: ['AI / ML','DeepTech'] },
                  { abbr: 'CVC', bg: 'bg-purple-600', name: 'Crest Alliance', type: 'Corporate VC Network', ticket: '$500K - $3M', tags: ['HealthTech','CleanTech'] },
                ].map((inv) => (
                  <div key={inv.name} className="rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between scroll-reveal group" style={{ backgroundColor: '#EDF2FA' }}>
                    <div>
                      <div className={`w-10 h-10 rounded-xl ${inv.bg} text-white flex items-center justify-center font-bold text-sm mb-3 group-hover:scale-105 transition-transform`}>{inv.abbr}</div>
                      <h4 className="font-bold text-sm group-hover:text-[#2563EB] transition-colors" style={{ color: '#1A2151' }}>{inv.name}</h4>
                      <p className="text-[11px] text-slate-500 mb-3">{inv.type}</p>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Ticket Size</p>
                      <p className="text-xs font-bold mb-3" style={{ color: '#1A2151' }}>{inv.ticket}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {inv.tags.map((t) => <span key={t} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] text-slate-600 font-semibold">{t}</span>)}
                      </div>
                    </div>
                    <Link href="/login" className="w-full py-1.5 rounded-lg bg-white font-bold text-xs border border-slate-200 hover:bg-[#1A2151] hover:text-white transition-all text-center block" style={{ color: '#1A2151' }}>
                      View Profile
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CO-INCUBATION ── */}
        <section className="py-20 lg:py-24 text-white relative overflow-hidden" style={{ backgroundColor: '#1A2151' }}>
          <div className="absolute inset-0 hero-pattern opacity-30" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse-glow" style={{ backgroundColor: 'rgba(6,182,212,0.12)' }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6 scroll-reveal">
                <span className="px-3 py-1 rounded-full bg-white/10 border text-xs font-semibold" style={{ color: '#06B6D4', borderColor: 'rgba(6,182,212,0.3)' }}>Multi-Tenant Ecosystem</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">Partner-Driven Growth Through Co-Incubation</h2>
                <p className="text-slate-300 text-base leading-relaxed">Break institutional silos. Launch joint accelerators across universities, corporations, and government innovation agencies with unified oversight.</p>
                <div className="space-y-4 pt-2">
                  {[
                    { Icon: Layers, title: 'Joint Incubation Programs', desc: 'Run cross-branded cohorts with co-managed applicant pipelines and shared curriculum.' },
                    { Icon: Users, title: 'Shared Mentor & Expert Pools', desc: 'Pool specialized advisors across regional partner centers while maintaining privacy controls.' },
                    { Icon: Globe, title: 'Cross-Border Innovation Ecosystems', desc: 'Support international soft-landing startup exchange programs effortlessly.' },
                    { Icon: FileCheck2, title: 'Unified Auditing & Grant Reporting', desc: 'Consolidate metric reporting for government sponsors and institutional backers in real time.' },
                  ].map(({ Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(37,99,235,0.2)', color: '#06B6D4' }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{title}</h4>
                        <p className="text-slate-400 text-xs">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-6 scroll-reveal">
                <div className="rounded-2xl p-6 border border-slate-700/60 shadow-2xl space-y-4 hover:border-slate-600 transition-colors" style={{ backgroundColor: 'rgba(15,21,53,0.9)' }}>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="font-bold text-sm text-white">Active Co-Incubation Network</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#06B6D4' }}>3 Partner Hubs Connected</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center py-2">
                    <div className="p-3 rounded-xl border hover:border-white/20 transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <p className="text-xs font-bold text-white">TechHub US</p>
                      <p className="text-[10px] text-slate-400">14 Startups</p>
                    </div>
                    <div className="p-3 rounded-xl border shadow-sm" style={{ backgroundColor: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.4)' }}>
                      <p className="text-xs font-bold" style={{ color: '#06B6D4' }}>Arba360 Core</p>
                      <p className="text-[10px] text-slate-300">Unified Portal</p>
                    </div>
                    <div className="p-3 rounded-xl border hover:border-white/20 transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <p className="text-xs font-bold text-white">BioEurope</p>
                      <p className="text-[10px] text-slate-400">12 Startups</p>
                    </div>
                  </div>
                  <div className="rounded-xl p-4 border space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Joint Grant Allocation Progress</span>
                      <span className="font-bold" style={{ color: '#06B6D4' }}>$1.2M / $1.5M</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden relative">
                      <div className="w-4/5 h-full bg-gradient-brand rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-20 lg:py-28 border-t border-slate-200/60" style={{ backgroundColor: '#EDF2FA' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 scroll-reveal">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#2563EB' }}>Standardized Process</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 mb-4" style={{ color: '#1A2151' }}>Your incubation journey, simplified</h2>
              <p className="text-slate-600 text-base">From intake evaluation to alumni scaling, Arba360 standardizes every critical phase of startup development.</p>
            </div>
            <div className="relative">
              {/* Sequential Line Flow & Pulse Wave */}
              <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] -translate-y-8 z-0">
                <div className="w-full h-0.5 border-t-2 border-dashed border-slate-300 relative">
                  {/* Glowing Pulse Wave Comet */}
                  <div className="animate-pulse-comet w-16 h-2 -top-1 rounded-full bg-gradient-to-r from-transparent via-[#06B6D4] to-[#2563EB] shadow-[0_0_14px_#2563EB] blur-[0.5px]" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
                {[
                  { step: '01', pulseClass: 'wave-pulse-1', title: 'Apply', desc: 'Custom intake forms with automated eligibility checks and applicant portal.' },
                  { step: '02', pulseClass: 'wave-pulse-2', title: 'Select', desc: 'Multi-reviewer scoring committees, pitch panel evaluation, and contract generation.' },
                  { step: '03', pulseClass: 'wave-pulse-3', title: 'Mentor', desc: 'Automated mentor matching, office hours calendar, and progress check-in tracking.' },
                  { step: '04', pulseClass: 'wave-pulse-4', title: 'Track', desc: 'Milestone verification, grant disbursement approvals, and health score monitoring.' },
                  { step: '05', pulseClass: 'wave-pulse-5', title: 'Scale', desc: 'Investor showcase room, demo day portal, and long-term alumni ecosystem engagement.' },
                ].map((s) => (
                  <div key={s.title} className="bg-white rounded-2xl p-6 shadow-soft text-center flex flex-col items-center hover:-translate-y-2.5 hover:shadow-card-hover hover:border-blue-200 transition-all duration-300 border border-slate-100 group scroll-reveal cursor-default">
                    <div className={`w-12 h-12 rounded-full text-white text-xs font-bold tracking-wider flex items-center justify-center mb-4 shadow-md group-hover:scale-110 group-hover:bg-[#2563EB] transition-all duration-300 font-mono ${s.pulseClass}`}>
                      {s.step}
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-[#2563EB] transition-colors" style={{ color: '#1A2151' }}>{s.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="about" className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 scroll-reveal">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#2563EB' }}>Social Proof</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 mb-4" style={{ color: '#1A2151' }}>Trusted by top global incubators</h2>
              <p className="text-slate-600 text-base">See how enterprise innovation centers use Arba360 to amplify program outcomes.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { quote: '"Arba360 completely transformed our cohort governance. We managed over 40 startups across 3 countries with zero administrative chaos."', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', name: 'Dr. Elena Vance', role: 'Managing Director, BioInnovate Hub' },
                { quote: '"The mentor matching feature alone saved our team 80+ manual coordination hours per cohort. Mentors love the simplicity of scheduling."', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', name: 'Marcus Chen', role: 'Head of Ecosystem, TechScale Regional' },
                { quote: '"Audit-ready reporting made grant compliance seamless for our public fund partners. Arba360 is indispensable for modern incubation."', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80', name: 'Aisha Al-Hassan', role: 'Director, National Venture Fund' },
              ].map((t) => (
                <div key={t.name} className="rounded-2xl p-8 border border-slate-200/60 shadow-sm hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between scroll-reveal" style={{ backgroundColor: '#EDF2FA' }}>
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">{t.quote}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.img} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow" />
                    <div>
                      <h4 className="text-xs font-bold" style={{ color: '#1A2151' }}>{t.name}</h4>
                      <p className="text-[11px] text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section id="get-started" className="relative py-20 overflow-hidden text-center text-white" style={{ backgroundColor: '#1A2151' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(37,99,235,0.2), transparent, rgba(6,182,212,0.2))' }} />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ backgroundColor: 'rgba(37,99,235,0.35)' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">Ready to build the next generation of startups?</h2>
            <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10">Join leading university, corporate, and regional incubators already using Arba360 to manage their startup ecosystem.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="px-8 py-4 rounded-xl bg-white font-bold text-base shadow-xl hover:bg-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto" style={{ color: '#1A2151' }}>
                Get Started Free
              </Link>
              <Link href="/login" className="px-8 py-4 rounded-xl border border-white/30 text-white font-semibold text-base hover:bg-white/10 hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto">
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="text-slate-400 py-16 border-t border-slate-800" style={{ backgroundColor: '#0F1535' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            <div className="lg:col-span-2 space-y-4">
              <Logo size="lg" variant="light" href="/" />
              <p className="text-xs leading-relaxed max-w-sm text-slate-400">The all-in-one enterprise operating system for innovation centers, university accelerators, corporate venture hubs, and grant managers.</p>
              <div className="flex gap-4 pt-2">
                {/* X / Twitter */}
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L1.254 2.25H8.08l4.258 5.625 5.906-5.625Zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                {/* LinkedIn */}
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
                {/* GitHub */}
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" /></svg>
                </a>
              </div>
            </div>
            {[
              { heading: 'Platform', links: ['Cohort Intake','Mentor Engine','Co-Incubation Hub','Grant Reporting','Investor Demo Room'] },
              { heading: 'Features', links: ['Custom Scoring Forms','Audit & Compliance','Role Permissions','Analytics Export','API Integrations'] },
              { heading: 'Company & Legal', links: ['About Us','Case Studies','Privacy Policy','Terms of Service','Security Overview'] },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">{col.heading}</h4>
                <ul className="space-y-2.5 text-xs">
                  {col.links.map((l) => <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>&copy; 2026 Arba360 Inc. All rights reserved. Enterprise SaaS Platform.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms &amp; Conditions</a>
              <a href="#" className="hover:underline">System Status</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
