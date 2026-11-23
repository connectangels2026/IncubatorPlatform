"use client";

import React, { useState } from "react";
import { StartupItem } from "./types";
import { UserCheck, TrendingUp, Handshake, Rocket, Mail, CheckCircle, LayoutDashboard } from "lucide-react";
import { apiClient } from "@/frontend/lib/apiClient";

interface StartupListProps {
  startups: StartupItem[];
  onSelectStartup: (startup: StartupItem) => void;
  onAllocateMentorClick: (startup: StartupItem) => void;
  onAllocateInvestorClick: (startup: StartupItem) => void;
  onCoIncubatorClick: (startup: StartupItem) => void;
  onStatusChange?: (startup: StartupItem, status: "Pending" | "Active" | "Inactive" | "Exited") => void;
  onInviteFounder?: (startup: StartupItem) => void;
  onAssignDashboard?: (startup: StartupItem) => void;
}

export const StartupList: React.FC<StartupListProps> = ({
  startups,
  onSelectStartup,
  onAllocateMentorClick,
  onAllocateInvestorClick,
  onCoIncubatorClick,
  onStatusChange,
  onInviteFounder,
  onAssignDashboard,
}) => {
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAssignDashboard = (e: React.MouseEvent, startup: StartupItem) => {
    e.stopPropagation();
    if (startup.admission_status === 'dashboard_assigned') return;
    if (onAssignDashboard) {
      onAssignDashboard(startup);
    }
  };

  const handleInviteFounder = async (e: React.MouseEvent, startup: StartupItem) => {
    e.stopPropagation();
    setInvitingId(startup.id);
    try {
      const res = await apiClient(`/api/v1/startups/${startup.id}/invite-founder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.emailSent) {
          showToast(`✅ Invitation email sent to ${startup.founderEmail || startup.founder_email || "founder"}!`, "success");
        } else if (data.link) {
          try {
            await navigator.clipboard.writeText(data.link);
            if (data.emailError) {
              showToast(`⚠️ Email not sent (${data.emailError}). Link copied to clipboard!`, "error");
            } else {
              showToast("✅ Invitation link copied to clipboard! Share it with the founder.", "success");
            }
          } catch {
            showToast("✅ Invitation sent! Link: " + data.link, "success");
          }
        } else {
          showToast("✅ Invitation email sent to " + (startup.founderEmail || startup.founder_email || "founder"), "success");
        }
        if (onInviteFounder) onInviteFounder(startup);
      } else {
        showToast(data.error || "Failed to send invitation", "error");
      }
    } catch (err) {
      console.error("Invite founder error:", err);
      showToast("Network error. Please try again.", "error");
    } finally {
      setInvitingId(null);
    }
  };

  if (startups.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center my-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Rocket className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">No startups found</h3>
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

  const getStatusStyle = (status?: string) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "inactive":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "exited":
        return "bg-purple-50 text-purple-700 border-purple-300";
      case "pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-300";
    }
  };

  const currentStatus = (status?: string): "Pending" | "Active" | "Inactive" | "Exited" => {
    const s = (status || "pending").toLowerCase();
    if (s === "active") return "Active";
    if (s === "inactive") return "Inactive";
    if (s === "exited") return "Exited";
    return "Pending";
  };

  return (
    <div className="relative">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 ${toast.type === "success"
            ? "bg-emerald-600 text-white"
            : "bg-red-600 text-white"
            }`}
        >
          {toast.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : null}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-xs">
                <th className="py-3 px-4">Startup</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Cohort</th>
                <th className="py-3 px-4">Funding</th>
                <th className="py-3 px-4 text-center">Mentors</th>
                <th className="py-3 px-4 text-center">Investors</th>
                <th className="py-3 px-4 text-center">Co-incubators</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {startups.map((startup) => {
                const statusVal = currentStatus(startup.status);
                const isInviting = invitingId === startup.id;
                return (
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
                          <div className="text-[11px] text-slate-500">
                            {startup.sector || startup.industry || <span className="text-slate-400">Not provided</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      {onStatusChange ? (
                        <select
                          value={statusVal}
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
                          {statusVal}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border inline-block ${getStageBadgeColor(startup.stage)}`}>
                        {startup.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {startup.cohort || <span className="text-slate-400 font-normal">Not provided</span>}
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

                        {/* Invite Founder / Already Registered — ONE button */}
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
                            onClick={(e) => handleInviteFounder(e, startup)}
                            disabled={isInviting}
                            title="Invite Founder to set password"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[10px] font-medium border border-indigo-200 cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-wait"
                          >
                            <Mail className="w-3 h-3" />
                            {isInviting ? "Sending…" : "Invite"}
                          </button>
                        )}

                        {/* Assign Dashboard Button (hidden if already assigned) */}
                        {startup.admission_status !== 'dashboard_assigned' && (
                          <button
                            onClick={(e) => handleAssignDashboard(e, startup)}
                            title="Assign Dashboard Access"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[10px] font-medium border border-indigo-200 cursor-pointer transition-colors"
                          >
                            <LayoutDashboard className="w-3 h-3" />
                            Assign Dashboard
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
