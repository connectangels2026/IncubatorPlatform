import React from 'react';
import { Lightbulb, FileCheck, Download } from 'lucide-react';
import { StartupItem } from '../types';

interface BasicInfoProps {
  startup: StartupItem;
  onDownloadDeck?: () => void;
}

export function BasicInfo({ startup, onDownloadDeck }: BasicInfoProps) {
  const handleDownload = () => {
    if (onDownloadDeck) {
      onDownloadDeck();
    } else {
      alert(`Downloading pitch deck for ${startup.name}`);
    }
  };

  return (
    <div className="p-5 space-y-4 text-xs text-slate-600 border-t border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
          <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
            Problem Statement
          </span>
          <p>{startup.problem || 'Standard problem statement under incubation review.'}</p>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
          <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
            Proposed Solution
          </span>
          <p>{startup.solution || startup.pitch || 'Modular software architecture and algorithms.'}</p>
        </div>
      </div>
      <div>
        <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
          Target Market & TAM
        </span>
        <p>{startup.market || 'Global Enterprise Technology ($25B TAM).'}</p>
      </div>
      <div className="pt-2 flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-800">Pitch Deck (v3.2 Official)</span>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          Download PDF
        </button>
      </div>
    </div>
  );
}
