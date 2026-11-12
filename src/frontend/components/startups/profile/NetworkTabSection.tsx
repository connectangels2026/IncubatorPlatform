'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Handshake,
  Plus,
  Trash2,
  ChevronDown,
  Building2,
  Calendar,
  ExternalLink,
  Award,
  FileCheck,
} from 'lucide-react';
import { StartupItem, AllocatedMentor, AllocatedInvestor, CoIncubatorItem } from '../types';

interface NetworkTabSectionProps {
  startup: StartupItem;
  mentors: AllocatedMentor[];
  investors: AllocatedInvestor[];
  coIncubators: any[];
  isLoading?: boolean;
  onAllocateMentorClick?: (startup: StartupItem) => void;
  onRemoveMentor?: (startupId: string, mentorId: string) => void;
  onAllocateInvestorClick?: (startup: StartupItem) => void;
  onUpdateInvestorInterest?: (startupId: string, investorId: string, level: AllocatedInvestor['interestLevel']) => void;
  onRemoveInvestor?: (startupId: string, investorId: string) => void;
  onAddCoIncubatorClick?: (startup: StartupItem, prefillPartner?: any) => void;
  onSignMOUClick?: (startup: StartupItem, partner: any) => void;
  onRemoveCoIncubator?: (startupId: string, partnerId: string) => void;
  onEndCoIncubation?: (startupId: string, coincId: string) => void;
}

export function NetworkTabSection({
  startup,
  mentors = [],
  investors = [],
  coIncubators = [],
  isLoading = false,
  onAllocateMentorClick = () => {},
  onRemoveMentor = () => {},
  onAllocateInvestorClick = () => {},
  onUpdateInvestorInterest = () => {},
  onRemoveInvestor = () => {},
  onAddCoIncubatorClick = () => {},
  onSignMOUClick = () => {},
  onRemoveCoIncubator = () => {},
  onEndCoIncubation = () => {},
}: NetworkTabSectionProps) {
  const [filter, setFilter] = useState<'all' | 'mentors' | 'investors' | 'co-incubators'>('all');
  const [allocateDropdownOpen, setAllocateDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAllocateDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCount = mentors.length + investors.length + coIncubators.length;

  return (
    <div className="space-y-6">
      {/* Network Header & Segmented Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        {/* Segmented Filter */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('mentors')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === 'mentors'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Mentors ({mentors.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('investors')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === 'investors'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Investors ({investors.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('co-incubators')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === 'co-incubators'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Co-incubators ({coIncubators.length})
          </button>
        </div>

        {/* Unified "+ Allocate" Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setAllocateDropdownOpen(!allocateDropdownOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Allocate</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {allocateDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setAllocateDropdownOpen(false);
                  onAllocateMentorClick(startup);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Allocate mentor
              </button>
              <button
                type="button"
                onClick={() => {
                  setAllocateDropdownOpen(false);
                  onAllocateInvestorClick(startup);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                Allocate investor
              </button>
              <button
                type="button"
                onClick={() => {
                  setAllocateDropdownOpen(false);
                  onAddCoIncubatorClick(startup);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Handshake className="w-3.5 h-3.5 text-indigo-600" />
                Add co-incubator
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 1. Mentors Section */}
      {(filter === 'all' || filter === 'mentors') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Allocated mentors ({mentors.length})
            </h4>
            {mentors.length > 0 && filter === 'all' && (
              <button
                type="button"
                onClick={() => onAllocateMentorClick(startup)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Add mentor
              </button>
            )}
          </div>

          {mentors.length === 0 ? (
            <div className="py-4 px-4 bg-slate-50/60 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
              <span>No mentors allocated yet.</span>
              <button
                type="button"
                onClick={() => onAllocateMentorClick(startup)}
                className="text-indigo-600 font-medium hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Allocate mentor
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white">
              {mentors.map((mentor) => {
                const statusLower = (mentor.status || 'active').toLowerCase();
                const chipClass =
                  statusLower === 'pending'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : statusLower === 'declined'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : statusLower === 'ended'
                    ? 'bg-slate-100 text-slate-600 border border-slate-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                const statusLabel =
                  statusLower === 'pending'
                    ? 'Pending'
                    : statusLower === 'declined'
                    ? 'Declined'
                    : statusLower === 'ended'
                    ? 'Ended'
                    : 'Active';
                return (
                  <div key={mentor.id} className="p-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {mentor.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{mentor.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {mentor.domain} • <span className="text-slate-600">{mentor.type}</span>
                        </p>
                        {statusLower === 'declined' && mentor.decline_reason && (
                          <p className="text-[11px] text-rose-600 mt-1">
                            Declined reason: {mentor.decline_reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${chipClass}`}>
                        {statusLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveMentor(startup.id, mentor.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove mentor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Investors Section */}
      {(filter === 'all' || filter === 'investors') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              Connected investors ({investors.length})
            </h4>
            {investors.length > 0 && filter === 'all' && (
              <button
                type="button"
                onClick={() => onAllocateInvestorClick(startup)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Add investor
              </button>
            )}
          </div>

          {investors.length === 0 ? (
            <div className="py-4 px-4 bg-slate-50/60 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
              <span>No investors connected yet.</span>
              <button
                type="button"
                onClick={() => onAllocateInvestorClick(startup)}
                className="text-indigo-600 font-medium hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Allocate investor
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white">
              {investors.map((inv) => (
                <div key={inv.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs">
                      {inv.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{inv.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {inv.company} {inv.ticketSize ? `• ${inv.ticketSize}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={inv.interestLevel}
                      onChange={(e) => onUpdateInvestorInterest(startup.id, inv.id, e.target.value as any)}
                      className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Warm Lead">Warm Lead</option>
                      <option value="Active">Active</option>
                      <option value="Offer">Offer</option>
                      <option value="Invested">Invested</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => onRemoveInvestor(startup.id, inv.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove investor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Co-Incubations Section */}
      {(filter === 'all' || filter === 'co-incubators') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <Handshake className="w-3.5 h-3.5 text-slate-700" />
              Co-incubators ({coIncubators.length})
            </h4>
            {coIncubators.length > 0 && filter === 'all' && (
              <button
                type="button"
                onClick={() => onAddCoIncubatorClick(startup)}
                className="text-xs text-slate-900 hover:text-slate-700 font-medium cursor-pointer"
              >
                + Add co-incubator
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200" />
                    <div className="space-y-1.5">
                      <div className="w-32 h-3.5 bg-slate-200 rounded" />
                      <div className="w-20 h-2.5 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="w-16 h-5 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : coIncubators.length === 0 ? (
            <div className="py-6 px-4 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center space-y-2">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                <Building2 className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-800">No co-incubators connected</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Partner with another incubator to share facilities, mentor networks, and cohort resources.
              </p>
              <button
                type="button"
                onClick={() => onAddCoIncubatorClick(startup)}
                className="mt-1 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>Add co-incubator</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white">
              {coIncubators.map((co) => {
                const partnerName =
                  co.co_incubator?.name || co.name || co.partner_name || 'Partner Incubator';
                const partnerLogo = co.co_incubator?.logo_url;
                const status = (co.status || 'pending').toLowerCase();
                const isPending = status === 'pending';
                const isActive = status === 'active';
                const isDeclined = status === 'rejected' || status === 'declined';
                const isEnded = status === 'ended' || status === 'terminated' || status === 'completed';
                const rejectReason = co.reject_reason || co.rejectReason;
                const sharedScope: string[] = Array.isArray(co.shared_scope)
                  ? co.shared_scope
                  : Array.isArray(co.sharedScope)
                  ? co.sharedScope
                  : [];

                return (
                  <div
                    key={co.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden border border-slate-200/80">
                        {partnerLogo ? (
                          <img
                            src={partnerLogo}
                            alt={partnerName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-900 truncate">{partnerName}</p>
                          {co.mou_signed && (
                            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                              • MOU signed
                            </span>
                          )}
                        </div>

                        {/* Shared Scopes */}
                        {sharedScope.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {sharedScope.map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.2 rounded text-[10px] font-normal bg-slate-100 text-slate-600 capitalize"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Reject Reason on Declined */}
                        {isDeclined && rejectReason && (
                          <p className="text-[11px] text-rose-600 mt-1 font-normal italic">
                            Reason: &ldquo;{rejectReason}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Chip & Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Status Chip */}
                      {isPending && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                      {isActive && (
                        <>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                          {onEndCoIncubation && (
                            <button
                              type="button"
                              onClick={() => onEndCoIncubation(startup.id, co.id)}
                              className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                              title="End co-incubation"
                            >
                              End
                            </button>
                          )}
                        </>
                      )}
                      {isDeclined && (
                        <>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            Declined
                          </span>
                          <button
                            type="button"
                            onClick={() => onAddCoIncubatorClick(startup, co)}
                            className="px-2 py-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                          >
                            Request again
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveCoIncubator(startup.id, co.id)}
                            className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Remove from list"
                          >
                            Remove
                          </button>
                        </>
                      )}
                      {isEnded && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Ended
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

