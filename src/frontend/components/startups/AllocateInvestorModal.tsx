"use client";

import React, { useState } from "react";
import { X, DollarSign, TrendingUp, Briefcase } from "lucide-react";
import { AllocatedInvestor } from "./types";

interface AllocateInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllocate: (investor: Omit<AllocatedInvestor, "id">) => void;
  startupName: string;
}

const AVAILABLE_INVESTORS = [
  { name: "Sequoia Surge", company: "Sequoia Capital", focus: ["Fintech", "SaaS", "AI"] },
  { name: "Nexus Venture Partners", company: "Nexus VP", focus: ["B2B SaaS", "Enterprise", "DeepTech"] },
  { name: "Blume Ventures", company: "Blume", focus: ["Consumer Tech", "EdTech", "CleanTech"] },
  { name: "Kalaari Capital", company: "Kalaari", focus: ["Web3", "HealthTech", "Logistics"] },
  { name: "Elevation Capital", company: "Elevation", focus: ["Fintech", "Consumer", "D2C"] },
];

export const AllocateInvestorModal: React.FC<AllocateInvestorModalProps> = ({
  isOpen,
  onClose,
  onAllocate,
  startupName,
}) => {
  const [selectedInvestor, setSelectedInvestor] = useState(AVAILABLE_INVESTORS[0].name);
  const [interestLevel, setInterestLevel] = useState<AllocatedInvestor["interestLevel"]>("Warm Lead");
  const [ticketSize, setTicketSize] = useState("$250K - $500K");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const investor = AVAILABLE_INVESTORS.find((i) => i.name === selectedInvestor) || AVAILABLE_INVESTORS[0];
    setTimeout(() => {
      onAllocate({
        name: investor.name,
        company: investor.company,
        focusAreas: investor.focus,
        interestLevel,
        allocationDate: new Date().toISOString().split("T")[0],
        ticketSize,
        notes: notes || undefined,
      });
      setSubmitting(false);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Allocate Investor</h3>
            <p className="text-xs text-slate-500 mt-0.5">Assign potential investor to {startupName}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Investor Firm / Partner</label>
            <select
              value={selectedInvestor}
              onChange={(e) => setSelectedInvestor(e.target.value)}
              className="w-full text-sm rounded-lg border-slate-200 border px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {AVAILABLE_INVESTORS.map((inv) => (
                <option key={inv.name} value={inv.name}>
                  {inv.name} ({inv.company}) - {inv.focus.join(", ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Initial Interest Level</label>
            <div className="grid grid-cols-2 gap-2">
              {(["Warm Lead", "Active", "Offer", "Invested"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setInterestLevel(lvl)}
                  className={`text-xs px-3 py-2 rounded-lg border font-medium text-left transition-all cursor-pointer ${
                    interestLevel === lvl
                      ? "border-teal-500 bg-teal-50 text-teal-700 font-semibold ring-1 ring-teal-500"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Target Ticket Size</label>
            <div className="relative">
              <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={ticketSize}
                onChange={(e) => setTicketSize(e.target.value)}
                placeholder="$250K - $500K"
                className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Investment Thesis / Allocation Note</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Fits their fintech seed fund criteria, partner intro requested..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Allocating..." : "Confirm Allocation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
