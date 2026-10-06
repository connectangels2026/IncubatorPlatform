"use client";

import React from "react";
import { StartupCard } from "./StartupCard";
import { StartupItem } from "./types";
import { Rocket } from "lucide-react";

interface StartupGridProps {
  startups: StartupItem[];
  onSelectStartup: (startup: StartupItem) => void;
  onAllocateMentorClick: (startup: StartupItem) => void;
  onAllocateInvestorClick: (startup: StartupItem) => void;
  onCoIncubatorClick: (startup: StartupItem) => void;
}

export const StartupGrid: React.FC<StartupGridProps> = ({
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {startups.map((startup) => (
        <StartupCard
          key={startup.id}
          startup={startup}
          onSelect={onSelectStartup}
          onAllocateMentorClick={onAllocateMentorClick}
          onAllocateInvestorClick={onAllocateInvestorClick}
          onCoIncubatorClick={onCoIncubatorClick}
        />
      ))}
    </div>
  );
};
