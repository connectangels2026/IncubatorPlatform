'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Globe,
  Loader2,
  Lock,
  LogOut,
  Minus,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import Logo from '@/frontend/components/ui/Logo';
import { useAuth } from '@/frontend/context/AuthContext';
import { supabase } from '@/backend/lib/supabase';
import { apiClient } from '@/services/apiClient';

type MeetingMode = 'video' | 'in_person' | 'both';
type StartupStage = 'Idea' | 'MVP' | 'Pre-revenue' | 'Revenue' | 'Growth' | 'Scale';

interface IncubatorOption {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
}

interface MentorApplicationFormState {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  linkedinUrl: string;
  domains: string[];
  preferredStages: StartupStage[];
  yearsOfExperience: number;
  hoursPerMonth: number;
  preferredMeetingMode: MeetingMode;
  timezone: string;
  bio: string;
  incubatorId: string;
  acceptedTerms: boolean;
}

const CURATED_DOMAINS: string[] = [
  'FinTech & Payments',
  'B2B SaaS',
  'AI & Machine Learning',
  'HealthTech',
  'Climate & CleanTech',
  'Consumer & D2C',
  'DeepTech & Hardware',
  'EdTech',
  'Supply Chain & Logistics',
  'Web3 & Infra',
  'Go-To-Market & Sales',
  'Fundraising & M&A',
];

const STARTUP_STAGES: StartupStage[] = [
  'Idea',
  'MVP',
  'Pre-revenue',
  'Revenue',
  'Growth',
  'Scale',
];

const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, UTC+05:30)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+08:00)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+04:00)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST, UTC+00:00)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET, UTC+01:00)' },
  { value: 'America/New_York', label: 'America/New_York (EST, UTC-05:00)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST, UTC-08:00)' },
];

const DRAFT_STORAGE_KEY = 'arba360_mentor_application_draft_v1';

function detectSystemTimezone(): string {
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected && COMMON_TIMEZONES.some((tz) => tz.value === detected)) {
      return detected;
    }
    return 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
}

function isValidLinkedInUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(normalized);
    return (
      (parsed.hostname === 'linkedin.com' || parsed.hostname === 'www.linkedin.com') &&
      parsed.pathname.startsWith('/in/') &&
      parsed.pathname.length > 4
    );
  } catch {
    return false;
  }
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^\d]/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

function MentorApplicationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteOrgId = searchParams.get('invite') || searchParams.get('org');
  const { user: authUser, isLoading: authLoading, logout } = useAuth();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [unauthorizedRole, setUnauthorizedRole] = useState<string | null>(null);
  const [existingApplication, setExistingApplication] = useState<any>(null);

  const [incubators, setIncubators] = useState<IncubatorOption[]>([]);
  const [loadingIncubators, setLoadingIncubators] = useState(true);

  const [form, setForm] = useState<MentorApplicationFormState>(() => ({
    fullName: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    linkedinUrl: '',
    domains: [],
    preferredStages: [],
    yearsOfExperience: 8,
    hoursPerMonth: 8,
    preferredMeetingMode: 'video',
    timezone: detectSystemTimezone(),
    bio: '',
    incubatorId: inviteOrgId || '',
    acceptedTerms: false,
  }));

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const [domainSearch, setDomainSearch] = useState('');
  const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);
  const domainContainerRef = useRef<HTMLDivElement | null>(null);

  const [incubatorSearch, setIncubatorSearch] = useState('');
  const [incubatorDropdownOpen, setIncubatorDropdownOpen] = useState(false);
  const incubatorContainerRef = useRef<HTMLDivElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedRecord, setSubmittedRecord] = useState<any>(null);

  // Verify authentication, prefill user details, and check existing mentor application
  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (authLoading) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user && !authUser) {
          const nextPath = inviteOrgId
            ? `/mentor/application-form?invite=${encodeURIComponent(inviteOrgId)}`
            : '/mentor/application-form';
          router.replace(`/login?redirect=${encodeURIComponent(nextPath)}`);
          return;
        }

        const res = await apiClient.get('/mentors/apply');
        if (!isMounted) return;

        const profile = res.data?.user;
        const role = (profile?.role || '').toLowerCase();

        // Only block incompatible active dashboard roles
        if (
          role &&
          !['mentor', 'user', 'pending', 'pending_mentor'].includes(role)
        ) {
          setUnauthorizedRole(role);
          setCheckingAccess(false);
          return;
        }

        if (res.data?.existingApplication) {
          router.replace('/mentor/dashboard');
          return;
        }

        const resolvedEmail = profile?.email || session?.user?.email || authUser?.email || '';
        const resolvedName =
          profile?.fullName ||
          (session?.user?.user_metadata?.full_name as string) ||
          '';
        const resolvedPhone = profile?.phone || '';

        let savedDraft: Partial<MentorApplicationFormState> = {};
        try {
          const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
          if (raw) savedDraft = JSON.parse(raw);
        } catch {
          // Ignore malformed draft
        }

        setForm((prev) => ({
          ...prev,
          ...savedDraft,
          fullName: savedDraft.fullName || resolvedName || prev.fullName,
          phone: savedDraft.phone || resolvedPhone || prev.phone,
          email: resolvedEmail,
          incubatorId: inviteOrgId || savedDraft.incubatorId || prev.incubatorId,
        }));

        if (Object.keys(savedDraft).length > 0) {
          setSaveStatus('saved');
        }
      } catch (err: any) {
        if (err?.response?.status === 401) {
          const nextPath = inviteOrgId
            ? `/mentor/application-form?invite=${encodeURIComponent(inviteOrgId)}`
            : '/mentor/application-form';
          router.replace(`/login?redirect=${encodeURIComponent(nextPath)}`);
          return;
        }
        console.error('Failed to load mentor application state:', err);
      } finally {
        if (isMounted) setCheckingAccess(false);
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, [authLoading, authUser, inviteOrgId, router]);

  // Fetch active incubators from /api/v1/incubators
  useEffect(() => {
    let active = true;
    async function loadIncubators() {
      try {
        setLoadingIncubators(true);
        const res = await fetch('/api/v1/incubators');
        if (res.ok) {
          const json = await res.json();
          if (active && Array.isArray(json.data)) {
            setIncubators(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch incubators:', err);
      } finally {
        if (active) setLoadingIncubators(false);
      }
    }
    loadIncubators();
    return () => {
      active = false;
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (domainContainerRef.current && !domainContainerRef.current.contains(event.target as Node)) {
        setDomainDropdownOpen(false);
      }
      if (incubatorContainerRef.current && !incubatorContainerRef.current.contains(event.target as Node)) {
        setIncubatorDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced autosave draft
  useEffect(() => {
    if (!isDirty) return;
    setSaveStatus('saving');
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
        setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setSaveStatus('saved');
        setIsDirty(false);
      } catch {
        setSaveStatus('idle');
      }
    }, 650);

    return () => window.clearTimeout(timer);
  }, [form, isDirty]);

  // Unsaved-changes browser navigation warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const invitedOrg = useMemo(() => {
    if (!inviteOrgId) return null;
    return incubators.find((inc) => inc.id === inviteOrgId) || null;
  }, [inviteOrgId, incubators]);

  const selectedIncubator = useMemo(
    () => incubators.find((inc) => inc.id === form.incubatorId) || null,
    [incubators, form.incubatorId]
  );

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full name.';
    }
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required for incubator coordination.';
    } else if (!isValidPhone(form.phone)) {
      errs.phone = 'Enter a valid phone number with country code.';
    }
    if (!form.jobTitle.trim()) {
      errs.jobTitle = 'Please enter your current role or job title.';
    }
    if (!form.company.trim()) {
      errs.company = 'Please enter your current or most recent company.';
    }
    if (!form.linkedinUrl.trim()) {
      errs.linkedinUrl = 'LinkedIn profile URL is required.';
    } else if (!isValidLinkedInUrl(form.linkedinUrl)) {
      errs.linkedinUrl = 'Enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/your-handle).';
    }
    if (form.domains.length === 0) {
      errs.domains = 'Select at least 1 domain of expertise (up to 3).';
    }
    if (form.preferredStages.length === 0) {
      errs.preferredStages = 'Select at least one startup stage you mentor.';
    }
    if (Number.isNaN(form.yearsOfExperience) || form.yearsOfExperience < 1 || form.yearsOfExperience > 50) {
      errs.yearsOfExperience = 'Experience must be between 1 and 50 years.';
    }
    if (!form.timezone) {
      errs.timezone = 'Please select your primary timezone.';
    }
    if (!form.bio.trim()) {
      errs.bio = 'Please write a short mentor bio.';
    } else if (form.bio.trim().length < 30) {
      errs.bio = 'Add at least 30 characters so founders understand your background.';
    } else if (form.bio.length > 500) {
      errs.bio = 'Bio cannot exceed 500 characters.';
    }
    if (!form.incubatorId) {
      errs.incubatorId = 'Please select the incubator you are applying to.';
    }
    if (!form.acceptedTerms) {
      errs.acceptedTerms = 'You must agree to the mentor guidelines to apply.';
    }
    return errs;
  }, [form]);

  const isFormValid = Object.keys(errors).length === 0;

  function updateField<K extends keyof MentorApplicationFormState>(
    key: K,
    value: MentorApplicationFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    if (submitError) setSubmitError(null);
  }

  function markTouched(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function toggleDomain(domain: string) {
    setForm((prev) => {
      const exists = prev.domains.includes(domain);
      if (exists) {
        return { ...prev, domains: prev.domains.filter((d) => d !== domain) };
      }
      if (prev.domains.length >= 3) return prev;
      return { ...prev, domains: [...prev.domains, domain] };
    });
    setIsDirty(true);
    markTouched('domains');
  }

  function toggleStage(stage: StartupStage) {
    setForm((prev) => {
      const exists = prev.preferredStages.includes(stage);
      const nextStages = exists
        ? prev.preferredStages.filter((s) => s !== stage)
        : [...prev.preferredStages, stage];
      return { ...prev, preferredStages: nextStages };
    });
    setIsDirty(true);
    markTouched('preferredStages');
  }

  function adjustExperience(delta: number) {
    const nextVal = Math.min(50, Math.max(1, (form.yearsOfExperience || 1) + delta));
    updateField('yearsOfExperience', nextVal);
    markTouched('yearsOfExperience');
  }

  function handleManualSaveDraft() {
    setSaveStatus('saving');
    window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
        setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setSaveStatus('saved');
        setIsDirty(false);
      } catch {
        setSaveStatus('idle');
      }
    }, 250);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allFields: Record<string, boolean> = {};
    Object.keys(form).forEach((k) => {
      allFields[k] = true;
    });
    setTouched(allFields);

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const normalizedLinkedIn = form.linkedinUrl.trim().startsWith('http')
      ? form.linkedinUrl.trim()
      : `https://${form.linkedinUrl.trim()}`;

    try {
      const res = await apiClient.post('/mentors/apply', {
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        job_title: form.jobTitle.trim(),
        company_background: form.company.trim(),
        linkedin_url: normalizedLinkedIn,
        expertise_areas: form.domains,
        preferred_stages: form.preferredStages,
        years_of_experience: form.yearsOfExperience,
        availability_hours_per_month: form.hoursPerMonth,
        preferred_meeting_mode: form.preferredMeetingMode,
        timezone: form.timezone,
        bio: form.bio.trim(),
        organization_id: form.incubatorId,
        invited_via_org_id: inviteOrgId || null,
      });

      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_role', 'mentor');
      }

      setIsDirty(false);
      setSubmittedRecord(res.data?.data || { organization: selectedIncubator });
      router.push('/mentor/dashboard');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Unable to submit application right now. Your draft is saved safely—please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredDomains = useMemo(() => {
    const q = domainSearch.trim().toLowerCase();
    if (!q) return CURATED_DOMAINS;
    return CURATED_DOMAINS.filter((d) => d.toLowerCase().includes(q));
  }, [domainSearch]);

  const filteredIncubators = useMemo(() => {
    const q = incubatorSearch.trim().toLowerCase();
    if (!q) return incubators;
    return incubators.filter(
      (inc) =>
        inc.name.toLowerCase().includes(q) ||
        (inc.city && inc.city.toLowerCase().includes(q)) ||
        (inc.state && inc.state.toLowerCase().includes(q))
    );
  }, [incubators, incubatorSearch]);

  const activeStatusRecord = submittedRecord || existingApplication;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Slim Top Navigation Bar matching Arba360 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size="md" href="/" />
            <span className="hidden md:inline-block text-slate-300">/</span>
            <span className="hidden md:inline-block text-xs font-medium text-slate-500 truncate">
              Mentor Application
            </span>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Log out</span>
          </button>
        </div>
      </header>

      {/* Loading State */}
      {checkingAccess ? (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
          <span className="text-sm font-medium">Checking application status...</span>
        </div>
      ) : unauthorizedRole ? (
        /* Role Guard */
        <main className="max-w-lg mx-auto px-4 py-16">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <h1 className="text-lg font-semibold text-[#1A2151]">
              Mentor access required
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Your current account is signed in with the{' '}
              <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                {unauthorizedRole}
              </span>{' '}
              role. Please switch to a mentor account to submit a mentor application.
            </p>
            <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between gap-3">
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Back to home
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                Switch account
              </button>
            </div>
          </div>
        </main>
      ) : activeStatusRecord ? (
        /* Submitted / Existing Application Status View */
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          {submittedRecord && (
            <div className="mb-6 bg-white border border-emerald-300 rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Application submitted — {activeStatusRecord.organization?.name || selectedIncubator?.name || 'your incubator'} has been notified
                </p>
                <p className="text-xs text-slate-500">
                  Your mentor profile is now queued for review.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div
                  className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium mb-2.5 border ${
                    activeStatusRecord.is_active
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activeStatusRecord.is_active ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {activeStatusRecord.is_active ? 'Application status: approved' : 'Application status: pending review'}
                </div>
                <h1 className="text-xl font-semibold text-[#1A2151]">
                  {form.fullName ? `Welcome, ${form.fullName}` : 'Mentor Application Received'}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Target incubator:{' '}
                  <span className="font-medium text-slate-900">
                    {activeStatusRecord.organization?.name || selectedIncubator?.name || 'Incubator Organization'}
                  </span>
                </p>
              </div>

              <Link
                href="/"
                className="self-start sm:self-center px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
              >
                Back to Arba360
              </Link>
            </div>

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Background
                </span>
                <p className="font-medium text-slate-900">
                  {activeStatusRecord.availability_json?.job_title || form.jobTitle || 'Mentor'}{' '}
                  {activeStatusRecord.company_background ? `at ${activeStatusRecord.company_background}` : ''}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {activeStatusRecord.years_of_experience || form.yearsOfExperience || 0}+ yrs experience ·{' '}
                  {activeStatusRecord.availability_hours_per_month || form.hoursPerMonth} hrs/month
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Focus &amp; Availability
                </span>
                <p className="font-medium text-slate-900 truncate">
                  {Array.isArray(activeStatusRecord.expertise_areas)
                    ? activeStatusRecord.expertise_areas.join(', ')
                    : form.domains.join(', ')}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Stages: {activeStatusRecord.industry_experience || form.preferredStages.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* Main Mentor Application Form */
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN: Sticky Context & 3-Step Guide */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-600 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <span>Mentor onboarding</span>
              </div>

              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#1A2151]">
                Apply as a mentor
              </h1>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Share your operator background and availability to support founders in an incubator cohort.
              </p>

              {/* Mobile Compact Stepper */}
              <div className="mt-5 lg:hidden bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#2563EB] whitespace-nowrap">1 Submit</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span className="font-medium text-slate-600 whitespace-nowrap">2 Incubator reviews</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span className="font-medium text-slate-600 whitespace-nowrap">3 Complete profile</span>
              </div>

              {/* Desktop Vertical 3-Step Guide */}
              <div className="hidden lg:block mt-8 pt-7 border-t border-slate-200">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                  What happens next
                </h2>

                <ol className="space-y-5">
                  <li className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Submit</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Send your core details and preferred incubator cohort.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Your incubator reviews</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        The program team evaluates domain fit and cohort capacity.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Complete your profile</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Configure scheduling preferences and match with cohort startups.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </aside>

            {/* RIGHT COLUMN: Single White Form Card */}
            <div className="lg:col-span-8 w-full max-w-2xl">
              <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-white border border-slate-200 rounded-xl shadow-xs"
              >
                {/* SECTION 1: ABOUT YOU */}
                <section className="p-6 sm:p-8">
                  <div className="mb-5">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      1. About you
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Full name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        value={form.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        onBlur={() => markTouched('fullName')}
                        placeholder="Aarav Mehta"
                        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] transition-colors ${
                          touched.fullName && errors.fullName ? 'border-rose-400' : 'border-slate-200'
                        }`}
                      />
                      {touched.fullName && errors.fullName && (
                        <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email <span className="text-rose-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          value={form.email}
                          readOnly
                          disabled
                          aria-readonly="true"
                          className="w-full pl-3 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed select-all"
                        />
                        <Lock
                          className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2"
                          aria-label="Locked account email"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">Linked to your Arba360 login</p>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Phone <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        onBlur={() => markTouched('phone')}
                        placeholder="+91 98201 44210"
                        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] transition-colors ${
                          touched.phone && errors.phone ? 'border-rose-400' : 'border-slate-200'
                        }`}
                      />
                      {touched.phone && errors.phone && (
                        <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Job title <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="jobTitle"
                        type="text"
                        value={form.jobTitle}
                        onChange={(e) => updateField('jobTitle', e.target.value)}
                        onBlur={() => markTouched('jobTitle')}
                        placeholder="VP of Product"
                        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] transition-colors ${
                          touched.jobTitle && errors.jobTitle ? 'border-rose-400' : 'border-slate-200'
                        }`}
                      />
                      {touched.jobTitle && errors.jobTitle && (
                        <p className="mt-1 text-xs text-rose-600">{errors.jobTitle}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Company <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="company"
                        type="text"
                        value={form.company}
                        onChange={(e) => updateField('company', e.target.value)}
                        onBlur={() => markTouched('company')}
                        placeholder="Razorpay"
                        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] transition-colors ${
                          touched.company && errors.company ? 'border-rose-400' : 'border-slate-200'
                        }`}
                      />
                      {touched.company && errors.company && (
                        <p className="mt-1 text-xs text-rose-600">{errors.company}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="linkedinUrl" className="block text-sm font-medium text-slate-700 mb-1.5">
                        LinkedIn URL <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="linkedinUrl"
                        type="url"
                        value={form.linkedinUrl}
                        onChange={(e) => updateField('linkedinUrl', e.target.value)}
                        onBlur={() => markTouched('linkedinUrl')}
                        placeholder="https://linkedin.com/in/your-profile"
                        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] transition-colors ${
                          touched.linkedinUrl && errors.linkedinUrl ? 'border-rose-400' : 'border-slate-200'
                        }`}
                      />
                      {touched.linkedinUrl && errors.linkedinUrl && (
                        <p className="mt-1 text-xs text-rose-600">{errors.linkedinUrl}</p>
                      )}
                    </div>
                  </div>
                </section>

                {/* SECTION 2: EXPERTISE */}
                <section className="p-6 sm:p-8 border-t border-slate-200">
                  <div className="mb-5">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      2. Expertise
                    </h2>
                  </div>

                  <div className="space-y-5">
                    <div ref={domainContainerRef} className="relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="domainSearchInput" className="block text-sm font-medium text-slate-700">
                          Domains <span className="text-rose-600">*</span>
                        </label>
                        <span className="text-xs font-medium text-slate-500 tabular-nums">
                          {form.domains.length}/3 selected
                        </span>
                      </div>

                      <div
                        onClick={() => setDomainDropdownOpen(true)}
                        className={`min-h-[42px] px-2.5 py-1.5 bg-white border rounded-lg flex flex-wrap items-center gap-1.5 cursor-text transition-colors ${
                          domainDropdownOpen
                            ? 'border-[#2563EB]'
                            : touched.domains && errors.domains
                            ? 'border-rose-400'
                            : 'border-slate-200'
                        }`}
                      >
                        {form.domains.map((domain) => (
                          <span
                            key={domain}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium"
                          >
                            <span>{domain}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDomain(domain);
                              }}
                              className="text-blue-500 hover:text-blue-800 focus:outline-none"
                              aria-label={`Remove ${domain}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}

                        <div className="flex-1 min-w-[140px] flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <input
                            id="domainSearchInput"
                            type="text"
                            value={domainSearch}
                            onFocus={() => setDomainDropdownOpen(true)}
                            onChange={(e) => {
                              setDomainSearch(e.target.value);
                              setDomainDropdownOpen(true);
                            }}
                            placeholder={
                              form.domains.length >= 3 ? 'Maximum 3 domains selected' : 'Search domains...'
                            }
                            className="w-full text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      {domainDropdownOpen && (
                        <div className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto py-1">
                          {filteredDomains.length === 0 ? (
                            <div className="px-3 py-2.5 text-xs text-slate-500">No matching domains found.</div>
                          ) : (
                            filteredDomains.map((domain) => {
                              const isSelected = form.domains.includes(domain);
                              const isDisabled = !isSelected && form.domains.length >= 3;
                              return (
                                <button
                                  key={domain}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => {
                                    toggleDomain(domain);
                                    setDomainSearch('');
                                  }}
                                  className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                                    isSelected
                                      ? 'bg-blue-50/70 text-[#2563EB] font-medium'
                                      : isDisabled
                                      ? 'text-slate-300 cursor-not-allowed'
                                      : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{domain}</span>
                                  {isSelected && <Check className="w-4 h-4 text-[#2563EB]" />}
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}

                      {touched.domains && errors.domains && (
                        <p className="mt-1 text-xs text-rose-600">{errors.domains}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Preferred startup stages <span className="text-rose-600">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {STARTUP_STAGES.map((stage) => {
                          const active = form.preferredStages.includes(stage);
                          return (
                            <button
                              key={stage}
                              type="button"
                              onClick={() => toggleStage(stage)}
                              aria-pressed={active}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                                active
                                  ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {stage}
                            </button>
                          );
                        })}
                      </div>
                      {touched.preferredStages && errors.preferredStages && (
                        <p className="mt-1.5 text-xs text-rose-600">{errors.preferredStages}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Years of experience <span className="text-rose-600">*</span>
                      </label>
                      <div className="inline-flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => adjustExperience(-1)}
                          disabled={form.yearsOfExperience <= 1}
                          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:hover:bg-white border-r border-slate-200 transition-colors cursor-pointer"
                          aria-label="Decrease years of experience"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          id="yearsOfExperience"
                          type="number"
                          min={1}
                          max={50}
                          value={form.yearsOfExperience}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            updateField('yearsOfExperience', Number.isNaN(val) ? 1 : val);
                          }}
                          onBlur={() => markTouched('yearsOfExperience')}
                          className="w-16 h-9 text-center text-sm font-medium text-slate-900 tabular-nums focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => adjustExperience(1)}
                          disabled={form.yearsOfExperience >= 50}
                          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:hover:bg-white border-l border-slate-200 transition-colors cursor-pointer"
                          aria-label="Increase years of experience"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="ml-3 text-xs text-slate-500">
                        {form.yearsOfExperience === 1 ? '1 year' : `${form.yearsOfExperience} years`} of operating or leadership experience
                      </span>
                      {touched.yearsOfExperience && errors.yearsOfExperience && (
                        <p className="mt-1 text-xs text-rose-600">{errors.yearsOfExperience}</p>
                      )}
                    </div>
                  </div>
                </section>

                {/* SECTION 3: AVAILABILITY */}
                <section className="p-6 sm:p-8 border-t border-slate-200">
                  <div className="mb-5">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      3. Availability
                    </h2>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="hoursPerMonth" className="text-sm font-medium text-slate-700">
                          Hours per month <span className="text-rose-600">*</span>
                        </label>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold tabular-nums">
                          <Clock className="w-3 h-3" />
                          {form.hoursPerMonth} hrs / month
                        </span>
                      </div>

                      <input
                        id="hoursPerMonth"
                        type="range"
                        min={2}
                        max={40}
                        step={2}
                        value={form.hoursPerMonth}
                        onChange={(e) => updateField('hoursPerMonth', parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400 tabular-nums mt-1">
                        <span>2 hrs</span>
                        <span>10 hrs</span>
                        <span>20 hrs</span>
                        <span>30 hrs</span>
                        <span>40 hrs</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Preferred meeting mode <span className="text-rose-600">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-lg">
                          {(
                            [
                              { value: 'video', label: 'Video' },
                              { value: 'in_person', label: 'In person' },
                              { value: 'both', label: 'Both' },
                            ] as const
                          ).map((option) => {
                            const active = form.preferredMeetingMode === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => updateField('preferredMeetingMode', option.value)}
                                className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                  active
                                    ? 'bg-white text-[#2563EB] border border-slate-200 shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900 border border-transparent'
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="timezone" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Timezone <span className="text-rose-600">*</span>
                        </label>
                        <div className="relative">
                          <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <select
                            id="timezone"
                            value={form.timezone}
                            onChange={(e) => updateField('timezone', e.target.value)}
                            className="w-full pl-8 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 appearance-none focus:outline-none focus:border-[#2563EB]"
                          >
                            {COMMON_TIMEZONES.map((tz) => (
                              <option key={tz.value} value={tz.value}>
                                {tz.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 4: ABOUT */}
                <section className="p-6 sm:p-8 border-t border-slate-200">
                  <div className="mb-5">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      4. About
                    </h2>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
                        Short bio <span className="text-rose-600">*</span>
                      </label>
                      <span
                        className={`text-xs tabular-nums ${
                          form.bio.length > 460 ? 'text-amber-600 font-medium' : 'text-slate-400'
                        }`}
                      >
                        {form.bio.length} / 500
                      </span>
                    </div>

                    <textarea
                      id="bio"
                      rows={4}
                      maxLength={500}
                      value={form.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      onBlur={() => markTouched('bio')}
                      placeholder="Built and scaled B2B payments products at Razorpay. I work with seed-stage founders on product-market fit, pricing strategy, and early enterprise sales."
                      className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] transition-colors resize-none ${
                        touched.bio && errors.bio ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                      Highlight your operator experience, functional strengths, and the types of founders you help best.
                    </p>

                    {touched.bio && errors.bio && (
                      <p className="mt-1 text-xs text-rose-600">{errors.bio}</p>
                    )}
                  </div>
                </section>

                {/* SECTION 5: INCUBATOR */}
                <section className="p-6 sm:p-8 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      5. Incubator
                    </h2>
                    {invitedOrg && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-medium">
                        <Lock className="w-3 h-3" />
                        <span>Invited by {invitedOrg.name}</span>
                      </span>
                    )}
                  </div>

                  {invitedOrg ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Target incubator <span className="text-rose-600">*</span>
                      </label>
                      <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Building2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                          <div className="truncate">
                            <span className="text-sm font-medium text-slate-900">{invitedOrg.name}</span>
                            {(invitedOrg.city || invitedOrg.state) && (
                              <span className="text-xs text-slate-500 ml-2">
                                {[invitedOrg.city, invitedOrg.state].filter(Boolean).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500">
                        Preselected and locked from your invitation link.
                      </p>
                    </div>
                  ) : (
                    <div ref={incubatorContainerRef} className="relative">
                      <label htmlFor="incubatorSearchInput" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Select incubator <span className="text-rose-600">*</span>
                      </label>

                      <button
                        id="incubatorSearchInput"
                        type="button"
                        onClick={() => {
                          setIncubatorDropdownOpen((prev) => !prev);
                          markTouched('incubatorId');
                        }}
                        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg flex items-center justify-between gap-2 text-left transition-colors cursor-pointer ${
                          incubatorDropdownOpen
                            ? 'border-[#2563EB]'
                            : touched.incubatorId && errors.incubatorId
                            ? 'border-rose-400'
                            : 'border-slate-200'
                        }`}
                      >
                        {selectedIncubator ? (
                          <span className="text-slate-900 font-medium truncate">
                            {selectedIncubator.name}
                            {(selectedIncubator.city || selectedIncubator.state) && (
                              <span className="text-slate-400 font-normal">
                                {' '}
                                — {[selectedIncubator.city, selectedIncubator.state].filter(Boolean).join(', ')}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {loadingIncubators ? 'Loading incubators...' : 'Search and select an incubator...'}
                          </span>
                        )}
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>

                      {incubatorDropdownOpen && (
                        <div className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-slate-200 flex items-center gap-2 bg-slate-50">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              autoFocus
                              value={incubatorSearch}
                              onChange={(e) => setIncubatorSearch(e.target.value)}
                              placeholder="Filter by incubator or city..."
                              className="w-full text-xs bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            />
                          </div>

                          <div className="max-h-52 overflow-y-auto py-1">
                            {loadingIncubators ? (
                              <div className="px-3 py-3 text-xs text-slate-400 flex items-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Loading active incubators...</span>
                              </div>
                            ) : filteredIncubators.length === 0 ? (
                              <div className="px-3 py-2.5 text-xs text-slate-500">
                                No matching incubators found.
                              </div>
                            ) : (
                              filteredIncubators.map((inc) => {
                                const isSelected = form.incubatorId === inc.id;
                                const locationLabel = [inc.city, inc.state].filter(Boolean).join(', ');
                                return (
                                  <button
                                    key={inc.id}
                                    type="button"
                                    onClick={() => {
                                      updateField('incubatorId', inc.id);
                                      setIncubatorDropdownOpen(false);
                                      setIncubatorSearch('');
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-blue-50/70 text-[#2563EB] font-medium'
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div>
                                      <span>{inc.name}</span>
                                      {locationLabel && (
                                        <span className="text-xs text-slate-400 ml-2">{locationLabel}</span>
                                      )}
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-[#2563EB]" />}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {touched.incubatorId && errors.incubatorId && (
                        <p className="mt-1 text-xs text-rose-600">{errors.incubatorId}</p>
                      )}
                    </div>
                  )}

                  <div className="mt-6 pt-5 border-t border-slate-200">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.acceptedTerms}
                        onChange={(e) => {
                          updateField('acceptedTerms', e.target.checked);
                          markTouched('acceptedTerms');
                        }}
                        className="mt-0.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed">
                        I agree to the{' '}
                        <span className="text-slate-900 font-medium underline decoration-slate-300 underline-offset-2">
                          Arba360 Mentor Code of Conduct
                        </span>{' '}
                        and founder confidentiality guidelines. <span className="text-rose-600">*</span>
                      </span>
                    </label>
                    {touched.acceptedTerms && errors.acceptedTerms && (
                      <p className="mt-1 text-xs text-rose-600 pl-6">{errors.acceptedTerms}</p>
                    )}
                  </div>

                  {submitError && (
                    <div
                      role="alert"
                      className="mt-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}
                </section>

                {/* STICKY FOOTER */}
                <footer className="sticky bottom-0 z-10 bg-white border-t border-slate-200 px-6 sm:px-8 py-4 rounded-b-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 min-h-[20px]">
                    {saveStatus === 'saving' && (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                        <span>Saving draft...</span>
                      </>
                    )}
                    {saveStatus === 'saved' && (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-slate-600">
                          Saved{lastSavedAt ? ` at ${lastSavedAt}` : ''}
                        </span>
                      </>
                    )}
                    {saveStatus === 'idle' && <span>Autosave enabled</span>}
                  </div>

                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={handleManualSaveDraft}
                      className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
                    >
                      Save draft
                    </button>

                    <button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors min-w-[162px] cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit application</span>
                      )}
                    </button>
                  </div>
                </footer>
              </form>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default function MentorApplicationFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2563EB] mr-2" />
          Loading mentor application...
        </div>
      }
    >
      <MentorApplicationContent />
    </Suspense>
  );
}
