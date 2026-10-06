"use client";

import React, { useState } from "react";
import { X, Building2, UploadCloud, FileText } from "lucide-react";
import { CoIncubatorItem } from "./types";

interface AddCoIncubatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (partner: Omit<CoIncubatorItem, "id">) => void;
  startupName: string;
}

const PARTNER_INCUBATORS = [
  "T-Hub Hyderabad",
  "NSRCEL IIM Bangalore",
  "C-CAMP Life Sciences",
  "IIT Madras Research Park",
  "Kerala Startup Mission (KSUM)",
  "SINE IIT Bombay",
];

export const AddCoIncubatorModal: React.FC<AddCoIncubatorModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  startupName,
}) => {
  const [partnerName, setPartnerName] = useState(PARTNER_INCUBATORS[0]);
  const [mouType, setMouType] = useState<CoIncubatorItem["type"]>("Full");
  const [duration, setDuration] = useState("12 Months");
  const [equityShare, setEquityShare] = useState("1.5%");
  const [responsibilities, setResponsibilities] = useState("Lab access, prototyping support & regulatory clearances");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      onAdd({
        name: partnerName,
        type: mouType,
        mouStatus: "Pending",
        status: "Active",
        durationMonths: 12,
        duration,
        equitySplit: equityShare,
        responsibilities,
        startDate: new Date().toISOString().split("T")[0],
        documentName: fileName || "MOU_Draft_v1.pdf",
      });
      setSubmitting(false);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Add Co-Incubation Partner</h3>
            <p className="text-xs text-slate-500 mt-0.5">Establish cross-incubator alliance for {startupName}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Partner Incubator / Accelerator</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PARTNER_INCUBATORS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Partnership Model</label>
              <select
                value={mouType}
                onChange={(e) => setMouType(e.target.value as CoIncubatorItem["type"])}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Full">Full Incubation</option>
                <option value="Partial">Partial Support</option>
                <option value="Knowledge Sharing">Knowledge Sharing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="12 Months"
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Equity / Success Fee Allocation</label>
            <input
              type="text"
              value={equityShare}
              onChange={(e) => setEquityShare(e.target.value)}
              placeholder="e.g. 1.5% equity or 2% advisory warrant"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Scope of Responsibilities</label>
            <textarea
              rows={2}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Attach Draft MOU Document</label>
            <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileName(e.target.files[0].name);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                {fileName ? (
                  <>
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-indigo-600">{fileName}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                    <span>Upload MOU PDF or DOCX (optional)</span>
                  </>
                )}
              </div>
            </div>
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
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Adding..." : "Add Co-Incubator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
