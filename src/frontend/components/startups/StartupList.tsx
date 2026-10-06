"use client";

import React from "react";
import { StartupItem } from "./types";
import { UserCheck, TrendingUp, Handshake, ChevronRight, Rocket } from "lucide-react";

interface StartupListProps {
  startups: StartupItem[];
  onSelectStartup: (startup: StartupItem) => void;
  onAllocateMentorClick: (startup: StartupItem) => void;
  onAllocateInvestorClick: (startup: StartupItem) => void;
  onCoIncubatorClick: (startup: StartupItem) => void;
}

export const StartupList: React.FC<StartupListProps> = ({
  startups,
  onSelectStartup,
  onAllocateMentorClick,
  onAllocateInvestorClick,
  onCoIncubatorClick,
}) => {
  if (startups.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center my-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Rocket className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">No Startups Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No startups matched your search query or filter selection. Try clearing filters.
        </p>
      </div>
    );
  }

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

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-3 px-4">Startup</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4">Cohort</th>
              <th className="py-3 px-4">Funding</th>
              <th className="py-3 px-4 text-center">Mentors</th>
              <th className="py-3 px-4 text-center">Investors</th>
              <th className="py-3 px-4 text-center">Co-Incubators</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {startups.map((startup) => (
              <tr
                key={startup.id}
                onClick={() => onSelectStartup(startup)}
                className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 border border-indigo-100 text-xs">
                      {startup.monogram || startup.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {startup.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{startup.sector || startup.industry || "Technology"}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded border inline-block ${getStageBadgeColor(startup.stage)}`}>
                    {startup.stage}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-700">
                  {startup.cohort || "Cohort 2026"}
                </td>
                <td className="py-3.5 px-4 font-semibold text-emerald-700">
                  {startup.funding || startup.fundingRaised || "$0"}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-medium">
                    <UserCheck className="w-3 h-3" />
                    {startup.allocatedMentors?.length || 0}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[11px] font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {startup.allocatedInvestors?.length || 0}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium">
                    <Handshake className="w-3 h-3" />
                    {startup.coIncubators?.length || 0}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onAllocateMentorClick(startup)}
                      title="Allocate Mentor"
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onAllocateInvestorClick(startup)}
                      title="Allocate Investor"
                      className="p-1 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onCoIncubatorClick(startup)}
                      title="Add Co-Incubator"
                      className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectStartup(startup)}
                      className="p-1 text-indigo-600 hover:bg-indigo-50 rounded ml-1 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
