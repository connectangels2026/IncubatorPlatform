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
import StartupLogo from '@/frontend/components/ui/StartupLogo';

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
    window.dispatchEvent(new CustomEvent('edit-startup-section', { detail: 'basic' }));
    const target = document.getElementById('section-basic');
    if (target && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 transition-all"
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
      {/* Modal Dialog Shell max-w-5xl */}
      <div
        ref={modalContentRef}
        className="relative w-full max-w-5xl h-full max-h-[92vh] sm:max-h-[90vh] bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Sticky Header: Logo, Name, one-line description, Stage + Batch chips, Edit Details primary */}
        <div className="sticky top-0 z-20 px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <StartupLogo
              name={displayName}
              logoUrl={startup.logo_url}
              logoColor={startup.logo_color}
              initials={startup.initials}
              className="w-9 h-9 rounded-lg text-xs shrink-0 border border-slate-200/80"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="modal-headline" className="text-lg font-semibold text-slate-900 tracking-tight truncate">
                  {displayName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <Rocket className="w-3 h-3 text-blue-600" />
                  {startup.stage || 'MVP'}
                </span>
                {startup.batch && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {startup.batch}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                {startup.tagline || startup.description || 'Active accelerated portfolio startup'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Primary Edit Details Button */}
            <button
              type="button"
              onClick={handleEditClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
              title="Edit startup details"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close modal"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-6 scrollbar-thin"
        >
          {/* Top Quick-View Stat Tiles Only */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-normal block">Funding raised</span>
              <span className={`text-base font-semibold mt-0.5 block font-mono ${Number(startup.funding_raised || 0) > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                ${Number(startup.funding_raised || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-normal block">Monthly MRR</span>
              <span className="text-base font-semibold text-slate-900 mt-0.5 block font-mono">
                ${Number(startup.mrr || startup.monthly_revenue || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-normal block">Active customers</span>
              <span className={`text-base font-semibold mt-0.5 block font-mono ${Number(startup.customer_count || 0) > 0 ? 'text-blue-700' : 'text-slate-900'}`}>
                {Number(startup.customer_count || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-normal block">Team size</span>
              <span className="text-base font-semibold text-slate-900 mt-0.5 block">
                {startup.team_size || 1} Members
              </span>
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

