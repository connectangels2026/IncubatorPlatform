'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Globe,
  MapPin,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';
import Logo from '@/frontend/components/ui/Logo';

export default function SignupIncubatorPage() {
  const router = useRouter();
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
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.organizationName.trim()) {
        throw new Error('Organization name is required');
      }

      // TODO: Send to backend to create organization
      // For now, just show success and redirect
      setSuccess(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
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
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -left-24 w-[420px] h-[420px] rounded-full bg-cyan-400/35 blur-[120px]" />
        <div className="absolute top-10 -right-24 w-[440px] h-[440px] rounded-full bg-blue-500/25 blur-[130px]" />
        <div className="absolute -bottom-24 -left-20 w-[420px] h-[420px] rounded-full bg-blue-400/30 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-[460px] h-[460px] rounded-full bg-cyan-300/35 blur-[130px]" />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex">
          <Logo size="lg" href="/" />
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto my-auto">
        {/* Success State */}
        {success ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Organization Created!</h1>
            <p className="text-slate-600 mb-8">
              Your incubator organization has been set up successfully. Redirecting to your dashboard...
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="font-semibold">Setting up your dashboard...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Set Up Your Incubator</h1>
              <p className="text-lg text-slate-600">
                Tell us about your accelerator program so we can get you set up in Arba360
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="e.g., Nexus AI Foundry"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              {/* Founder Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="founderName"
                  value={formData.founderName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  About Your Incubator
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your incubator, focus areas, and what you're looking for..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#0066ff] to-[#00d4ff] hover:from-blue-700 hover:to-cyan-500 text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-75"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Organization
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Info Text */}
              <p className="text-xs text-slate-500 text-center pt-4">
                You can update these details later in your organization settings
              </p>
            </form>
          </>
        )}
      </div>

      <div />
    </div>
  );
}
