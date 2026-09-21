'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';

type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  professionalStatus: string;
  experience: string;
  previousBusiness: string;
  reasonsForJoining: string[];
  businessStage: string;
  startedDate: string;
  legallyRegistered: string;
  operatingLocation: string;
  industry: string;
  businessOneSentence: string;
  businessDescription: string;
  problemStatement: string;
  targetAudience: string;
  currentSolution: string;
  inadequateReason: string;
  problemImportance: string;
  validationEvidence: string[];
  solutionDescription: string;
  differentiation: string;
  competitiveEdge: string;
  strongestAdvantage: string[];
  productAvailability: string;
  demoLink: string;
  idealCustomer: string;
  payingCustomer: string;
  marketSize: string;
  targetGeography: string[];
  topCompetitors: string;
  competitorStrengths: string;
  competitorWeaknesses: string;
  marketTiming: string;
  currentCustomers: string;
  payingCustomersCount: string;
  revenue12Months: string;
  revenue3Months: string;
  revenueGrowth: string;
  transactionValue: string;
  customerAcquisitionChannels: string[];
  customerAcquisitionChallenge: string;
  revenueModel: string;
  revenueStreams: string;
  grossMargin: string;
  monthlyExpenses: string;
  monthlyBurn: string;
  profitability: string;
  financialChallenge: string;
  weeklyHours: string;
  fullTimeStatus: string;
  preventFullTime: string;
  commitment: string;
  uncertaintyComfort: string;
  feedbackWillingness: string;
  founderDescription: string;
  personalChallenge: string;
  businessChallenge: string;
  founders: string;
  teamSize: string;
  missingSkills: string[];
  lookingForCoFounder: string;
  fundingRaised: string[];
  personalInvestment: string;
  seekingFunding: string;
  fundingAmount: string;
  fundingUse: string[];
  investmentReady: string;
  nurtureCaveGoals: string;
  supportAreas: string[];
  success90Days: string;
  success12Months: string;
  keyProblem: string;
  customerFeedback: string;
  businessModelFlexibility: string;
  responsibility: string;
  criticalFeedback: string;
  executionFocus: string;
  businessNumbers: string;
  idealCustomerUnderstanding: string;
  competitorUnderstanding: string;
  businessGoals: string;
  timeAvailability: string;
  accountabilityWillingness: string;
  failureReason: string;
  uncertainAssumption: string;
  failedAttempts: string;
  biggestMistake: string;
  avoidingAction: string;
  shutdownReason: string;
  whySelectUs: string;
  differentlyIfAccepted: string;
  whyBuildBusiness: string;
  futureVision: string;
  documents: File | null;
}

const INITIAL_FORM_DATA: FormData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  professionalStatus: "",
  experience: "",
  previousBusiness: "",
  reasonsForJoining: [],
  businessStage: "",
  startedDate: "",
  legallyRegistered: "",
  operatingLocation: "",
  industry: "",
  businessOneSentence: "",
  businessDescription: "",
  problemStatement: "",
  targetAudience: "",
  currentSolution: "",
  inadequateReason: "",
  problemImportance: "",
  validationEvidence: [],
  solutionDescription: "",
  differentiation: "",
  competitiveEdge: "",
  strongestAdvantage: [],
  productAvailability: "",
  demoLink: "",
  idealCustomer: "",
  payingCustomer: "",
  marketSize: "",
  targetGeography: [],
  topCompetitors: "",
  competitorStrengths: "",
  competitorWeaknesses: "",
  marketTiming: "",
  currentCustomers: "",
  payingCustomersCount: "",
  revenue12Months: "",
  revenue3Months: "",
  revenueGrowth: "",
  transactionValue: "",
  customerAcquisitionChannels: [],
  customerAcquisitionChallenge: "",
  revenueModel: "",
  revenueStreams: "",
  grossMargin: "",
  monthlyExpenses: "",
  monthlyBurn: "",
  profitability: "",
  financialChallenge: "",
  weeklyHours: "",
  fullTimeStatus: "",
  preventFullTime: "",
  commitment: "",
  uncertaintyComfort: "",
  feedbackWillingness: "",
  founderDescription: "",
  personalChallenge: "",
  businessChallenge: "",
  founders: "",
  teamSize: "",
  missingSkills: [],
  lookingForCoFounder: "",
  fundingRaised: [],
  personalInvestment: "",
  seekingFunding: "",
  fundingAmount: "",
  fundingUse: [],
  investmentReady: "",
  nurtureCaveGoals: "",
  supportAreas: [],
  success90Days: "",
  success12Months: "",
  keyProblem: "",
  customerFeedback: "",
  businessModelFlexibility: "",
  responsibility: "",
  criticalFeedback: "",
  executionFocus: "",
  businessNumbers: "",
  idealCustomerUnderstanding: "",
  competitorUnderstanding: "",
  businessGoals: "",
  timeAvailability: "",
  accountabilityWillingness: "",
  failureReason: "",
  uncertainAssumption: "",
  failedAttempts: "",
  biggestMistake: "",
  avoidingAction: "",
  shutdownReason: "",
  whySelectUs: "",
  differentlyIfAccepted: "",
  whyBuildBusiness: "",
  futureVision: "",
  documents: null,
};

export default function PreIncubatorForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev + 1) as FormStep);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => (Math.max(1, prev - 1)) as FormStep);
    window.scrollTo(0, 0);
  };

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Phone validation regex (international format)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    // URL validation regex
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

    switch (step) {
      case 1:
        if (!formData.fullName) {
          newErrors.fullName = "Please fill in your full name";
        } else if (formData.fullName.length < 2) {
          newErrors.fullName = "Name must be at least 2 characters long";
        } else if (formData.fullName.length > 100) {
          newErrors.fullName = "Name must be less than 100 characters";
        }

        if (!formData.email) {
          newErrors.email = "Please fill in your email address";
        } else if (!emailRegex.test(formData.email)) {
          newErrors.email = "Please enter a valid email address (e.g., john@example.com)";
        }

        if (!formData.phone) {
          newErrors.phone = "Please fill in your phone number";
        } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
          newErrors.phone = "Please enter a valid phone number (e.g., +971 50 123 4567 or +1 234 567 8900)";
        }

        if (!formData.location) newErrors.location = "Please select your location";
        if (!formData.professionalStatus) newErrors.professionalStatus = "Please tell us your current status";
        if (!formData.experience) newErrors.experience = "Please share your years of experience";
        if (!formData.previousBusiness) newErrors.previousBusiness = "Please let us know about your previous business experience";
        if (formData.reasonsForJoining.length === 0) newErrors.reasonsForJoining = "Please select at least one reason for joining";
        break;

      case 2:
        if (!formData.businessStage) newErrors.businessStage = "Please let us know what stage your business is at";
        if (!formData.startedDate) newErrors.startedDate = "Please tell us when you started working on this";
        if (!formData.legallyRegistered) newErrors.legallyRegistered = "Please let us know about your registration status";

        if (!formData.industry) {
          newErrors.industry = "Please let us know your industry";
        } else if (formData.industry.length > 100) {
          newErrors.industry = "Industry name must be less than 100 characters";
        }

        if (!formData.businessOneSentence) {
          newErrors.businessOneSentence = "Please describe your business in one sentence";
        } else if (formData.businessOneSentence.length < 10) {
          newErrors.businessOneSentence = "Please provide a more detailed one-sentence description";
        } else if (formData.businessOneSentence.length > 200) {
          newErrors.businessOneSentence = "One-sentence description must be less than 200 characters";
        }

        if (!formData.businessDescription) {
          newErrors.businessDescription = "Please provide details about your business";
        } else if (formData.businessDescription.length < 20) {
          newErrors.businessDescription = "Business description must be at least 20 characters";
        } else if (formData.businessDescription.length > 1000) {
          newErrors.businessDescription = "Business description must be less than 1000 characters";
        }

        if (!formData.operatingLocation) {
          newErrors.operatingLocation = "Please tell us where you are operating";
        } else if (formData.operatingLocation.length > 100) {
          newErrors.operatingLocation = "Location must be less than 100 characters";
        }
        break;

      case 3:
        if (!formData.problemStatement) {
          newErrors.problemStatement = "Please describe the problem you're solving";
        } else if (formData.problemStatement.length < 20) {
          newErrors.problemStatement = "Problem description must be at least 20 characters";
        } else if (formData.problemStatement.length > 1000) {
          newErrors.problemStatement = "Problem description must be less than 1000 characters";
        }

        if (!formData.targetAudience) {
          newErrors.targetAudience = "Please tell us who experiences this problem";
        } else if (formData.targetAudience.length < 20) {
          newErrors.targetAudience = "Target audience description must be at least 20 characters";
        } else if (formData.targetAudience.length > 1000) {
          newErrors.targetAudience = "Target audience description must be less than 1000 characters";
        }

        if (!formData.currentSolution) {
          newErrors.currentSolution = "Please share how people currently solve this problem";
        } else if (formData.currentSolution.length < 20) {
          newErrors.currentSolution = "Current solution description must be at least 20 characters";
        }

        if (!formData.problemImportance) newErrors.problemImportance = "Please rate how important this problem is";
        if (formData.validationEvidence.length === 0) newErrors.validationEvidence = "Please select how you have validated this problem";
        break;

      case 4:
        if (!formData.solutionDescription) {
          newErrors.solutionDescription = "Please describe what you are offering";
        } else if (formData.solutionDescription.length < 20) {
          newErrors.solutionDescription = "Solution description must be at least 20 characters";
        } else if (formData.solutionDescription.length > 1000) {
          newErrors.solutionDescription = "Solution description must be less than 1000 characters";
        }

        if (!formData.differentiation) {
          newErrors.differentiation = "Please tell us what makes you different";
        } else if (formData.differentiation.length < 20) {
          newErrors.differentiation = "Differentiation must be at least 20 characters";
        }

        if (!formData.competitiveEdge) {
          newErrors.competitiveEdge = "Please explain your competitive edge";
        } else if (formData.competitiveEdge.length < 20) {
          newErrors.competitiveEdge = "Competitive edge must be at least 20 characters";
        }

        if (formData.strongestAdvantage.length === 0) newErrors.strongestAdvantage = "Please select your strongest competitive advantage";
        if (!formData.productAvailability) newErrors.productAvailability = "Please let us know your product status";

        if (formData.demoLink && !urlRegex.test(formData.demoLink)) {
          newErrors.demoLink = "Please enter a valid URL (e.g., https://example.com)";
        }
        break;

      case 5:
        if (!formData.idealCustomer) {
          newErrors.idealCustomer = "Please describe your ideal customer";
        } else if (formData.idealCustomer.length < 20) {
          newErrors.idealCustomer = "Ideal customer description must be at least 20 characters";
        } else if (formData.idealCustomer.length > 1000) {
          newErrors.idealCustomer = "Ideal customer description must be less than 1000 characters";
        }

        if (!formData.payingCustomer) {
          newErrors.payingCustomer = "Please tell us who your paying customer is";
        } else if (formData.payingCustomer.length < 10) {
          newErrors.payingCustomer = "Paying customer description must be at least 10 characters";
        }

        if (!formData.marketSize) {
          newErrors.marketSize = "Please tell us your market size";
        } else if (formData.marketSize.length > 100) {
          newErrors.marketSize = "Market size must be less than 100 characters";
        }

        if (formData.targetGeography.length === 0) newErrors.targetGeography = "Please select at least one target geography";

        if (!formData.topCompetitors) {
          newErrors.topCompetitors = "Please share information about your competitors";
        } else if (formData.topCompetitors.length < 20) {
          newErrors.topCompetitors = "Competitor information must be at least 20 characters";
        } else if (formData.topCompetitors.length > 1000) {
          newErrors.topCompetitors = "Competitor information must be less than 1000 characters";
        }
        break;

      case 6:
        if (!formData.currentCustomers) newErrors.currentCustomers = "Please let us know your current customer count";
        if (!formData.revenueGrowth) newErrors.revenueGrowth = "Please tell us about your revenue status";
        if (formData.customerAcquisitionChannels.length === 0) newErrors.customerAcquisitionChannels = "Please select how you acquire customers";

        if (formData.payingCustomersCount && isNaN(Number(formData.payingCustomersCount))) {
          newErrors.payingCustomersCount = "Please enter a valid number";
        }
        break;

      case 7:
        if (!formData.revenueModel) {
          newErrors.revenueModel = "Please describe your revenue model";
        } else if (formData.revenueModel.length < 20) {
          newErrors.revenueModel = "Revenue model must be at least 20 characters";
        } else if (formData.revenueModel.length > 1000) {
          newErrors.revenueModel = "Revenue model must be less than 1000 characters";
        }

        if (!formData.profitability) newErrors.profitability = "Please let us know your profitability status";
        if (!formData.financialChallenge) newErrors.financialChallenge = "Please tell us your biggest financial challenge";
        break;

      case 8:
        if (!formData.weeklyHours) newErrors.weeklyHours = "Please let us know how many hours you can dedicate";
        if (!formData.fullTimeStatus) newErrors.fullTimeStatus = "Please let us know your full-time status";
        if (!formData.commitment) newErrors.commitment = "Please rate your commitment level";
        if (!formData.uncertaintyComfort) newErrors.uncertaintyComfort = "Please rate your comfort with uncertainty";
        if (!formData.feedbackWillingness) newErrors.feedbackWillingness = "Please rate your willingness to change";
        if (!formData.founderDescription) newErrors.founderDescription = "Please select a description that fits you";

        if (!formData.businessChallenge) {
          newErrors.businessChallenge = "Please tell us your biggest business challenge";
        } else if (formData.businessChallenge.length < 10) {
          newErrors.businessChallenge = "Business challenge must be at least 10 characters";
        } else if (formData.businessChallenge.length > 1000) {
          newErrors.businessChallenge = "Business challenge must be less than 1000 characters";
        }
        break;

      case 9:
        if (!formData.founders) {
          newErrors.founders = "Please tell us about your founding team";
        } else if (formData.founders.length < 10) {
          newErrors.founders = "Founder information must be at least 10 characters";
        } else if (formData.founders.length > 1000) {
          newErrors.founders = "Founder information must be less than 1000 characters";
        }

        if (!formData.teamSize) {
          newErrors.teamSize = "Please let us know your team size";
        } else if (isNaN(Number(formData.teamSize))) {
          newErrors.teamSize = "Please enter a valid number";
        } else if (Number(formData.teamSize) < 0) {
          newErrors.teamSize = "Team size cannot be negative";
        }

        if (formData.missingSkills.length === 0) newErrors.missingSkills = "Please select the skills you are looking for";
        break;

      case 10:
        if (!formData.seekingFunding) newErrors.seekingFunding = "Please let us know your funding status";
        if (!formData.investmentReady) newErrors.investmentReady = "Please let us know if you are investment-ready";

        if (formData.seekingFunding === "Yes") {
          if (!formData.fundingAmount) {
            newErrors.fundingAmount = "Please tell us the funding amount you are seeking";
          } else if (formData.fundingAmount.length > 100) {
            newErrors.fundingAmount = "Funding amount must be less than 100 characters";
          }

          if (formData.fundingUse.length === 0) {
            newErrors.fundingUse = "Please select what the funding will be used for";
          }
        }
        break;

      case 11:
        if (!formData.nurtureCaveGoals) {
          newErrors.nurtureCaveGoals = "Please tell us your goals for ARBA Accelerator";
        } else if (formData.nurtureCaveGoals.length < 20) {
          newErrors.nurtureCaveGoals = "Goals must be at least 20 characters";
        } else if (formData.nurtureCaveGoals.length > 1000) {
          newErrors.nurtureCaveGoals = "Goals must be less than 1000 characters";
        }

        if (formData.supportAreas.length === 0) newErrors.supportAreas = "Please select the areas you need support with";

        if (!formData.success90Days) {
          newErrors.success90Days = "Please describe your 90-day success metrics";
        } else if (formData.success90Days.length < 20) {
          newErrors.success90Days = "90-day metrics must be at least 20 characters";
        } else if (formData.success90Days.length > 1000) {
          newErrors.success90Days = "90-day metrics must be less than 1000 characters";
        }

        if (!formData.success12Months) {
          newErrors.success12Months = "Please describe your 12-month success metrics";
        } else if (formData.success12Months.length < 20) {
          newErrors.success12Months = "12-month metrics must be at least 20 characters";
        } else if (formData.success12Months.length > 1000) {
          newErrors.success12Months = "12-month metrics must be less than 1000 characters";
        }
        break;

      case 12:
        if (!formData.customerFeedback) newErrors.customerFeedback = "Please rate this statement";
        if (!formData.businessModelFlexibility) newErrors.businessModelFlexibility = "Please rate this statement";
        if (!formData.responsibility) newErrors.responsibility = "Please rate this statement";
        if (!formData.criticalFeedback) newErrors.criticalFeedback = "Please rate this statement";
        if (!formData.executionFocus) newErrors.executionFocus = "Please rate this statement";
        if (!formData.businessNumbers) newErrors.businessNumbers = "Please rate this statement";
        if (!formData.idealCustomerUnderstanding) newErrors.idealCustomerUnderstanding = "Please rate this statement";
        if (!formData.competitorUnderstanding) newErrors.competitorUnderstanding = "Please rate this statement";
        if (!formData.businessGoals) newErrors.businessGoals = "Please rate this statement";
        if (!formData.timeAvailability) newErrors.timeAvailability = "Please rate this statement";
        if (!formData.accountabilityWillingness) newErrors.accountabilityWillingness = "Please rate this statement";
        break;

      case 13:
        if (!formData.failureReason) {
          newErrors.failureReason = "Please share your thoughts on this";
        } else if (formData.failureReason.length < 20) {
          newErrors.failureReason = "This answer must be at least 20 characters";
        } else if (formData.failureReason.length > 1000) {
          newErrors.failureReason = "This answer must be less than 1000 characters";
        }

        if (!formData.uncertainAssumption) {
          newErrors.uncertainAssumption = "Please share your thoughts on this";
        } else if (formData.uncertainAssumption.length < 20) {
          newErrors.uncertainAssumption = "This answer must be at least 20 characters";
        } else if (formData.uncertainAssumption.length > 1000) {
          newErrors.uncertainAssumption = "This answer must be less than 1000 characters";
        }

        if (!formData.whySelectUs) {
          newErrors.whySelectUs = "Please tell us why we should select you";
        } else if (formData.whySelectUs.length < 20) {
          newErrors.whySelectUs = "This answer must be at least 20 characters";
        } else if (formData.whySelectUs.length > 1000) {
          newErrors.whySelectUs = "This answer must be less than 1000 characters";
        }
        break;

      case 14:
        if (!formData.whyBuildBusiness) {
          newErrors.whyBuildBusiness = "Please share your motivation";
        } else if (formData.whyBuildBusiness.length < 20) {
          newErrors.whyBuildBusiness = "Please share more about your motivation (minimum 20 characters)";
        } else if (formData.whyBuildBusiness.length > 500) {
          newErrors.whyBuildBusiness = "Please keep your answer to 500 characters or less";
        }

        if (!formData.futureVision) {
          newErrors.futureVision = "Please share your vision for the future";
        } else if (formData.futureVision.length < 10) {
          newErrors.futureVision = "Vision must be at least 10 characters";
        } else if (formData.futureVision.length > 200) {
          newErrors.futureVision = "Vision should be concise (maximum 200 characters)";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateStep(14)) {
      setSubmitted(true);
      console.log("Form submitted:", formData);
    }
  };

  if (submitted) {
    return <SubmissionSuccess />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/programs" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xl font-bold">ARBA Accelerator</span>
          </Link>
          <div className="text-sm text-slate-500">Section {currentStep} of 14</div>
        </div>
      </nav>

      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold">{getSectionTitle(currentStep)}</h2>
              <div className="text-sm text-slate-500">{Math.round((currentStep / 14) * 100)}%</div>
            </div>
            <div className="w-full bg-white rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 14) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-8">
            {renderFormSection(currentStep, formData, setFormData, errors)}
          </div>

          <div className="flex gap-4 mt-8">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex-1 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 14 ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
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
              <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-700">Please fill in the required details</p>
                <p className="text-sm text-amber-700 mt-1">We noticed some fields are incomplete. Please review and complete all required information before proceeding to the next section.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-slate-200 py-8 px-4 bg-white mt-20">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          <p>ARBA Accelerator - Founder & Business Incubation Prerequisite Questionnaire</p>
          <p className="mt-2">Estimated completion time: 15-20 minutes | Section {currentStep} of 14</p>
        </div>
      </footer>
    </div>
  );
}

function getSectionTitle(step: FormStep): string {
  const titles: Record<FormStep, string> = {
    1: "Founder Information",
    2: "Business Stage",
    3: "The Problem",
    4: "Your Solution",
    5: "Customer & Market",
    6: "Traction",
    7: "Business Model",
    8: "Founder Readiness",
    9: "Team",
    10: "Funding & Investment",
    11: "Incubation Requirements",
    12: "Founder Mindset",
    13: "Reality Check",
    14: "Final Founder Statement",
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
    case 8:
      return <Section8 formData={formData} setFormData={setFormData} errors={errors} />;
    case 9:
      return <Section9 formData={formData} setFormData={setFormData} errors={errors} />;
    case 10:
      return <Section10 formData={formData} setFormData={setFormData} errors={errors} />;
    case 11:
      return <Section11 formData={formData} setFormData={setFormData} errors={errors} />;
    case 12:
      return <Section12 formData={formData} setFormData={setFormData} errors={errors} />;
    case 13:
      return <Section13 formData={formData} setFormData={setFormData} errors={errors} />;
    case 14:
      return <Section14 formData={formData} setFormData={setFormData} errors={errors} />;
    default:
      return null;
  }
}

// Form Input Components
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
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none transition ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
            : "border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-500/50"
        } text-slate-900 placeholder-slate-400`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none transition resize-none ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
            : "border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-500/50"
        } text-slate-900 placeholder-slate-400`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        {...props}
        className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none transition ${
          error ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-blue-400"
        } text-slate-900`}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
          {label} {required && <span className="text-red-500">*</span>}
          {max && <span className="text-slate-500 font-normal"> (Select up to {max})</span>}
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
              className="w-4 h-4 rounded border-slate-300 bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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
          {label} {required && <span className="text-red-500">*</span>}
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
              className="w-4 h-4 rounded-full border-slate-300 bg-white cursor-pointer"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}

// Section 1 - Founder Information
function Section1({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormInput
        label="Full Name"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        placeholder="John Doe"
        error={errors.fullName}
      />

      <FormInput
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="john@example.com"
        error={errors.email}
      />

      <FormInput
        label="Phone / WhatsApp Number"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="+971 50 123 4567"
        error={errors.phone}
      />

      <FormSelect
        label="Current Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        options={[
          { value: "UAE", label: "UAE" },
          { value: "India", label: "India" },
          { value: "GCC", label: "GCC" },
          { value: "Other", label: "Other" },
        ]}
        error={errors.location}
      />

      <FormSelect
        label="Current Professional Status"
        value={formData.professionalStatus}
        onChange={(e) => setFormData({ ...formData, professionalStatus: e.target.value })}
        options={[
          { value: "Student", label: "Student" },
          { value: "Employed", label: "Employed" },
          { value: "Entrepreneur", label: "Entrepreneur" },
          { value: "Freelancer", label: "Freelancer/Consultant" },
          { value: "FamilyBusiness", label: "Family Business" },
          { value: "Starting", label: "Looking to start a business" },
          { value: "Other", label: "Other" },
        ]}
        error={errors.professionalStatus}
      />

      <FormSelect
        label="Professional / Business Experience"
        value={formData.experience}
        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
        options={[
          { value: "0-2", label: "0-2 years" },
          { value: "3-5", label: "3-5 years" },
          { value: "6-10", label: "6-10 years" },
          { value: "10+", label: "10+ years" },
        ]}
        error={errors.experience}
      />

      <FormSelect
        label="Have you previously started or managed a business?"
        value={formData.previousBusiness}
        onChange={(e) => setFormData({ ...formData, previousBusiness: e.target.value })}
        options={[
          { value: "No", label: "No" },
          { value: "Current", label: "Yes, currently operating" },
          { value: "Previous", label: "Yes, previously operated" },
          { value: "Multiple", label: "Yes, multiple businesses" },
        ]}
        error={errors.previousBusiness}
      />

      <FormCheckboxGroup
        label="What is your primary reason for joining ARBA Accelerator?"
        error={errors.reasonsForJoining}
        value={formData.reasonsForJoining}
        onChange={(val) => setFormData({ ...formData, reasonsForJoining: val })}
        max={3}
        options={[
          { value: "idea", label: "I have an idea but do not know how to start" },
          { value: "validate", label: "I want to validate my idea" },
          { value: "started", label: "I have started but need direction" },
          { value: "customers", label: "I need help acquiring customers" },
          { value: "model", label: "I need help building a business model" },
          { value: "funding", label: "I need funding/investment readiness" },
          { value: "strategic", label: "I need strategic guidance" },
          { value: "operational", label: "I need operational support" },
          { value: "scale", label: "I want to scale my existing business" },
          { value: "market", label: "I want to enter a new market" },
          { value: "tech", label: "I want to build a technology/product business" },
          { value: "professional", label: "I want to professionalise my existing business" },
        ]}
      />
    </div>
  );
}

// Section 2 - Business Stage
function Section2({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormSelect
        label="Which stage best describes your business?"
        value={formData.businessStage}
        onChange={(e) => setFormData({ ...formData, businessStage: e.target.value })}
        options={[
          { value: "Idea", label: "Idea Stage - only an idea" },
          { value: "Validation", label: "Validation Stage - testing the idea" },
          { value: "MVP", label: "MVP Stage - initial product/service exists" },
          { value: "EarlyRevenue", label: "Early Revenue - first customers/revenue" },
          { value: "Growth", label: "Growth Stage - established customer base" },
          { value: "Scaling", label: "Scaling Stage - actively expanding" },
          { value: "Mature", label: "Mature Business - established and looking for transformation" },
        ]}
        error={errors.businessStage}
      />

      <FormInput
        label="When did you start working on this business?"
        type="month"
        value={formData.startedDate}
        onChange={(e) => setFormData({ ...formData, startedDate: e.target.value })}
        error={errors.startedDate}
      />

      <FormSelect
        label="Is the business legally registered?"
        value={formData.legallyRegistered}
        onChange={(e) => setFormData({ ...formData, legallyRegistered: e.target.value })}
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
          { value: "Process", label: "In process" },
          { value: "NotRequired", label: "Not required yet" },
        ]}
        error={errors.legallyRegistered}
      />

      <FormInput
        label="Where is the business currently operating?"
        value={formData.operatingLocation}
        onChange={(e) => setFormData({ ...formData, operatingLocation: e.target.value })}
        placeholder="e.g., Dubai, UAE"
        error={errors.operatingLocation}
      />

      <FormInput
        label="What industry/category does your business belong to?"
        value={formData.industry}
        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
        placeholder="e.g., EdTech, FinTech, E-commerce"
        error={errors.industry}
      />

      <FormInput
        label="Describe your business in one sentence"
        value={formData.businessOneSentence}
        onChange={(e) => setFormData({ ...formData, businessOneSentence: e.target.value })}
        placeholder="We help small retailers increase repeat purchases through AI-powered customer engagement."
        error={errors.businessOneSentence}
      />

      <FormTextarea
        label="Explain your business in simple terms"
        rows={4}
        value={formData.businessDescription}
        onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
        placeholder="Describe what your business does, who it serves, and why it matters..."
        error={errors.businessDescription}
      />
    </div>
  );
}

// Section 3 - The Problem
function Section3({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormTextarea
        label="What problem are you solving?"
        rows={3}
        value={formData.problemStatement}
        onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
        placeholder="Describe the specific problem your business addresses..."
        error={errors.problemStatement}
      />

      <FormTextarea
        label="Who experiences this problem?"
        rows={3}
        value={formData.targetAudience}
        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
        placeholder="Describe your target customer in detail..."
        error={errors.targetAudience}
      />

      <FormTextarea
        label="How are people currently solving this problem?"
        rows={3}
        value={formData.currentSolution}
        onChange={(e) => setFormData({ ...formData, currentSolution: e.target.value })}
        placeholder="What are the existing solutions and workarounds?"
        error={errors.currentSolution}
      />

      <FormTextarea
        label="Why is the existing solution inadequate?"
        rows={3}
        value={formData.inadequateReason}
        onChange={(e) => setFormData({ ...formData, inadequateReason: e.target.value })}
        placeholder="What are the gaps or limitations in current solutions?"
        required={false}
      />

      <FormRadioGroup
        label="How important is this problem to your target customer?"
        value={formData.problemImportance}
        onChange={(val) => setFormData({ ...formData, problemImportance: val })}
        options={[
          { value: "1", label: "1 - Not very important" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5 - Extremely important" },
        ]}
        error={errors.problemImportance}
      />

      <FormCheckboxGroup
        label="What evidence do you have that this problem actually exists?"
        error={errors.validationEvidence}
        value={formData.validationEvidence}
        onChange={(val) => setFormData({ ...formData, validationEvidence: val })}
        options={[
          { value: "interviews", label: "Customer interviews" },
          { value: "sales", label: "Existing sales" },
          { value: "surveys", label: "Surveys" },
          { value: "research", label: "Market research" },
          { value: "competitors", label: "Competitor analysis" },
          { value: "personal", label: "Personal experience" },
          { value: "industry", label: "Industry data" },
          { value: "validation", label: "No validation yet" },
        ]}
      />
    </div>
  );
}

// Section 4 - Your Solution
function Section4({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormTextarea
        label="What exactly are you offering?"
        rows={3}
        value={formData.solutionDescription}
        onChange={(e) => setFormData({ ...formData, solutionDescription: e.target.value })}
        placeholder="Describe your product or service in detail..."
        error={errors.solutionDescription}
      />

      <FormTextarea
        label="What makes your solution different?"
        rows={3}
        value={formData.differentiation}
        onChange={(e) => setFormData({ ...formData, differentiation: e.target.value })}
        placeholder="What unique features or approach do you have?"
        error={errors.differentiation}
      />

      <FormTextarea
        label="Why would customers choose you instead of an existing alternative?"
        rows={3}
        value={formData.competitiveEdge}
        onChange={(e) => setFormData({ ...formData, competitiveEdge: e.target.value })}
        placeholder="What makes you the better choice?"
        required={false}
      />

      <FormCheckboxGroup
        label="What is your strongest competitive advantage?"
        error={errors.strongestAdvantage}
        value={formData.strongestAdvantage}
        onChange={(val) => setFormData({ ...formData, strongestAdvantage: val })}
        options={[
          { value: "Price", label: "Price" },
          { value: "Technology", label: "Technology" },
          { value: "IP", label: "Intellectual property" },
          { value: "Distribution", label: "Distribution" },
          { value: "Brand", label: "Brand" },
          { value: "Expertise", label: "Founder expertise" },
          { value: "Experience", label: "Customer experience" },
          { value: "Network", label: "Network" },
          { value: "Speed", label: "Speed" },
          { value: "Model", label: "Unique business model" },
        ]}
      />

      <FormSelect
        label="Is your product/service already available?"
        value={formData.productAvailability}
        onChange={(e) => setFormData({ ...formData, productAvailability: e.target.value })}
        options={[
          { value: "Yes", label: "Yes" },
          { value: "Prototype", label: "Prototype" },
          { value: "MVP", label: "MVP" },
          { value: "Development", label: "Under development" },
          { value: "No", label: "Not yet" },
        ]}
        error={errors.productAvailability}
      />

      <FormInput
        label="If applicable, share your website/social media/product/demo link"
        type="url"
        value={formData.demoLink}
        onChange={(e) => setFormData({ ...formData, demoLink: e.target.value })}
        placeholder="https://example.com"
        required={false}
      />
    </div>
  );
}

// Section 5 - Customer & Market
function Section5({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormTextarea
        label="Who is your ideal customer? (Be specific)"
        rows={3}
        value={formData.idealCustomer}
        onChange={(e) => setFormData({ ...formData, idealCustomer: e.target.value })}
        placeholder="e.g., UAE-based SMEs with 10-50 employees"
        error={errors.idealCustomer}
      />

      <FormInput
        label="Who is your primary paying customer?"
        value={formData.payingCustomer}
        onChange={(e) => setFormData({ ...formData, payingCustomer: e.target.value })}
        placeholder="Who actually pays for your product/service?"
        required={false}
      />

      <FormInput
        label="Approximately how large is your target market?"
        value={formData.marketSize}
        onChange={(e) => setFormData({ ...formData, marketSize: e.target.value })}
        placeholder="e.g., $2B, or I do not know"
        error={errors.marketSize}
      />

      <FormCheckboxGroup
        label="Which geographic market are you targeting?"
        error={errors.targetGeography}
        value={formData.targetGeography}
        onChange={(val) => setFormData({ ...formData, targetGeography: val })}
        options={[
          { value: "UAE", label: "UAE" },
          { value: "India", label: "India" },
          { value: "GCC", label: "GCC" },
          { value: "MiddleEast", label: "Middle East" },
          { value: "Asia", label: "Asia" },
          { value: "Europe", label: "Europe" },
          { value: "USA", label: "USA" },
          { value: "Global", label: "Global" },
        ]}
      />

      <FormTextarea
        label="Who are your top 3 competitors?"
        rows={3}
        value={formData.topCompetitors}
        onChange={(e) => setFormData({ ...formData, topCompetitors: e.target.value })}
        placeholder="List and briefly describe your main competitors"
        error={errors.topCompetitors}
      />

      <FormTextarea
        label="What do your competitors do better than you?"
        rows={3}
        value={formData.competitorStrengths}
        onChange={(e) => setFormData({ ...formData, competitorStrengths: e.target.value })}
        placeholder="Be honest about competitor advantages"
        required={false}
      />

      <FormTextarea
        label="What do you believe you can do better than them?"
        rows={3}
        value={formData.competitorWeaknesses}
        onChange={(e) => setFormData({ ...formData, competitorWeaknesses: e.target.value })}
        placeholder="What are your competitive advantages?"
        required={false}
      />

      <FormTextarea
        label="Why is now the right time for this business?"
        rows={3}
        value={formData.marketTiming}
        onChange={(e) => setFormData({ ...formData, marketTiming: e.target.value })}
        placeholder="What market trends or factors make this the right time?"
        required={false}
      />
    </div>
  );
}

// Section 6 - Traction
function Section6({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormSelect
        label="Do you currently have customers?"
        value={formData.currentCustomers}
        onChange={(e) => setFormData({ ...formData, currentCustomers: e.target.value })}
        options={[
          { value: "No", label: "No" },
          { value: "1-10", label: "1-10" },
          { value: "11-50", label: "11-50" },
          { value: "51-100", label: "51-100" },
          { value: "100+", label: "100+" },
        ]}
        error={errors.currentCustomers}
      />

      <FormInput
        label="How many paying customers have you served so far?"
        type="number"
        value={formData.payingCustomersCount}
        onChange={(e) => setFormData({ ...formData, payingCustomersCount: e.target.value })}
        placeholder="0"
        required={false}
      />

      <FormSelect
        label="What was your revenue during the last 12 months?"
        value={formData.revenue12Months}
        onChange={(e) => setFormData({ ...formData, revenue12Months: e.target.value })}
        options={[
          { value: "0", label: "₹0" },
          { value: "under_1L", label: "Under ₹1 lakh" },
          { value: "1-5L", label: "₹1-5 lakh" },
          { value: "5-25L", label: "₹5-25 lakh" },
          { value: "25L-1Cr", label: "₹25 lakh - ₹1 crore" },
          { value: "1-5Cr", label: "₹1-5 crore" },
          { value: "5Cr+", label: "₹5 crore+" },
          { value: "prefer_not", label: "Prefer not to disclose" },
        ]}
        required={false}
      />

      <FormInput
        label="What was your revenue in the last 3 months?"
        value={formData.revenue3Months}
        onChange={(e) => setFormData({ ...formData, revenue3Months: e.target.value })}
        placeholder="e.g., ₹50,000 or No revenue yet"
        required={false}
      />

      <FormSelect
        label="Is your revenue currently growing?"
        value={formData.revenueGrowth}
        onChange={(e) => setFormData({ ...formData, revenueGrowth: e.target.value })}
        options={[
          { value: "rapidly", label: "Yes, rapidly" },
          { value: "steadily", label: "Yes, steadily" },
          { value: "flat", label: "Flat" },
          { value: "declining", label: "Declining" },
          { value: "no_revenue", label: "No revenue yet" },
        ]}
        error={errors.revenueGrowth}
      />

      <FormInput
        label="What is your average transaction/customer value?"
        value={formData.transactionValue}
        onChange={(e) => setFormData({ ...formData, transactionValue: e.target.value })}
        placeholder="e.g., ₹500 or $10"
        required={false}
      />

      <FormCheckboxGroup
        label="How do you currently acquire customers?"
        error={errors.customerAcquisitionChannels}
        value={formData.customerAcquisitionChannels}
        onChange={(val) => setFormData({ ...formData, customerAcquisitionChannels: val })}
        options={[
          { value: "referrals", label: "Referrals" },
          { value: "social", label: "Social media" },
          { value: "paid_ads", label: "Paid advertising" },
          { value: "sales", label: "Sales team" },
          { value: "partnerships", label: "Partnerships" },
          { value: "marketplace", label: "Marketplace/platforms" },
          { value: "networking", label: "Networking" },
          { value: "founder", label: "Founder network" },
          { value: "organic", label: "Organic search" },
        ]}
      />

      <FormTextarea
        label="What is your biggest customer acquisition challenge?"
        rows={3}
        value={formData.customerAcquisitionChallenge}
        onChange={(e) => setFormData({ ...formData, customerAcquisitionChallenge: e.target.value })}
        placeholder="What makes it hard to acquire customers?"
        required={false}
      />
    </div>
  );
}

// Section 7 - Business Model
function Section7({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormTextarea
        label="How does your business make money?"
        rows={3}
        value={formData.revenueModel}
        onChange={(e) => setFormData({ ...formData, revenueModel: e.target.value })}
        placeholder="Describe your revenue model (e.g., subscription, one-time purchase, commission)"
        error={errors.revenueModel}
      />

      <FormTextarea
        label="What are your current revenue streams?"
        rows={3}
        value={formData.revenueStreams}
        onChange={(e) => setFormData({ ...formData, revenueStreams: e.target.value })}
        placeholder="List all ways you make money"
        required={false}
      />

      <FormInput
        label="What is your gross margin, approximately?"
        value={formData.grossMargin}
        onChange={(e) => setFormData({ ...formData, grossMargin: e.target.value })}
        placeholder="e.g., 70% or I do not know"
        required={false}
      />

      <FormTextarea
        label="What are your major monthly expenses?"
        rows={3}
        value={formData.monthlyExpenses}
        onChange={(e) => setFormData({ ...formData, monthlyExpenses: e.target.value })}
        placeholder="List your main cost categories (salary, rent, tools, marketing, etc.)"
        required={false}
      />

      <FormInput
        label="What is your current monthly burn?"
        value={formData.monthlyBurn}
        onChange={(e) => setFormData({ ...formData, monthlyBurn: e.target.value })}
        placeholder="Monthly expenses minus revenue"
        required={false}
      />

      <FormSelect
        label="Is the business currently profitable?"
        value={formData.profitability}
        onChange={(e) => setFormData({ ...formData, profitability: e.target.value })}
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
          { value: "Breakeven", label: "Break-even" },
          { value: "TooEarly", label: "Too early to determine" },
        ]}
        error={errors.profitability}
      />

      <FormSelect
        label="What is your biggest financial challenge?"
        value={formData.financialChallenge}
        onChange={(e) => setFormData({ ...formData, financialChallenge: e.target.value })}
        options={[
          { value: "Revenue", label: "Revenue" },
          { value: "CashFlow", label: "Cash flow" },
          { value: "Pricing", label: "Pricing" },
          { value: "CostManagement", label: "Cost management" },
          { value: "Funding", label: "Funding" },
          { value: "WorkingCapital", label: "Working capital" },
          { value: "Profitability", label: "Profitability" },
          { value: "DontKnow", label: "Do not know yet" },
        ]}
        error={errors.financialChallenge}
      />
    </div>
  );
}

// Section 8 - Founder Readiness
function Section8({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormSelect
        label="How many hours per week can you realistically dedicate to this business?"
        value={formData.weeklyHours}
        onChange={(e) => setFormData({ ...formData, weeklyHours: e.target.value })}
        options={[
          { value: "<5", label: "Less than 5 hours" },
          { value: "5-10", label: "5-10 hours" },
          { value: "10-20", label: "10-20 hours" },
          { value: "20-40", label: "20-40 hours" },
          { value: "FullTime", label: "Full-time (40+ hours)" },
        ]}
        error={errors.weeklyHours}
      />

      <FormSelect
        label="Are you currently working on this business full-time?"
        value={formData.fullTimeStatus}
        onChange={(e) => setFormData({ ...formData, fullTimeStatus: e.target.value })}
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        error={errors.fullTimeStatus}
      />

      {formData.fullTimeStatus === "No" && (
        <FormTextarea
          label="If not, what prevents you from working full-time?"
          rows={3}
          value={formData.preventFullTime}
          onChange={(e) => setFormData({ ...formData, preventFullTime: e.target.value })}
          placeholder="e.g., Current job, family commitments, funding constraints"
          required={false}
        />
      )}

      <div>
        <label className="block text-sm font-medium mb-3">
          How committed are you to building this business over the next 12 months? <span className="text-red-500">*</span>
          <span className="text-slate-500 font-normal block text-xs mt-1">Rate 1-10 (1 = Not very committed, 10 = Extremely committed)</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.commitment}
          onChange={(e) => setFormData({ ...formData, commitment: e.target.value })}
          className="w-full"
        />
        <div className="text-center text-lg font-semibold mt-2 text-blue-600">
          {formData.commitment ? `${formData.commitment}/10` : "Not selected"}
        </div>
        {errors.commitment && <p className="text-red-500 text-sm mt-2">{errors.commitment}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">
          How comfortable are you with uncertainty and risk? <span className="text-red-500">*</span>
          <span className="text-slate-500 font-normal block text-xs mt-1">Rate 1-10 (1 = Very uncomfortable, 10 = Very comfortable)</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.uncertaintyComfort}
          onChange={(e) => setFormData({ ...formData, uncertaintyComfort: e.target.value })}
          className="w-full"
        />
        <div className="text-center text-lg font-semibold mt-2 text-blue-600">
          {formData.uncertaintyComfort ? `${formData.uncertaintyComfort}/10` : "Not selected"}
        </div>
        {errors.uncertaintyComfort && <p className="text-red-500 text-sm mt-2">{errors.uncertaintyComfort}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">
          How willing are you to change your original idea based on market feedback? <span className="text-red-500">*</span>
          <span className="text-slate-500 font-normal block text-xs mt-1">Rate 1-10 (1 = Not willing, 10 = Very willing)</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.feedbackWillingness}
          onChange={(e) => setFormData({ ...formData, feedbackWillingness: e.target.value })}
          className="w-full"
        />
        <div className="text-center text-lg font-semibold mt-2 text-blue-600">
          {formData.feedbackWillingness ? `${formData.feedbackWillingness}/10` : "Not selected"}
        </div>
        {errors.feedbackWillingness && <p className="text-red-500 text-sm mt-2">{errors.feedbackWillingness}</p>}
      </div>

      <FormRadioGroup
        label="Which statement describes you best?"
        value={formData.founderDescription}
        onChange={(val) => setFormData({ ...formData, founderDescription: val })}
        options={[
          { value: "idea-tell", label: "I have an idea and need someone to tell me what to do." },
          { value: "idea-testing", label: "I have an idea and am actively testing it." },
          { value: "business-fixing", label: "I have a business and need help fixing problems." },
          { value: "traction-scale", label: "I have traction and want to scale." },
          { value: "know-resources", label: "I know what I want but need strategic resources." },
          { value: "unsure", label: "I am unsure what my business needs." },
        ]}
        error={errors.founderDescription}
      />

      <FormTextarea
        label="What is the biggest personal challenge currently affecting your business?"
        rows={3}
        value={formData.personalChallenge}
        onChange={(e) => setFormData({ ...formData, personalChallenge: e.target.value })}
        placeholder="e.g., Time management, confidence, skill gaps"
        required={false}
      />

      <FormTextarea
        label="What is the biggest business challenge currently affecting your growth?"
        rows={3}
        value={formData.businessChallenge}
        onChange={(e) => setFormData({ ...formData, businessChallenge: e.target.value })}
        placeholder="e.g., Customer acquisition, product-market fit, scaling"
        error={errors.businessChallenge}
      />
    </div>
  );
}

// Section 9 - Team
function Section9({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormTextarea
        label="Who are the founders? (For each founder: Name, Role, Experience, Relevant expertise)"
        rows={4}
        value={formData.founders}
        onChange={(e) => setFormData({ ...formData, founders: e.target.value })}
        placeholder="e.g., John Doe (CEO, 5 years in fintech), Jane Smith (CTO, mobile development expert)"
        error={errors.founders}
      />

      <FormInput
        label="How many people currently work in the business?"
        type="number"
        value={formData.teamSize}
        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
        placeholder="0"
        error={errors.teamSize}
      />

      <FormCheckboxGroup
        label="What key skills are missing from your team?"
        error={errors.missingSkills}
        value={formData.missingSkills}
        onChange={(val) => setFormData({ ...formData, missingSkills: val })}
        options={[
          { value: "Sales", label: "Sales" },
          { value: "Marketing", label: "Marketing" },
          { value: "Technology", label: "Technology" },
          { value: "Finance", label: "Finance" },
          { value: "Operations", label: "Operations" },
          { value: "Product", label: "Product" },
          { value: "HR", label: "HR" },
          { value: "Leadership", label: "Leadership" },
          { value: "Legal", label: "Legal" },
          { value: "Fundraising", label: "Fundraising" },
          { value: "Industry", label: "Industry expertise" },
        ]}
      />

      <FormSelect
        label="Are you currently looking for co-founders?"
        value={formData.lookingForCoFounder}
        onChange={(e) => setFormData({ ...formData, lookingForCoFounder: e.target.value })}
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
          { value: "Maybe", label: "Maybe" },
        ]}
      />
    </div>
  );
}

// Section 10 - Funding & Investment
function Section10({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormCheckboxGroup
        label="Have you raised external funding?"
        error={errors.fundingRaised}
        value={formData.fundingRaised}
        onChange={(val) => setFormData({ ...formData, fundingRaised: val })}
        options={[
          { value: "No", label: "No" },
          { value: "FriendsFamily", label: "Yes - friends/family" },
          { value: "Angel", label: "Angel investment" },
          { value: "VC", label: "Venture capital" },
          { value: "Bank", label: "Bank/business loan" },
          { value: "Government", label: "Government funding" },
          { value: "Other", label: "Other" },
        ]}
        required={false}
      />

      <FormInput
        label="How much capital have you invested personally?"
        value={formData.personalInvestment}
        onChange={(e) => setFormData({ ...formData, personalInvestment: e.target.value })}
        placeholder="e.g., ₹100,000 or $5,000"
        required={false}
      />

      <FormSelect
        label="Are you currently seeking funding?"
        value={formData.seekingFunding}
        onChange={(e) => setFormData({ ...formData, seekingFunding: e.target.value })}
        options={[
          { value: "No", label: "No" },
          { value: "Yes", label: "Yes" },
          { value: "Maybe", label: "Maybe in the future" },
        ]}
        error={errors.seekingFunding}
      />

      {formData.seekingFunding === "Yes" && (
        <>
          <FormInput
            label="If yes, how much funding are you seeking?"
            value={formData.fundingAmount}
            onChange={(e) => setFormData({ ...formData, fundingAmount: e.target.value })}
            placeholder="e.g., ₹50 lakhs or $100,000"
          />

          <FormCheckboxGroup
            label="What will the funding primarily be used for?"
            value={formData.fundingUse}
            onChange={(val) => setFormData({ ...formData, fundingUse: val })}
            options={[
              { value: "Product", label: "Product development" },
              { value: "Hiring", label: "Hiring" },
              { value: "Marketing", label: "Marketing" },
              { value: "Sales", label: "Sales" },
              { value: "Technology", label: "Technology" },
              { value: "Inventory", label: "Inventory" },
              { value: "Expansion", label: "Expansion" },
              { value: "WorkingCapital", label: "Working capital" },
            ]}
          />
        </>
      )}

      <FormSelect
        label="Are you investment-ready?"
        value={formData.investmentReady}
        onChange={(e) => setFormData({ ...formData, investmentReady: e.target.value })}
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
          { value: "DontKnow", label: "I do not know" },
        ]}
        error={errors.investmentReady}
      />
    </div>
  );
}

// Section 11 - Incubation Requirements
function Section11({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormTextarea
        label="What are the top 3 things you want ARBA Accelerator to help you achieve?"
        rows={3}
        value={formData.nurtureCaveGoals}
        onChange={(e) => setFormData({ ...formData, nurtureCaveGoals: e.target.value })}
        placeholder="List your top 3 goals..."
        error={errors.nurtureCaveGoals}
      />

      <FormCheckboxGroup
        label="Which areas do you need the most support in? (Rank your top 5)"
        error={errors.supportAreas}
        value={formData.supportAreas}
        onChange={(val) => setFormData({ ...formData, supportAreas: val })}
        max={5}
        options={[
          { value: "model", label: "Business model" },
          { value: "validation", label: "Business validation" },
          { value: "research", label: "Market research" },
          { value: "product", label: "Product development" },
          { value: "branding", label: "Branding" },
          { value: "marketing", label: "Marketing" },
          { value: "sales", label: "Sales" },
          { value: "acquisition", label: "Customer acquisition" },
          { value: "pricing", label: "Pricing" },
          { value: "financial", label: "Financial planning" },
          { value: "fundraising", label: "Fundraising" },
          { value: "technology", label: "Technology" },
          { value: "operations", label: "Operations" },
          { value: "hiring", label: "HR/team building" },
          { value: "leadership", label: "Leadership" },
          { value: "legal", label: "Legal/compliance" },
          { value: "expansion", label: "International expansion" },
          { value: "partnerships", label: "Partnerships" },
          { value: "investor", label: "Investor readiness" },
        ]}
      />

      <FormTextarea
        label="What would success look like for you after 90 days?"
        rows={3}
        value={formData.success90Days}
        onChange={(e) => setFormData({ ...formData, success90Days: e.target.value })}
        placeholder="e.g., Validate product with 50 customers, secure first paying customer, complete business plan"
        error={errors.success90Days}
      />

      <FormTextarea
        label="What would success look like after 12 months?"
        rows={3}
        value={formData.success12Months}
        onChange={(e) => setFormData({ ...formData, success12Months: e.target.value })}
        placeholder="e.g., $100K MRR, 1000 paying customers, Series A ready"
        error={errors.success12Months}
      />

      <FormTextarea
        label="If ARBA Accelerator could solve one problem for your business, what should it be?"
        rows={3}
        value={formData.keyProblem}
        onChange={(e) => setFormData({ ...formData, keyProblem: e.target.value })}
        placeholder="What is the one thing that would make the biggest difference?"
        required={false}
      />
    </div>
  );
}

// Section 12 - Founder Mindset
function Section12({ formData, setFormData, errors }: any) {
  const scaleOptions = [
    { value: "1", label: "1 - Strongly Disagree" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5 - Strongly Agree" },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mb-4">
        <p className="text-sm text-slate-600">
          Rate each statement on a scale of 1-5 (1 = Strongly Disagree, 5 = Strongly Agree)
        </p>
      </div>

      <FormRadioGroup
        label="I actively seek customer feedback"
        value={formData.customerFeedback}
        onChange={(val) => setFormData({ ...formData, customerFeedback: val })}
        options={scaleOptions}
        error={errors.customerFeedback}
      />

      <FormRadioGroup
        label="I am willing to change my business model when evidence suggests I should"
        value={formData.businessModelFlexibility}
        onChange={(val) => setFormData({ ...formData, businessModelFlexibility: val })}
        options={scaleOptions}
        error={errors.businessModelFlexibility}
      />

      <FormRadioGroup
        label="I take responsibility when something does not work"
        value={formData.responsibility}
        onChange={(val) => setFormData({ ...formData, responsibility: val })}
        options={scaleOptions}
        error={errors.responsibility}
      />

      <FormRadioGroup
        label="I am comfortable receiving critical feedback"
        value={formData.criticalFeedback}
        onChange={(val) => setFormData({ ...formData, criticalFeedback: val })}
        options={scaleOptions}
        error={errors.criticalFeedback}
      />

      <FormRadioGroup
        label="I consistently execute rather than only plan"
        value={formData.executionFocus}
        onChange={(val) => setFormData({ ...formData, executionFocus: val })}
        options={scaleOptions}
        error={errors.executionFocus}
      />

      <FormRadioGroup
        label="I understand my business numbers"
        value={formData.businessNumbers}
        onChange={(val) => setFormData({ ...formData, businessNumbers: val })}
        options={scaleOptions}
        error={errors.businessNumbers}
      />

      <FormRadioGroup
        label="I know who my ideal customer is"
        value={formData.idealCustomerUnderstanding}
        onChange={(val) => setFormData({ ...formData, idealCustomerUnderstanding: val })}
        options={scaleOptions}
        error={errors.idealCustomerUnderstanding}
      />

      <FormRadioGroup
        label="I understand my competitors"
        value={formData.competitorUnderstanding}
        onChange={(val) => setFormData({ ...formData, competitorUnderstanding: val })}
        options={scaleOptions}
        error={errors.competitorUnderstanding}
      />

      <FormRadioGroup
        label="I have clearly defined business goals"
        value={formData.businessGoals}
        onChange={(val) => setFormData({ ...formData, businessGoals: val })}
        options={scaleOptions}
        error={errors.businessGoals}
      />

      <FormRadioGroup
        label="I can dedicate sufficient time to execution"
        value={formData.timeAvailability}
        onChange={(val) => setFormData({ ...formData, timeAvailability: val })}
        options={scaleOptions}
        error={errors.timeAvailability}
      />

      <FormRadioGroup
        label="I am willing to be held accountable for agreed milestones"
        value={formData.accountabilityWillingness}
        onChange={(val) => setFormData({ ...formData, accountabilityWillingness: val })}
        options={scaleOptions}
        error={errors.accountabilityWillingness}
      />
    </div>
  );
}

// Section 13 - Reality Check
function Section13({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-4 mb-4">
        <p className="text-sm text-slate-600">
          These questions help us understand your self-awareness and resilience. Be honest.
        </p>
      </div>

      <FormTextarea
        label="What is the biggest reason your business might fail?"
        rows={3}
        value={formData.failureReason}
        onChange={(e) => setFormData({ ...formData, failureReason: e.target.value })}
        placeholder="What is the biggest risk or weakness?"
        error={errors.failureReason}
      />

      <FormTextarea
        label="What assumption about your business are you least certain about?"
        rows={3}
        value={formData.uncertainAssumption}
        onChange={(e) => setFormData({ ...formData, uncertainAssumption: e.target.value })}
        placeholder="What do you question or worry about?"
        error={errors.uncertainAssumption}
      />

      <FormTextarea
        label="What have you tried that did not work?"
        rows={3}
        value={formData.failedAttempts}
        onChange={(e) => setFormData({ ...formData, failedAttempts: e.target.value })}
        placeholder="What have you learned from failures?"
        required={false}
      />

      <FormTextarea
        label="What is the biggest mistake you have made so far?"
        rows={3}
        value={formData.biggestMistake}
        onChange={(e) => setFormData({ ...formData, biggestMistake: e.target.value })}
        placeholder="What would you do differently?"
        required={false}
      />

      <FormTextarea
        label="What are you currently avoiding doing that you know needs to be done?"
        rows={3}
        value={formData.avoidingAction}
        onChange={(e) => setFormData({ ...formData, avoidingAction: e.target.value })}
        placeholder="What hard conversations or decisions are you putting off?"
        required={false}
      />

      <FormTextarea
        label="If you had to shut down this business tomorrow, what would be the most likely reason?"
        rows={3}
        value={formData.shutdownReason}
        onChange={(e) => setFormData({ ...formData, shutdownReason: e.target.value })}
        placeholder="This is about planning, not pessimism"
        required={false}
      />

      <FormTextarea
        label="Why should ARBA Accelerator select you?"
        rows={3}
        value={formData.whySelectUs}
        onChange={(e) => setFormData({ ...formData, whySelectUs: e.target.value })}
        placeholder="What makes you a great candidate?"
        error={errors.whySelectUs}
      />

      <FormTextarea
        label="What will you do differently if you are accepted?"
        rows={3}
        value={formData.differentlyIfAccepted}
        onChange={(e) => setFormData({ ...formData, differentlyIfAccepted: e.target.value })}
        placeholder="How will you leverage this opportunity?"
        required={false}
      />
    </div>
  );
}

// Section 14 - Final Founder Statement
function Section14({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <FormTextarea
        label="In 100 words or less: Why do you want to build this business?"
        rows={4}
        value={formData.whyBuildBusiness}
        onChange={(e) => setFormData({ ...formData, whyBuildBusiness: e.target.value })}
        placeholder="Share your motivation and passion..."
        error={errors.whyBuildBusiness}
      />
      <p className="text-xs text-slate-500">{formData.whyBuildBusiness.length}/100 words recommended</p>

      <FormInput
        label="In one sentence: What do you want ARBA Accelerator to help you become?"
        value={formData.futureVision}
        onChange={(e) => setFormData({ ...formData, futureVision: e.target.value })}
        placeholder="e.g., A sustainable fashion brand that empowers 1000+ artisans"
        error={errors.futureVision}
      />

      <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
        <p className="text-sm text-slate-600">
          Check mark - You have completed all 14 sections! Review your answers and submit your application.
        </p>
      </div>
    </div>
  );
}

// Submission Success Component
function SubmissionSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 text-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Application Submitted Successfully!
        </h1>

        <p className="text-xl text-slate-600 mb-8">
          Thank you for completing the ARBA Accelerator Pre-Incubator Prerequisite Questionnaire.
        </p>

        <div className="bg-white rounded-lg border border-slate-200 p-8 mb-8">
          <p className="text-slate-600 mb-4">
            Our team will review your application and assess your readiness for the pre-incubation program.
          </p>
          <p className="text-slate-600 mb-4">
            <strong>Next Steps:</strong>
          </p>
          <ul className="text-left space-y-2 text-slate-600 max-w-md mx-auto">
            <li>Check - We will evaluate your founder readiness score</li>
            <li>Check - You will receive our assessment within 7 business days</li>
            <li>Check - If selected, we will contact you to discuss the program</li>
            <li>Check - You will get detailed feedback on your business</li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-slate-500">
            In the meantime, check your email for updates or follow us on social media.
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-6 text-lg">
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-500 mt-8">
          ARBA Accelerator - Building Tomorrows Leaders Today
        </p>
      </div>
    </div>
  );
}
