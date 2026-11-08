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
  Lock,
} from 'lucide-react';
import Logo from '@/frontend/components/ui/Logo';
import MyApplicationsModal from '@/frontend/components/applications/MyApplicationsModal';

interface FormData {
  startupName: string;
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
  startupName: '',
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

const inputClass =
  'w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors';

const textareaClass =
  'w-full p-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors';

const selectClass =
  'w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors';

const labelClass = 'block text-xs font-medium text-slate-600 mb-1.5';

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
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

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

  // 1. Restore saved draft from localStorage on initial page load
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const rawDraft = localStorage.getItem('arba360_preincubator_draft');
        if (rawDraft) {
          const parsed = JSON.parse(rawDraft);
          if (parsed && typeof parsed === 'object') {
            const { _savedStep, _savedAt, ...savedData } = parsed;
            setFormData((prev) => ({
              ...prev,
              ...savedData,
            }));
            if (typeof _savedStep === 'number' && _savedStep >= 1 && _savedStep <= 14) {
              setCurrentStep(_savedStep);
            }
            if (_savedAt) {
              setLastSavedAt(new Date(_savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }
            showToast('Loaded your saved draft application');
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load draft from localStorage:', err);
    } finally {
      setIsDraftLoaded(true);
    }
  }, []);

  // 2. Check auth session and sync user details (Email and Full Name) from database
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          const sessionEmail = session.user.email || '';
          let userTableFullName = '';

          // Check if user has selected a role before accessing application
          const userRole = session.user.user_metadata?.role || (user as any)?.role;
          let activeRole = userRole;

          // 1. Fetch user record from users table via /api/v1/auth/me (using server-side supabaseAdmin)
          try {
            const meRes = await fetch('/api/v1/auth/me', {
              headers: session.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              if (meData?.user?.user_table_full_name) {
                userTableFullName = meData.user.user_table_full_name;
              }
              if (meData?.user?.role) {
                activeRole = meData.user.role;
              }
            }
          } catch (e) {
            console.warn('Could not query users table via /api/v1/auth/me:', e);
          }

          // If role is not selected yet, strictly redirect to choose-role
          if (!activeRole) {
            router.replace('/auth/choose-role');
            return;
          }

          // Issue 1: Admin / Incubator Admin accounts must NOT display startup application forms
          const normalizedRole = (activeRole || '').toLowerCase();
          if (
            normalizedRole === 'admin' ||
            normalizedRole === 'incubator_admin' ||
            normalizedRole === 'incubator' ||
            normalizedRole === 'super-admin' ||
            normalizedRole === 'super_admin'
          ) {
            const orgId = (user as any)?.organization_id || (typeof window !== 'undefined' ? localStorage.getItem('org_id') : null);
            if (normalizedRole.includes('super')) {
              router.replace('/super-admin/dashboard');
            } else {
              router.replace(orgId ? `/dashboard?org=${orgId}` : '/dashboard');
            }
            return;
          }

          // 2. Fallback: direct query to public.users table in database by email
          if (!userTableFullName && sessionEmail) {
            try {
              const { data: uRec } = await supabase
                .from('users')
                .select('full_name, first_name, last_name')
                .eq('email', sessionEmail)
                .maybeSingle();
              if (uRec) {
                userTableFullName = uRec.full_name || [uRec.first_name, uRec.last_name].filter(Boolean).join(' ');
              }
            } catch (e) {
              // Ignore direct query error
            }
          }

          setFormData((prev) => ({
            ...prev,
            email: sessionEmail || prev.email,
            // Strictly set full name from users table in database
            fullName: userTableFullName || prev.fullName,
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

  // 3. Auto-save form progress to localStorage on any changes (debounced)
  useEffect(() => {
    // Only auto-save after initial draft has been loaded to prevent overwriting with defaults
    if (!isDraftLoaded || submitted) return;

    setIsAutoSaving(true);
    const timer = setTimeout(() => {
      try {
        const draftPayload = {
          ...formData,
          _savedStep: currentStep,
          _savedAt: new Date().toISOString(),
        };
        localStorage.setItem('arba360_preincubator_draft', JSON.stringify(draftPayload));
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSavedAt(timeStr);
      } catch (err) {
        console.warn('Auto-save failed:', err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData, currentStep, isDraftLoaded, submitted]);

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
      if (!d.startupName?.trim()) errors.push('Startup / Venture Name');
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
      const draftPayload = {
        ...formData,
        _savedStep: currentStep,
        _savedAt: new Date().toISOString(),
      };
      localStorage.setItem('arba360_preincubator_draft', JSON.stringify(draftPayload));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedAt(timeStr);
      showToast(`Application draft saved locally at ${timeStr}`);
    } catch {
      showToast('Application draft saved locally!');
    }
  };

  const submitApplication = async () => {
    if (!formData.declarationAgreed || isSubmitting || submitted) return;
    setIsSubmitting(true);

    try {
      const targetName = formData.incubatorName.trim();
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          incubator_name: targetName,
          incubator_name_text: targetName,
          application_type: 'pre-incubator',
          applicant_name: formData.fullName,
          applicant_email: formData.email,
          applicant_phone: formData.phone,
          startup_name: formData.startupName?.trim() || formData.oneSentencePitch.split(' ').slice(0, 3).join(' ') || `${formData.fullName}'s Startup`,
          pitch: formData.oneSentencePitch,
          industry: formData.industryVertical || 'AI & DeepTech',
          stage: formData.businessStage || 'Idea Phase',
          form_data: {
            ...formData,
            startup_name: formData.startupName?.trim() || `${formData.fullName}'s Startup`,
            startupName: formData.startupName?.trim() || `${formData.fullName}'s Startup`,
          },
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
        localStorage.removeItem('arba360_preincubator_draft');
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Brand Logo & Back to Programs */}
          <div className="flex items-center gap-3">
            <Link
              href="/programs"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
              title="Back to programs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Logo size="sm" href="/" />
          </div>

          {/* Header Middle: Single Label "Step X of 14 · Title" */}
          <div className="text-xs sm:text-sm font-medium text-slate-700 truncate max-w-xs sm:max-w-md text-center">
            Step {currentStep} of 14 <span className="text-slate-300 mx-1.5">·</span> <span className="font-semibold text-slate-900">{STEPS[currentStep - 1]?.title}</span>
          </div>

          {/* Top Right Action Controls: One Save Status next to Save Draft Button */}
          <div className="flex items-center gap-3">
            {lastSavedAt && (
              <span className="text-xs text-slate-500 hidden sm:inline">
                {isAutoSaving ? 'Saving...' : `Saved ${lastSavedAt}`}
              </span>
            )}
            <button
              onClick={saveDraft}
              type="button"
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition shadow-2xs cursor-pointer"
            >
              Save draft
            </button>
          </div>
        </div>

        {/* Single Progress Bar Under Top Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-blue-600 h-1 transition-all duration-300"
            style={{ width: `${(currentStep / 14) * 100}%` }}
          />
        </div>
      </header>

      {/* Toast Notification Overlay */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Form Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Left Stepper: Number + Title only, page scrolls naturally */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs">
              <nav className="space-y-0.5">
                {STEPS.map((step, index) => {
                  const stepNum = index + 1;
                  const isActive = currentStep === stepNum;
                  const completed = isStepCompleted(stepNum);

                  return (
                    <button
                      key={index}
                      onClick={() => goToStep(stepNum)}
                      type="button"
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer relative ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600 rounded-l-none'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold'
                            : completed
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {completed && !isActive ? (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          stepNum
                        )}
                      </span>
                      <span className="truncate">{step.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Form Content Card */}
          <section className="lg:col-span-8 xl:col-span-9 flex flex-col h-full">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs flex-1 flex flex-col justify-between">
              <div>
                {/* Step Header Title & Subtitle */}
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-semibold text-slate-900">
                        {STEPS[currentStep - 1]?.title}
                      </h1>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {STEPS[currentStep - 1]?.subtitle}
                      </p>
                    </div>
                    {validationErrors.length > 0 && (
                      <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1 shrink-0">
                        <AlertCircle className="w-3.5 h-3.5" /> Required fields missing
                      </span>
                    )}
                  </div>
                </div>

                {/* Form Sections */}
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  {/* SECTION 1: FOUNDER INFORMATION */}
                  {currentStep === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {/* Target Incubator Name Input */}
                      <div>
                        <label className={labelClass}>
                          Incubator name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={formData.incubatorName}
                            onChange={(e) => setFormData({ ...formData, incubatorName: e.target.value })}
                            placeholder="e.g. Arba360 Innovation Hub, NurtureCave..."
                            className={`${inputClass} pl-9`}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Enter the name of the incubator you are applying to. You can apply to up to 5 incubators independently.
                        </p>
                      </div>

                      {/* Startup / Venture Name Input */}
                      <div>
                        <label className={labelClass}>
                          Startup / venture name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Rocket className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={formData.startupName}
                            onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                            placeholder="e.g. NextWave AI, EcoVolt Labs, FinFlow..."
                            className={`${inputClass} pl-9`}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Enter your startup or business name. This will be linked to your startup dashboard.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Full name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="e.g. Sarah Jenkins"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Email address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={formData.email}
                              readOnly
                              disabled
                              aria-readonly="true"
                              placeholder="sarah@example.com"
                              className="w-full h-10 pl-3 pr-9 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-sm cursor-not-allowed select-none focus:outline-none"
                            />
                            <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Phone number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Operating location <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="City, Country"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Professional status <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.professionalStatus}
                            onChange={(e) =>
                              setFormData({ ...formData, professionalStatus: e.target.value })
                            }
                            className={selectClass}
                          >
                            <option value="">Select status</option>
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
                          <label className={labelClass}>
                            Years of experience <span className="text-red-500">*</span>
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
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Previous entrepreneurial history
                        </label>
                        <textarea
                          rows={3}
                          value={formData.previousBusinessHistory}
                          onChange={(e) =>
                            setFormData({ ...formData, previousBusinessHistory: e.target.value })
                          }
                          placeholder="Briefly describe previous startups, side projects, or key achievements..."
                          className={textareaClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Primary reasons for joining
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {REASON_OPTIONS.map((reason) => {
                            const isSelected = formData.reasonsForJoining.includes(reason);
                            return (
                              <button
                                key={reason}
                                type="button"
                                onClick={() => toggleArrayItem('reasonsForJoining', reason)}
                                className={`p-3 rounded-lg border text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span>{reason}</span>
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                    isSelected
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
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
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <label className={labelClass}>
                          Current business stage <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {STAGE_OPTIONS.map((stage) => {
                            const isSelected = formData.businessStage === stage.title;
                            return (
                              <button
                                key={stage.title}
                                type="button"
                                onClick={() =>
                                  setFormData({ ...formData, businessStage: stage.title })
                                }
                                className={`p-4 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-blue-50/70 text-blue-950 border-blue-600 ring-1 ring-blue-600'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                                }`}
                              >
                                <div>
                                  <div className="font-semibold text-sm mb-1">{stage.title}</div>
                                  <div className="text-xs text-slate-500">{stage.desc}</div>
                                </div>
                                <div className="mt-3 flex justify-end">
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      isSelected
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {isSelected ? 'Selected' : 'Select'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Project / company start date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={formData.startedDate}
                            onChange={(e) =>
                              setFormData({ ...formData, startedDate: e.target.value })
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Legal registration status <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.legalStatus}
                            onChange={(e) =>
                              setFormData({ ...formData, legalStatus: e.target.value })
                            }
                            className={selectClass}
                          >
                            <option value="">Select status</option>
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
                        <label className={labelClass}>
                          Primary industry / vertical <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.industryVertical}
                          onChange={(e) =>
                            setFormData({ ...formData, industryVertical: e.target.value })
                          }
                          placeholder="e.g. HealthTech, FinTech, B2B SaaS, Climate Tech"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 3: THE PROBLEM */}
                  {currentStep === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <label className={labelClass}>
                          One-sentence pitch <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.oneSentencePitch}
                          onChange={(e) =>
                            setFormData({ ...formData, oneSentencePitch: e.target.value })
                          }
                          placeholder="We help [target group] solve [problem] by [key solution]."
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Detailed problem statement <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          value={formData.problemStatement}
                          onChange={(e) =>
                            setFormData({ ...formData, problemStatement: e.target.value })
                          }
                          placeholder="What core pain point or inefficiency are you solving? Be specific."
                          className={textareaClass}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Target audience suffering most <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.targetAudience}
                            onChange={(e) =>
                              setFormData({ ...formData, targetAudience: e.target.value })
                            }
                            placeholder="e.g. Mid-sized logistics operations managers"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Why existing alternatives fail <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.whyExistingSolutionsFail}
                            onChange={(e) =>
                              setFormData({ ...formData, whyExistingSolutionsFail: e.target.value })
                            }
                            placeholder="Too expensive, manual, slow, fragmented..."
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Problem validation evidence <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={formData.validationEvidence}
                          onChange={(e) =>
                            setFormData({ ...formData, validationEvidence: e.target.value })
                          }
                          placeholder="Interviews conducted, survey numbers, waitlist size, pilot data..."
                          className={textareaClass}
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 4: YOUR SOLUTION */}
                  {currentStep === 4 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <label className={labelClass}>
                          Solution overview <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          value={formData.solutionOverview}
                          onChange={(e) =>
                            setFormData({ ...formData, solutionOverview: e.target.value })
                          }
                          placeholder="Explain how your product or service works in simple terms..."
                          className={textareaClass}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Key differentiator <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.keyDifferentiation}
                            onChange={(e) =>
                              setFormData({ ...formData, keyDifferentiation: e.target.value })
                            }
                            placeholder="10x faster, proprietary AI model, unique distribution..."
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Unfair competitive advantage
                          </label>
                          <input
                            type="text"
                            value={formData.competitiveAdvantage}
                            onChange={(e) =>
                              setFormData({ ...formData, competitiveAdvantage: e.target.value })
                            }
                            placeholder="Patents, exclusive partnerships, network effect..."
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Prototype / demo / deck link (optional)
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            value={formData.prototypeLink}
                            onChange={(e) =>
                              setFormData({ ...formData, prototypeLink: e.target.value })
                            }
                            placeholder="https://figma.com/..., https://youtube.com/..., https://yourdeck.com"
                            className={`${inputClass} pl-9`}
                          />
                          <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 5: CUSTOMER & MARKET */}
                  {currentStep === 5 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Ideal customer persona <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={3}
                            value={formData.idealCustomerPersona}
                            onChange={(e) =>
                              setFormData({ ...formData, idealCustomerPersona: e.target.value })
                            }
                            placeholder="Who is the primary user or decision maker?"
                            className={textareaClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Paying customer profile <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={3}
                            value={formData.payingCustomerProfile}
                            onChange={(e) =>
                              setFormData({ ...formData, payingCustomerProfile: e.target.value })
                            }
                            placeholder="Who actually writes the check or puts down the credit card?"
                            className={textareaClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Estimated market size (TAM / SAM / SOM) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.marketSize}
                          onChange={(e) => setFormData({ ...formData, marketSize: e.target.value })}
                          placeholder="e.g. TAM: $12B, SAM: $1.5B, SOM: $50M"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Primary target geography <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.targetGeography}
                          onChange={(e) =>
                            setFormData({ ...formData, targetGeography: e.target.value })
                          }
                          placeholder="e.g. India, MENA Region, North America, Southeast Asia, Global"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 6: TRACTION & REVENUE */}
                  {currentStep === 6 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Total active users / beta testers <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.currentUsers}
                            onChange={(e) =>
                              setFormData({ ...formData, currentUsers: e.target.value })
                            }
                            placeholder="0"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Paying customers count <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.payingCustomers}
                            onChange={(e) =>
                              setFormData({ ...formData, payingCustomers: e.target.value })
                            }
                            placeholder="0"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Past 12 months revenue (USD/INR) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.revenue12Months}
                            onChange={(e) =>
                              setFormData({ ...formData, revenue12Months: e.target.value })
                            }
                            placeholder="$0 or ₹2,50,000"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Monthly growth rate (%) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.monthlyGrowthRate}
                            onChange={(e) =>
                              setFormData({ ...formData, monthlyGrowthRate: e.target.value })
                            }
                            placeholder="e.g. 15%"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Primary customer acquisition channels <span className="text-red-500">*</span>
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
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 7: BUSINESS MODEL & ECONOMICS */}
                  {currentStep === 7 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Business / revenue model <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.revenueModel}
                            onChange={(e) =>
                              setFormData({ ...formData, revenueModel: e.target.value })
                            }
                            className={selectClass}
                          >
                            <option value="">Select revenue model</option>
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
                          <label className={labelClass}>
                            Estimated gross margins (%) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.grossMargins}
                            onChange={(e) =>
                              setFormData({ ...formData, grossMargins: e.target.value })
                            }
                            placeholder="e.g. 75%"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Monthly burn rate <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.monthlyBurnRate}
                            onChange={(e) =>
                              setFormData({ ...formData, monthlyBurnRate: e.target.value })
                            }
                            placeholder="e.g. $4,000 / mo"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Runway months remaining <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.runwayMonths}
                            onChange={(e) =>
                              setFormData({ ...formData, runwayMonths: e.target.value })
                            }
                            placeholder="e.g. 8 months"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Biggest financial bottleneck right now <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.financialBottleneck}
                          onChange={(e) =>
                            setFormData({ ...formData, financialBottleneck: e.target.value })
                          }
                          placeholder="High CAC, long sales cycles, R&D expenses..."
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 8: FOUNDER READINESS & COMMITMENT */}
                  {currentStep === 8 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Hours dedicated per week <span className="text-red-500">*</span>
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
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Full-time commitment status <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.fullTimeStatus}
                            onChange={(e) =>
                              setFormData({ ...formData, fullTimeStatus: e.target.value })
                            }
                            className={selectClass}
                          >
                            <option value="">Select commitment level</option>
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
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className={labelClass}>
                            Comfort with high uncertainty & ambiguity <span className="text-red-500">*</span>
                          </label>
                          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
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
                          className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                        />
                        <div className="flex justify-between text-xs text-slate-400 font-medium mt-1.5">
                          <span>1: Prefer predictability</span>
                          <span>5: Moderate risk</span>
                          <span>10: Thrive in chaos</span>
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Openness to critical feedback & pivoting <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={formData.feedbackOpenness}
                          onChange={(e) =>
                            setFormData({ ...formData, feedbackOpenness: e.target.value })
                          }
                          placeholder="Share an instance where feedback changed your direction or worldview..."
                          className={textareaClass}
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 9: TEAM & CO-FOUNDERS */}
                  {currentStep === 9 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Team structure <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.teamStructure}
                            onChange={(e) =>
                              setFormData({ ...formData, teamStructure: e.target.value })
                            }
                            className={selectClass}
                          >
                            <option value="">Select team structure</option>
                            <option value="Solo Founder">Solo Founder</option>
                            <option value="Co-Founding Team">Co-Founding Team</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>
                            Number of co-founders <span className="text-red-500">*</span>
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
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Missing key skills on team <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.missingSkills}
                          onChange={(e) =>
                            setFormData({ ...formData, missingSkills: e.target.value })
                          }
                          placeholder="e.g. Lead AI engineer, growth marketer, regulatory expert"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Are you currently seeking a co-founder? <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, seekingCoFounder: 'Yes' })}
                            className={`flex-1 h-10 px-4 rounded-lg border text-sm font-medium transition cursor-pointer ${
                              formData.seekingCoFounder === 'Yes'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            Yes, looking for a co-founder
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, seekingCoFounder: 'No' })}
                            className={`flex-1 h-10 px-4 rounded-lg border text-sm font-medium transition cursor-pointer ${
                              formData.seekingCoFounder === 'No'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
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
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Personal capital invested to-date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.personalCapitalInvested}
                            onChange={(e) =>
                              setFormData({ ...formData, personalCapitalInvested: e.target.value })
                            }
                            placeholder="e.g. $15,000 or ₹5,00,000"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            External capital raised (grants, angels) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.externalFundingRaised}
                            onChange={(e) =>
                              setFormData({ ...formData, externalFundingRaised: e.target.value })
                            }
                            placeholder="e.g. $0 or $50,000 grant"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            Target funding seeking <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.fundingAmountSought}
                            onChange={(e) =>
                              setFormData({ ...formData, fundingAmountSought: e.target.value })
                            }
                            placeholder="e.g. $150,000"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Primary use of funds <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.primaryUseOfFunds}
                            onChange={(e) =>
                              setFormData({ ...formData, primaryUseOfFunds: e.target.value })
                            }
                            placeholder="e.g. 50% tech dev, 30% growth marketing, 20% ops"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 11: INCUBATION REQUIREMENTS */}
                  {currentStep === 11 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div>
                        <label className={labelClass}>
                          Top 3 goals for the pre-incubation program <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={formData.top3IncubationGoals}
                          onChange={(e) =>
                            setFormData({ ...formData, top3IncubationGoals: e.target.value })
                          }
                          placeholder="1. Achieve $10k MRR&#10;2. Secure key pilot partner&#10;3. Fine-tune unit economics"
                          className={textareaClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Support areas needed (select all that apply)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {SUPPORT_OPTIONS.map((support) => {
                            const isSelected = formData.supportAreasNeeded.includes(support);
                            return (
                              <button
                                key={support}
                                type="button"
                                onClick={() => toggleArrayItem('supportAreasNeeded', support)}
                                className={`h-10 px-3 rounded-lg border text-xs font-medium text-center transition cursor-pointer flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span>{support}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Single key 90-day success metric <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.metric90Days}
                          onChange={(e) =>
                            setFormData({ ...formData, metric90Days: e.target.value })
                          }
                          placeholder="e.g. Sign 5 enterprise LOIs or launch public v1.0 MVP"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 12: FOUNDER MINDSET */}
                  {currentStep === 12 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className={labelClass}>
                            Accountability & extreme ownership rating <span className="text-red-500">*</span>
                          </label>
                          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
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
                          className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Execution vs ideation focus <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={formData.executionVsIdeation}
                          onChange={(e) =>
                            setFormData({ ...formData, executionVsIdeation: e.target.value })
                          }
                          placeholder="How do you balance creative brainstorming with rapid execution and shipping?"
                          className={textareaClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Handling severe pushback or rejection <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={formData.handlingPushback}
                          onChange={(e) =>
                            setFormData({ ...formData, handlingPushback: e.target.value })
                          }
                          placeholder="Describe a time an investor or customer rejected your vision and how you responded..."
                          className={textareaClass}
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 13: REALITY CHECK & ASSUMPTIONS */}
                  {currentStep === 13 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div>
                        <label className={labelClass}>
                          Biggest unproven assumption <span className="text-red-500">*</span>
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
                          className={textareaClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Biggest mistake made so far <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={formData.biggestMistake}
                          onChange={(e) =>
                            setFormData({ ...formData, biggestMistake: e.target.value })
                          }
                          placeholder="What decision backfired, and what was your key takeaway?"
                          className={textareaClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Hard truth you are actively avoiding <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={formData.activelyAvoiding}
                          onChange={(e) =>
                            setFormData({ ...formData, activelyAvoiding: e.target.value })
                          }
                          placeholder="Be honest: What uncomfortable task or reality are you postponing?"
                          className={textareaClass}
                        />
                      </div>
                    </div>
                  )}

                  {/* SECTION 14: FINAL REVIEW & SUBMISSION */}
                  {currentStep === 14 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">
                            Review application summary
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Please review your key application details before submitting.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMyAppsModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition shrink-0 cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>My applications</span>
                        </button>
                      </div>

                      {/* Target Incubator Review Card */}
                      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            Target incubator
                          </span>
                          <button
                            type="button"
                            onClick={() => goToStep(1)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-blue-600 text-white font-semibold text-xs flex items-center justify-center">
                            {(formData.incubatorName || 'A').trim().charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {formData.incubatorName || 'Not specified'}
                          </span>
                        </div>
                      </div>

                      {/* Summary Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-xs text-slate-500 font-medium">
                            Startup & founder
                          </span>
                          <p className="text-sm font-semibold text-slate-900 mt-1">
                            {formData.startupName || `${formData.fullName}'s Startup`}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">{formData.fullName} ({formData.email})</p>
                          <div className="mt-2 inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                            {formData.businessStage || 'Stage N/A'}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-xs text-slate-500 font-medium">
                            Pitch & vertical
                          </span>
                          <p className="text-xs font-normal text-slate-800 mt-1 line-clamp-2">
                            {formData.oneSentencePitch || 'Pitch not entered'}
                          </p>
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            {formData.industryVertical || 'Vertical N/A'}
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-xs text-slate-500 font-medium">
                            Traction & funding
                          </span>
                          <p className="text-xs text-slate-700 font-medium mt-1">
                            Users:{' '}
                            <span className="font-semibold text-slate-900">{formData.currentUsers || 0}</span> |
                            Paying:{' '}
                            <span className="font-semibold text-slate-900">{formData.payingCustomers || 0}</span>
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Seeking:{' '}
                            <span className="font-semibold text-slate-900">
                              {formData.fundingAmountSought || '$0'}
                            </span>
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-xs text-slate-500 font-medium">
                            Commitment & mindset
                          </span>
                          <p className="text-xs text-slate-700 mt-1">
                            Hours/wk: <span className="font-semibold text-slate-900">{formData.hoursPerWeek}</span>
                          </p>
                          <p className="text-xs text-slate-700 mt-0.5">
                            Uncertainty comfort:{' '}
                            <span className="font-semibold text-blue-600">
                              {formData.comfortWithUncertainty} / 10
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Agreement Checkbox */}
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="declaration"
                          checked={formData.declarationAgreed}
                          onChange={(e) =>
                            setFormData({ ...formData, declarationAgreed: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 rounded-sm border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
                        />
                        <label
                          htmlFor="declaration"
                          className="text-xs text-slate-600 leading-relaxed cursor-pointer font-normal"
                        >
                          I hereby declare that all information provided in this pre-incubation application is accurate,
                          truthful, and representative of my startup. I agree to participate actively in program
                          milestones if selected.
                        </label>
                      </div>

                      {/* Submitted celebration card */}
                      {submitted && (
                        <div className="p-6 rounded-xl bg-emerald-600 text-white text-center shadow-xs animate-in zoom-in-95 duration-200">
                          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-white" />
                          <h3 className="text-lg font-semibold">
                            Application submitted successfully
                          </h3>
                          <p className="text-xs text-emerald-100 mt-1">
                            Application reference:{' '}
                            <span className="font-mono font-medium">{applicationId}</span>
                          </p>
                          <p className="text-xs text-emerald-100 mt-1">
                            Our admissions committee will review your application and respond within 5 business days.
                          </p>
                          <div className="mt-4 flex items-center justify-center gap-3">
                            <Link
                              href="/programs"
                              className="px-3.5 py-2 bg-white text-emerald-700 rounded-lg font-medium text-xs hover:bg-emerald-50 transition shadow-2xs"
                            >
                              Explore programs
                            </Link>
                            <Link
                              href={`/programs/preincubator/status${applicationId ? `?id=${applicationId}` : ''}`}
                              className="px-3.5 py-2 bg-emerald-700 text-white rounded-lg font-medium text-xs hover:bg-emerald-800 transition shadow-2xs flex items-center gap-1.5"
                            >
                              <span>Track application status</span>
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

      {/* Sticky Bottom Action Controls */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Previous Button (Secondary) */}
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || submitted}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
              currentStep === 1 || submitted
                ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Next / Submit Button (Flat Blue, No Gradient) */}
          <div>
            {currentStep < 14 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
              >
                <span>Next step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitApplication}
                disabled={!formData.declarationAgreed || isSubmitting || submitted}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-5 py-2.5 rounded-lg transition-colors shadow-2xs ${
                  formData.declarationAgreed && !isSubmitting && !submitted
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
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
                    <span>Submit application</span>
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
