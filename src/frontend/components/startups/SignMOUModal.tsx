"use client";

import React, { useState } from "react";
import { X, CheckCircle2, ShieldCheck, FileSignature, AlertCircle } from "lucide-react";
import { CoIncubatorItem } from "./types";

interface SignMOUModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (partnerId: string) => void;
  partner: CoIncubatorItem | null;
  startupName: string;
}

export const SignMOUModal: React.FC<SignMOUModalProps> = ({
  isOpen,
  onClose,
  onSign,
  partner,
  startupName,
}) => {
  const [signerName, setSignerName] = useState("Dr. R. K. Sharma (Incubator Director)");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signing, setSigning] = useState(false);

  if (!isOpen || !partner) return null;

  const handleConfirmSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;
    setSigning(true);
    setTimeout(() => {
      onSign(partner.id);
      setSigning(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <FileSignature className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Sign Co-Incubation MOU</h3>
              <p className="text-xs text-slate-500">Legal Agreement Execution</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirmSign} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Startup:</span>
              <span className="font-medium text-slate-800">{startupName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Partner Incubator:</span>
              <span className="font-medium text-slate-800">{partner.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">MOU Classification:</span>
              <span className="font-medium text-slate-800">{partner.mouType}</span>
            </div>
            {partner.equityShare && (
              <div className="flex justify-between">
                <span className="text-slate-500">Equity Terms:</span>
                <span className="font-semibold text-emerald-700">{partner.equityShare}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Term Duration:</span>
              <span className="font-medium text-slate-800">{partner.duration || "12 Months"}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Authorized Signatory Name & Title</label>
            <input
              type="text"
              required
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200/60 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              By executing this digital signature, both incubator parties agree to shared resource allocation, joint progress tracking, and governance protocols.
            </p>
          </div>

          <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
            />
            <span>I confirm authorization to sign on behalf of the Incubator and approve MOU terms.</span>
          </label>

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
              disabled={!agreeTerms || signing}
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              {signing ? "Signing..." : "Execute & Sign MOU"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
