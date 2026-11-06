'use client';

import React from 'react';
import {
  Sparkles,
  Rocket,
  Globe,
  Mail,
  Phone,
  Calendar,
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  FileCheck,
  Download,
  ExternalLink,
  ShieldCheck,
  Target,
  Lightbulb,
  Award,
  Clock,
  Briefcase,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { StartupItem, AllocatedMentor, AllocatedInvestor, CoIncubatorItem } from '../types';

interface StartupProfilePreviewProps {
  startup: StartupItem;
  liveMentors?: AllocatedMentor[];
  liveInvestors?: AllocatedInvestor[];
  liveCoIncubators?: CoIncubatorItem[];
}

export function StartupProfilePreview({
  startup,
  liveMentors = [],
  liveInvestors = [],
  liveCoIncubators = [],
}: StartupProfilePreviewProps) {
  // Derive progress based on stage
  const stageMap: Record<string, number> = {
    idea: 20,
    mvp: 40,
    'pre-revenue': 60,
    revenue: 80,
    growth: 90,
    scale: 100,
  };
  const currentStageKey = (startup.stage || 'idea').toLowerCase();
  const stageProgress = stageMap[currentStageKey] || 50;

  const founderName = startup.founder_name || startup.founder || 'Founder';
  const founderEmail = startup.founder_email || startup.founderEmail || '';
  const founderPhone = startup.founder_phone || startup.founderPhone || '';
  const teamList = startup.teamMembers || startup.team || [];
  const mrrVal = Number(startup.mrr || startup.monthly_revenue || 0);
  const arrVal = Number(startup.arr || startup.annual_revenue || mrrVal * 12);
  const fundingVal = startup.funding || (startup.funding_raised ? `$${Number(startup.funding_raised).toLocaleString()}` : '$0');
  const customerCount = startup.customers ?? startup.customer_count ?? 0;

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Header Banner & Identity */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold flex items-center justify-center text-xl shadow-md shrink-0">
            {startup.monogram || startup.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {startup.name}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Rocket className="w-3 h-3 text-blue-600" />
                {startup.cohort || 'Cohort 2026'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {startup.sector || 'Technology'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {startup.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {startup.tagline || startup.description || 'Accelerated Startup Cohort Member'}
            </p>
          </div>
        </div>

        {/* Stage Meter */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
            <span>Stage: <strong className="text-slate-900">{startup.stage || 'MVP'}</strong></span>
            <span className="text-blue-600 font-extrabold">{stageProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
              style={{ width: `${stageProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Quick Info Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Founder & CEO</p>
            <p className="text-xs font-bold text-slate-900 truncate">{founderName}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-semibold text-slate-500">Founder Email</p>
            <p className="text-xs font-bold text-slate-900 truncate">{founderEmail || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Phone</p>
            <p className="text-xs font-bold text-slate-900">{founderPhone || 'Not provided'}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-semibold text-slate-500">Website</p>
            {startup.website ? (
              <a
                href={startup.website.startsWith('http') ? startup.website : `https://${startup.website}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 truncate"
              >
                {startup.website.replace(/^https?:\/\//, '')}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <p className="text-xs font-bold text-slate-400">Not set</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Financials & Traction Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3.5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Financials & Growth Traction
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Monthly MRR</span>
            <p className="text-lg font-black text-slate-900 mt-0.5 tabular-nums">
              ${mrrVal.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Annual ARR</span>
            <p className="text-lg font-black text-slate-900 mt-0.5 tabular-nums">
              ${arrVal.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Capital Raised</span>
            <p className="text-lg font-black text-blue-600 mt-0.5">{fundingVal}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Customers</span>
            <p className="text-lg font-black text-slate-900 mt-0.5 tabular-nums">
              {customerCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Business & Product Information */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-600" />
          Business & Product Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Problem Statement
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {startup.problem_statement || startup.problem || 'Under validation with pilot partners.'}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5 text-blue-500" />
              Proposed Solution
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {startup.solution_description || startup.solution || startup.pitch || 'Autonomous software architecture and proprietary workflows.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1.5">
              Target Market & TAM
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {startup.target_market || startup.market || 'High-growth Enterprise & B2B Technology.'}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1.5">
              Business & Revenue Model
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {startup.business_model || startup.revenue_model || 'B2B SaaS subscription with annual platform tiers.'}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Legal & Corporate Registration */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3.5 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Legal & Compliance
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Entity Type</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{startup.registration_type || 'Private Limited'}</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Reg Number</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5 font-mono">{startup.registration_number || 'REG-PENDING'}</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">PAN</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5 font-mono">{startup.pan_number || 'N/A'}</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">GST</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5 font-mono">{startup.gst_number || 'N/A'}</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">CIN</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5 font-mono">{startup.cin_number || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* 6. Team & Key Personnel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3.5 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          Team & Key Personnel ({teamList.length + 1} members)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Founder */}
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
              {founderName.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{founderName}</p>
              <p className="text-[11px] text-blue-700 font-semibold">Founder & CEO</p>
              <p className="text-[10px] text-slate-400 truncate">{founderEmail}</p>
            </div>
          </div>

          {/* Additional Members */}
          {teamList.map((m: any, idx: number) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                {m.initials || m.name?.slice(0, 2).toUpperCase() || 'TM'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{m.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">{m.role || 'Core Team'}</p>
                {m.email && <p className="text-[10px] text-slate-400 truncate">{m.email}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Documents & Incubation Collateral */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3.5 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          Documents & Official Decks
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-slate-900">Pitch Deck Official</p>
                <p className="text-[10px] text-slate-500">Official Investor Presentation</p>
              </div>
            </div>
            {startup.pitch_deck_url ? (
              <a
                href={startup.pitch_deck_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                View Deck
              </a>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">Uploaded in Portal</span>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-xs font-bold text-slate-900">Business Model Plan</p>
                <p className="text-[10px] text-slate-500">Unit Economics & Model</p>
              </div>
            </div>
            {startup.business_plan_url ? (
              <a
                href={startup.business_plan_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                View Plan
              </a>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">Under Cohort Review</span>
            )}
          </div>
        </div>
      </div>

      {/* 8. Allocations: Mentors, Investors & Co-Incubations */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          Incubator Allocations & Advisory Network
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mentors */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Allocated Mentors</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                {liveMentors.length}
              </span>
            </h4>
            {liveMentors.length === 0 ? (
              <p className="text-[11px] text-slate-400">No mentors allocated yet.</p>
            ) : (
              <ul className="space-y-2">
                {liveMentors.map((m) => (
                  <li key={m.id} className="text-xs">
                    <p className="font-bold text-slate-900">{m.name}</p>
                    <p className="text-[10px] text-slate-500">{m.domain} • {m.type}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Investors */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Investor Leads</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                {liveInvestors.length}
              </span>
            </h4>
            {liveInvestors.length === 0 ? (
              <p className="text-[11px] text-slate-400">No investor leads active.</p>
            ) : (
              <ul className="space-y-2">
                {liveInvestors.map((i) => (
                  <li key={i.id} className="text-xs">
                    <p className="font-bold text-slate-900">{i.name}</p>
                    <p className="text-[10px] text-slate-500">{i.company} • {i.interestLevel}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Co-Incubations */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Co-Incubations</span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                {liveCoIncubators.length}
              </span>
            </h4>
            {liveCoIncubators.length === 0 ? (
              <p className="text-[11px] text-slate-400">No partner incubators enrolled.</p>
            ) : (
              <ul className="space-y-2">
                {liveCoIncubators.map((c) => (
                  <li key={c.id} className="text-xs">
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <p className="text-[10px] text-slate-500">{c.type} • {c.mouStatus}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

