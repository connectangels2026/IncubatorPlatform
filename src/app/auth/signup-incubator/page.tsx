'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, Globe, Mail, MapPin, Sparkles, Check, ArrowRight, ArrowLeft, 
  Palette, ShieldCheck, Zap, Rocket, Crown, AlertCircle, 
  RefreshCw, Layers, Users, ExternalLink, CheckCircle2,
  Upload, Eye, Info
} from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';
import Logo from '@/frontend/components/ui/Logo';
import { apiClient } from '@/services/apiClient';

interface PlanTier {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  badge: string;
  startups: string;
  mentors: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
}

const PLAN_TIERS: Record<string, PlanTier> = {
  free: {
    id: 'free',
    name: 'Incubator Starter',
    badge: 'Starter Tier',
    startups: '20 Startups',
    mentors: '10 Mentors',
    monthlyPrice: 3999,
    annualPrice: 2999,
    features: ['Basic Cohort Tracker', 'Directory Listing', 'Standard Email Support'],
  },
  pro: {
    id: 'pro',
    name: 'Incubator Pro',
    badge: '★ Most Popular',
    startups: '100 Startups',
    mentors: '25 Mentors',
    monthlyPrice: 9999,
    annualPrice: 7999,
    features: ['Mentorship CRM', 'Milestone Automation', 'Custom Domain', '24/7 Priority Support'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Cluster',
    badge: 'Cluster Power',
    startups: 'Unlimited Startups',
    mentors: 'Unlimited Mentors',
    monthlyPrice: 29999,
    annualPrice: 23999,
    features: ['Multi-Branch Clusters', 'Dedicated Account Manager', 'Custom API & Webhooks', 'SSO & SLA'],
  },
};

const BRAND_PRESETS = [
  { primary: '#1A2151', secondary: '#0066ff', name: 'Arba Navy' },
  { primary: '#0f172a', secondary: '#10b981', name: 'Emerald Slate' },
  { primary: '#311b92', secondary: '#7c4dff', name: 'Deep Purple' },
  { primary: '#881337', secondary: '#f43f5e', name: 'Crimson Glow' },
  { primary: '#111827', secondary: '#f59e0b', name: 'Amber Dark' },
];

const LOGO_PRESETS = [
  { label: 'Modern Abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80' },
  { label: 'Tech Lab', url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=150&auto=format&fit=crop&q=80' },
  { label: 'Venture Hub', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80' },
];

function SignupIncubatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTier = searchParams.get('tier') || 'free';
  const initialTier = ['free', 'pro', 'enterprise'].includes(rawTier) ? (rawTier as 'free' | 'pro' | 'enterprise') : 'free';
  const initialBilling = searchParams.get('billing') === 'monthly' ? 'monthly' : 'annual';

  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrg, setCreatedOrg] = useState<{ id: string; slug: string } | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'enterprise'>(initialTier);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(initialBilling);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    primary_color: '#1A2151',
    secondary_color: '#0066ff',
    founder_name: '',
    founder_email: '',
    billing_email: '',
    sameAsFounderEmail: true,
    phone_country: '+91',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        founder_email: prev.founder_email || user.email || '',
        billing_email: prev.sameAsFounderEmail ? (user.email || '') : prev.billing_email,
        founder_name: prev.founder_name || user.email?.split('@')[0] || '',
      }));
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name]);

  useEffect(() => {
    if (formData.sameAsFounderEmail) {
      setFormData(prev => ({ ...prev, billing_email: prev.founder_email }));
    }
  }, [formData.founder_email, formData.sameAsFounderEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value } = target;
    const isCheckbox = target instanceof HTMLInputElement && target.type === 'checkbox';
    const checked = isCheckbox ? (target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Organization name is required';
      if (!formData.description.trim()) newErrors.description = 'Please provide a short description or mission';
    } else if (step === 2) {
      if (!formData.founder_name.trim()) newErrors.founder_name = 'Director or Founder name is required';
      if (!formData.founder_email.trim()) {
        newErrors.founder_email = 'Founder email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.founder_email)) {
        newErrors.founder_email = 'Invalid email address format';
      }
      if (!formData.billing_email.trim()) {
        newErrors.billing_email = 'Billing email is required';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Contact phone number is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
    } else if (step === 3) {
      if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must accept the terms of service to proceed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/incubators', {
        name: formData.name.trim(),
        slug: formData.slug?.trim() || null,
        description: formData.description?.trim() || null,
        logo_url: formData.logo_url?.trim() || null,
        primary_color: formData.primary_color || '#1A2151',
        secondary_color: formData.secondary_color || '#0066ff',
        founder_name: formData.founder_name?.trim() || user?.email?.split('@')[0],
        founder_email: formData.founder_email?.trim() || user?.email,
        billing_email: formData.billing_email?.trim() || user?.email,
        phone: formData.phone?.trim() ? `${formData.phone_country} ${formData.phone.trim()}` : null,
        website: formData.website?.trim() || null,
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
        country: formData.country?.trim() || 'India',
        postal_code: formData.postal_code?.trim() || null,
        tier: selectedPlan,
        billing_cycle: billingCycle,
      });

      if (!res.data?.success && res.data?.error) {
        throw new Error(res.data.error);
      }

      const org = res.data?.data;
      if (org?.id && typeof window !== 'undefined') {
        localStorage.setItem('org_id', org.id);
      }

      setCreatedOrg({ id: org?.id, slug: org?.slug || formData.slug });
      setIsSuccess(true);
    } catch (err: any) {
      setErrors({ form: err?.response?.data?.error || err.message || 'Failed to register incubator' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePlanInfo = PLAN_TIERS[selectedPlan] || PLAN_TIERS.free;

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans relative overflow-x-hidden">
      {/* Background radial gradient glow spots */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Header */}
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="md" href="/" />
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Incubator Onboarding
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs sm:text-sm font-semibold text-slate-600">
            <Link
              href="/auth/incubator-plans"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:text-[#1A2151] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Change Plan
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A2151] tracking-tight">
            Register Your Incubator Portal
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-3xl">
            Empower early-stage startups, manage mentors, and streamline application cohorts under your own branded ecosystem.
          </p>
        </div>

        {/* Wizard Progress Bar */}
        <div className="mb-10 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-md shadow-slate-200/40">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div 
              onClick={() => currentStep > 1 && setCurrentStep(1)}
              className={`flex items-center space-x-3 p-2 sm:p-3 rounded-xl transition-all ${
                currentStep >= 1 ? 'cursor-pointer' : ''
              } ${currentStep === 1 ? 'bg-blue-50/80 border border-blue-200' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                currentStep > 1 ? 'bg-emerald-500 text-white' : currentStep === 1 ? 'bg-[#0066ff] text-white shadow-md shadow-blue-500/30' : 'bg-slate-100 text-slate-400'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className="hidden md:block">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Step 01</p>
                <p className={`text-xs font-bold ${currentStep === 1 ? 'text-[#1A2151]' : 'text-slate-600'}`}>
                  Profile & Identity
                </p>
              </div>
            </div>

            <div 
              onClick={() => currentStep > 2 && setCurrentStep(2)}
              className={`flex items-center space-x-3 p-2 sm:p-3 rounded-xl transition-all ${
                currentStep >= 2 ? 'cursor-pointer' : ''
              } ${currentStep === 2 ? 'bg-blue-50/80 border border-blue-200' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                currentStep > 2 ? 'bg-emerald-500 text-white' : currentStep === 2 ? 'bg-[#0066ff] text-white shadow-md shadow-blue-500/30' : 'bg-slate-100 text-slate-400'
              }`}>
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className="hidden md:block">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Step 02</p>
                <p className={`text-xs font-bold ${currentStep === 2 ? 'text-[#1A2151]' : 'text-slate-600'}`}>
                  Location & Contact
                </p>
              </div>
            </div>

            <div 
              className={`flex items-center space-x-3 p-2 sm:p-3 rounded-xl transition-all ${
                currentStep === 3 ? 'bg-blue-50/80 border border-blue-200' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                currentStep === 3 ? 'bg-[#0066ff] text-white shadow-md shadow-blue-500/30' : 'bg-slate-100 text-slate-400'
              }`}>
                3
              </div>
              <div className="hidden md:block">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Step 03</p>
                <p className={`text-xs font-bold ${currentStep === 3 ? 'text-[#1A2151]' : 'text-slate-600'}`}>
                  Plan & Review
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Form Container */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl shadow-slate-200/50">
              
              {errors.form && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {errors.form}
                </div>
              )}

              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-lg font-bold text-[#1A2151] flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#0066ff]" /> Core Profile & Hub Identity
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Set up your organization's brand identity and public web presence.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Organization / Incubator Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Nexus Tech Accelerator"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.name ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-[#0066ff]'
                      } focus:ring-2 focus:ring-blue-500/20 outline-none transition text-slate-800 text-sm`}
                    />
                    {errors.name && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Hub URL Slug Preview
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 text-xs">
                      <span className="px-3 py-2.5 bg-slate-100 text-slate-500 border-r border-slate-200 font-mono flex items-center">
                        arba360.io/incubators/
                      </span>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="your-org-slug"
                        className="w-full px-3 py-2.5 bg-transparent font-mono text-slate-700 outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Mission & Sector Focus <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your incubator's focus areas (e.g. FinTech, AI, SaaS, HealthTech)..."
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.description ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-[#0066ff]'
                      } focus:ring-2 focus:ring-blue-500/20 outline-none transition text-slate-800 text-sm resize-none`}
                    />
                    {errors.description && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Incubator Logo URL or Upload
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          name="logo_url"
                          value={formData.logo_url}
                          onChange={handleChange}
                          placeholder="https://your-domain.com/logo.png"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#0066ff] focus:ring-2 focus:ring-blue-500/20 outline-none text-xs text-slate-800 mb-2"
                        />
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
                          <Upload className="w-3.5 h-3.5" /> Upload File
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                      </div>
                      <div className="sm:col-span-4 border-l border-slate-200 pl-0 sm:pl-3">
                        <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Or Choose Preset:</p>
                        <div className="flex gap-2">
                          {LOGO_PRESETS.map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, logo_url: p.url }))}
                              className="w-8 h-8 rounded-lg border border-slate-200 overflow-hidden hover:border-blue-500 transition"
                              title={p.label}
                            >
                              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-[#0066ff]" /> Custom Portal Palette
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-slate-500 font-medium block mb-1">Primary Color</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            name="primary_color"
                            value={formData.primary_color}
                            onChange={handleChange}
                            className="w-9 h-9 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                          />
                          <input
                            type="text"
                            name="primary_color"
                            value={formData.primary_color}
                            onChange={handleChange}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 font-medium block mb-1">Secondary Color</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            name="secondary_color"
                            value={formData.secondary_color}
                            onChange={handleChange}
                            className="w-9 h-9 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                          />
                          <input
                            type="text"
                            name="secondary_color"
                            value={formData.secondary_color}
                            onChange={handleChange}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Presets:</span>
                      {BRAND_PRESETS.map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, primary_color: preset.primary, secondary_color: preset.secondary }))}
                          className="flex items-center space-x-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-[11px] transition"
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.primary }} />
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.secondary }} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-lg font-bold text-[#1A2151] flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#0066ff]" /> Founder Contact & Location
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Provide contact details for administrative and billing verification.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Director / Head of Incubator Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="founder_name"
                      value={formData.founder_name}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Sarah Jenkins"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.founder_name ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-[#0066ff]'
                      } focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-800`}
                    />
                    {errors.founder_name && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.founder_name}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Founder Official Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="founder_email"
                        value={formData.founder_email}
                        onChange={handleChange}
                        placeholder="s.jenkins@incubator.org"
                        className={`w-full px-3 py-2.5 rounded-xl border ${
                          errors.founder_email ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-[#0066ff]'
                        } focus:ring-2 focus:ring-blue-500/20 outline-none text-xs text-slate-800`}
                      />
                      {errors.founder_email && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.founder_email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Billing Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="billing_email"
                        disabled={formData.sameAsFounderEmail}
                        value={formData.billing_email}
                        onChange={handleChange}
                        placeholder="billing@incubator.org"
                        className={`w-full px-3 py-2.5 rounded-xl border ${
                          formData.sameAsFounderEmail ? 'bg-slate-100 text-slate-500 border-slate-200' : 'border-slate-300 focus:border-[#0066ff]'
                        } outline-none text-xs`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sameAsFounderEmail"
                      name="sameAsFounderEmail"
                      checked={formData.sameAsFounderEmail}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#0066ff] rounded border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="sameAsFounderEmail" className="text-xs text-slate-600 cursor-pointer">
                      Use founder email for billing and invoice notifications
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Contact Phone <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <select
                          name="phone_country"
                          value={formData.phone_country}
                          onChange={handleChange}
                          className="px-2 py-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-700"
                        >
                          <option value="+91">+91 (IN)</option>
                          <option value="+1">+1 (US/CA)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+971">+971 (UAE)</option>
                          <option value="+61">+61 (AU)</option>
                        </select>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className={`w-full px-3 py-2 rounded-xl border ${
                            errors.phone ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-[#0066ff]'
                          } focus:ring-2 focus:ring-blue-500/20 outline-none text-xs text-slate-800`}
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Official Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://www.yourincubator.com"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#0066ff] focus:ring-2 focus:ring-blue-500/20 outline-none text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        City / Location <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Bengaluru"
                        className={`w-full px-3 py-2 rounded-xl border ${errors.city ? 'border-rose-500' : 'border-slate-300'} text-xs text-slate-800`}
                      />
                      {errors.city && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="India"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-lg font-bold text-[#1A2151] flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-[#0066ff]" /> Confirm Plan & Launch Cohort
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Review your incubator parameters and confirm quota limits to initialize.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Select Platform Subscription Plan
                      </label>
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
                        <button
                          type="button"
                          onClick={() => setBillingCycle('monthly')}
                          className={`px-3 py-1 rounded-lg font-semibold transition ${
                            billingCycle === 'monthly' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          onClick={() => setBillingCycle('annual')}
                          className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1 ${
                            billingCycle === 'annual' ? 'bg-[#1A2151] text-white shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          Annual <span className="bg-cyan-400 text-slate-900 text-[10px] px-1 rounded font-bold">20% OFF</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(Object.keys(PLAN_TIERS) as Array<'free' | 'pro' | 'enterprise'>).map((key) => {
                        const plan = PLAN_TIERS[key];
                        const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                        const isSelected = selectedPlan === plan.id;

                        return (
                          <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`cursor-pointer rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${
                              isSelected 
                                ? 'border-[#0066ff] bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md' 
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {plan.badge}
                              </span>
                              <h3 className="font-bold text-slate-800 text-sm mt-1.5">{plan.name}</h3>
                              <p className="text-xl font-extrabold text-[#1A2151] mt-1">
                                ₹{price.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-500">/mo</span>
                              </p>
                              
                              <ul className="mt-2.5 space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                                <li className="font-medium text-slate-800 flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-blue-500" /> {plan.startups}
                                </li>
                                <li className="font-medium text-slate-800 flex items-center gap-1">
                                  <Crown className="w-3.5 h-3.5 text-amber-500" /> {plan.mentors}
                                </li>
                              </ul>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-100">
                              <span className={`text-xs font-bold block text-center py-1.5 rounded-lg transition ${
                                isSelected ? 'bg-[#1A2151] text-white' : 'text-slate-500 bg-slate-100'
                              }`}>
                                {isSelected ? 'Selected' : 'Select'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
                    <p className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-blue-600" /> Quota Breakdown
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                      <div><span className="text-slate-400">Selected Tier:</span> <strong>{activePlanInfo.name}</strong></div>
                      <div><span className="text-slate-400">Billing Term:</span> <strong className="capitalize">{billingCycle}</strong></div>
                      <div><span className="text-slate-400">Startup Capacity:</span> <strong>{activePlanInfo.startups}</strong></div>
                      <div><span className="text-slate-400">Mentor Capacity:</span> <strong>{activePlanInfo.mentors}</strong></div>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreedToTerms"
                        checked={formData.agreedToTerms}
                        onChange={handleChange}
                        className="mt-0.5 w-4 h-4 text-[#0066ff] rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed">
                        I agree to the Terms of Service, Privacy Policy, and consent to provisioning resources on Arba360.
                      </span>
                    </label>
                    {errors.agreedToTerms && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5"/>{errors.agreedToTerms}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Wizard Nav Buttons */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : <div />}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1A2151] to-[#0066ff] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#00d4ff] hover:opacity-95 text-white text-xs font-extrabold shadow-lg shadow-blue-500/25 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Provisioning Workspace...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Complete Registration
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Real-time Hub Preview */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#0066ff]" /> Live Portal Header Preview
              </span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Real-Time
              </span>
            </div>

            {/* Live Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xl shadow-slate-300/40">
              <div 
                className="p-6 transition-colors duration-300 text-white relative overflow-hidden"
                style={{ backgroundColor: formData.primary_color }}
              >
                <div 
                  className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-30 blur-2xl pointer-events-none"
                  style={{ backgroundColor: formData.secondary_color }}
                />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6 text-white/80" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white leading-tight">
                        {formData.name || 'Your Incubator Name'}
                      </h3>
                      <p className="text-xs text-white/70 font-mono mt-0.5">
                        arba360.io/incubators/{formData.slug || 'your-org'}
                      </p>
                    </div>
                  </div>

                  <span 
                    className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full text-white shadow-2xs shrink-0"
                    style={{ backgroundColor: formData.secondary_color }}
                  >
                    {activePlanInfo.name}
                  </span>
                </div>

                <p className="mt-3.5 text-xs text-white/80 line-clamp-2 italic leading-relaxed">
                  "{formData.description || 'Your mission statement, focus sectors, and pitch preview will appear here.'}"
                </p>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 bg-slate-50/60">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Head of Incubator</span>
                    <span className="font-semibold text-slate-800 truncate block mt-0.5">
                      {formData.founder_name || 'Not specified'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">HQ Location</span>
                    <span className="font-semibold text-slate-800 truncate block mt-0.5">
                      {formData.city ? `${formData.city}, ${formData.country}` : 'City, Country'}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-slate-200/70 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-500" /> Cohorts Capacity Meter
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Live</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Startups Quota</span>
                      <span>0 / {activePlanInfo.startups}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full w-2" style={{ backgroundColor: formData.secondary_color }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {formData.website || 'incubator.org'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {formData.founder_email || 'founder@org.com'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Instant Workspace Ready</p>
                <p className="text-blue-700/80 mt-0.5">
                  Your custom incubator dashboard, startup intake pipelines, and mentor onboarding will be provisioned instantly.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* SUCCESS MODAL OVERLAY */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#0066ff] to-[#00d4ff]" />
            
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-extrabold text-[#1A2151]">Portal Provisioned!</h3>
            <p className="text-sm text-slate-600 mt-2">
              <strong className="text-slate-800">{formData.name}</strong> has been successfully registered on Arba360.
            </p>

            <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Public Slug:</span>
                <span className="font-mono text-blue-600 font-bold">arba360.io/incubators/{createdOrg?.slug || formData.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Tier:</span>
                <span className="font-bold text-slate-800 capitalize">{activePlanInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Admin Email:</span>
                <span className="font-bold text-slate-800">{formData.founder_email}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push(createdOrg?.id ? `/dashboard?org=${createdOrg.id}` : '/dashboard')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#00d4ff] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition cursor-pointer"
              >
                Go to Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
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
