'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Building2,
  Rocket,
  Globe,
  ExternalLink,
  Edit3,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Award,
} from 'lucide-react';
import { StartupProfileManager } from '../startup-profile/StartupProfileManager';

interface StartupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  startup: any;
  organization?: any;
  onStartupUpdate?: (updated: any) => void;
}

export const StartupDetailModal: React.FC<StartupDetailModalProps> = ({
  isOpen,
  onClose,
  startup,
  organization,
  onStartupUpdate,
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Close on ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !startup) return null;

  const displayName = startup.startup_name || startup.name || 'Startup';
  const monogram = displayName.slice(0, 2).toUpperCase();

  const handleEditClick = () => {
    // Scroll down to the first editable section
    const target = document.getElementById('section-basic');
    if (target && scrollContainerRef.current) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Click the edit button of basic section if present
      const editBtn = target.querySelector('button') as HTMLButtonElement | null;
      if (editBtn) {
        editBtn.click();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-10 transition-all"
      onClick={(e) => {
        // Close if clicked on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      {/* Modal Dialog Shell with Consistent Spacing on All Four Borders */}
      <div
        ref={modalContentRef}
        className="relative w-full max-w-6xl h-full max-h-[92vh] sm:max-h-[90vh] bg-[#F8FAFC] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 px-6 sm:px-8 py-4 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            {startup.logo_url ? (
              <img
                src={startup.logo_url}
                alt={displayName}
                className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-200 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A2151] to-blue-600 text-white font-black flex items-center justify-center text-sm shadow-2xs shrink-0">
                {monogram}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="modal-headline" className="text-base sm:text-lg font-black text-slate-900 truncate">
                  {displayName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Rocket className="w-3 h-3 text-blue-600" />
                  {startup.stage || 'MVP'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
                  {startup.sector || 'Technology'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                Complete Startup Profile & Database Records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Clear Edit Option Button */}
            <button
              type="button"
              onClick={handleEditClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
              title="Edit startup details"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200"
              aria-label="Close modal"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body with Clean Padding */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 scrollbar-thin"
        >
          {/* Top Quick-View Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Executive Overview
                </span>
                <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
                  {startup.description || startup.solution_description || 'Active accelerated portfolio startup.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {startup.website && (
                  <a
                    href={startup.website.startsWith('http') ? startup.website : `https://${startup.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
                {startup.pitch_deck_url && (
                  <a
                    href={startup.pitch_deck_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Pitch Deck</span>
                  </a>
                )}
              </div>
            </div>

            {/* 4 Mini Traction Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Funding Raised</span>
                <span className="text-base font-black text-emerald-700 mt-0.5 block font-mono">
                  ${Number(startup.funding_raised || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly MRR</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block font-mono">
                  ${Number(startup.mrr || startup.monthly_revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customers</span>
                <span className="text-base font-black text-blue-700 mt-0.5 block font-mono">
                  {Number(startup.customer_count || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Size</span>
                <span className="text-base font-black text-slate-800 mt-0.5 block">
                  {startup.team_size || 1} Members
                </span>
              </div>
            </div>
          </div>

          {/* Full Section-Wise Startup Profile with Clear Edit Controls */}
          <StartupProfileManager
            initialStartup={startup}
            organization={organization}
            onStartupUpdate={onStartupUpdate}
            isReadOnly={false}
          />
        </div>
      </div>
    </div>
  );
};

