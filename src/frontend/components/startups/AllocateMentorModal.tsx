"use client";

import React, { useState } from "react";
import { X, UserCheck, Star } from "lucide-react";
import { AllocatedMentor } from "./types";

interface AllocateMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllocate: (mentor: Omit<AllocatedMentor, "id">) => void;
  startupName: string;
}

const AVAILABLE_MENTORS = [
  { name: "Dr. Marcus Vance", domain: "Clinical Health Systems & FDA", type: "SME" as const },
  { name: "Pooja Hegde", domain: "B2B SaaS Growth & GTM Strategy", type: "General" as const },
  { name: "Vikram Singhania", domain: "DeepTech AI & Computer Vision", type: "SME" as const },
  { name: "Sarah Jenkins", domain: "Fintech Regulatory & Compliance", type: "SME" as const },
  { name: "Rahul Verma", domain: "Early Stage Fundraising & Pitching", type: "General" as const },
];

export const AllocateMentorModal: React.FC<AllocateMentorModalProps> = ({
  isOpen,
  onClose,
  onAllocate,
  startupName,
}) => {
  const [selectedMentorName, setSelectedMentorName] = useState(AVAILABLE_MENTORS[0].name);
  const [mentorType, setMentorType] = useState<"General" | "SME">("General");
  const [domain, setDomain] = useState(AVAILABLE_MENTORS[0].domain);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectMentor = (name: string) => {
    setSelectedMentorName(name);
    const m = AVAILABLE_MENTORS.find((item) => item.name === name);
    if (m) {
      setMentorType(m.type);
      setDomain(m.domain);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      onAllocate({
        name: selectedMentorName,
        type: mentorType,
        domain: domain || "Advisory",
        allocatedDate: new Date().toISOString().split("T")[0],
        feedback: notes || undefined,
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
            <h3 className="font-semibold text-slate-800 text-base">Allocate Mentor</h3>
            <p className="text-xs text-slate-500 mt-0.5">Assign an advisor to {startupName}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Mentor</label>
            <select
              value={selectedMentorName}
              onChange={(e) => handleSelectMentor(e.target.value)}
              className="w-full text-sm rounded-lg border-slate-200 border px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {AVAILABLE_MENTORS.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({m.domain})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Mentor Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMentorType("General")}
                className={`text-xs px-3 py-2 rounded-lg border font-medium transition-all ${
                  mentorType === "General"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold ring-1 ring-indigo-500"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                General Mentor
              </button>
              <button
                type="button"
                onClick={() => setMentorType("SME")}
                className={`text-xs px-3 py-2 rounded-lg border font-medium transition-all ${
                  mentorType === "SME"
                    ? "border-purple-500 bg-purple-50 text-purple-700 font-semibold ring-1 ring-purple-500"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                SME (Subject Matter)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Expertise Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Allocation Goal / Initial Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Focus on sprint validation and Q3 enterprise pilots..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? "Allocating..." : "Confirm Allocation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
