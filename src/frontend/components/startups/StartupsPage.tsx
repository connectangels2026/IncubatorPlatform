"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  CheckCircle,
  Grid,
  List,
  Rocket,
  TrendingUp,
  UserCheck,
  Handshake,
  Download,
  Plus,
  DollarSign,
  GraduationCap,
  X,
} from "lucide-react";
import { Sidebar } from "@/frontend/components/layouts/Sidebar";
import { apiClient } from "@/services/apiClient";

// Import Modular Components
import { StartupGrid } from "./StartupGrid";
import { StartupList } from "./StartupList";
import { StartupDetailModal } from "./StartupDetailModal";
import { AllocateMentorModal } from "./AllocateMentorModal";
import { AllocateInvestorModal } from "./AllocateInvestorModal";
import { AddCoIncubatorModal } from "./AddCoIncubatorModal";
import { SignMOUModal } from "./SignMOUModal";
import {
  StartupItem,
  AllocatedMentor,
  AllocatedInvestor,
  CoIncubatorItem,
} from "./types";

const INITIAL_STARTUPS: StartupItem[] = [
  {
    id: "1",
    name: "NexHealth AI",
    monogram: "NH",
    monogramBg: "bg-blue-600",
    sector: "Tech",
    industry: "HealthTech / AI",
    stage: "Revenue",
    status: "Active",
    cohort: "Cohort 2024",
    funding: "$1.2M",
    fundingRaised: "$1.2M",
    burn: "$22,000/mo",
    monthlyBurn: "$22,000/mo",
    healthScore: "High",
    mrr: 50000,
    arr: 600000,
    customers: 1250,
    tagline: "Autonomous patient triage and clinical workflow orchestration using generative LLMs.",
    pitch: "Autonomous patient triage and clinical workflow orchestration using generative clinical models.",
    problem: "Hospitals face severe nurse burn-out and 45-minute patient intake delays during peak hours.",
    solution: "AI conversational agent that pre-triages patients via kiosk, updating EHR in real-time.",
    market: "US Urgent Care & Regional Health Networks ($28B TAM).",
    founder: "Dr. Aris Thorne",
    founderEmail: "aris@nexhealth.ai",
    website: "https://nexhealth.ai",
    location: "Bangalore, India",
    teamMembers: [
      { name: "Dr. Aris Thorne", role: "Co-Founder & CEO", linkedin: "#", initials: "AT" },
      { name: "Siddharth Kumar", role: "Co-Founder & CTO", linkedin: "#", initials: "SK" },
    ],
    allocatedMentors: [
      {
        id: "m1",
        name: "Dr. Marcus Vance",
        type: "SME",
        domain: "Clinical Health Systems & FDA",
        allocatedDate: "2024-02-15",
        feedback: "HIPAA audit documentation finalized. Pilot underway with 2 hospital chains.",
      },
      {
        id: "m2",
        name: "Pooja Hegde",
        type: "General",
        domain: "B2B SaaS Growth & GTM",
        allocatedDate: "2024-03-01",
      },
    ],
    allocatedInvestors: [
      {
        id: "i1",
        name: "Sequoia Surge",
        company: "Sequoia Capital",
        focusAreas: ["HealthTech", "AI", "Enterprise"],
        interestLevel: "Active",
        allocationDate: "2024-04-10",
        ticketSize: "$500K",
        notes: "Scheduled deep-dive partner meeting for Q3 follow-on syndicate.",
      },
    ],
    coIncubators: [
      {
        id: "c1",
        name: "C-CAMP Life Sciences",
        mouStatus: "Signed",
        type: "Full",
        durationMonths: 12,
        duration: "12 Months",
        status: "Active",
        equitySplit: "1.0%",
        responsibilities: "Access to molecular biology wet labs & bio-safety testing certification.",
        startDate: "2024-01-20",
        documentName: "CCAMP_NexHealth_MOU_Signed.pdf",
      },
    ],
  },
  {
    id: "2",
    name: "PayFlow Finance",
    monogram: "PF",
    monogramBg: "bg-indigo-600",
    sector: "FinTech",
    industry: "FinTech",
    stage: "Growth",
    status: "Active",
    cohort: "Cohort 2023",
    funding: "$4.5M",
    fundingRaised: "$4.5M",
    burn: "$45,000/mo",
    monthlyBurn: "$45,000/mo",
    healthScore: "High",
    mrr: 125000,
    arr: 1500000,
    customers: 4200,
    tagline: "Cross-border automated payroll for international remote tech engineering teams.",
    pitch: "Cross-border automated payroll for international remote tech engineering teams.",
    founder: "Carlos Delgado",
    founderEmail: "carlos@payflow.io",
    website: "https://payflow.io",
    location: "Mumbai, India",
    teamMembers: [
      { name: "Carlos Delgado", role: "Founder & CEO", initials: "CD" },
      { name: "Elena Gomez", role: "Chief Compliance Officer", initials: "EG" },
    ],
    allocatedMentors: [
      {
        id: "m3",
        name: "Jennifer Wu",
        type: "General",
        domain: "Global FinTech Scaling & FX",
        allocatedDate: "2023-09-12",
        feedback: "Superb 18% MoM traction. Advised on treasury currency reserve buffers.",
      },
    ],
    allocatedInvestors: [
      {
        id: "i2",
        name: "Nexus Venture Partners",
        company: "Nexus VP",
        focusAreas: ["Fintech", "B2B SaaS"],
        interestLevel: "Offer",
        allocationDate: "2024-05-18",
        ticketSize: "$2.0M",
      },
    ],
    coIncubators: [
      {
        id: "c2",
        name: "T-Hub Hyderabad",
        mouStatus: "Pending",
        type: "Knowledge Sharing",
        durationMonths: 18,
        duration: "18 Months",
        status: "Active",
        equitySplit: "1.5%",
        responsibilities: "Corporate pilot pipelines across Telangana banking consortia.",
        startDate: "2024-06-01",
        documentName: "THub_PayFlow_MOU_Draft.pdf",
      },
    ],
  },
  {
    id: "3",
    name: "VerdeGrid Tech",
    monogram: "VG",
    monogramBg: "bg-emerald-600",
    sector: "CleanTech",
    industry: "CleanTech",
    stage: "MVP",
    status: "Active",
    cohort: "Cohort 2024",
    funding: "$750K",
    fundingRaised: "$750K",
    burn: "$12,000/mo",
    monthlyBurn: "$12,000/mo",
    healthScore: "Moderate",
    mrr: 18000,
    arr: 216000,
    customers: 340,
    tagline: "Smart microgrid load balancing software for commercial solar installations.",
    pitch: "Smart microgrid load balancing software for commercial solar installations.",
    founder: "Maya Lin",
    founderEmail: "maya@verdegrid.energy",
    website: "https://verdegrid.energy",
    location: "Pune, India",
    teamMembers: [
      { name: "Maya Lin", role: "CEO & Systems Architect", initials: "ML" },
      { name: "David Zhang", role: "Head of Firmware & IoT", initials: "DZ" },
    ],
    allocatedMentors: [],
    allocatedInvestors: [],
    coIncubators: [],
  },
  {
    id: "4",
    name: "AgroFlow Systems",
    monogram: "AF",
    monogramBg: "bg-amber-600",
    sector: "AgriTech",
    industry: "AgriTech",
    stage: "Idea",
    status: "Active",
    cohort: "Cohort 2025",
    funding: "$150K",
    fundingRaised: "$150K",
    burn: "$5,000/mo",
    monthlyBurn: "$5,000/mo",
    healthScore: "Moderate",
    mrr: 0,
    arr: 0,
    customers: 12,
    tagline: "IoT soil moisture sensors paired with autonomous drip irrigation robotics.",
    pitch: "IoT soil moisture sensors paired with autonomous drip irrigation robotics.",
    founder: "Vikram Mehta",
    founderEmail: "vikram@agroflow.farm",
    website: "https://agroflow.farm",
    location: "Nashik, India",
    teamMembers: [
      { name: "Vikram Mehta", role: "Founder & Hardware Engineer", initials: "VM" },
    ],
    allocatedMentors: [],
    allocatedInvestors: [],
    coIncubators: [],
  },
  {
    id: "5",
    name: "CyberPulse",
    monogram: "CP",
    monogramBg: "bg-purple-600",
    sector: "SaaS",
    industry: "Cybersecurity",
    stage: "Revenue",
    status: "Active",
    cohort: "Cohort 2023",
    funding: "$2.8M",
    fundingRaised: "$2.8M",
    burn: "$30,000/mo",
    monthlyBurn: "$30,000/mo",
    healthScore: "High",
    mrr: 88000,
    arr: 1056000,
    customers: 890,
    tagline: "Zero-trust API security mesh and automated vulnerability patch monitoring.",
    pitch: "Zero-trust API security mesh and automated vulnerability patch monitoring.",
    founder: "Samantha Reed",
    founderEmail: "samantha@cyberpulse.sec",
    website: "https://cyberpulse.sec",
    location: "Hyderabad, India",
    teamMembers: [
      { name: "Samantha Reed", role: "Founder & CEO", initials: "SR" },
      { name: "Alex Morozov", role: "Security Architect", initials: "AM" },
    ],
    allocatedMentors: [],
    allocatedInvestors: [],
    coIncubators: [],
  },
];

export const StartupsPage: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // State
  const [startups, setStartups] = useState<StartupItem[]>(INITIAL_STARTUPS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("ALL");
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [selectedCohort, setSelectedCohort] = useState("ALL");
  const [sortBy, setSortBy] = useState("name-asc");

  // Modals state
  const [selectedStartup, setSelectedStartup] = useState<StartupItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Quick Action Modal states
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [isInvestorModalOpen, setIsInvestorModalOpen] = useState(false);
  const [isCoIncubatorModalOpen, setIsCoIncubatorModalOpen] = useState(false);
  const [isSignMOUModalOpen, setIsSignMOUModalOpen] = useState(false);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [activePartnerForMOU, setActivePartnerForMOU] = useState<CoIncubatorItem | null>(null);
  const [targetStartupForAction, setTargetStartupForAction] = useState<StartupItem | null>(null);

  // New Startup Onboard Form State
  const [onboardForm, setOnboardForm] = useState({
    name: "",
    founder: "",
    founderEmail: "",
    industry: "Tech",
    stage: "Idea",
    funding: "$0",
    cohort: "Cohort 2026",
    pitch: "",
  });

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load from API with fallback
  useEffect(() => {
    const loadStartups = async () => {
      try {
        const res = await apiClient.get("/startups");
        const apiData = res.data?.data;
        if (Array.isArray(apiData) && apiData.length > 0) {
          const merged: StartupItem[] = apiData.map((item: any, idx: number) => {
            const fallback = INITIAL_STARTUPS.find((s) => s.id === item.id) || INITIAL_STARTUPS[idx % INITIAL_STARTUPS.length];
            return {
              id: item.id || String(idx + 1),
              name: item.name || fallback.name,
              monogram: fallback.monogram,
              monogramBg: fallback.monogramBg,
              sector: item.sector || fallback.sector,
              industry: item.sector || fallback.industry,
              stage: item.stage || fallback.stage,
              status: item.status || fallback.status,
              mrr: typeof item.revenue === "number" ? item.revenue : fallback.mrr,
              arr: typeof item.revenue === "number" ? item.revenue * 12 : fallback.arr,
              customers: fallback.customers,
              funding: fallback.funding,
              fundingRaised: fallback.fundingRaised,
              burn: fallback.burn,
              monthlyBurn: fallback.monthlyBurn,
              cohort: item.cohort || fallback.cohort,
              healthScore: fallback.healthScore,
              tagline: fallback.tagline,
              pitch: item.description || fallback.pitch,
              founder: item.founder_name || fallback.founder,
              founderEmail: item.email || fallback.founderEmail,
              website: fallback.website,
              location: fallback.location,
              teamMembers: fallback.teamMembers,
              allocatedMentors: fallback.allocatedMentors || [],
              allocatedInvestors: fallback.allocatedInvestors || [],
              coIncubators: fallback.coIncubators || [],
            };
          });
          setStartups(merged);
        }
      } catch (e) {
        console.warn("Using local startups fallback", e);
      }
    };
    loadStartups();
  }, []);

  // Filtered & Sorted startups
  const filteredStartups = useMemo(() => {
    return startups.filter((s) => {
      const industryVal = s.industry || s.sector || "";
      const matchSearch =
        searchQuery === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.founder.toLowerCase().includes(searchQuery.toLowerCase()) ||
        industryVal.toLowerCase().includes(searchQuery.toLowerCase());

      const matchIndustry = selectedIndustry === "ALL" || industryVal.toLowerCase().includes(selectedIndustry.toLowerCase());
      const matchStage = selectedStage === "ALL" || s.stage.toLowerCase() === selectedStage.toLowerCase();
      const matchCohort = selectedCohort === "ALL" || (s.cohort || "") === selectedCohort;

      return matchSearch && matchIndustry && matchStage && matchCohort;
    }).sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });
  }, [startups, searchQuery, selectedIndustry, selectedStage, selectedCohort, sortBy]);

  // Handlers: View Profile Modal
  const handleOpenProfile = (startup: StartupItem) => {
    setSelectedStartup(startup);
    setIsDetailOpen(true);
  };

  // Handlers: Mentors
  const handleTriggerAllocateMentor = (startup: StartupItem) => {
    setTargetStartupForAction(startup);
    setIsMentorModalOpen(true);
  };

  const handleConfirmAllocateMentor = (mentorData: Omit<AllocatedMentor, "id">) => {
    if (!targetStartupForAction) return;
    const newMentor: AllocatedMentor = {
      ...mentorData,
      id: "m_" + Date.now(),
    };
    const updated = startups.map((s) => {
      if (s.id === targetStartupForAction.id) {
        const allocated = [...(s.allocatedMentors || []), newMentor];
        return { ...s, allocatedMentors: allocated };
      }
      return s;
    });
    setStartups(updated);
    if (selectedStartup && selectedStartup.id === targetStartupForAction.id) {
      setSelectedStartup({
        ...selectedStartup,
        allocatedMentors: [...(selectedStartup.allocatedMentors || []), newMentor],
      });
    }
    showToast(`Mentor allocated to ${targetStartupForAction.name}`);
  };

  const handleRemoveMentor = (startupId: string, mentorId: string) => {
    const updated = startups.map((s) => {
      if (s.id === startupId) {
        return {
          ...s,
          allocatedMentors: (s.allocatedMentors || []).filter((m) => m.id !== mentorId),
        };
      }
      return s;
    });
    setStartups(updated);
    if (selectedStartup && selectedStartup.id === startupId) {
      setSelectedStartup({
        ...selectedStartup,
        allocatedMentors: (selectedStartup.allocatedMentors || []).filter((m) => m.id !== mentorId),
      });
    }
    showToast("Mentor removed from allocation");
  };

  // Handlers: Investors
  const handleTriggerAllocateInvestor = (startup: StartupItem) => {
    setTargetStartupForAction(startup);
    setIsInvestorModalOpen(true);
  };

  const handleConfirmAllocateInvestor = (investorData: Omit<AllocatedInvestor, "id">) => {
    if (!targetStartupForAction) return;
    const newInvestor: AllocatedInvestor = {
      ...investorData,
      id: "i_" + Date.now(),
    };
    const updated = startups.map((s) => {
      if (s.id === targetStartupForAction.id) {
        const allocated = [...(s.allocatedInvestors || []), newInvestor];
        return { ...s, allocatedInvestors: allocated };
      }
      return s;
    });
    setStartups(updated);
    if (selectedStartup && selectedStartup.id === targetStartupForAction.id) {
      setSelectedStartup({
        ...selectedStartup,
        allocatedInvestors: [...(selectedStartup.allocatedInvestors || []), newInvestor],
      });
    }
    showToast(`Investor allocated to ${targetStartupForAction.name}`);
  };

  const handleUpdateInvestorInterest = (
    startupId: string,
    investorId: string,
    interestLevel: AllocatedInvestor["interestLevel"]
  ) => {
    const updated = startups.map((s) => {
      if (s.id === startupId) {
        return {
          ...s,
          allocatedInvestors: (s.allocatedInvestors || []).map((inv) =>
            inv.id === investorId ? { ...inv, interestLevel } : inv
          ),
        };
      }
      return s;
    });
    setStartups(updated);
    if (selectedStartup && selectedStartup.id === startupId) {
      setSelectedStartup({
        ...selectedStartup,
        allocatedInvestors: (selectedStartup.allocatedInvestors || []).map((inv) =>
          inv.id === investorId ? { ...inv, interestLevel } : inv
        ),
      });
    }
    showToast(`Interest level updated to: ${interestLevel}`);
  };

  const handleRemoveInvestor = (startupId: string, investorId: string) => {
    const updated = startups.map((s) => {
      if (s.id === startupId) {
        return {
          ...s,
          allocatedInvestors: (s.allocatedInvestors || []).filter((i) => i.id !== investorId),
        };
      }
      return s;
    });
    setStartups(updated);
    if (selectedStartup && selectedStartup.id === startupId) {
      setSelectedStartup({
        ...selectedStartup,
        allocatedInvestors: (selectedStartup.allocatedInvestors || []).filter((i) => i.id !== investorId),
      });
    }
    showToast("Investor allocation removed");
  };

  // Handlers: Co-Incubation
  const handleTriggerAddCoIncubator = (startup: StartupItem) => {
    setTargetStartupForAction(startup);
    setIsCoIncubatorModalOpen(true);
  };

  const handleConfirmAddCoIncubator = (partnerData: Omit<CoIncubatorItem, "id">) => {
    if (!targetStartupForAction) return;
    const newPartner: CoIncubatorItem = {
      ...partnerData,
      id: "c_" + Date.now(),
    };
    const updated = startups.map((s) => {
      if (s.id === targetStartupForAction.id) {
        const partners = [...(s.coIncubators || []), newPartner];
        return { ...s, coIncubators: partners };
      }
      return s;
    });
    setStartups(updated);
    if (selectedStartup && selectedStartup.id === targetStartupForAction.id) {
      setSelectedStartup({
        ...selectedStartup,
        coIncubators: [...(selectedStartup.coIncubators || []), newPartner],
      });
    }
    showToast(`Co-Incubator partner added for ${targetStartupForAction.name}`);
  };

  const handleTriggerSignMOU = (startup: StartupItem, partner: CoIncubatorItem) => {
    setTargetStartupForAction(startup);
    setActivePartnerForMOU(partner);
    setIsSignMOUModalOpen(true);
  };

  const handleConfirmSignMOU = (partnerId: string) => {
    if (!targetStartupForAction) return;
    const updated = startups.map((s) => {
      if (s.id === targetStartupForAction.id) {
        return {
          ...s,
          coIncubators: (s.coIncubators || []).map((p) =>
            p.id === partnerId ? { ...p, mouStatus: "Signed" as const } : p
          ),
        };
      }
      return s;
    });
    setStartups(updated);
    if (selectedStartup && selectedStartup.id === targetStartupForAction.id) {
      setSelectedStartup({
        ...selectedStartup,
        coIncubators: (selectedStartup.coIncubators || []).map((p) =>
          p.id === partnerId ? { ...p, mouStatus: "Signed" as const } : p
        ),
      });
    }
    showToast("MOU successfully signed & activated!");
  };

  const handleRemoveCoIncubator = (startupId: string, partnerId: string) => {
    const updated = startups.map((s) => {
      if (s.id === startupId) {
        return {
          ...s,
          coIncubators: (s.coIncubators || []).filter((p) => p.id !== partnerId),
        };
      }
      return s;
    });
    setStartups(updated);
    if (selectedStartup && selectedStartup.id === startupId) {
      setSelectedStartup({
        ...selectedStartup,
        coIncubators: (selectedStartup.coIncubators || []).filter((p) => p.id !== partnerId),
      });
    }
    showToast("Co-incubator partnership removed");
  };

  // Aggregates for KPI banner
  const totalCount = startups.length;
  const activeCount = startups.filter((s) => s.status.toLowerCase() === "active").length;
  const graduatedCount = startups.filter((s) => s.status.toLowerCase() === "graduated").length;
  const graduationRate = totalCount > 0 ? Math.round((graduatedCount / totalCount) * 100) : 0;
  const totalMentorsAllocated = startups.reduce((acc, s) => acc + (s.allocatedMentors?.length || 0), 0);
  const totalInvestorsAllocated = startups.reduce((acc, s) => acc + (s.allocatedInvestors?.length || 0), 0);
  const totalCoIncubations = startups.reduce((acc, s) => acc + (s.coIncubators?.length || 0), 0);

  // Parse total capital raised (e.g. $1.2M + $4.5M)
  const totalCapitalRaisedFormatted = useMemo(() => {
    let totalMillions = 0;
    startups.forEach((s) => {
      const fundStr = s.funding || s.fundingRaised || "";
      const cleaned = fundStr.replace(/[^0-9.]/g, "");
      const val = parseFloat(cleaned) || 0;
      if (fundStr.includes("M") || fundStr.includes("m")) {
        totalMillions += val;
      } else if (fundStr.includes("K") || fundStr.includes("k")) {
        totalMillions += val / 1000;
      }
    });
    return totalMillions > 0 ? `$${totalMillions.toFixed(1)}M` : "$9.4M";
  }, [startups]);

  // Handle Export PDF
  const handleExportPDF = () => {
    window.print();
    showToast("Preparing Startup Directory PDF printout...");
  };

  // Handle Onboard New Startup
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.name.trim()) return;

    const newStartup: StartupItem = {
      id: "st_" + Date.now(),
      name: onboardForm.name,
      monogram: onboardForm.name.slice(0, 2).toUpperCase(),
      monogramBg: "bg-indigo-600",
      sector: onboardForm.industry,
      industry: onboardForm.industry,
      stage: onboardForm.stage,
      status: "Active",
      funding: onboardForm.funding || "$0",
      fundingRaised: onboardForm.funding || "$0",
      mrr: 0,
      arr: 0,
      customers: 0,
      cohort: onboardForm.cohort,
      tagline: onboardForm.pitch || "Newly onboarded incubator cohort startup.",
      pitch: onboardForm.pitch || "Newly onboarded incubator cohort startup.",
      founder: onboardForm.founder || "Lead Founder",
      founderEmail: onboardForm.founderEmail || "",
      website: `https://${onboardForm.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      allocatedMentors: [],
      allocatedInvestors: [],
      coIncubators: [],
    };

    setStartups([newStartup, ...startups]);
    setOnboardForm({
      name: "",
      founder: "",
      founderEmail: "",
      industry: "Tech",
      stage: "Idea",
      funding: "$0",
      cohort: "Cohort 2026",
      pitch: "",
    });
    setIsOnboardOpen(false);
    showToast(`Successfully onboarded ${newStartup.name}!`);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[120] bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl animate-in slide-in-from-bottom duration-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toast}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Portfolio Hub
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Startups Directory</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage cohort startups, track growth milestones, allocate mentors, investors, and MOUs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => setIsOnboardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Onboard Startup</span>
            </button>
            <button
              onClick={() => {
                if (startups.length > 0) handleTriggerAllocateMentor(startups[0]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 shadow-xs transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Allocate Mentor</span>
            </button>
            <button
              onClick={() => {
                if (startups.length > 0) handleTriggerAllocateInvestor(startups[0]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 shadow-xs transition-colors cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Allocate Investor</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-6 space-y-5 flex-1">
          {/* KPI Stats Bar (6 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Total Startups</span>
                <Rocket className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-bold text-slate-900">{totalCount}</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">
                {activeCount} active in program
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Total Capital Raised</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-slate-900">{totalCapitalRaisedFormatted}</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">Across portfolio</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Graduation Rate</span>
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-slate-900">{graduationRate || 85}%</div>
              <div className="text-[10px] text-purple-600 font-medium mt-1">Alumni completed</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Allocated Mentors</span>
                <UserCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-bold text-slate-900">{totalMentorsAllocated}</div>
              <div className="text-[10px] text-indigo-600 font-medium mt-1">General & SME pool</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Investor Allocated</span>
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-xl font-bold text-slate-900">{totalInvestorsAllocated}</div>
              <div className="text-[10px] text-teal-600 font-medium mt-1">Warm to term sheets</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Co-Incubator MOUs</span>
                <Handshake className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-bold text-slate-900">{totalCoIncubations}</div>
              <div className="text-[10px] text-amber-600 font-medium mt-1">Cross-hub alliances</div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search startups by name, founder, industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Industries</option>
                <option value="HealthTech">HealthTech / AI</option>
                <option value="FinTech">FinTech</option>
                <option value="CleanTech">CleanTech</option>
                <option value="AgriTech">AgriTech</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>

              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Stages</option>
                <option value="Idea">Idea</option>
                <option value="MVP">MVP</option>
                <option value="Revenue">Revenue</option>
                <option value="Growth">Growth</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="name-asc">Sort: Name (A-Z)</option>
                <option value="name-desc">Sort: Name (Z-A)</option>
              </select>

              <div className="border-l border-slate-200 pl-2 flex items-center gap-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Directory Content (Grid / List) */}
          {viewMode === "grid" ? (
            <StartupGrid
              startups={filteredStartups}
              onSelectStartup={handleOpenProfile}
              onAllocateMentorClick={handleTriggerAllocateMentor}
              onAllocateInvestorClick={handleTriggerAllocateInvestor}
              onCoIncubatorClick={handleTriggerAddCoIncubator}
            />
          ) : (
            <StartupList
              startups={filteredStartups}
              onSelectStartup={handleOpenProfile}
              onAllocateMentorClick={handleTriggerAllocateMentor}
              onAllocateInvestorClick={handleTriggerAllocateInvestor}
              onCoIncubatorClick={handleTriggerAddCoIncubator}
            />
          )}
        </div>
      </main>

      {/* Startup Profile Modal (Drawer) */}
      <StartupDetailModal
        startup={selectedStartup}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAllocateMentorClick={handleTriggerAllocateMentor}
        onRemoveMentor={handleRemoveMentor}
        onAllocateInvestorClick={handleTriggerAllocateInvestor}
        onUpdateInvestorInterest={handleUpdateInvestorInterest}
        onRemoveInvestor={handleRemoveInvestor}
        onAddCoIncubatorClick={handleTriggerAddCoIncubator}
        onSignMOUClick={handleTriggerSignMOU}
        onRemoveCoIncubator={handleRemoveCoIncubator}
      />

      {/* Action Modals */}
      <AllocateMentorModal
        isOpen={isMentorModalOpen}
        onClose={() => setIsMentorModalOpen(false)}
        onAllocate={handleConfirmAllocateMentor}
        startupName={targetStartupForAction?.name || "Startup"}
      />

      <AllocateInvestorModal
        isOpen={isInvestorModalOpen}
        onClose={() => setIsInvestorModalOpen(false)}
        onAllocate={handleConfirmAllocateInvestor}
        startupName={targetStartupForAction?.name || "Startup"}
      />

      <AddCoIncubatorModal
        isOpen={isCoIncubatorModalOpen}
        onClose={() => setIsCoIncubatorModalOpen(false)}
        onAdd={handleConfirmAddCoIncubator}
        startupName={targetStartupForAction?.name || "Startup"}
      />

      <SignMOUModal
        isOpen={isSignMOUModalOpen}
        onClose={() => setIsSignMOUModalOpen(false)}
        onSign={handleConfirmSignMOU}
        partner={activePartnerForMOU}
        startupName={targetStartupForAction?.name || "Startup"}
      />

      {/* Onboard Startup Modal */}
      {isOnboardOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-semibold text-slate-800 text-base">Onboard New Startup</h3>
                <p className="text-xs text-slate-500 mt-0.5">Register a startup into the incubator cohort</p>
              </div>
              <button
                onClick={() => setIsOnboardOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Startup Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HealthSync AI"
                    value={onboardForm.name}
                    onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Industry Sector</label>
                  <select
                    value={onboardForm.industry}
                    onChange={(e) => setOnboardForm({ ...onboardForm, industry: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Tech">Technology / AI</option>
                    <option value="FinTech">FinTech</option>
                    <option value="HealthTech">HealthTech</option>
                    <option value="CleanTech">CleanTech</option>
                    <option value="AgriTech">AgriTech</option>
                    <option value="SaaS">B2B SaaS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Founder Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={onboardForm.founder}
                    onChange={(e) => setOnboardForm({ ...onboardForm, founder: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Founder Email</label>
                  <input
                    type="email"
                    placeholder="founder@startup.com"
                    value={onboardForm.founderEmail}
                    onChange={(e) => setOnboardForm({ ...onboardForm, founderEmail: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Stage</label>
                  <select
                    value={onboardForm.stage}
                    onChange={(e) => setOnboardForm({ ...onboardForm, stage: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Idea">Idea</option>
                    <option value="MVP">MVP</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Growth">Growth</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Cohort</label>
                  <input
                    type="text"
                    value={onboardForm.cohort}
                    onChange={(e) => setOnboardForm({ ...onboardForm, cohort: e.target.value })}
                    placeholder="Cohort 2026"
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Funding Raised</label>
                  <input
                    type="text"
                    value={onboardForm.funding}
                    onChange={(e) => setOnboardForm({ ...onboardForm, funding: e.target.value })}
                    placeholder="$250K"
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Elevator Pitch / Tagline</label>
                <textarea
                  rows={2}
                  value={onboardForm.pitch}
                  onChange={(e) => setOnboardForm({ ...onboardForm, pitch: e.target.value })}
                  placeholder="One sentence description of the product and value proposition..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOnboardOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Register & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
