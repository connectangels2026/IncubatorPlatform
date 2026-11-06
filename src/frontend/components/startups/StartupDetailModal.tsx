'use client';

import React, { useState, useEffect } from "react";
import { X, Eye, Edit3, GraduationCap, Briefcase, Handshake, Loader2 } from "lucide-react";
import { StartupItem, AllocatedMentor, AllocatedInvestor, CoIncubatorItem } from "./types";
import { StartupProfilePreview } from "./profile/StartupProfilePreview";
import { StartupProfileEdit } from "./profile/StartupProfileEdit";
import { MentorAllocationSection } from "./profile/MentorAllocationSection";
import { InvestorAllocationSection } from "./profile/InvestorAllocationSection";
import { CoIncubationSection } from "./profile/CoIncubationSection";
import { apiClient } from "@/services/apiClient";

interface StartupDetailModalProps {
  startup: StartupItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAllocateMentorClick: (startup: StartupItem) => void;
  onRemoveMentor: (startupId: string, mentorId: string) => void;
  onAllocateInvestorClick: (startup: StartupItem) => void;
  onUpdateInvestorInterest: (startupId: string, investorId: string, level: AllocatedInvestor["interestLevel"]) => void;
  onRemoveInvestor: (startupId: string, investorId: string) => void;
  onAddCoIncubatorClick: (startup: StartupItem) => void;
  onSignMOUClick: (startup: StartupItem, partner: CoIncubatorItem) => void;
  onRemoveCoIncubator: (startupId: string, partnerId: string) => void;
  onUpdateStartup?: (updated: StartupItem) => void;
}

export const StartupDetailModal: React.FC<StartupDetailModalProps> = ({
  startup,
  isOpen,
  onClose,
  onAllocateMentorClick,
  onRemoveMentor,
  onAllocateInvestorClick,
  onUpdateInvestorInterest,
  onRemoveInvestor,
  onAddCoIncubatorClick,
  onSignMOUClick,
  onRemoveCoIncubator,
  onUpdateStartup,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "edit" | "mentors" | "investors" | "co-incubation">("preview");
  const [fullStartup, setFullStartup] = useState<StartupItem | null>(null);
  const [liveMentors, setLiveMentors] = useState<AllocatedMentor[]>([]);
  const [liveInvestors, setLiveInvestors] = useState<AllocatedInvestor[]>([]);
  const [liveCoIncubators, setLiveCoIncubators] = useState<CoIncubatorItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Synchronize initial & fetch live
  useEffect(() => {
    if (!isOpen || !startup) return;
    setFullStartup(startup);
    setActiveTab("preview");
    setLiveMentors(startup.allocatedMentors || []);
    setLiveInvestors(startup.allocatedInvestors || []);
    setLiveCoIncubators(startup.coIncubators || []);

    const fetchDetailAllocationsAndProfile = async () => {
      setIsLoadingDetails(true);
      try {
        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const orgIdFromUrl = searchParams?.get('org');
        const orgIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
        const orgId = orgIdFromUrl || orgIdFromStorage || startup.organization_id;
        const queryParams = orgId ? { org_id: orgId } : undefined;

        const [pRes, mRes, iRes, cRes] = await Promise.allSettled([
          apiClient.get(`/startups/${startup.id}`, { params: queryParams }),
          apiClient.get(`/startups/${startup.id}/mentors`, { params: queryParams }),
          apiClient.get(`/startups/${startup.id}/investors`, { params: queryParams }),
          apiClient.get(`/startups/${startup.id}/co-incubations`, { params: queryParams }),
        ]);

        if (pRes.status === "fulfilled" && pRes.value.data?.data) {
          const d = pRes.value.data.data;
          setFullStartup((prev) => ({
            ...(prev || startup),
            ...d,
            tagline: d.description || prev?.tagline || '',
            pitch: d.description || prev?.pitch || '',
            problem: d.problem_statement || prev?.problem || '',
            problem_statement: d.problem_statement || prev?.problem_statement || '',
            solution: d.solution_description || prev?.solution || '',
            solution_description: d.solution_description || prev?.solution_description || '',
            market: d.target_market || prev?.market || '',
            target_market: d.target_market || prev?.target_market || '',
            founder: d.founder_name || prev?.founder || '',
            founder_name: d.founder_name || prev?.founder_name || '',
            founderEmail: d.founder_email || d.email || prev?.founderEmail || '',
            founder_email: d.founder_email || d.email || prev?.founder_email || '',
            founderPhone: d.founder_phone || prev?.founderPhone || '',
            founder_phone: d.founder_phone || prev?.founder_phone || '',
            customers: d.customer_count ?? prev?.customers ?? 0,
            customer_count: d.customer_count ?? prev?.customer_count ?? 0,
            mrr: d.mrr || d.monthly_revenue || prev?.mrr || 0,
            arr: d.annual_revenue || (d.mrr ? d.mrr * 12 : 0) || prev?.arr || 0,
            funding: d.funding_raised ? `$${Number(d.funding_raised).toLocaleString()}` : (prev?.funding || '$0'),
            funding_raised: d.funding_raised || prev?.funding_raised || 0,
            teamMembers: Array.isArray(d.team_members) && d.team_members.length > 0 ? d.team_members : (prev?.teamMembers || prev?.team || []),
          }));
        }

        if (mRes.status === "fulfilled" && Array.isArray(mRes.value.data?.data)) {
          setLiveMentors(mRes.value.data.data);
        }
        if (iRes.status === "fulfilled" && Array.isArray(iRes.value.data?.data)) {
          setLiveInvestors(iRes.value.data.data);
        }
        if (cRes.status === "fulfilled" && Array.isArray(cRes.value.data?.data)) {
          setLiveCoIncubators(cRes.value.data.data);
        }
      } catch (e) {
        // preserve fallback items gracefully
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetailAllocationsAndProfile();
  }, [isOpen, startup?.id]);

  // Keep live items aligned with prop mutations
  useEffect(() => {
    if (startup) {
      if (startup.allocatedMentors) setLiveMentors(startup.allocatedMentors);
      if (startup.allocatedInvestors) setLiveInvestors(startup.allocatedInvestors);
      if (startup.coIncubators) setLiveCoIncubators(startup.coIncubators);
    }
  }, [startup?.allocatedMentors, startup?.allocatedInvestors, startup?.coIncubators]);

  const handleSaveStartup = async (updatedFields: Partial<StartupItem>) => {
    if (!startup) return;
    setIsSaving(true);
    try {
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const orgIdFromUrl = searchParams?.get('org');
      const orgIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
      const orgId = orgIdFromUrl || orgIdFromStorage || startup.organization_id;

      const res = await apiClient.put(`/startups/${startup.id}`, updatedFields, {
        params: orgId ? { org_id: orgId } : undefined,
      });

      const savedData = res.data?.data || updatedFields;
      const merged: StartupItem = {
        ...startup,
        ...(fullStartup || {}),
        ...updatedFields,
        ...savedData,
      };

      setFullStartup(merged);
      onUpdateStartup?.(merged);
      setActiveTab("preview");
    } catch (err: any) {
      console.error("Failed to save startup changes:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !startup) return null;

  const activeStartup = fullStartup || startup;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-base shadow-sm">
              {activeStartup.monogram || activeStartup.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">{activeStartup.name}</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {activeStartup.stage}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                  {activeStartup.cohort || "Cohort 2026"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-md sm:max-w-xl">
                {activeStartup.tagline || activeStartup.pitch || "Cohort portfolio member"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoadingDetails && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mr-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                Syncing DB...
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 sm:gap-6 px-6 border-b border-slate-200 bg-white text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("preview")}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === "preview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>

          <button
            onClick={() => setActiveTab("edit")}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === "edit"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>

          <button
            onClick={() => setActiveTab("mentors")}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === "mentors"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Mentors
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-50 text-indigo-700">
              {liveMentors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("investors")}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === "investors"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Investors
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-teal-50 text-teal-700">
              {liveInvestors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("co-incubation")}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === "co-incubation"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Handshake className="w-4 h-4" />
            Co-Incubations
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-700">
              {liveCoIncubators.length}
            </span>
          </button>
        </div>

        {/* Drawer Body Scroll */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40">
          {activeTab === "preview" && (
            <StartupProfilePreview
              startup={activeStartup}
              liveMentors={liveMentors}
              liveInvestors={liveInvestors}
              liveCoIncubators={liveCoIncubators}
            />
          )}

          {activeTab === "edit" && (
            <StartupProfileEdit
              startup={activeStartup}
              onSave={handleSaveStartup}
              onCancel={() => setActiveTab("preview")}
              isSaving={isSaving}
            />
          )}

          {activeTab === "mentors" && (
            <div className="space-y-4">
              <MentorAllocationSection
                mentors={liveMentors}
                onOpenAllocateModal={() => onAllocateMentorClick(activeStartup)}
                onRemoveMentor={(mentorId) => onRemoveMentor(activeStartup.id, mentorId)}
              />
            </div>
          )}

          {activeTab === "investors" && (
            <div className="space-y-4">
              <InvestorAllocationSection
                investors={liveInvestors}
                onOpenAllocateModal={() => onAllocateInvestorClick(activeStartup)}
                onUpdateInterest={(investorId, level) => onUpdateInvestorInterest(activeStartup.id, investorId, level)}
                onRemoveInvestor={(investorId) => onRemoveInvestor(activeStartup.id, investorId)}
              />
            </div>
          )}

          {activeTab === "co-incubation" && (
            <div className="space-y-4">
              <CoIncubationSection
                coIncubators={liveCoIncubators}
                onOpenAddModal={() => onAddCoIncubatorClick(activeStartup)}
                onOpenSignMOUModal={(partner) => onSignMOUClick(activeStartup, partner)}
                onRemoveCoIncubator={(partnerId) => onRemoveCoIncubator(activeStartup.id, partnerId)}
              />
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {activeTab !== "edit" && (
          <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">ID: {activeStartup.id}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("edit")}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
