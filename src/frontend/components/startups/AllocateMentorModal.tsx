"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { AllocatedMentor } from "./types";
import { apiClient } from "@/services/apiClient";

interface AllocateMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllocate: (mentor: Omit<AllocatedMentor, "id">) => Promise<void> | void;
  startupName: string;
}

interface LiveMentorOption {
  id: string;
  name: string;
  domain: string;
  type: "General" | "SME";
}

export const AllocateMentorModal: React.FC<AllocateMentorModalProps> = ({
  isOpen,
  onClose,
  onAllocate,
  startupName,
}) => {
  const [mentors, setMentors] = useState<LiveMentorOption[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [mentorType, setMentorType] = useState<"General" | "SME">("General");
  const [domain, setDomain] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    async function loadMentors() {
      try {
        setLoadingMentors(true);
        const res = await apiClient.get("/mentors", {
          params: { status: "active", is_available: "true" },
        });
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        const mapped: LiveMentorOption[] = list.map((m: any) => {
          const u = m.user || {};
          const name =
            u.full_name ||
            [u.first_name, u.last_name].filter(Boolean).join(" ").trim() ||
            u.email?.split("@")[0] ||
            "Mentor";
          const primaryDomain =
            m.primary_expertise ||
            (Array.isArray(m.expertise_areas) && m.expertise_areas[0]) ||
            "Advisory";
          const isSme =
            String(m.mentor_type || "").toLowerCase().includes("sme") ||
            String(m.mentor_type || "").toLowerCase().includes("subject");
          return {
            id: m.id,
            name,
            domain: primaryDomain,
            type: isSme ? "SME" : "General",
          };
        });
        if (active) {
          setMentors(mapped);
          if (mapped.length > 0) {
            setSelectedMentorId(mapped[0].id);
            setMentorType(mapped[0].type);
            setDomain(mapped[0].domain);
          } else {
            setSelectedMentorId("");
            setDomain("");
          }
        }
      } catch (err) {
        console.warn("Failed to load active mentors:", err);
        if (active) setMentors([]);
      } finally {
        if (active) setLoadingMentors(false);
      }
    }
    loadMentors();
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedMentor = mentors.find((item) => item.id === selectedMentorId);

  const handleSelectMentor = (id: string) => {
    setSelectedMentorId(id);
    const m = mentors.find((item) => item.id === id);
    if (m) {
      setMentorType(m.type);
      setDomain(m.domain);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;
    setSubmitting(true);
    try {
      await onAllocate({
        mentor_id: selectedMentor.id,
        name: selectedMentor.name,
        type: mentorType,
        domain: domain || selectedMentor.domain || "Advisory",
        status: "pending",
        allocatedDate: new Date().toISOString().split("T")[0],
        feedback: notes || undefined,
      });
      setNotes("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Allocate Mentor</h3>
            <p className="text-xs text-slate-500 mt-0.5">Assign an active available advisor to {startupName}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Mentor</label>
            {loadingMentors ? (
              <div className="py-2.5 px-3 border border-slate-200 rounded-lg text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading active mentors...</span>
              </div>
            ) : mentors.length === 0 ? (
              <div className="py-2.5 px-3 border border-amber-200 bg-amber-50/60 rounded-lg text-xs text-amber-800">
                No active mentors are currently accepting startups.
              </div>
            ) : (
              <select
                value={selectedMentorId}
                onChange={(e) => handleSelectMentor(e.target.value)}
                className="w-full text-sm rounded-lg border-slate-200 border px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.domain})
                  </option>
                ))}
              </select>
            )}
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
              disabled={submitting || !selectedMentor}
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
