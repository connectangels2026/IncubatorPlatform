"use client";

import React, { useState } from "react";
import { Users, DollarSign, Award, ChevronRight, UserCheck, TrendingUp, Handshake, Mail, CheckCircle } from "lucide-react";
import { StartupItem } from "./types";
import StartupLogo from "@/frontend/components/ui/StartupLogo";
import { apiClient } from "@/frontend/lib/apiClient";

interface StartupCardProps {
  startup: StartupItem;
  onSelect: (startup: StartupItem) => void;
  onAllocateMentorClick?: (startup: StartupItem) => void;
  onAllocateInvestorClick?: (startup: StartupItem) => void;
  onCoIncubatorClick?: (startup: StartupItem) => void;
  onStatusChange?: (startup: StartupItem, status: 'Pending' | 'Active' | 'Inactive' | 'Exited') => void;
  onInviteFounder?: (startup: StartupItem) => void;
}

export const StartupCard: React.FC<StartupCardProps> = ({
  startup,
  onSelect,
  onAllocateMentorClick,
  onAllocateInvestorClick,
  onCoIncubatorClick,
  onStatusChange,
  onInviteFounder,
}) => {
  const [isInviting, setIsInviting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInviteFounder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInviting(true);
    try {
      const res = await apiClient(`/api/v1/startups/${startup.id}/invite-founder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.link) {
          try {
            await navigator.clipboard.writeText(data.link);
            showToast("✅ Invitation link copied to clipboard!", "success");
          } catch {
            showToast("✅ Invitation sent to founder.", "success");
          }
        } else {
          showToast("✅ Invitation email sent to founder.", "success");
        }
        if (onInviteFounder) onInviteFounder(startup);
      } else {
        showToast(data.error || "Failed to send invitation", "error");
      }
    } catch (err) {
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsInviting(false);
    }
  };
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

  const getStatusStyle = (status?: string) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'inactive':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'exited':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-300';
    }
  };

  const currentStatus = (): 'Pending' | 'Active' | 'Inactive' | 'Exited' => {
    const s = (startup.status || 'pending').toLowerCase();
    if (s === 'active') return 'Active';
    if (s === 'inactive') return 'Inactive';
    if (s === 'exited') return 'Exited';
    return 'Pending';
  };

  return (
    <div
      onClick={() => onSelect(startup)}
      className="group bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden relative"
    >
      {/* Toast */}
      {toast && (
        <div
          className={`absolute top-2 left-2 right-2 z-10 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium shadow-md ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}
      <div className="p-5">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <StartupLogo
              name={startup.name}
              logoUrl={(startup as any).logo_url}
              logoColor={(startup as any).logo_color}
              initials={(startup as any).initials}
              className="w-10 h-10 rounded-lg text-xs shrink-0 border border-slate-200/80 shadow-xs"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                {startup.name}
              </h3>
              <p className="text-xs text-slate-500 truncate">{startup.industry || "Technology"}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${getStageBadgeColor(startup.stage)}`}>
              {startup.stage}
            </span>
            {onStatusChange ? (
              <select
                value={currentStatus()}
                onChange={(e) => onStatusChange(startup, e.target.value as any)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer focus:outline-none ${getStatusStyle(startup.status)}`}
              >
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Exited">Exited</option>
              </select>
            ) : (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(startup.status)}`}>
                {currentStatus()}
              </span>
            )}
          </div>
        </div>

        {/* Pitch / Tagline */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {startup.pitch || "Innovative platform accelerating workflows and unlocking scalable efficiencies."}
        </p>

        {/* Key Metrics Pill Grid */}
        <div className="grid grid-cols-2 gap-2 py-2.5 px-3 bg-slate-50/70 rounded-lg border border-slate-100 text-xs mb-3">
          <div>
            <span className="text-[10px] text-slate-500 block font-medium">Cohort</span>
            <span className="text-slate-800 font-medium truncate block">{startup.cohort || "Cohort 2026"}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-medium">Funding</span>
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

          {/* Invite Founder / Already Registered */}
          {startup.founder_registered ? (
            <span
              title="Founder already registered"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium border border-emerald-200 cursor-default select-none"
            >
              <CheckCircle className="w-3 h-3" />
              Registered
            </span>
          ) : (
            <button
              onClick={handleInviteFounder}
              disabled={isInviting}
              title="Invite Founder to set password"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[10px] font-medium border border-indigo-200 cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
              <Mail className="w-3 h-3" />
              {isInviting ? "Sending…" : "Invite"}
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
