"use client";

import React, { useState } from "react";
import { X, ExternalLink, Calendar, MapPin, Globe } from "lucide-react";
import { StartupItem, AllocatedMentor, AllocatedInvestor, CoIncubatorItem } from "./types";
import { BasicInfo } from "./profile/BasicInfo";
import { TeamInfo } from "./profile/TeamInfo";
import { FinancialInfo } from "./profile/FinancialInfo";
import { MentorAllocationSection } from "./profile/MentorAllocationSection";
import { InvestorAllocationSection } from "./profile/InvestorAllocationSection";
import { CoIncubationSection } from "./profile/CoIncubationSection";

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
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "mentors" | "investors" | "co-incubation">("overview");

  if (!isOpen || !startup) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xl shadow-md">
              {startup.monogram || startup.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900">{startup.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {startup.stage}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                  {startup.cohort || "Cohort 2026"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                {startup.tagline || startup.pitch || "Accelerated startup in the incubation cohort portfolio."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 px-6 border-b border-slate-200 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Overview & Profile
          </button>
          <button
            onClick={() => setActiveTab("mentors")}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "mentors"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Mentors
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-50 text-indigo-700">
              {startup.allocatedMentors?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("investors")}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "investors"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Investors
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-teal-50 text-teal-700">
              {startup.allocatedInvestors?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("co-incubation")}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "co-incubation"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Co-Incubation (MOU)
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-700">
              {startup.coIncubators?.length || 0}
            </span>
          </button>
        </div>

        {/* Drawer Body Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40">
          {activeTab === "overview" && (
            <>
              <BasicInfo startup={startup} />
              <TeamInfo startup={startup} />
              <FinancialInfo startup={startup} />
            </>
          )}

          {activeTab === "mentors" && (
            <MentorAllocationSection
              mentors={startup.allocatedMentors || []}
              onOpenAllocateModal={() => onAllocateMentorClick(startup)}
              onRemoveMentor={(mentorId) => onRemoveMentor(startup.id, mentorId)}
            />
          )}

          {activeTab === "investors" && (
            <InvestorAllocationSection
              investors={startup.allocatedInvestors || []}
              onOpenAllocateModal={() => onAllocateInvestorClick(startup)}
              onUpdateInterest={(investorId, level) => onUpdateInvestorInterest(startup.id, investorId, level)}
              onRemoveInvestor={(investorId) => onRemoveInvestor(startup.id, investorId)}
            />
          )}

          {activeTab === "co-incubation" && (
            <CoIncubationSection
              coIncubators={startup.coIncubators || []}
              onOpenAddModal={() => onAddCoIncubatorClick(startup)}
              onOpenSignMOUModal={(partner) => onSignMOUClick(startup, partner)}
              onRemoveCoIncubator={(partnerId) => onRemoveCoIncubator(startup.id, partnerId)}
            />
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs">
          <span className="text-slate-500">ID: {startup.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
