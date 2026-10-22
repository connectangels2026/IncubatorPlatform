'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  Rocket,
  Zap,
  Crown,
  ArrowRight,
  ArrowLeft,
  Users,
  HelpCircle,
  Building2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Logo from '@/frontend/components/ui/Logo';

interface Plan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  badge?: string;
  popular?: boolean;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  customPriceLabel?: string;
  limits: Array<{ label: string; value: string; icon: React.ReactNode }>;
  features: string[];
  ctaText: string;
  ctaStyle: 'outline' | 'gradient' | 'navy';
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Incubator Starter',
    description: 'Entry-level tier for newly launched incubators and emerging cohorts.',
    priceMonthly: 3999,
    priceAnnual: 2999,
    limits: [
      { label: 'Startups Allowed', value: 'Up to 20', icon: <Building2 className="w-4 h-4 text-slate-500" /> },
      { label: 'Mentors Allowed', value: 'Up to 10', icon: <Users className="w-4 h-4 text-slate-500" /> },
    ],
    features: [
      'Basic Startup Directory',
      'Public Programs Listing',
      'Application Evaluation Portal',
      'Standard Email Support',
      'Standard Analytics Overview',
    ],
    ctaText: 'Choose Starter Plan',
    ctaStyle: 'outline',
    icon: <Rocket className="w-6 h-6 text-slate-700" />,
  },
  {
    id: 'pro',
    name: 'Incubator Pro',
    badge: '★ MOST POPULAR',
    popular: true,
    priceMonthly: 9999,
    priceAnnual: 7999,
    description: 'Designed for scaling accelerators managing multiple cohorts simultaneously.',
    limits: [
      { label: 'Startups Allowed', value: 'Up to 100', icon: <Building2 className="w-4 h-4 text-blue-600" /> },
      { label: 'Mentors Allowed', value: 'Up to 25', icon: <Users className="w-4 h-4 text-blue-600" /> },
    ],
    features: [
      'Everything in Incubator Starter',
      '1-on-1 Mentorship CRM',
      'CSV Export & Cohort Reports',
      'Demo Day Investor Matching',
      'Custom Color Theme & Branding',
      'Automated Cohort Milestones',
    ],
    ctaText: 'Choose Incubator Pro',
    ctaStyle: 'gradient',
    icon: <Zap className="w-6 h-6 text-blue-600" />,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Cluster',
    description: 'High-performance cluster deployment for university networks and global venture hubs.',
    priceMonthly: 29999,
    priceAnnual: 23999,
    customPriceLabel: 'Custom / ₹29,999',
    limits: [
      { label: 'Startups Allowed', value: 'Unlimited', icon: <Building2 className="w-4 h-4 text-amber-500" /> },
      { label: 'Mentors Allowed', value: 'Unlimited', icon: <Users className="w-4 h-4 text-amber-500" /> },
    ],
    features: [
      'Everything in Incubator Pro',
      'Dedicated Account Manager',
      'AI Applicant Scoring Engine',
      'White-label Custom Domain',
      'Priority 24/7 SLA Support',
      'SSO & Advanced Audit Logs',
    ],
    ctaText: 'Contact Enterprise Sales',
    ctaStyle: 'navy',
    icon: <Crown className="w-6 h-6 text-amber-500" />,
  },
];

const faqs = [
  {
    question: 'Can I upgrade or downgrade my incubator plan later?',
    answer: 'Yes, you can seamlessly scale your plan up or down at any time from your incubator administrative settings dashboard.',
  },
  {
    question: 'How are mentor and startup limits calculated?',
    answer: 'Limits are based on active accounts currently enrolled in your cohorts. Archived cohorts do not count against your active limit.',
  },
  {
    question: 'Is custom billing and invoicing available for Enterprise plans?',
    answer: 'Absolutely. We support PO invoicing, wire transfers, custom procurement schedules, and university vendor setups.',
  },
];

export default function IncubatorPlansPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const handleSelectPlan = (tier: 'free' | 'pro' | 'enterprise') => {
    router.push(`/auth/signup-incubator?tier=${tier}&billing=${billingCycle}`);
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
      {/* Background radial gradient glow spots matching platform aesthetic */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/25 rounded-full blur-3xl opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/3 right-0 translate-x-1/3 w-[700px] h-[700px] bg-blue-500/20 rounded-full blur-3xl opacity-60"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.3)_1px,transparent_0)] [background-size:24px_24px] pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/60">
          <Logo size="lg" href="/" />
          <Link
            href="/auth/choose-role"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1A2151] px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Role Selection</span>
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Incubator Operating Infrastructure</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1A2151] tracking-tight mb-4">
            Scale Your Cohorts with the Right Tier
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Choose your deployment capacity to manage applications, allocate mentors, and track cohort startup milestones.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-7 inline-flex items-center p-1.5 bg-slate-200/70 rounded-full border border-slate-300/60 shadow-inner">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#1A2151] shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-[#1A2151] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-cyan-400 text-[#1A2151] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4 pb-12">
          {plans.map((plan) => {
            const isPro = plan.popular;
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl bg-white p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 ${
                  isPro
                    ? 'ring-2 ring-blue-600 scale-100 lg:scale-105 z-10 shadow-2xl shadow-blue-500/15'
                    : 'border border-slate-200/80 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60'
                }`}
              >
                {/* Badge for Featured Plan */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#0066ff] to-[#00d4ff] text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-500/30">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-2xl ${isPro ? 'bg-blue-50' : 'bg-slate-100'}`}>
                        {plan.icon}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#1A2151]">{plan.name}</h2>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      {plan.id === 'enterprise' ? (
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#1A2151]">
                          {plan.customPriceLabel}
                        </span>
                      ) : (
                        <>
                          <span className="text-3xl sm:text-4xl font-extrabold text-[#1A2151] tracking-tight">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-slate-500 font-medium text-xs sm:text-sm">/ month</span>
                        </>
                      )}
                    </div>
                    {billingCycle === 'annual' && plan.priceMonthly > 0 && (
                      <p className="text-[11px] text-blue-600 font-semibold mt-1">
                        Billed annually (₹{(price * 12).toLocaleString('en-IN')}/yr)
                      </p>
                    )}
                  </div>

                  {/* Schema Limits */}
                  <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 space-y-2.5">
                    {plan.limits.map((limit, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-2 text-slate-600">
                          {limit.icon}
                          {limit.label}
                        </span>
                        <span className="font-bold text-[#1A2151] bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
                          {limit.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Included Capabilities
                    </p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 rounded-full p-0.5 shrink-0 ${
                            isPro ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="pt-2">
                  {plan.ctaStyle === 'gradient' && (
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className="w-full group inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white font-bold text-sm sm:text-base bg-gradient-to-r from-[#0066ff] to-[#00d4ff] hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}

                  {plan.ctaStyle === 'outline' && (
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-[#1A2151] font-bold text-sm sm:text-base border-2 border-slate-300 hover:border-[#1A2151] hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>{plan.ctaText}</span>
                    </button>
                  )}

                  {plan.ctaStyle === 'navy' && (
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white font-bold text-sm sm:text-base bg-[#1A2151] hover:bg-[#252e6d] active:scale-[0.98] transition-all shadow-lg shadow-slate-900/10 cursor-pointer"
                    >
                      <span>{plan.ctaText}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Trust Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 hidden sm:block shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1A2151]">
                Need custom university or state-level incubator cluster deployments?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                We offer custom compliance, multi-tenancy, data migrations, and university vendor setups.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSelectPlan('enterprise')}
            className="whitespace-nowrap px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1A2151] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Talk to Enterprise Team
          </button>
        </div>

        {/* Frequently Asked Questions */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A2151]">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Common questions about incubator subscriptions and limits.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-[#1A2151] font-bold text-xs sm:text-sm">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <h4>{faq.question}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
