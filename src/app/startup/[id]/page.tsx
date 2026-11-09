'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/frontend/context/AuthContext';
import { apiClient } from '@/services/apiClient';
import {
  ArrowLeft,
  Building2,
  Rocket,
  Globe,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Users,
  Award,
  FileText,
  Loader2,
  ShieldAlert,
  Edit3,
  Eye,
} from 'lucide-react';
import { StartupProfileManager } from '@/frontend/components/startup-profile/StartupProfileManager';
import { FileViewerModal } from '@/frontend/components/common/FileViewerModal';

export default function StartupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const startupId = params?.id as string;

  const [startup, setStartup] = useState<any | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerFile, setViewerFile] = useState<{ url: string; title: string; type?: 'pdf' | 'video' | 'auto' } | null>(null);

  useEffect(() => {
    async function fetchStartupDetail() {
      if (authLoading) return;
      if (!user) {
        router.push(`/login?redirect=/startup/${startupId}`);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch startup data
        const endpoint = startupId === 'me' ? '/startups/me' : `/startups/${startupId}`;
        const res = await apiClient.get(endpoint);

        if (res.data?.startup || res.data?.data) {
          const st = res.data.startup || res.data.data;
          setStartup(st);
          if (res.data.organization) {
            setOrganization(res.data.organization);
          }
        } else {
          setError('Startup details not found or access restricted.');
        }
      } catch (err: any) {
        console.error('Error fetching startup details:', err);
        setError(err?.response?.data?.error || err.message || 'Failed to load startup profile');
      } finally {
        setIsLoading(false);
      }
    }

    if (startupId) {
      fetchStartupDetail();
    }
  }, [startupId, user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold text-slate-500">Loading startup profile...</p>
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Unable to View Startup</h2>
          <p className="text-xs text-slate-500">{error || 'Startup profile not found.'}</p>
          <div className="pt-2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner =
    Boolean(user?.id && startup.founder_id === user.id) ||
    Boolean(user?.email && startup.founder_email && startup.founder_email.toLowerCase() === user.email.toLowerCase()) ||
    Boolean(startupId === 'me') ||
    Boolean(user?.role === 'startup' || user?.role === 'founder' || user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'super-admin' || user?.role === 'incubator' || user?.role === 'incubator_admin');

  const displayName = startup.startup_name || startup.name || 'Startup';
  const monogram = displayName.slice(0, 2).toUpperCase();

  const handleEditClick = () => {
    window.dispatchEvent(new CustomEvent('edit-startup-section', { detail: 'basic' }));
    const target = document.getElementById('section-basic');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/startup/dashboard" className="hover:text-blue-600 transition font-medium">
              Startup Dashboard
            </Link>
            <span>/</span>
            <span className="font-bold text-slate-900 truncate max-w-[200px]">{displayName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isOwner && (
            <button
              onClick={handleEditClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              title="Edit startup details"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          )}
          <Link
            href="/startup/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Workspace
          </Link>
        </div>
      </header>

      {/* Main Full-Width Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {startup.logo_url ? (
              <img
                src={startup.logo_url}
                alt={displayName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center text-xl shadow-md shrink-0">
                {monogram}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{displayName}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Rocket className="w-3 h-3 text-blue-600" />
                  {startup.stage || 'MVP'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {startup.sector || 'Technology'}
                </span>
                {startup.batch && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {startup.batch}
                  </span>
                )}
                {startup.track && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    {startup.track === 'both' ? 'DeepTech' : startup.track}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl font-medium">
                {startup.tagline || startup.description || startup.solution_description || 'Accelerated portfolio startup.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
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
              <button
                type="button"
                onClick={() =>
                  setViewerFile({
                    url: startup.pitch_deck_url,
                    title: `${startup.startup_name || startup.name || 'Startup'} - Pitch Deck`,
                    type: 'pdf',
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pitch Deck</span>
              </button>
            )}
          </div>
        </div>

        {/* High-Level Traction Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 block">Funding Raised</span>
            <span className="text-lg font-black text-emerald-700 mt-0.5 block">
              ${Number(startup.funding_raised || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 block">Monthly Recurring (MRR)</span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">
              ${Number(startup.mrr || startup.monthly_revenue || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 block">Active Customers</span>
            <span className="text-lg font-black text-blue-700 mt-0.5 block">
              {Number(startup.customer_count || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
            <span className="text-xs text-slate-500 block">Team Size</span>
            <span className="text-lg font-black text-slate-800 mt-0.5 block">
              {startup.team_size || 1} Members
            </span>
          </div>
        </div>

        {/* Complete Section-Wise Startup Profile */}
        <StartupProfileManager
          initialStartup={startup}
          organization={organization}
          onStartupUpdate={setStartup}
          isReadOnly={!isOwner}
        />
      </main>

      {/* In-app Document & Video Viewer Modal */}
      <FileViewerModal
        isOpen={Boolean(viewerFile)}
        onClose={() => setViewerFile(null)}
        url={viewerFile?.url}
        title={viewerFile?.title}
        type={viewerFile?.type || 'auto'}
      />
    </div>
  );
}
