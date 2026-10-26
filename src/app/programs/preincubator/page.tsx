'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/context/AuthContext';
import { supabase } from '@/backend/lib/supabase';
import {
  Rocket,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  ShieldCheck,
  Send,
  Sparkles,
  Link as LinkIcon,
  RotateCcw,
  Building2,
  Layers,
  Clock,
} from 'lucide-react';
import MyApplicationsModal from '@/frontend/components/applications/MyApplicationsModal';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  professionalStatus: string;
  yearsExperience: string;
  previousBusinessHistory: string;
  reasonsForJoining: string[];

  businessStage: string;
  startedDate: string;
  legalStatus: string;
  industryVertical: string;

  oneSentencePitch: string;
  problemStatement: string;
  targetAudience: string;
  whyExistingSolutionsFail: string;
  validationEvidence: string;

  solutionOverview: string;
  keyDifferentiation: string;
  competitiveAdvantage: string;
  prototypeLink: string;

  idealCustomerPersona: string;
  payingCustomerProfile: string;
  marketSize: string;
  targetGeography: string;

  currentUsers: string;
  payingCustomers: string;
  revenue12Months: string;
  monthlyGrowthRate: string;
  customerAcquisitionChannels: string;

  revenueModel: string;
  grossMargins: string;
  monthlyBurnRate: string;
  runwayMonths: string;
  financialBottleneck: string;

  hoursPerWeek: number;
  fullTimeStatus: string;
  comfortWithUncertainty: number;
  feedbackOpenness: string;

  teamStructure: string;
  coFounderCount: number;
  missingSkills: string;
  seekingCoFounder: string;

  personalCapitalInvested: string;
  externalFundingRaised: string;
  fundingAmountSought: string;
  primaryUseOfFunds: string;

  top3IncubationGoals: string;
  supportAreasNeeded: string[];
  metric90Days: string;

  accountabilityRating: number;
  executionVsIdeation: string;
  handlingPushback: string;

  biggestUnprovenAssumption: string;
  biggestMistake: string;
  activelyAvoiding: string;

  incubatorName: string;
  selectedIncubators: Array<{ id: string; name: string; slug?: string; description?: string; logo_url?: string }>;
  declarationAgreed: boolean;
}

const INITIAL_FORM_DATA: FormData = {
  incubatorName: '',
  selectedIncubators: [],
  fullName: '',
  email: '',
  phone: '',
  location: '',
  professionalStatus: '',
  yearsExperience: '',
  previousBusinessHistory: '',
  reasonsForJoining: [],

  businessStage: 'Idea Phase',
  startedDate: '',
  legalStatus: '',
  industryVertical: '',

  oneSentencePitch: '',
  problemStatement: '',
  targetAudience: '',
  whyExistingSolutionsFail: '',
  validationEvidence: '',

  solutionOverview: '',
  keyDifferentiation: '',
  competitiveAdvantage: '',
  prototypeLink: '',

  idealCustomerPersona: '',
  payingCustomerProfile: '',
  marketSize: '',
  targetGeography: '',

  currentUsers: '',
  payingCustomers: '',
  revenue12Months: '',
  monthlyGrowthRate: '',
  customerAcquisitionChannels: '',

  revenueModel: '',
  grossMargins: '',
  monthlyBurnRate: '',
  runwayMonths: '',
  financialBottleneck: '',

  hoursPerWeek: 40,
  fullTimeStatus: '',
  comfortWithUncertainty: 7,
  feedbackOpenness: '',

  teamStructure: '',
  coFounderCount: 0,
  missingSkills: '',
  seekingCoFounder: 'No',

  personalCapitalInvested: '',
  externalFundingRaised: '',
  fundingAmountSought: '',
  primaryUseOfFunds: '',

  top3IncubationGoals: '',
  supportAreasNeeded: [],
  metric90Days: '',

  accountabilityRating: 8,
  executionVsIdeation: '',
  handlingPushback: '',

  biggestUnprovenAssumption: '',
  biggestMistake: '',
  activelyAvoiding: '',

  declarationAgreed: false,
};

const STEPS = [
  { title: 'Founder Information', subtitle: 'Personal & background details' },
  { title: 'Business Stage', subtitle: 'Current maturity & legal status' },
  { title: 'The Problem', subtitle: 'Pain point & market need' },
  { title: 'Your Solution', subtitle: 'Value prop & differentiation' },
  { title: 'Customer & Market', subtitle: 'Target persona & TAM/SAM/SOM' },
  { title: 'Traction & Revenue', subtitle: 'Users, growth & revenue metrics' },
  { title: 'Business Model', subtitle: 'Unit economics & burn rate' },
  { title: 'Founder Readiness', subtitle: 'Commitment & uncertainty tolerance' },
  { title: 'Team & Co-founders', subtitle: 'Composition & talent requirements' },
  { title: 'Funding & Investment', subtitle: 'Capital history & needs' },
  { title: 'Incubation Requirements', subtitle: 'Goals & support areas needed' },
  { title: 'Founder Mindset', subtitle: 'Resilience & ownership rating' },
  { title: 'Reality Check', subtitle: 'Assumptions & mistakes analysis' },
  { title: 'Final Review', subtitle: 'Declaration & submission' },
];

const STAGE_OPTIONS = [
  { title: 'Idea Phase', desc: 'Concept stage, market research, initial interviews' },
  { title: 'MVP / Prototype', desc: 'Functional product built, undergoing internal beta testing' },
  { title: 'Early Traction', desc: 'Live customers, active users, generating first revenue' },
  { title: 'Scaling', desc: 'Repeatable business model seeking aggressive growth' },
];

const REASON_OPTIONS = [
  'Mentorship & Guidance',
  'Investor Access & Pitching',
  'Go-To-Market Strategy',
  'Product & Tech Support',
  'Co-Founder Matching',
  'Community & Peer Founders',
];

const SUPPORT_OPTIONS = [
  'Legal & Compliance',
  'Technical Architecture',
  'GTM Marketing',
  'Mentorship Access',
  'Investor Introductions',
  'Financial Modeling',
];

export default function PreIncubatorApplicationPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [myAppsModalOpen, setMyAppsModalOpen] = useState(false);
  const [incubatorsList, setIncubatorsList] = useState<Array<{ id: string; name: string; slug?: string; description?: string; logo_url?: string }>>([]);

  useEffect(() => {
    fetch('/api/v1/incubators')
      .then((r) => r.json())
      .then((d) => {
        if (d?.data && Array.isArray(d.data) && d.data.length > 0) {
          setIncubatorsList(d.data);
        }
      })
      .catch(() => { });
  }, []);

  const toggleIncubatorSelection = (incubator: { id: string; name: string; slug?: string; description?: string; logo_url?: string }) => {
    setFormData((prev) => {
      const exists = prev.selectedIncubators.some((i) => i.id === incubator.id);
      if (exists) {
        const nextList = prev.selectedIncubators.filter((i) => i.id !== incubator.id);
        return {
          ...prev,
          selectedIncubators: nextList,
          incubatorName: nextList.map((i) => i.name).join(', '),
        };
      }
      if (prev.selectedIncubators.length >= 5) {
        showToast('You can select a maximum of 5 incubators.');
        return prev;
      }
      const nextList = [...prev.selectedIncubators, incubator];
      return {
        ...prev,
        selectedIncubators: nextList,
        incubatorName: nextList.map((i) => i.name).join(', '),
      };
    });
  };

  // Check auth session safely with Supabase to prevent premature redirect bounce
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          const userMeta = session.user.user_metadata || {};
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || userMeta.full_name || userMeta.name || '',
            email: prev.email || session.user.email || '',
          }));
        } else if (!isLoading && !user) {
          router.push('/login?redirect=/programs/preincubator');
        }
      } catch (e) {
        if (!isLoading && !user && isMounted) {
          router.push('/login?redirect=/programs/preincubator');
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [user, isLoading, router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const progressPercent = Math.round((currentStep / 14) * 100);
  const completedStepsCount = Math.max(0, currentStep - 1);

  const isStepCompleted = (stepNum: number) => stepNum < currentStep;

  const toggleArrayItem = (key: 'reasonsForJoining' | 'supportAreasNeeded', item: string) => {
    setFormData((prev) => {
      const list = prev[key];
      const nextList = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
      return { ...prev, [key]: nextList };
    });
  };

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];
    const d = formData;

    if (step === 1) {
      if (!d.incubatorName.trim()) errors.push('Target Incubator Name');
      if (!d.fullName.trim()) errors.push('Full Name');
      if (!d.email.trim()) errors.push('Email');
      if (!d.phone.trim()) errors.push('Phone');
      if (!d.location.trim()) errors.push('Location');
      if (!d.professionalStatus) errors.push('Professional Status');
    } else if (step === 2) {
      if (!d.businessStage) errors.push('Business Stage');
      if (!d.startedDate) errors.push('Start Date');
      if (!d.legalStatus) errors.push('Legal Status');
      if (!d.industryVertical.trim()) errors.push('Industry');
    } else if (step === 3) {
      if (!d.oneSentencePitch.trim()) errors.push('One-Sentence Pitch');
      if (!d.problemStatement.trim()) errors.push('Problem Statement');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 14) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      showToast('Please complete required fields before proceeding.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (stepNum: number) => {
    if (stepNum <= currentStep || validateStep(currentStep)) {
      setCurrentStep(stepNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem('arba360_preincubator_draft', JSON.stringify(formData));
      showToast('Application draft saved locally!');
    } catch {
      showToast('Draft saved!');
    }
  };

  const submitApplication = async () => {
    if (!formData.declarationAgreed || isSubmitting || submitted) return;
    setIsSubmitting(true);

    try {
      const targetName = formData.incubatorName.trim();
      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incubator_name: targetName,
          incubator_name_text: targetName,
          application_type: 'pre-incubator',
          applicant_name: formData.fullName,
          applicant_email: formData.email,
          applicant_phone: formData.phone,
          startup_name: formData.oneSentencePitch.split(' ').slice(0, 3).join(' ') || `${formData.fullName}'s Startup`,
          pitch: formData.oneSentencePitch,
          industry: formData.industryVertical || 'AI & DeepTech',
          stage: formData.businessStage || 'Idea Phase',
          form_data: formData,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || 'Failed to submit application.');
        return;
      }

      const effectiveAppId = json?.data?.id || `APP-${Date.now().toString().slice(-6)}`;
      setSubmitted(true);
      setApplicationId(effectiveAppId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('last_application_id', effectiveAppId);
        localStorage.setItem('last_applicant_email', formData.email);
      }
      showToast(`Application submitted successfully to ${targetName}!`);
    } catch {
      showToast('Network error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-800 relative bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/40 flex flex-col justify-between overflow-x-hidden">
      {/* Ambient Glowing Background Orbs */}
      <div className="fixed top-[-10%] left-[-5%] w-[450px] h-[450px] bg-cyan-400/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-[40%] right-[20%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Floating Glass Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 px-4 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Back to Programs */}
          <div className="flex items-center gap-3">
            <Link
              href="/programs"
              className="p-2 rounded-xl border border-slate-200/80 text-slate-500 hover:text-[#1A2151] hover:bg-slate-100 transition"
              title="Back to Programs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1A2151] to-blue-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#1A2151] rounded-[14px] flex items-center justify-center">
                <Rocket className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#1A2151]">
                ARBA<span className="text-blue-600">360</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2.5 py-0.5 text-xs font-semibold bg-cyan-50 text-cyan-700 rounded-full border border-cyan-200">
                PRE-INCUBATOR
              </span>
            </div>
          </div>

          {/* Header Middle Progress Info */}
          <div className="hidden md:flex flex-col items-center flex-1 max-w-md mx-6">
            <div className="flex justify-between w-full text-xs font-semibold mb-1.5 text-slate-600">
              <span>
                Step {currentStep} of 14:{' '}
                <span className="text-[#1A2151] font-bold">{STEPS[currentStep - 1]?.title}</span>
              </span>
              <span className="text-blue-600">{progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden p-0.5 border border-slate-300/40">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Top Right Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={saveDraft}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1A2151] bg-white/80 hover:bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-xs transition-all duration-200"
            >
              <Bookmark className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>
            <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-[#1A2151] md:hidden">
              {currentStep}/14
            </div>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden w-full bg-slate-200 h-1.5 mt-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Toast Notification Overlay */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-3 bg-[#1A2151] text-white px-5 py-3 rounded-2xl shadow-2xl border border-cyan-400/30 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Form Container */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex-1 flex flex-col z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
          {/* Sidebar Navigation (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-5 shadow-xl max-h-[calc(100vh-120px)] flex flex-col">
              <div className="mb-4 pb-3 border-b border-slate-200/80 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-400">
                  Application Steps
                </h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  {completedStepsCount}/14 Completed
                </span>
              </div>

              {/* Steps List */}
              <nav className="space-y-1.5 overflow-y-auto pr-1 flex-1">
                {STEPS.map((step, index) => {
                  const stepNum = index + 1;
                  const isActive = currentStep === stepNum;
                  const completed = isStepCompleted(stepNum);

                  return (
                    <button
                      key={index}
                      onClick={() => goToStep(stepNum)}
                      type="button"
                      className={`w-full text-left p-3 rounded-2xl transition-all duration-200 flex items-center gap-3 group relative ${isActive
                        ? 'bg-[#1A2151] text-white shadow-lg shadow-[#1A2151]/20'
                        : completed
                          ? 'bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/80 border border-emerald-200/60'
                          : 'hover:bg-slate-100/80 text-slate-600'
                        }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive
                          ? 'bg-cyan-400 text-[#1A2151]'
                          : completed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200/80 text-slate-600'
                          }`}
                      >
                        {completed && !isActive ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span>{stepNum}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-800'
                            }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-[10px] truncate opacity-75">{step.subtitle}</p>
                      </div>

                      {isActive && (
                        <div className="w-1.5 h-6 bg-cyan-400 rounded-full absolute right-2" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Form Content Card */}
          <section className="lg:col-span-8 xl:col-span-9 flex flex-col h-full">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl flex-1 relative flex flex-col justify-between mb-24">
              <div>
                {/* Step Header Title & Subtitle */}
                <div className="mb-8 pb-5 border-b border-slate-200/80">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                      Section {currentStep} of 14
                    </span>
                    {validationErrors.length > 0 && (
                      <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Required fields missing
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2151] tracking-tight">
                    {STEPS[currentStep - 1]?.title}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    {STEPS[currentStep - 1]?.subtitle}
                  </p>
                </div>

                {/* Form Sections */}
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  {/* SECTION 1: FOUNDER INFORMATION */}
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Target Incubator Name Input */}
                      <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-cyan-50/60 border border-blue-200/80 space-y-2">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                            Target Incubator Name *
                          </span>
                        </label>
                        <p className="text-xs text-slate-500 font-medium">
                          Enter the name of the incubator you are applying to. You can apply to up to 5 incubators independently.
                        </p>
                        <div className="relative mt-2">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={formData.incubatorName}
                            onChange={(e) => setFormData({ ...formData, incubatorName: e.target.value })}
                            placeholder="e.g. Arba360 Innovation Hub, NurtureCave, Kalsekar..."
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm font-bold text-slate-900 shadow-2xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="e.g. Sarah Jenkins"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="sarah@example.com"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Operating Location *
                          </label>
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="City, Country"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Professional Status *
                          </label>
                          <select
                            value={formData.professionalStatus}
                            onChange={(e) =>
                              setFormData({ ...formData, professionalStatus: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm text-slate-700"
                          >
                            <option value="">Select Status</option>
                            <option value="Full-Time Founder">Full-Time Founder</option>
                            <option value="Employed (Transitioning)">
                              Employed (Transitioning)
                            </option>
                            <option value="Student / Recent Graduate">
                              Student / Recent Graduate
                            </option>
                            <option value="Serial Entrepreneur">Serial Entrepreneur</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Years of Experience *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={formData.yearsExperience}
                            onChange={(e) =>
                              setFormData({ ...formData, yearsExperience: e.target.value })
                            }
                            placeholder="e.g. 6"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Previous Entrepreneurial History
                        </label>
                        <textarea
                          rows={3}
                          value={formData.previousBusinessHistory}
                          onChange={(e) =>
                            setFormData({ ...formData, previousBusinessHistory: e.target.value })
                          }
                          placeholder="Briefly describe previous startups, side projects, or key achievements..."
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                          Primary Reasons for Joining Arba360
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {REASON_OPTIONS.map((reason) => {
                            const isSelected = formData.reasonsForJoining.includes(reason);
                            return (
                              <button
                                key={reason}
                                type="button"
                                onClick={() => toggleArrayItem('reasonsForJoining', reason)}
                                className={`p-3.5 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition-all duration-200 ${isSelected
                                  ? 'bg-blue-50 border-blue-600 text-blue-600 font-bold shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                              >
                                <span>{reason}</span>
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300'
                                    }`}
                                >
                                  {isSelected && <Check className="w-3 h-3" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: BUSINESS STAGE */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                          Current Business Stage *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {STAGE_OPTIONS.map((stage) => {
                            const isSelected = formData.businessStage === stage.title;
                            return (
                              <button
                                key={stage.title}
                                type="button"
                                onClick={() =>
                                  setFormData({ ...formData, businessStage: stage.title })
                                }
                                className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${isSelected
                                  ? 'bg-[#1A2151] text-white border-[#1A2151] shadow-lg'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                  }`}
                              >
                                <div>
                                  <div className="font-extrabold text-sm mb-1">{stage.title}</div>
                                  <div className="text-xs opacity-75">{stage.desc}</div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                  <span
                                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${isSelected
                                      ? 'bg-cyan-400 text-[#1A2151]'
                                      : 'bg-slate-100 text-slate-500'
                                      }`}
                                  >
                                    Select
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Project/Company Start Date *
                          </label>
                          <input
                            type="date"
                            value={formData.startedDate}
                            onChange={(e) =>
                              setFormData({ ...formData, startedDate: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Legal Registration Status *
                          </label>
                          <select
                            value={formData.legalStatus}
                            onChange={(e) =>
                              setFormData({ ...formData, legalStatus: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm text-slate-700"
                          >
                            <option value="">Select Status</option>
                            <option value="Not Registered Yet">Not Registered Yet</option>
                            <option value="Incorporated (C-Corp / LLC)">
                              Incorporated (C-Corp / LLC / Private Ltd)
                            </option>
                            <option value="Sole Proprietorship">Sole Proprietorship</option>
                            <option value="In Registration Process">In Registration Process</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Primary Industry / Vertical *
                        </label>
                        <input
                          type="text"
                          value={formData.industryVertical}
                          onChange={(e) =>
                            setFormData({ ...formData, industryVertical: e.target.value })
                          }
                          placeholder="e.g. HealthTech, FinTech, B2B SaaS, Climate Tech"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 3: THE PROBLEM */}
                  {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          One-Sentence Pitch *
                        </label>
                        <input
                          type="text"
                          value={formData.oneSentencePitch}
                          onChange={(e) =>
                            setFormData({ ...formData, oneSentencePitch: e.target.value })
                          }
                          placeholder="We help [target group] solve [problem] by [key solution]."
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Detailed Problem Statement *
                        </label>
                        <textarea
                          rows={4}
                          value={formData.problemStatement}
                          onChange={(e) =>
                            setFormData({ ...formData, problemStatement: e.target.value })
                          }
                          placeholder="What core pain point or inefficiency are you solving? Be specific."
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Target Audience Suffering Most *
                          </label>
                          <input
                            type="text"
                            value={formData.targetAudience}
                            onChange={(e) =>
                              setFormData({ ...formData, targetAudience: e.target.value })
                            }
                            placeholder="e.g. Mid-sized logistics operations managers"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Why Existing Alternatives Fail *
                          </label>
                          <input
                            type="text"
                            value={formData.whyExistingSolutionsFail}
                            onChange={(e) =>
                              setFormData({ ...formData, whyExistingSolutionsFail: e.target.value })
                            }
                            placeholder="Too expensive, manual, slow, fragmented..."
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Problem Validation Evidence *
                        </label>
                        <textarea
                          rows={3}
                          value={formData.validationEvidence}
                          onChange={(e) =>
                            setFormData({ ...formData, validationEvidence: e.target.value })
                          }
                          placeholder="Interviews conducted, survey numbers, waitlist size, pilot data..."
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 4: YOUR SOLUTION */}
                  {currentStep === 4 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Solution Overview *
                        </label>
                        <textarea
                          rows={4}
                          value={formData.solutionOverview}
                          onChange={(e) =>
                            setFormData({ ...formData, solutionOverview: e.target.value })
                          }
                          placeholder="Explain how your product or service works in simple terms..."
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Key Differentiator *
                          </label>
                          <input
                            type="text"
                            value={formData.keyDifferentiation}
                            onChange={(e) =>
                              setFormData({ ...formData, keyDifferentiation: e.target.value })
                            }
                            placeholder="10x faster, proprietary AI model, unique distribution..."
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Unfair Competitive Advantage
                          </label>
                          <input
                            type="text"
                            value={formData.competitiveAdvantage}
                            onChange={(e) =>
                              setFormData({ ...formData, competitiveAdvantage: e.target.value })
                            }
                            placeholder="Patents, exclusive partnerships, network effect..."
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Prototype / Demo / Deck Link (Optional)
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            value={formData.prototypeLink}
                            onChange={(e) =>
                              setFormData({ ...formData, prototypeLink: e.target.value })
                            }
                            placeholder="https://figma.com/..., https://youtube.com/..., https://yourdeck.com"
                            className="w-full px-4 py-3 pl-10 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                          <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 5: CUSTOMER & MARKET */}
                  {currentStep === 5 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Ideal Customer Persona *
                          </label>
                          <textarea
                            rows={3}
                            value={formData.idealCustomerPersona}
                            onChange={(e) =>
                              setFormData({ ...formData, idealCustomerPersona: e.target.value })
                            }
                            placeholder="Who is the primary user or decision maker?"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Paying Customer Profile *
                          </label>
                          <textarea
                            rows={3}
                            value={formData.payingCustomerProfile}
                            onChange={(e) =>
                              setFormData({ ...formData, payingCustomerProfile: e.target.value })
                            }
                            placeholder="Who actually writes the check or puts down the credit card?"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Estimated Market Size (TAM / SAM / SOM) *
                        </label>
                        <input
                          type="text"
                          value={formData.marketSize}
                          onChange={(e) => setFormData({ ...formData, marketSize: e.target.value })}
                          placeholder="e.g. TAM: $12B, SAM: $1.5B, SOM: $50M"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Primary Target Geography *
                        </label>
                        <input
                          type="text"
                          value={formData.targetGeography}
                          onChange={(e) =>
                            setFormData({ ...formData, targetGeography: e.target.value })
                          }
                          placeholder="e.g. India, MENA Region, North America, Southeast Asia, Global"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 6: TRACTION & REVENUE */}
                  {currentStep === 6 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Total Active Users / Beta Testers *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.currentUsers}
                            onChange={(e) =>
                              setFormData({ ...formData, currentUsers: e.target.value })
                            }
                            placeholder="0"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Paying Customers Count *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.payingCustomers}
                            onChange={(e) =>
                              setFormData({ ...formData, payingCustomers: e.target.value })
                            }
                            placeholder="0"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Past 12 Months Revenue (USD/INR) *
                          </label>
                          <input
                            type="text"
                            value={formData.revenue12Months}
                            onChange={(e) =>
                              setFormData({ ...formData, revenue12Months: e.target.value })
                            }
                            placeholder="$0 or ₹2,50,000"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Monthly Growth Rate (%) *
                          </label>
                          <input
                            type="text"
                            value={formData.monthlyGrowthRate}
                            onChange={(e) =>
                              setFormData({ ...formData, monthlyGrowthRate: e.target.value })
                            }
                            placeholder="e.g. 15%"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Primary Customer Acquisition Channels *
                        </label>
                        <input
                          type="text"
                          value={formData.customerAcquisitionChannels}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerAcquisitionChannels: e.target.value,
                            })
                          }
                          placeholder="e.g. Cold outbound, Organic SEO, LinkedIn, Partner referrals"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 7: BUSINESS MODEL & ECONOMICS */}
                  {currentStep === 7 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Business / Revenue Model *
                          </label>
                          <select
                            value={formData.revenueModel}
                            onChange={(e) =>
                              setFormData({ ...formData, revenueModel: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm text-slate-700"
                          >
                            <option value="">Select Revenue Model</option>
                            <option value="SaaS Subscription">SaaS Subscription</option>
                            <option value="Marketplace / Take Rate">Marketplace / Take Rate</option>
                            <option value="Transactional / Pay-per-use">
                              Transactional / Pay-per-use
                            </option>
                            <option value="Hardware + Software">Hardware + Software</option>
                            <option value="B2B Enterprise Contracts">
                              B2B Enterprise Contracts
                            </option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Estimated Gross Margins (%) *
                          </label>
                          <input
                            type="text"
                            value={formData.grossMargins}
                            onChange={(e) =>
                              setFormData({ ...formData, grossMargins: e.target.value })
                            }
                            placeholder="e.g. 75%"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Monthly Burn Rate *
                          </label>
                          <input
                            type="text"
                            value={formData.monthlyBurnRate}
                            onChange={(e) =>
                              setFormData({ ...formData, monthlyBurnRate: e.target.value })
                            }
                            placeholder="e.g. $4,000 / mo"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Runway Months Remaining *
                          </label>
                          <input
                            type="text"
                            value={formData.runwayMonths}
                            onChange={(e) =>
                              setFormData({ ...formData, runwayMonths: e.target.value })
                            }
                            placeholder="e.g. 8 months"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Biggest Financial Bottleneck Right Now *
                        </label>
                        <input
                          type="text"
                          value={formData.financialBottleneck}
                          onChange={(e) =>
                            setFormData({ ...formData, financialBottleneck: e.target.value })
                          }
                          placeholder="High CAC, long sales cycles, R&D expenses..."
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 8: FOUNDER READINESS & COMMITMENT */}
                  {currentStep === 8 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Hours Dedicated Per Week *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={formData.hoursPerWeek}
                            onChange={(e) =>
                              setFormData({ ...formData, hoursPerWeek: Number(e.target.value) })
                            }
                            placeholder="e.g. 50"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Full-Time Commitment Status *
                          </label>
                          <select
                            value={formData.fullTimeStatus}
                            onChange={(e) =>
                              setFormData({ ...formData, fullTimeStatus: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm text-slate-700"
                          >
                            <option value="">Select Commitment Level</option>
                            <option value="Currently Full-Time">Currently Full-Time</option>
                            <option value="Ready to go Full-Time upon acceptance">
                              Ready to go Full-Time upon acceptance
                            </option>
                            <option value="Part-Time for next 3-6 months">
                              Part-Time for next 3-6 months
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* Slider for Uncertainty */}
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Comfort with High Uncertainty & Ambiguity *
                          </label>
                          <span className="text-base font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                            {formData.comfortWithUncertainty} / 10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={formData.comfortWithUncertainty}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              comfortWithUncertainty: Number(e.target.value),
                            })
                          }
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-2">
                          <span>1: Prefer Predictability</span>
                          <span>5: Moderate Risk</span>
                          <span>10: Thrive in Chaos</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Openness to Critical Feedback & Pivoting *
                        </label>
                        <textarea
                          rows={3}
                          value={formData.feedbackOpenness}
                          onChange={(e) =>
                            setFormData({ ...formData, feedbackOpenness: e.target.value })
                          }
                          placeholder="Share an instance where feedback changed your direction or worldview..."
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 9: TEAM & CO-FOUNDERS */}
                  {currentStep === 9 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Team Structure *
                          </label>
                          <select
                            value={formData.teamStructure}
                            onChange={(e) =>
                              setFormData({ ...formData, teamStructure: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm text-slate-700"
                          >
                            <option value="">Select Team Structure</option>
                            <option value="Solo Founder">Solo Founder</option>
                            <option value="Co-Founding Team">Co-Founding Team</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Number of Co-Founders *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={formData.coFounderCount}
                            onChange={(e) =>
                              setFormData({ ...formData, coFounderCount: Number(e.target.value) })
                            }
                            placeholder="0"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Missing Key Skills on Team *
                        </label>
                        <input
                          type="text"
                          value={formData.missingSkills}
                          onChange={(e) =>
                            setFormData({ ...formData, missingSkills: e.target.value })
                          }
                          placeholder="e.g. Lead AI Engineer, Growth Marketer, Regulatory Expert"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                          Are you currently seeking a Co-Founder? *
                        </label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, seekingCoFounder: 'Yes' })}
                            className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-bold transition-all duration-200 ${formData.seekingCoFounder === 'Yes'
                              ? 'bg-[#1A2151] text-white border-[#1A2151] shadow-md'
                              : 'bg-white border-slate-200 text-slate-600'
                              }`}
                          >
                            Yes, looking for a Co-Founder
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, seekingCoFounder: 'No' })}
                            className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-bold transition-all duration-200 ${formData.seekingCoFounder === 'No'
                              ? 'bg-[#1A2151] text-white border-[#1A2151] shadow-md'
                              : 'bg-white border-slate-200 text-slate-600'
                              }`}
                          >
                            No, team complete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 10: FUNDING & INVESTMENT NEEDS */}
                  {currentStep === 10 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Personal Capital Invested To-Date *
                          </label>
                          <input
                            type="text"
                            value={formData.personalCapitalInvested}
                            onChange={(e) =>
                              setFormData({ ...formData, personalCapitalInvested: e.target.value })
                            }
                            placeholder="e.g. $15,000 or ₹5,00,000"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            External Capital Raised (Grants, Angels) *
                          </label>
                          <input
                            type="text"
                            value={formData.externalFundingRaised}
                            onChange={(e) =>
                              setFormData({ ...formData, externalFundingRaised: e.target.value })
                            }
                            placeholder="e.g. $0 or $50,000 Grant"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Target Funding Seeking *
                          </label>
                          <input
                            type="text"
                            value={formData.fundingAmountSought}
                            onChange={(e) =>
                              setFormData({ ...formData, fundingAmountSought: e.target.value })
                            }
                            placeholder="e.g. $150,000"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Primary Use of Funds *
                          </label>
                          <input
                            type="text"
                            value={formData.primaryUseOfFunds}
                            onChange={(e) =>
                              setFormData({ ...formData, primaryUseOfFunds: e.target.value })
                            }
                            placeholder="e.g. 50% Tech Dev, 30% Growth Marketing, 20% Ops"
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 11: INCUBATION REQUIREMENTS */}
                  {currentStep === 11 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Top 3 Goals for the Pre-Incubation Program *
                        </label>
                        <textarea
                          rows={3}
                          value={formData.top3IncubationGoals}
                          onChange={(e) =>
                            setFormData({ ...formData, top3IncubationGoals: e.target.value })
                          }
                          placeholder="1. Achieve $10k MRR&#10;2. Secure key pilot partner&#10;3. Fine-tune unit economics"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                          Support Areas Needed (Select all that apply)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {SUPPORT_OPTIONS.map((support) => {
                            const isSelected = formData.supportAreasNeeded.includes(support);
                            return (
                              <button
                                key={support}
                                type="button"
                                onClick={() => toggleArrayItem('supportAreasNeeded', support)}
                                className={`p-3 rounded-2xl border text-xs font-semibold text-center transition-all duration-200 ${isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                              >
                                <span>{support}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Single Key 90-Day Success Metric *
                        </label>
                        <input
                          type="text"
                          value={formData.metric90Days}
                          onChange={(e) =>
                            setFormData({ ...formData, metric90Days: e.target.value })
                          }
                          placeholder="e.g. Sign 5 enterprise LOIs or launch public v1.0 MVP"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 12: FOUNDER MINDSET */}
                  {currentStep === 12 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Accountability & Extreme Ownership Rating *
                          </label>
                          <span className="text-base font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                            {formData.accountabilityRating} / 10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={formData.accountabilityRating}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              accountabilityRating: Number(e.target.value),
                            })
                          }
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Execution vs Ideation Focus *
                        </label>
                        <textarea
                          rows={3}
                          value={formData.executionVsIdeation}
                          onChange={(e) =>
                            setFormData({ ...formData, executionVsIdeation: e.target.value })
                          }
                          placeholder="How do you balance creative brainstorming with rapid execution and shipping?"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Handling Severe Pushback or Rejection *
                        </label>
                        <textarea
                          rows={3}
                          value={formData.handlingPushback}
                          onChange={(e) =>
                            setFormData({ ...formData, handlingPushback: e.target.value })
                          }
                          placeholder="Describe a time an investor or customer rejected your vision and how you responded..."
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 13: REALITY CHECK & ASSUMPTIONS */}
                  {currentStep === 13 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Biggest Unproven Assumption *
                        </label>
                        <textarea
                          rows={3}
                          value={formData.biggestUnprovenAssumption}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              biggestUnprovenAssumption: e.target.value,
                            })
                          }
                          placeholder="What single assumption could destroy your startup if proven wrong?"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Biggest Mistake Made So Far *
                        </label>
                        <textarea
                          rows={3}
                          value={formData.biggestMistake}
                          onChange={(e) =>
                            setFormData({ ...formData, biggestMistake: e.target.value })
                          }
                          placeholder="What decision backfired, and what was your key takeaway?"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Hard Truth You Are Actively Avoiding *
                        </label>
                        <textarea
                          rows={3}
                          value={formData.activelyAvoiding}
                          onChange={(e) =>
                            setFormData({ ...formData, activelyAvoiding: e.target.value })
                          }
                          placeholder="Be honest: What uncomfortable task or reality are you postponing?"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 14: FINAL REVIEW & SUBMISSION */}
                  {currentStep === 14 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="bg-gradient-to-r from-[#1A2151] to-blue-600 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <Sparkles className="w-32 h-32 text-white/5 absolute -right-6 -bottom-6 pointer-events-none" />
                        <div>
                          <h2 className="text-xl font-bold mb-1">
                            Final Review & Founder Declaration
                          </h2>
                          <p className="text-xs text-blue-100">
                            Please review your key application summary below before submitting.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMyAppsModalOpen(true)}
                          className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition shrink-0 cursor-pointer"
                        >
                          <Building2 className="w-4 h-4 text-cyan-400" />
                          <span>My Applications</span>
                        </button>
                      </div>

                      {/* Target Incubator Review Card */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-cyan-50/60 border border-blue-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-extrabold uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            Target Incubator
                          </span>
                          <button
                            type="button"
                            onClick={() => goToStep(1)}
                            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1A2151] to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                            {(formData.incubatorName || 'A').trim().charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-extrabold text-[#1A2151]">
                            {formData.incubatorName || 'Not specified'}
                          </span>
                        </div>
                      </div>

                      {/* Summary Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Founder & Stage
                          </span>
                          <p className="text-sm font-extrabold text-[#1A2151] mt-1">
                            {formData.fullName || 'Not provided'}
                          </p>
                          <p className="text-xs text-slate-600">{formData.email}</p>
                          <div className="mt-2 inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-bold">
                            {formData.businessStage || 'Stage N/A'}
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Pitch & Vertical
                          </span>
                          <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-2">
                            {formData.oneSentencePitch || 'Pitch not entered'}
                          </p>
                          <p className="text-xs text-cyan-600 font-bold mt-1">
                            {formData.industryVertical || 'Vertical N/A'}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Traction & Funding
                          </span>
                          <p className="text-xs text-slate-700 font-bold mt-1">
                            Users:{' '}
                            <span className="text-blue-600">{formData.currentUsers || 0}</span> |
                            Paying:{' '}
                            <span className="text-blue-600">{formData.payingCustomers || 0}</span>
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Seeking:{' '}
                            <span className="font-bold text-[#1A2151]">
                              {formData.fundingAmountSought || '$0'}
                            </span>
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Commitment & Mindset
                          </span>
                          <p className="text-xs text-slate-700 mt-1">
                            Hours/wk: <span className="font-bold">{formData.hoursPerWeek}</span>
                          </p>
                          <p className="text-xs text-slate-700">
                            Uncertainty Comfort:{' '}
                            <span className="font-bold text-blue-600">
                              {formData.comfortWithUncertainty}/10
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Agreement Checkbox */}
                      <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/60 flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="declaration"
                          checked={formData.declarationAgreed}
                          onChange={(e) =>
                            setFormData({ ...formData, declarationAgreed: e.target.checked })
                          }
                          className="mt-1 w-5 h-5 rounded-md accent-blue-600 cursor-pointer"
                        />
                        <label
                          htmlFor="declaration"
                          className="text-xs text-slate-700 leading-relaxed cursor-pointer font-medium"
                        >
                          I hereby declare that all information provided in this Arba360 Accelerator
                          pre-incubation application is accurate, truthful, and representative of my
                          startup. I agree to participate actively in program milestones if
                          selected.
                        </label>
                      </div>

                      {/* Submitted celebration card */}
                      {submitted && (
                        <div className="p-6 rounded-3xl bg-emerald-500 text-white text-center shadow-2xl animate-in zoom-in-95 duration-300">
                          <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-white" />
                          <h3 className="text-xl font-black">
                            Application Submitted Successfully!
                          </h3>
                          <p className="text-xs text-emerald-100 mt-1">
                            Application Reference:{' '}
                            <span className="font-mono font-bold">{applicationId}</span>
                          </p>
                          <p className="text-xs text-emerald-100 mt-1">
                            Our admissions committee will review your application and respond within
                            5 business days.
                          </p>
                          <div className="mt-4 flex items-center justify-center gap-3">
                            <Link
                              href="/programs"
                              className="px-4 py-2 bg-white text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-50 transition shadow-xs"
                            >
                              Explore Programs
                            </Link>
                            <Link
                              href={`/programs/preincubator/status${applicationId ? `?id=${applicationId}` : ''}`}
                              className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold text-xs hover:bg-emerald-800 transition shadow-xs flex items-center gap-1.5"
                            >
                              <span>Track Application Status</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Bottom Navigation Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-xl border-t border-slate-200/80 px-4 lg:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Back Button */}
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || submitted}
            className={`inline-flex items-center gap-2 text-xs font-bold px-5 py-3 rounded-2xl transition-all duration-200 ${currentStep === 1 || submitted
              ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-400'
              : 'bg-white hover:bg-slate-100 text-[#1A2151] border border-slate-300 shadow-xs'
              }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Middle Status Indicator (Desktop) */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted & Auto-saved</span>
          </div>

          {/* Next / Submit Button */}
          <div>
            {currentStep < 14 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 text-xs font-extrabold px-6 py-3 rounded-2xl bg-gradient-to-r from-[#1A2151] to-blue-600 hover:opacity-95 text-white shadow-lg shadow-blue-600/25 transition-all duration-200 transform hover:scale-[1.02]"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitApplication}
                disabled={!formData.declarationAgreed || isSubmitting || submitted}
                className={`inline-flex items-center gap-2 text-xs font-black px-7 py-3.5 rounded-2xl transition-all duration-200 transform ${formData.declarationAgreed && !isSubmitting && !submitted
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-slate-900 shadow-xl shadow-cyan-400/30 hover:scale-105 cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* MY APPLICATIONS MODAL */}
      <MyApplicationsModal
        isOpen={myAppsModalOpen}
        onClose={() => setMyAppsModalOpen(false)}
        applicantEmail={formData.email || user?.email}
      />
    </div>
  );
}
