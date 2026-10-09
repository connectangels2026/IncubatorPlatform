'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Building2, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  DollarSign, 
  Calendar, 
  Globe, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Loader2, 
  Rocket,
  Check
} from 'lucide-react';
import Logo from '@/frontend/components/ui/Logo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function IncubatorApplyPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const searchParams = useSearchParams();
  const programQuery = searchParams.get('program') || 'incubator';
  const isPreIncubator = programQuery.toLowerCase().includes('pre');

  const [currentStep, setCurrentStep] = useState(1);
  const [incubator, setIncubator] = useState<any>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    location: '',
    role: 'Founder / CEO',
    startupName: '',
    industry: 'AI & DeepTech',
    stage: isPreIncubator ? 'Ideation' : 'MVP',
    oneLiner: '',
    problemStatement: '',
    solutionDescription: '',
    targetMarket: '',
    demoUrl: '',
    fundingNeeded: isPreIncubator ? '$25,000 - $50,000' : '$100,000 - $250,000',
    whyThisIncubator: '',
    agreed: true
  });

  // Load Incubator Info
  useEffect(() => {
    async function loadIncubator() {
      try {
        const res = await fetch('/api/v1/incubators');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const match = json.data.find((item: any) => 
            (item.slug && item.slug.toLowerCase() === slug.toLowerCase()) || 
            item.id === slug
          );
          if (match) {
            setIncubator(match);
          } else {
            // Friendly fallback format if slug isn't yet in DB
            setIncubator({
              id: slug,
              name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
              description: 'Enterprise Startup Incubation & Cohort Acceleration Program',
              city: 'San Francisco',
              state: 'CA',
              country: 'USA'
            });
          }
        }
      } catch (err) {
        console.error('Failed to load incubator details:', err);
      } finally {
        setIsLoadingOrg(false);
      }
    }
    loadIncubator();
  }, [slug]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!formData.applicantName || !formData.applicantEmail) {
        setErrorMsg('Please fill in your name and email to proceed.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.startupName || !formData.oneLiner) {
        setErrorMsg('Please provide your startup name and a brief pitch.');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.problemStatement || !formData.solutionDescription) {
        setErrorMsg('Please describe the problem and solution to continue.');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        incubator_slug: slug,
        organization_id: incubator?.id,
        application_type: isPreIncubator ? 'Pre-Incubator' : 'Incubator',
        cohort_name: isPreIncubator ? 'Pre-Incubation Cohort 2026' : 'Incubation Cohort 2026',
        applicant_name: formData.applicantName,
        applicant_email: formData.applicantEmail,
        applicant_phone: formData.applicantPhone,
        form_data: {
          ...formData,
          incubatorName: incubator?.name || 'Incubator'
        }
      };

      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit application');
      }

      setSubmittedData(json.data);
      setSubmissionSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const programTitle = isPreIncubator ? 'Pre-Incubator Program' : 'Incubator Accelerator';

  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-[#EDF2FA] text-slate-800 font-sans flex flex-col justify-between">
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-4 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Logo size="md" href="/" />
            <Link href="/incubators" className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Incubators
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-12 text-center w-full my-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl animate-fade-in-up">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-3">
              Application Successfully Dispatched
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2151] tracking-tight">
              Application Submitted to {incubator?.name}!
            </h1>

            <p className="text-slate-600 text-sm mt-3 leading-relaxed max-w-lg mx-auto">
              Your application for <strong>{formData.startupName || 'your startup'}</strong> has been registered in <strong>{incubator?.name}&apos;s</strong> intake dashboard.
            </p>

            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 mt-6 text-left text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Program Type</span>
                <span className="font-bold text-[#1A2151]">{programTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Applicant Name</span>
                <span className="font-bold text-slate-800">{formData.applicantName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Confirmation Sent To</span>
                <span className="font-bold text-blue-600">{formData.applicantEmail}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Application ID</span>
                <span className="font-mono font-bold text-slate-700">{submittedData?.id ? `${submittedData.id.slice(0, 8)}...` : 'REGISTERED'}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/incubators"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1A2151] hover:bg-blue-700 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
              >
                <span>Browse More Programs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </main>

        <footer className="text-center py-6 text-xs text-slate-500">
          &copy; 2026 Arba360 Incubator Operating System.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDF2FA] text-slate-800 font-sans flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="md" href="/" />
            <span className="text-slate-300 font-light">/</span>
            <Link href="/incubators" className="text-xs font-semibold text-slate-500 hover:text-blue-600 hidden sm:inline-block">
              Incubators
            </Link>
            <span className="text-slate-300 font-light hidden sm:inline-block">/</span>
            <span className="bg-blue-50 text-[#1A2151] border border-blue-200/80 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              {isPreIncubator ? <Layers className="w-3.5 h-3.5 text-blue-600" /> : <Building2 className="w-3.5 h-3.5 text-blue-600" />}
              {incubator?.name || 'Loading...'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border ${
              isPreIncubator 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {programTitle}
            </span>
            <Link
              href="/incubators"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition"
            >
              Exit
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Banner with Program Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                Official Cohort Intake
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {[incubator?.city, incubator?.state, incubator?.country].filter(Boolean).join(', ') || 'Global / Remote'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2151] tracking-tight">
              Apply to {incubator?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              {incubator?.description || 'Submit your startup pitch directly into this incubator’s evaluation committee.'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 self-stretch md:self-auto justify-around">
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Program</span>
              <span className="text-xs font-extrabold text-[#1A2151]">{isPreIncubator ? 'Pre-Incubator' : 'Incubator'}</span>
            </div>
            <div className="w-px h-7 bg-slate-200" />
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Intake</span>
              <span className="text-xs font-extrabold text-emerald-600">Active 2026</span>
            </div>
          </div>
        </div>

        {/* Progress Bar Indicator */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs mb-6">
          <div className="flex items-center justify-between mb-2 text-xs font-bold">
            <span className="text-[#1A2151]">
              Step {currentStep} of 4: {
                currentStep === 1 ? 'Founder & Team' :
                currentStep === 2 ? 'Startup Profile' :
                currentStep === 3 ? 'Product & Market' :
                'Review & Submission'
              }
            </span>
            <span className="text-blue-600">{currentStep * 25}% Completed</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300 rounded-full"
              style={{ width: `${currentStep * 25}%` }}
            />
          </div>
        </div>

        {/* Step Form Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          {errorMsg && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleNext}>
            {/* Step 1: Founder Information */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-[#1A2151]">Founder &amp; Contact Details</h2>
                  <p className="text-xs text-slate-500">Provide the lead founder or applicant contact details for committee notifications.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                      <input
                        type="text"
                        required
                        value={formData.applicantName}
                        onChange={(e) => handleInputChange('applicantName', e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Email *</label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                      <input
                        type="email"
                        required
                        value={formData.applicantEmail}
                        onChange={(e) => handleInputChange('applicantEmail', e.target.value)}
                        placeholder="sarah@startup.com"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                      <input
                        type="tel"
                        value={formData.applicantPhone}
                        onChange={(e) => handleInputChange('applicantPhone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Location / City</label>
                    <div className="relative flex items-center">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="San Francisco, CA"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Role in Startup</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 bg-white"
                  >
                    <option value="Founder / CEO">Founder / CEO</option>
                    <option value="Co-Founder / CTO">Co-Founder / CTO</option>
                    <option value="Product Lead">Product Lead</option>
                    <option value="Solo Entrepreneur">Solo Entrepreneur</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Startup Profile */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-[#1A2151]">Startup &amp; Sector Details</h2>
                  <p className="text-xs text-slate-500">Tell us what you are building and your sector focus.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Startup / Project Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.startupName}
                      onChange={(e) => handleInputChange('startupName', e.target.value)}
                      placeholder="e.g. NexaAI"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Industry Sector</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 bg-white"
                    >
                      <option value="AI & DeepTech">AI &amp; DeepTech</option>
                      <option value="FinTech">FinTech</option>
                      <option value="HealthTech">HealthTech</option>
                      <option value="Climate">Climate &amp; CleanTech</option>
                      <option value="SaaS">B2B SaaS</option>
                      <option value="EdTech">EdTech</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Startup Stage</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Ideation', 'MVP', 'Seed'].map((stage) => (
                      <button
                        type="button"
                        key={stage}
                        onClick={() => handleInputChange('stage', stage)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                          formData.stage === stage
                            ? 'bg-[#1A2151] text-white border-[#1A2151] shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">One-Line Elevator Pitch *</label>
                  <input
                    type="text"
                    required
                    value={formData.oneLiner}
                    onChange={(e) => handleInputChange('oneLiner', e.target.value)}
                    placeholder="We build X to help Y achieve Z through automated..."
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Product, Market & Traction */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-[#1A2151]">Problem, Solution &amp; Funding</h2>
                  <p className="text-xs text-slate-500">Explain the core market opportunity and what support you are seeking.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">What critical problem are you solving? *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.problemStatement}
                    onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                    placeholder="Describe the friction or unmet need in the market..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">How does your product solve this? *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.solutionDescription}
                    onChange={(e) => handleInputChange('solutionDescription', e.target.value)}
                    placeholder="Describe your technical innovation or product solution..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Demo / Website / Deck URL</label>
                    <div className="relative flex items-center">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5" />
                      <input
                        type="url"
                        value={formData.demoUrl}
                        onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                        placeholder="https://yourstartup.com/demo"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Grant / Funding Target</label>
                    <div className="relative flex items-center">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5" />
                      <input
                        type="text"
                        value={formData.fundingNeeded}
                        onChange={(e) => handleInputChange('fundingNeeded', e.target.value)}
                        placeholder="$50,000 - $150,000"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-[#1A2151]">Review Your Submission</h2>
                  <p className="text-xs text-slate-500">Please review your information before final transmission to {incubator?.name}.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200/70">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Incubator Organization</span>
                      <span className="font-extrabold text-[#1A2151] text-sm">{incubator?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Selected Program</span>
                      <span className="font-extrabold text-blue-600 text-sm">{programTitle}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Founder</span>
                      <span className="font-semibold text-slate-800">{formData.applicantName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                      <span className="font-semibold text-slate-800">{formData.applicantEmail}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Startup</span>
                      <span className="font-semibold text-slate-800">{formData.startupName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Industry &amp; Stage</span>
                      <span className="font-semibold text-slate-800">{formData.industry} • {formData.stage}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Pitch</span>
                    <p className="text-slate-700 italic">&ldquo;{formData.oneLiner}&rdquo;</p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={formData.agreed}
                      onChange={(e) => handleInputChange('agreed', e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      I confirm that the information provided is accurate and grant {incubator?.name} permission to review my startup proposal.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1A2151] hover:bg-blue-700 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting || !formData.agreed}
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-extrabold transition shadow-lg hover:shadow-cyan-500/25 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-500 border-t border-slate-200/80 bg-white/50">
        &copy; 2026 Arba360 Incubator Operating System. All applications are SSL encrypted and protected.
      </footer>
    </div>
  );
}
