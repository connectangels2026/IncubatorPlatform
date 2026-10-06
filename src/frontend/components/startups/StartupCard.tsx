"use client";

import React from "react";
import { Users, DollarSign, Award, ChevronRight, UserCheck, TrendingUp, Handshake } from "lucide-react";
import { StartupItem } from "./types";

interface StartupCardProps {
  startup: StartupItem;
  onSelect: (startup: StartupItem) => void;
  onAllocateMentorClick?: (startup: StartupItem) => void;
  onAllocateInvestorClick?: (startup: StartupItem) => void;
  onCoIncubatorClick?: (startup: StartupItem) => void;
}

export const StartupCard: React.FC<StartupCardProps> = ({
  startup,
  onSelect,
  onAllocateMentorClick,
  onAllocateInvestorClick,
  onCoIncubatorClick,
}) => {
  const getStageBadgeColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case "idea":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "mvp":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "early stage":
      case "early":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "growth":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "scale":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getHealthBadge = (health?: string) => {
    switch (health?.toLowerCase()) {
      case "high":
      case "strong":
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">High Growth</span>;
      case "moderate":
      case "medium":
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">Moderate</span>;
      case "at risk":
      case "low":
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">Needs Focus</span>;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => onSelect(startup)}
      className="group bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden relative"
    >
      <div className="p-5">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 border border-indigo-100/80 shadow-xs">
              {startup.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                {startup.name}
              </h3>
              <p className="text-xs text-slate-500 truncate">{startup.industry || "Technology"}</p>
            </div>
          </div>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border shrink-0 ${getStageBadgeColor(startup.stage)}`}>
            {startup.stage}
          </span>
        </div>

        {/* Pitch / Tagline */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {startup.pitch || "Innovative platform accelerating workflows and unlocking scalable efficiencies."}
        </p>

        {/* Key Metrics Pill Grid */}
        <div className="grid grid-cols-2 gap-2 py-2.5 px-3 bg-slate-50/70 rounded-lg border border-slate-100 text-xs mb-3">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Cohort</span>
            <span className="text-slate-800 font-medium truncate block">{startup.cohort || "Cohort 2026"}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Funding</span>
            <span className="text-emerald-700 font-semibold truncate block">{startup.fundingRaised || "$0"}</span>
          </div>
        </div>

        {/* Allocations summary counters */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[11px]" title="Allocated Mentors">
              <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>{startup.allocatedMentors?.length || 0}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]" title="Allocated Investors">
              <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
              <span>{startup.allocatedInvestors?.length || 0}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]" title="Co-Incubators">
              <Handshake className="w-3.5 h-3.5 text-amber-500" />
              <span>{startup.coIncubators?.length || 0}</span>
            </span>
          </div>
          {getHealthBadge(startup.healthScore)}
        </div>
      </div>

      {/* Footer / Quick Actions Bar */}
      <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {onAllocateMentorClick && (
            <button
              onClick={() => onAllocateMentorClick(startup)}
              title="Allocate Mentor"
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
            </button>
          )}
          {onAllocateInvestorClick && (
            <button
              onClick={() => onAllocateInvestorClick(startup)}
              title="Allocate Investor"
              className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          )}
          {onCoIncubatorClick && (
            <button
              onClick={() => onCoIncubatorClick(startup)}
              title="Add Co-Incubator"
              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-colors"
            >
              <Handshake className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform">
          View Profile <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
