'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Building2, Search, Check, Loader2, Share2, Layers } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface OrganizationOption {
  id: string;
  name: string;
  logo_url?: string | null;
  slug?: string;
  city?: string;
  state?: string;
}

interface AddCoIncubatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (created: any) => void;
  onSuccess?: () => void;
  startupName: string;
  startupId?: string;
  preselectedPartner?: {
    id?: string;
    co_incubator_id?: string;
    co_incubator?: { id: string; name: string };
    name?: string;
  } | null;
}

const SCOPE_OPTIONS = [
  { id: 'lab', label: 'Lab & equipment', desc: 'Hardware testing & lab facilities' },
  { id: 'mentors', label: 'Mentors', desc: 'Advisors, specialists & expert pool' },
  { id: 'funding', label: 'Funding', desc: 'Investor network & grants' },
  { id: 'profile', label: 'Profile', desc: 'Deck, pitch & team info' },
  { id: 'financials', label: 'Financials', desc: 'Revenue, burn & metrics' },
];

export const AddCoIncubatorModal: React.FC<AddCoIncubatorModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  onSuccess,
  startupName,
  startupId,
  preselectedPartner,
}) => {
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [orgSearch, setOrgSearch] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['lab', 'mentors', 'profile']);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch active partner organizations from /api/v1/incubators
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    async function fetchOrgs() {
      try {
        setLoadingOrgs(true);
        setErrorMessage(null);
        const res = await fetch('/api/v1/incubators');
        if (res.ok) {
          const json = await res.json();
          const list: OrganizationOption[] = json.data || [];
          const currentOrgId = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
          // Filter out current user's organization
          const available = list.filter((o) => o.id !== currentOrgId);
          if (mounted) {
            setOrganizations(available);

            // If preselected partner passed, choose it
            const targetPartnerId =
              preselectedPartner?.co_incubator_id ||
              preselectedPartner?.co_incubator?.id ||
              preselectedPartner?.id;
            if (targetPartnerId && available.some((o) => o.id === targetPartnerId)) {
              setSelectedOrgId(targetPartnerId);
            } else if (available.length > 0 && !selectedOrgId) {
              setSelectedOrgId(available[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load incubators:', err);
      } finally {
        if (mounted) setLoadingOrgs(false);
      }
    }

    fetchOrgs();
    return () => {
      mounted = false;
    };
  }, [isOpen, preselectedPartner]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setMessage('');
      if (preselectedPartner) {
        const targetPartnerId =
          preselectedPartner.co_incubator_id ||
          preselectedPartner.co_incubator?.id ||
          preselectedPartner.id;
        if (targetPartnerId) setSelectedOrgId(targetPartnerId);
      }
    }
  }, [isOpen, preselectedPartner]);

  // Filtered organizations
  const filteredOrgs = useMemo(() => {
    const q = orgSearch.trim().toLowerCase();
    if (!q) return organizations;
    return organizations.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.city && o.city.toLowerCase().includes(q)) ||
        (o.state && o.state.toLowerCase().includes(q))
    );
  }, [organizations, orgSearch]);

  const toggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    );
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId) {
      setErrorMessage('Please select a partner incubator.');
      return;
    }
    if (selectedScopes.length === 0) {
      setErrorMessage('Please select at least one shared scope category.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post('/co-incubations', {
        startup_id: startupId,
        co_incubator_id: selectedOrgId,
        shared_scope: selectedScopes,
        message: message.trim() || undefined,
      });

      if (onAdd) onAdd(res.data?.data);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'An unexpected error occurred. Please try again.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Add co-incubator</h3>
            <p className="text-xs text-slate-500 mt-0.5">Send a partnership invitation for {startupName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMessage}
            </div>
          )}

          {/* 1. Searchable Partner Incubator Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Partner incubator
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 mb-1.5"
              />
            </div>

            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
              {loadingOrgs ? (
                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  <span>Loading incubators...</span>
                </div>
              ) : filteredOrgs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching partner incubators found.
                </div>
              ) : (
                filteredOrgs.map((org) => {
                  const isSelected = selectedOrgId === org.id;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => setSelectedOrgId(org.id)}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white font-medium'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {org.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate">{org.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Choose What is Shared */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              What is shared
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SCOPE_OPTIONS.map((opt) => {
                const checked = selectedScopes.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleScope(opt.id)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      checked
                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{opt.label}</span>
                      {checked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <p
                      className={`text-[10px] mt-0.5 line-clamp-1 ${
                        checked ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Optional Message */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Message <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add details, objectives or special arrangements for the partner..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedOrgId}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer inline-flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Send request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
