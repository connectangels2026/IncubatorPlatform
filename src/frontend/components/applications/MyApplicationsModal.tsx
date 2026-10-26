'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export interface ApplicationItem {
  id: string;
  organization_id?: string;
  status: string;
  created_at: string;
  super_admin_notes?: string;
  organization?: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    logo_url?: string;
  };
  form_data?: any;
}

interface MyApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantEmail?: string;
  fallbackApplications?: ApplicationItem[];
}

export default function MyApplicationsModal({
  isOpen,
  onClose,
  applicantEmail,
  fallbackApplications = [],
}: MyApplicationsModalProps) {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationItem[]>(fallbackApplications);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadApplications = async () => {
    const email =
      applicantEmail ||
      (typeof window !== 'undefined' ? localStorage.getItem('last_applicant_email') : '') ||
      '';

    if (!email) {
      if (fallbackApplications.length > 0) {
        setApplications(fallbackApplications);
      }
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/applications/status?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json?.applications && Array.isArray(json.applications)) {
        setApplications(json.applications);
        setLastUpdated(new Date());
      } else if (json?.data) {
        setApplications([json.data]);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.warn('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen, applicantEmail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#1A2151] to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <span>My Applications</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-400 text-slate-950">
                  {applications.length} {applications.length === 1 ? 'Incubator' : 'Incubators'}
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                Independent status tracking across all applied incubators
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadApplications}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading && applications.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Loading your applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No applications found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven&apos;t submitted applications to any incubators yet, or your application is being processed.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {applications.map((app) => {
                const org = app.organization;
                const orgName = org?.name || (app as any).incubator_name_text || app.form_data?.targetIncubator?.name || app.form_data?.incubatorName || 'Incubator Workspace';
                const orgDesc = org?.description || app.form_data?.targetIncubator?.description || 'Early-stage startup pre-incubation program & mentorship.';
                const logoUrl = org?.logo_url || app.form_data?.targetIncubator?.logo_url;
                const rawStatus = (app.status || 'submitted').toLowerCase();
                const isAccepted = rawStatus === 'accepted' || rawStatus === 'admitted';
                const isRejected = rawStatus === 'rejected';
                const isPending = !isAccepted && !isRejected;

                const orgId = app.organization_id || org?.id || app.form_data?.targetIncubator?.id;

                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    {/* Left: Incubator Details */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={orgName}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-white shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1A2151] to-blue-600 flex items-center justify-center text-white font-black text-base shrink-0 shadow-2xs">
                          {orgName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-sm text-[#1A2151] truncate">
                            {orgName}
                          </h3>
                          {/* Status Badge */}
                          {isAccepted && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Accepted
                            </span>
                          )}
                          {isPending && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              Declined
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {orgDesc}
                        </p>

                        <div className="mt-2 text-[10px] text-slate-400 font-mono">
                          ID: #{app.id.slice(0, 8)} • Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <div className="shrink-0 flex sm:flex-col items-center justify-end">
                      {isAccepted ? (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (orgId) {
                              if (typeof window !== 'undefined') localStorage.setItem('org_id', orgId);
                              router.push(`/dashboard?org=${orgId}`);
                            } else {
                              router.push('/dashboard');
                            }
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>View Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : isPending ? (
                        <button
                          type="button"
                          disabled
                          className="w-full sm:w-auto px-4 py-2 bg-slate-200/80 border border-slate-300/80 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5 opacity-75"
                          title="Under admissions review by this incubator"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Pending</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full sm:w-auto px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl cursor-not-allowed opacity-75"
                        >
                          <span>Declined</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Applications verified via secure admissions protocol</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
