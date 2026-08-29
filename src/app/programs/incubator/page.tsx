'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface FormData {
  // Section 1 - Idea Evaluation
  businessName: string;
  businessDescription: string;
  problemSolved: string;
  targetMarket: string;
  ideaStage: string;
  ideaValidation: string[];

  // Section 2 - Market Fit Validation
  customerProblems: string;
  customerSolutions: string;
  productMarketFit: string;
  customerFeedback: string;
  marketResearch: string[];

  // Section 3 - Scalability Validation
  scalabilityPlan: string;
  scalingChallenges: string;
  resourcesNeeded: string;
  growthProjection: string;
  scalabilityMetrics: string;

  // Section 4 - Product Validation
  productStatus: string;
  productFeatures: string;
  productDifferentiation: string;
  userTesting: string;
  productRoadmap: string;

  // Section 5 - Business Model Validation
  revenueModel: string;
  customerAcquisitionCost: string;
  lifetimeValue: string;
  profitabilityTimeline: string;
  businessModelValidation: string;

  // Section 6 - Financial Projection
  projectedRevenue6M: string;
  projectedRevenue12M: string;
  fundingRequired: string;
  fundingUse: string[];
  financialAssumptions: string;

  // Section 7 - Founder Skills Validation
  founderBackground: string;
  founderExpertise: string;
  teamCompletion: string;
  skillGaps: string[];
  leadershipExperience: string;
}

const INITIAL_FORM_DATA: FormData = {
  businessName: "",
  businessDescription: "",
  problemSolved: "",
  targetMarket: "",
  ideaStage: "",
  ideaValidation: [],

  customerProblems: "",
  customerSolutions: "",
  productMarketFit: "",
  customerFeedback: "",
  marketResearch: [],

  scalabilityPlan: "",
  scalingChallenges: "",
  resourcesNeeded: "",
  growthProjection: "",
  scalabilityMetrics: "",

  productStatus: "",
  productFeatures: "",
  productDifferentiation: "",
  userTesting: "",
  productRoadmap: "",

  revenueModel: "",
  customerAcquisitionCost: "",
  lifetimeValue: "",
  profitabilityTimeline: "",
  businessModelValidation: "",

  projectedRevenue6M: "",
  projectedRevenue12M: "",
  fundingRequired: "",
  fundingUse: [],
  financialAssumptions: "",

  founderBackground: "",
  founderExpertise: "",
  teamCompletion: "",
  skillGaps: [],
  leadershipExperience: "",
};

export default function IncubatorForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (Math.min(7, prev + 1)) as FormStep);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => (Math.max(1, prev - 1)) as FormStep);
    window.scrollTo(0, 0);
  };

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

    switch (step) {
      case 1:
        if (!formData.businessName) {
          newErrors.businessName = "Please tell us your business name";
        } else if (formData.businessName.length < 2) {
          newErrors.businessName = "Business name must be at least 2 characters";
        } else if (formData.businessName.length > 100) {
          newErrors.businessName = "Business name must be less than 100 characters";
        }

        if (!formData.businessDescription) {
          newErrors.businessDescription = "Please describe your business";
        } else if (formData.businessDescription.length < 30) {
          newErrors.businessDescription = "Please provide a more detailed description (minimum 30 characters)";
        } else if (formData.businessDescription.length > 1000) {
          newErrors.businessDescription = "Business description must be less than 1000 characters";
        }

        if (!formData.problemSolved) {
          newErrors.problemSolved = "Please describe the problem you are solving";
        } else if (formData.problemSolved.length < 20) {
          newErrors.problemSolved = "Problem description must be at least 20 characters";
        }

        if (!formData.targetMarket) {
          newErrors.targetMarket = "Please describe your target market";
        } else if (formData.targetMarket.length < 20) {
          newErrors.targetMarket = "Target market description must be at least 20 characters";
        }

        if (!formData.ideaStage) newErrors.ideaStage = "Please select your business stage";
        if (formData.ideaValidation.length === 0) newErrors.ideaValidation = "Please select at least one validation method";
        break;

      case 2:
        if (!formData.customerProblems) {
          newErrors.customerProblems = "Please describe customer problems";
        } else if (formData.customerProblems.length < 20) {
          newErrors.customerProblems = "Customer problems must be at least 20 characters";
        }

        if (!formData.customerSolutions) {
          newErrors.customerSolutions = "Please describe how customers currently solve this";
        } else if (formData.customerSolutions.length < 20) {
          newErrors.customerSolutions = "Solutions must be at least 20 characters";
        }

        if (!formData.productMarketFit) newErrors.productMarketFit = "Please rate your product-market fit";
        if (!formData.customerFeedback) {
          newErrors.customerFeedback = "Please share customer feedback";
        } else if (formData.customerFeedback.length < 20) {
          newErrors.customerFeedback = "Feedback must be at least 20 characters";
        }

        if (formData.marketResearch.length === 0) newErrors.marketResearch = "Please select your market research methods";
        break;

      case 3:
        if (!formData.scalabilityPlan) {
          newErrors.scalabilityPlan = "Please describe your scalability plan";
        } else if (formData.scalabilityPlan.length < 30) {
          newErrors.scalabilityPlan = "Scalability plan must be at least 30 characters";
        }

        if (!formData.scalingChallenges) {
          newErrors.scalingChallenges = "Please describe potential scaling challenges";
        } else if (formData.scalingChallenges.length < 20) {
          newErrors.scalingChallenges = "Scaling challenges must be at least 20 characters";
        }

        if (!formData.resourcesNeeded) {
          newErrors.resourcesNeeded = "Please describe resources needed for scaling";
        } else if (formData.resourcesNeeded.length < 20) {
          newErrors.resourcesNeeded = "Resources needed must be at least 20 characters";
        }

        if (!formData.growthProjection) {
          newErrors.growthProjection = "Please share your growth projection";
        } else if (formData.growthProjection.length < 20) {
          newErrors.growthProjection = "Growth projection must be at least 20 characters";
        }

        if (!formData.scalabilityMetrics) newErrors.scalabilityMetrics = "Please select your scalability metrics";
        break;

      case 4:
        if (!formData.productStatus) newErrors.productStatus = "Please select your product status";

        if (!formData.productFeatures) {
          newErrors.productFeatures = "Please describe your key product features";
        } else if (formData.productFeatures.length < 20) {
          newErrors.productFeatures = "Product features must be at least 20 characters";
        }

        if (!formData.productDifferentiation) {
          newErrors.productDifferentiation = "Please describe what makes your product unique";
        } else if (formData.productDifferentiation.length < 20) {
          newErrors.productDifferentiation = "Product differentiation must be at least 20 characters";
        }

        if (!formData.userTesting) {
          newErrors.userTesting = "Please share your user testing results";
        } else if (formData.userTesting.length < 20) {
          newErrors.userTesting = "User testing results must be at least 20 characters";
        }

        if (!formData.productRoadmap) {
          newErrors.productRoadmap = "Please describe your product roadmap";
        } else if (formData.productRoadmap.length < 20) {
          newErrors.productRoadmap = "Product roadmap must be at least 20 characters";
        }
        break;

      case 5:
        if (!formData.revenueModel) {
          newErrors.revenueModel = "Please describe your revenue model";
        } else if (formData.revenueModel.length < 20) {
          newErrors.revenueModel = "Revenue model must be at least 20 characters";
        }

        if (!formData.customerAcquisitionCost) {
          newErrors.customerAcquisitionCost = "Please estimate your customer acquisition cost";
        } else if (formData.customerAcquisitionCost.length < 5) {
          newErrors.customerAcquisitionCost = "Please provide a valid estimate";
        }

        if (!formData.lifetimeValue) {
          newErrors.lifetimeValue = "Please estimate customer lifetime value";
        } else if (formData.lifetimeValue.length < 5) {
          newErrors.lifetimeValue = "Please provide a valid estimate";
        }

        if (!formData.profitabilityTimeline) newErrors.profitabilityTimeline = "Please select your profitability timeline";

        if (!formData.businessModelValidation) {
          newErrors.businessModelValidation = "Please describe your business model validation";
        } else if (formData.businessModelValidation.length < 20) {
          newErrors.businessModelValidation = "Validation must be at least 20 characters";
        }
        break;

      case 6:
        if (!formData.projectedRevenue6M) {
          newErrors.projectedRevenue6M = "Please project your 6-month revenue";
        } else if (formData.projectedRevenue6M.length < 5) {
          newErrors.projectedRevenue6M = "Please provide a valid projection";
        }

        if (!formData.projectedRevenue12M) {
          newErrors.projectedRevenue12M = "Please project your 12-month revenue";
        } else if (formData.projectedRevenue12M.length < 5) {
          newErrors.projectedRevenue12M = "Please provide a valid projection";
        }

        if (!formData.fundingRequired) {
          newErrors.fundingRequired = "Please specify funding required";
        } else if (formData.fundingRequired.length < 5) {
          newErrors.fundingRequired = "Please provide a valid amount";
        }

        if (formData.fundingUse.length === 0) newErrors.fundingUse = "Please select how you will use the funding";

        if (!formData.financialAssumptions) {
          newErrors.financialAssumptions = "Please describe your financial assumptions";
        } else if (formData.financialAssumptions.length < 20) {
          newErrors.financialAssumptions = "Assumptions must be at least 20 characters";
        }
        break;

      case 7:
        if (!formData.founderBackground) {
          newErrors.founderBackground = "Please describe your background";
        } else if (formData.founderBackground.length < 20) {
          newErrors.founderBackground = "Background must be at least 20 characters";
        }

        if (!formData.founderExpertise) {
          newErrors.founderExpertise = "Please describe your expertise";
        } else if (formData.founderExpertise.length < 20) {
          newErrors.founderExpertise = "Expertise must be at least 20 characters";
        }

        if (!formData.teamCompletion) {
          newErrors.teamCompletion = "Please describe your team";
        } else if (formData.teamCompletion.length < 20) {
          newErrors.teamCompletion = "Team description must be at least 20 characters";
        }

        if (formData.skillGaps.length === 0) newErrors.skillGaps = "Please select skills you need to develop";

        if (!formData.leadershipExperience) {
          newErrors.leadershipExperience = "Please describe your leadership experience";
        } else if (formData.leadershipExperience.length < 20) {
          newErrors.leadershipExperience = "Leadership experience must be at least 20 characters";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateStep(7)) {
      setSubmitted(true);
      console.log("Form submitted:", formData);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          <p className="mt-4 text-slate-400">Loading form...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return <SubmissionSuccess />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/programs" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xl font-bold">Incubator Program</span>
          </Link>
          <div className="text-sm text-slate-400">Section {currentStep} of 7</div>
        </div>
      </nav>

      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold">{getSectionTitle(currentStep)}</h2>
              <div className="text-sm text-slate-400">{Math.round((currentStep / 7) * 100)}%</div>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
            {renderFormSection(currentStep, formData, setFormData, errors)}
          </div>

          <div className="flex gap-4 mt-8">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 7 ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Application
              </Button>
            )}
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-400/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-400">Please fill in the required details</p>
                <p className="text-sm text-amber-300 mt-1">We noticed some fields are incomplete. Please review and complete all required information before proceeding.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-slate-700 py-8 px-4 bg-slate-900 mt-20">
        <div className="max-w-4xl mx-auto text-center text-slate-400 text-sm">
          <p>Nurture Cave - Incubator Program Application</p>
          <p className="mt-2">Comprehensive validation of your startup | Section {currentStep} of 7</p>
        </div>
      </footer>
    </div>
  );
}

function getSectionTitle(step: FormStep): string {
  const titles: Record<FormStep, string> = {
    1: "Idea Evaluation",
    2: "Market Fit Validation",
    3: "Scalability Validation",
    4: "Product Validation",
    5: "Business Model Validation",
    6: "Financial Projection",
    7: "Founder Skills Validation",
  };
  return titles[step];
}

function renderFormSection(
  step: FormStep,
  formData: FormData,
  setFormData: (data: FormData) => void,
  errors: Record<string, string>
): React.ReactNode {
  switch (step) {
    case 1:
      return <Section1 formData={formData} setFormData={setFormData} errors={errors} />;
    case 2:
      return <Section2 formData={formData} setFormData={setFormData} errors={errors} />;
    case 3:
      return <Section3 formData={formData} setFormData={setFormData} errors={errors} />;
    case 4:
      return <Section4 formData={formData} setFormData={setFormData} errors={errors} />;
    case 5:
      return <Section5 formData={formData} setFormData={setFormData} errors={errors} />;
    case 6:
      return <Section6 formData={formData} setFormData={setFormData} errors={errors} />;
    case 7:
      return <Section7 formData={formData} setFormData={setFormData} errors={errors} />;
    default:
      return null;
  }
}

// Form Components
function FormInput({
  label,
  error,
  required = true,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; required?: boolean }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-2 bg-slate-700/50 border rounded-lg focus:outline-none transition ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
            : "border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50"
        } text-white placeholder-slate-500`}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

function FormTextarea({
  label,
  error,
  required = true,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string; required?: boolean }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full px-4 py-2 bg-slate-700/50 border rounded-lg focus:outline-none transition resize-none ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
            : "border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50"
        } text-white placeholder-slate-500`}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

function FormSelect({
  label,
  error,
  required = true,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; required?: boolean; options: { value: string; label: string }[] }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <select
        {...props}
        className={`w-full px-4 py-2 bg-slate-700/50 border rounded-lg focus:outline-none transition ${
          error ? "border-red-400 focus:border-red-500" : "border-slate-600 focus:border-cyan-400"
        } text-white`}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

function FormCheckboxGroup({
  label,
  error,
  required = true,
  options,
  value,
  onChange,
  max,
}: {
  label?: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (values: string[]) => void;
  max?: number;
}) {
  const handleChange = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      if (max && value.length >= max) return;
      onChange([...value, optValue]);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-3">
          {label} {required && <span className="text-red-400">*</span>}
          {max && <span className="text-slate-400 font-normal"> (Select up to {max})</span>}
        </label>
      )}
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={() => handleChange(opt.value)}
              disabled={!!(max && value.length >= max && !value.includes(opt.value))}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}

function FormRadioGroup({
  label,
  error,
  required = true,
  options,
  value,
  onChange,
}: {
  label?: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-3">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name={label}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="w-4 h-4 rounded-full border-slate-600 bg-slate-700/50 cursor-pointer"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}

// Section 1 - Idea Evaluation
function Section1({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormInput
        label="Business Name"
        value={formData.businessName}
        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
        placeholder="Your business name"
        error={errors.businessName}
      />

      <FormTextarea
        label="Business Description"
        rows={4}
        value={formData.businessDescription}
        onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
        placeholder="Describe what your business does in detail..."
        error={errors.businessDescription}
      />

      <FormTextarea
        label="Problem Solved"
        rows={3}
        value={formData.problemSolved}
        onChange={(e) => setFormData({ ...formData, problemSolved: e.target.value })}
        placeholder="What specific problem are you solving?"
        error={errors.problemSolved}
      />

      <FormTextarea
        label="Target Market"
        rows={3}
        value={formData.targetMarket}
        onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
        placeholder="Who is your target market? Be specific."
        error={errors.targetMarket}
      />

      <FormSelect
        label="Business Stage"
        value={formData.ideaStage}
        onChange={(e) => setFormData({ ...formData, ideaStage: e.target.value })}
        options={[
          { value: "MVP", label: "MVP Stage" },
          { value: "EarlyRevenue", label: "Early Revenue" },
          { value: "Growth", label: "Growth Stage" },
          { value: "Scaling", label: "Scaling Stage" },
        ]}
        error={errors.ideaStage}
      />

      <FormCheckboxGroup
        label="How have you validated this idea?"
        error={errors.ideaValidation}
        value={formData.ideaValidation}
        onChange={(val) => setFormData({ ...formData, ideaValidation: val })}
        options={[
          { value: "interviews", label: "Customer interviews" },
          { value: "surveys", label: "Surveys" },
          { value: "landing", label: "Landing page validation" },
          { value: "MVP", label: "MVP with real users" },
          { value: "revenue", label: "Early revenue" },
          { value: "partnerships", label: "Strategic partnerships" },
        ]}
      />
    </div>
  );
}

// Section 2 - Market Fit Validation
function Section2({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormTextarea
        label="Customer Problems"
        rows={3}
        value={formData.customerProblems}
        onChange={(e) => setFormData({ ...formData, customerProblems: e.target.value })}
        placeholder="Describe the problems your customers face..."
        error={errors.customerProblems}
      />

      <FormTextarea
        label="Current Customer Solutions"
        rows={3}
        value={formData.customerSolutions}
        onChange={(e) => setFormData({ ...formData, customerSolutions: e.target.value })}
        placeholder="How are customers currently solving this problem?"
        error={errors.customerSolutions}
      />

      <FormSelect
        label="Product-Market Fit Status"
        value={formData.productMarketFit}
        onChange={(e) => setFormData({ ...formData, productMarketFit: e.target.value })}
        options={[
          { value: "Exploring", label: "Still exploring" },
          { value: "Developing", label: "Developing fit" },
          { value: "Validating", label: "Validating fit" },
          { value: "Strong", label: "Strong fit achieved" },
        ]}
        error={errors.productMarketFit}
      />

      <FormTextarea
        label="Customer Feedback"
        rows={4}
        value={formData.customerFeedback}
        onChange={(e) => setFormData({ ...formData, customerFeedback: e.target.value })}
        placeholder="Share specific feedback from your customers..."
        error={errors.customerFeedback}
      />

      <FormCheckboxGroup
        label="Market Research Methods Used"
        error={errors.marketResearch}
        value={formData.marketResearch}
        onChange={(val) => setFormData({ ...formData, marketResearch: val })}
        options={[
          { value: "interviews", label: "Interviews" },
          { value: "surveys", label: "Surveys" },
          { value: "analytics", label: "Analytics" },
          { value: "competitor", label: "Competitor analysis" },
          { value: "industry", label: "Industry reports" },
          { value: "focus", label: "Focus groups" },
        ]}
      />
    </div>
  );
}

// Section 3 - Scalability Validation
function Section3({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormTextarea
        label="Scalability Plan"
        rows={4}
        value={formData.scalabilityPlan}
        onChange={(e) => setFormData({ ...formData, scalabilityPlan: e.target.value })}
        placeholder="How will you scale your business in the next 1-3 years?"
        error={errors.scalabilityPlan}
      />

      <FormTextarea
        label="Scaling Challenges"
        rows={3}
        value={formData.scalingChallenges}
        onChange={(e) => setFormData({ ...formData, scalingChallenges: e.target.value })}
        placeholder="What are the biggest challenges you might face while scaling?"
        error={errors.scalingChallenges}
      />

      <FormTextarea
        label="Resources Needed for Scaling"
        rows={3}
        value={formData.resourcesNeeded}
        onChange={(e) => setFormData({ ...formData, resourcesNeeded: e.target.value })}
        placeholder="What resources (people, capital, tech) will you need?"
        error={errors.resourcesNeeded}
      />

      <FormTextarea
        label="Growth Projection"
        rows={3}
        value={formData.growthProjection}
        onChange={(e) => setFormData({ ...formData, growthProjection: e.target.value })}
        placeholder="Describe your projected growth rate and milestones..."
        error={errors.growthProjection}
      />

      <FormSelect
        label="Key Scalability Metrics"
        value={formData.scalabilityMetrics}
        onChange={(e) => setFormData({ ...formData, scalabilityMetrics: e.target.value })}
        options={[
          { value: "Users", label: "User growth" },
          { value: "Revenue", label: "Revenue growth" },
          { value: "Retention", label: "Retention rate" },
          { value: "CAC", label: "Customer acquisition cost" },
          { value: "LTV", label: "Lifetime value" },
          { value: "Efficiency", label: "Operational efficiency" },
        ]}
        error={errors.scalabilityMetrics}
      />
    </div>
  );
}

// Section 4 - Product Validation
function Section4({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormSelect
        label="Current Product Status"
        value={formData.productStatus}
        onChange={(e) => setFormData({ ...formData, productStatus: e.target.value })}
        options={[
          { value: "Concept", label: "Concept/Prototype" },
          { value: "Beta", label: "Beta version" },
          { value: "Live", label: "Live with early users" },
          { value: "Production", label: "Production ready" },
        ]}
        error={errors.productStatus}
      />

      <FormTextarea
        label="Key Product Features"
        rows={3}
        value={formData.productFeatures}
        onChange={(e) => setFormData({ ...formData, productFeatures: e.target.value })}
        placeholder="What are your core product features?"
        error={errors.productFeatures}
      />

      <FormTextarea
        label="Product Differentiation"
        rows={3}
        value={formData.productDifferentiation}
        onChange={(e) => setFormData({ ...formData, productDifferentiation: e.target.value })}
        placeholder="What makes your product unique compared to competitors?"
        error={errors.productDifferentiation}
      />

      <FormTextarea
        label="User Testing & Feedback"
        rows={3}
        value={formData.userTesting}
        onChange={(e) => setFormData({ ...formData, userTesting: e.target.value })}
        placeholder="What has user testing revealed? Share specific feedback..."
        error={errors.userTesting}
      />

      <FormTextarea
        label="Product Roadmap"
        rows={3}
        value={formData.productRoadmap}
        onChange={(e) => setFormData({ ...formData, productRoadmap: e.target.value })}
        placeholder="What are your product plans for the next 6-12 months?"
        error={errors.productRoadmap}
      />
    </div>
  );
}

// Section 5 - Business Model Validation
function Section5({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormTextarea
        label="Revenue Model"
        rows={3}
        value={formData.revenueModel}
        onChange={(e) => setFormData({ ...formData, revenueModel: e.target.value })}
        placeholder="How do you make money? (e.g., subscription, one-time purchase, commission)"
        error={errors.revenueModel}
      />

      <FormInput
        label="Customer Acquisition Cost (CAC)"
        value={formData.customerAcquisitionCost}
        onChange={(e) => setFormData({ ...formData, customerAcquisitionCost: e.target.value })}
        placeholder="e.g., $50 per customer or $500 per customer"
        error={errors.customerAcquisitionCost}
      />

      <FormInput
        label="Customer Lifetime Value (LTV)"
        value={formData.lifetimeValue}
        onChange={(e) => setFormData({ ...formData, lifetimeValue: e.target.value })}
        placeholder="e.g., $500 or $5000"
        error={errors.lifetimeValue}
      />

      <FormSelect
        label="Profitability Timeline"
        value={formData.profitabilityTimeline}
        onChange={(e) => setFormData({ ...formData, profitabilityTimeline: e.target.value })}
        options={[
          { value: "Now", label: "Already profitable" },
          { value: "6M", label: "Within 6 months" },
          { value: "1Y", label: "Within 1 year" },
          { value: "2Y", label: "Within 2 years" },
          { value: "3Y+", label: "3+ years" },
        ]}
        error={errors.profitabilityTimeline}
      />

      <FormTextarea
        label="Business Model Validation"
        rows={3}
        value={formData.businessModelValidation}
        onChange={(e) => setFormData({ ...formData, businessModelValidation: e.target.value })}
        placeholder="How have you validated your business model?"
        error={errors.businessModelValidation}
      />
    </div>
  );
}

// Section 6 - Financial Projection
function Section6({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormInput
        label="Projected Revenue (6 Months)"
        value={formData.projectedRevenue6M}
        onChange={(e) => setFormData({ ...formData, projectedRevenue6M: e.target.value })}
        placeholder="e.g., $100,000 or €50,000"
        error={errors.projectedRevenue6M}
      />

      <FormInput
        label="Projected Revenue (12 Months)"
        value={formData.projectedRevenue12M}
        onChange={(e) => setFormData({ ...formData, projectedRevenue12M: e.target.value })}
        placeholder="e.g., $500,000 or €250,000"
        error={errors.projectedRevenue12M}
      />

      <FormInput
        label="Funding Required"
        value={formData.fundingRequired}
        onChange={(e) => setFormData({ ...formData, fundingRequired: e.target.value })}
        placeholder="e.g., $500,000 or €250,000"
        error={errors.fundingRequired}
      />

      <FormCheckboxGroup
        label="How will you use the funding?"
        error={errors.fundingUse}
        value={formData.fundingUse}
        onChange={(val) => setFormData({ ...formData, fundingUse: val })}
        options={[
          { value: "Product", label: "Product development" },
          { value: "Hiring", label: "Hiring and team" },
          { value: "Marketing", label: "Marketing and sales" },
          { value: "Operations", label: "Operations and infrastructure" },
          { value: "Working", label: "Working capital" },
          { value: "Expansion", label: "Geographic expansion" },
        ]}
      />

      <FormTextarea
        label="Financial Assumptions"
        rows={4}
        value={formData.financialAssumptions}
        onChange={(e) => setFormData({ ...formData, financialAssumptions: e.target.value })}
        placeholder="Explain the key assumptions behind your financial projections..."
        error={errors.financialAssumptions}
      />
    </div>
  );
}

// Section 7 - Founder Skills Validation
function Section7({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormTextarea
        label="Founder Background"
        rows={3}
        value={formData.founderBackground}
        onChange={(e) => setFormData({ ...formData, founderBackground: e.target.value })}
        placeholder="Describe your background, education, and professional history..."
        error={errors.founderBackground}
      />

      <FormTextarea
        label="Relevant Expertise"
        rows={3}
        value={formData.founderExpertise}
        onChange={(e) => setFormData({ ...formData, founderExpertise: e.target.value })}
        placeholder="What expertise do you have that is relevant to this business?"
        error={errors.founderExpertise}
      />

      <FormTextarea
        label="Team Composition"
        rows={3}
        value={formData.teamCompletion}
        onChange={(e) => setFormData({ ...formData, teamCompletion: e.target.value })}
        placeholder="Who is on your team? What are their roles and expertise?"
        error={errors.teamCompletion}
      />

      <FormCheckboxGroup
        label="Key Skills You Need to Develop"
        error={errors.skillGaps}
        value={formData.skillGaps}
        onChange={(val) => setFormData({ ...formData, skillGaps: val })}
        options={[
          { value: "Sales", label: "Sales and business development" },
          { value: "Marketing", label: "Marketing and branding" },
          { value: "Product", label: "Product management" },
          { value: "Finance", label: "Financial management" },
          { value: "Operations", label: "Operations and scaling" },
          { value: "Technology", label: "Technology and engineering" },
          { value: "Leadership", label: "Leadership and management" },
        ]}
      />

      <FormTextarea
        label="Leadership Experience"
        rows={3}
        value={formData.leadershipExperience}
        onChange={(e) => setFormData({ ...formData, leadershipExperience: e.target.value })}
        placeholder="Describe your leadership and team management experience..."
        error={errors.leadershipExperience}
      />
    </div>
  );
}

// Submission Success Component
function SubmissionSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Application Submitted Successfully!
        </h1>

        <p className="text-xl text-slate-300 mb-8">
          Thank you for submitting your Incubator Program Application.
        </p>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 mb-8">
          <p className="text-slate-300 mb-4">
            Our team will review your comprehensive submission and assess your startup readiness.
          </p>
          <p className="text-slate-300 mb-4">
            <strong>Next Steps:</strong>
          </p>
          <ul className="text-left space-y-2 text-slate-300 max-w-md mx-auto">
            <li>Check - We will conduct a detailed evaluation within 5-7 business days</li>
            <li>Check - If selected, we will schedule an interview with our team</li>
            <li>Check - You will receive detailed feedback and next steps</li>
            <li>Check - Selected startups will begin the 6-month incubation program</li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-slate-400">
            Keep an eye on your email for updates.
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 px-8 py-6 text-lg">
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-500 mt-8">
          Nurture Cave - Building Tomorrow Leaders Today
        </p>
      </div>
    </div>
  );
}
