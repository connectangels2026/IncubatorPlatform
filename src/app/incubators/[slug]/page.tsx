'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Globe,
  MapPin,
  Mail,
  ShieldCheck,
  Rocket,
  ArrowRight,
  ExternalLink,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/backend/lib/supabase';
import Logo from '@/frontend/components/ui/Logo';

interface OrgProfile {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  city?: string;
  state?: string;
  country?: string;
  email?: string;
  primary_color?: string;
  secondary_color?: string;
  subscription_tier?: string;
}

export default function PublicIncubatorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';

  const [org, setOrg] = useState<OrgProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadIncubator() {
      if (!slug) return;
      setLoading(true);
      try {
        const { data, error: fetchErr } = await supabase
          .from('organizations')
          .select('*')
          .eq('slug', slug.toLowerCase().trim())
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        if (!data) {
          setError('Incubator hub not found');
        } else {
          setOrg(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load incubator profile');
      } finally {
        setLoading(false);
      }
    }

    loadIncubator();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading Incubator Hub...</p>
        </div>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1A2151]">Incubator Not Found</h1>
        <p className="text-sm text-slate-500 max-w-md mt-2">
          The requested incubator hub <code className="font-mono text-blue-600">/incubators/{slug}</code> does not exist or may have been updated.
        </p>
        <Link
          href="/"
          className="mt-6 px-5 py-2.5 rounded-xl bg-[#1A2151] text-white text-xs font-bold shadow-md hover:bg-blue-900 transition"
        >
          Return to Arba360 Home
        </Link>
      </div>
    );
  }

  const primaryColor = org.primary_color || '#1A2151';
  const secondaryColor = org.secondary_color || '#0066ff';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Logo size="md" href="/" />
          <div className="flex items-center gap-3">
            <Link
              href="/programs/preincubator"
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition flex items-center gap-1.5"
            >
              <span>Apply for Incubation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 flex-1 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Accent top ribbon */}
          <div
            className="h-32 sm:h-44 w-full relative"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
          </div>

          {/* Profile Header Details */}
          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
              <div className="flex items-end gap-5">
                {org.logo_url ? (
                  <img
                    src={org.logo_url}
                    alt={org.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover bg-white p-2 border-4 border-white shadow-xl shadow-slate-200 shrink-0"
                  />
                ) : (
                  <div
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center text-white text-3xl font-black border-4 border-white shadow-xl shadow-slate-200 shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#1A2151] tracking-tight">
                      {org.name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      Verified Hub
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400">
                    arba360.io/incubators/{org.slug}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/programs/preincubator"
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Submit Startup Application</span>
                </Link>
              </div>
            </div>

            {/* Hub Summary Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    About & Mission
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {org.description || 'Dedicated startup incubator supporting early-stage founders with cohort-driven venture mentorship, seed funding access, and specialized industry labs.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500 pt-2">
                  {(org.city || org.state || org.country) && (
                    <div className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{[org.city, org.state, org.country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}

                  {org.website && (
                    <a
                      href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-medium text-blue-600 hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{org.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {org.email && (
                    <div className="flex items-center gap-1.5 font-medium">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{org.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Programs Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                  <span className="text-xs font-extrabold text-[#1A2151]">Incubation Tracks</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold flex items-center justify-between">
                    <span>Pre-Incubator Cohort 2026</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">Open</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold flex items-center justify-between">
                    <span>Accelerator Seed Track</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white/60">
        <p>© 2026 Arba360 Incubator Hubs. All rights reserved.</p>
      </footer>
    </div>
  );
}
