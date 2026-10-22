'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Globe,
  MapPin,
  Zap,
  Rocket,
  Crown,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';
import Logo from '@/frontend/components/ui/Logo';
import { apiClient } from '@/services/apiClient';

const TIER_META: Record<string, { name: string; startups: string; mentors: string; price: string; icon: any; color: string }> = {
  free: {
    name: 'Community Free',
    startups: 'Up to 20 Startups',
    mentors: 'Up to 10 Mentors',
    price: '₹0 / mo',
    icon: Rocket,
    color: 'text-slate-600 bg-slate-100 border-slate-200',
  },
  pro: {
    name: 'Incubator Pro',
    startups: 'Up to 100 Startups',
    mentors: 'Up to 25 Mentors',
    price: '₹7,999 / mo (billed annually)',
    icon: Zap,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  enterprise: {
    name: 'Enterprise Cluster',
    startups: 'Unlimited Startups',
    mentors: 'Unlimited Mentors',
    price: 'Custom / ₹23,999 / mo',
    icon: Crown,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
};

function SignupIncubatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTier = searchParams.get('tier') || 'free';
  const tier = ['free', 'pro', 'enterprise'].includes(rawTier) ? rawTier : 'free';
  const billingCycle = searchParams.get('billing') || 'annual';

  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    organizationName: '',
    website: '',
    location: '',
    description: '',
    founderName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const planInfo = TIER_META[tier] || TIER_META.free;
  const PlanIcon = planInfo.icon;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.organizationName.trim()) {
        throw new Error('Organization name is required');
      }

      const res = await apiClient.post('/incubators', {
        name: formData.organizationName.trim(),
        website: formData.website?.trim() || null,
        city: formData.location?.trim() || null,
        description: formData.description?.trim() || null,
        founderName: formData.founderName?.trim() || user?.email?.split('@')[0],
        tier: tier,
      });

      if (!res.data?.success && res.data?.error) {
        throw new Error(res.data.error);
      }

      const newOrg = res.data?.data;
      if (newOrg?.id && typeof window !== 'undefined') {
        localStorage.setItem('org_id', newOrg.id);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(newOrg?.id ? `/dashboard?org=${newOrg.id}` : '/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden">
      {/* Background radial gradient effects matching incubator-plans */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="pointer-events-none absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-400/25 rounded-full blur-3xl opacity-70" />
        <div className="pointer-events-none absolute bottom-1/3 right-0 translate-x-1/3 w-[650px] h-[650px] bg-blue-500/20 rounded-full blur-3xl opacity-60" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <Link href="/" className="inline-flex">
          <Logo size="lg" href="/" />
        </Link>
        <Link
          href="/auth/incubator-plans"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1A2151] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Plan</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto my-auto pt-6 pb-12">
        {/* Success State */}
        {success ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center shadow-2xl shadow-blue-500/10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#1A2151] mb-3">Organization Created!</h1>
            <p className="text-slate-600 mb-6 text-sm sm:text-base leading-relaxed">
              Your incubator hub has been deployed on the <span className="font-bold text-[#1A2151]">{planInfo.name}</span>. Redirecting you to your administrative console...
            </p>
            <div className="inline-flex items-center justify-center gap-2.5 text-blue-600 bg-blue-50 px-5 py-2.5 rounded-full border border-blue-200/60 text-sm font-semibold">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Initializing your dashboard...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Step 2: Incubator Setup</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A2151] tracking-tight mb-2">
                Launch Your Incubator
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
                Configure your incubator workspace to begin onboarding cohorts, startups, and mentors.
              </p>
            </div>

            {/* Selected Plan Summary Banner */}
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-xl border ${planInfo.color}`}>
                  <PlanIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selected Plan</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                      {billingCycle}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1A2151]">{planInfo.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {planInfo.startups} • {planInfo.mentors}
                  </p>
                </div>
              </div>
              <Link
                href="/auth/incubator-plans"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline shrink-0"
              >
                Change
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl shadow-slate-200/50 space-y-5">
              {/* Organization Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Incubator / Organization Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    placeholder="e.g. Nexus AI Foundry"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Founder Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Director / Founder Name
                </label>
                <input
                  type="text"
                  name="founderName"
                  value={formData.founderName}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              {/* Website and Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Official Website
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://nexusfoundry.io"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    City / Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Bengaluru, India"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Incubator Mission / Focus Areas
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your cohorts, sectors (e.g. DeepTech, FinTech, CleanEnergy), and value proposition..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => router.push('/auth/incubator-plans')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#00d4ff] hover:opacity-95 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Incubator Setup</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center pt-2">
                All tier settings, branding colors, and mentor quotas can be managed later in Incubator Settings.
              </p>
            </form>
          </>
        )}
      </div>

      <div className="relative z-10 text-center text-xs text-slate-400 pb-2">
        &copy; {new Date().getFullYear()} Arba360 Incubator Management Platform. All rights reserved.
      </div>
    </div>
  );
}

export default function SignupIncubatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      }
    >
      <SignupIncubatorContent />
    </Suspense>
  );
}

