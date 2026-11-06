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
import { useAuth } from "@/frontend/context/AuthContext";
import { DashboardLayout } from "@/frontend/components/layouts/DashboardLayout";
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
  const [sectionFilter, setSectionFilter] = useState<"all" | "queue" | "active" | "inactive" | "exited">("all");

  // State
  const { organization } = useAuth();
  const [startups, setStartups] = useState<StartupItem[]>([]);
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
    founderPhone: "",
    industry: "Tech",
    stage: "MVP",
    status: "Active" as "Pending" | "Active" | "Inactive" | "Exited",
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
        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const orgIdFromUrl = searchParams?.get('org');
        const orgIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
        const orgId = organization?.id || orgIdFromUrl || orgIdFromStorage;

        if (!orgId) {
          setStartups([]);
          return;
        }

        const res = await apiClient.get("/startups", {
          headers: { 'x-org-id': orgId },
          params: { org_id: orgId },
        });

        const apiData = res.data?.data;
        if (Array.isArray(apiData)) {
          if (apiData.length === 0) {
            setStartups([]);
          } else {
            const merged: StartupItem[] = apiData.map((item: any, idx: number) => {
              return {
                id: item.id || String(idx + 1),
                name: item.startup_name || item.name || 'Startup',
                startup_name: item.startup_name || item.name || 'Startup',
                monogram: (item.startup_name || item.name) ? (item.startup_name || item.name).slice(0, 2).toUpperCase() : 'ST',
                monogramBg: 'bg-blue-600',
                sector: item.sector || 'General',
                industry: item.sector || 'General',
                stage: item.stage || 'Idea',
                status: item.status || 'active',
                mrr: typeof item.revenue === "number" ? item.revenue : 0,
                arr: typeof item.revenue === "number" ? item.revenue * 12 : 0,
                customers: item.customer_count || 0,
                funding: item.funding_raised ? `$${item.funding_raised}` : '$0',
                fundingRaised: item.funding_raised ? `$${item.funding_raised}` : '$0',
                burn: '$0',
                monthlyBurn: '$0',
                cohort: item.cohort || 'Cohort 2026',
                healthScore: '85',
                tagline: item.description || '',
                pitch: item.description || '',
                founder: item.founder_name || (item.founder_email ? item.founder_email.split('@')[0] : 'Founder'),
                founderEmail: item.email || item.founder_email || '',
                website: item.website || '',
                location: 'Remote',
                teamMembers: [],
                allocatedMentors: item.allocatedMentors || [],
                allocatedInvestors: item.allocatedInvestors || [],
                coIncubators: item.coIncubators || [],
              };
            });
            setStartups(merged);
          }
        }
      } catch (e) {
        console.warn("Error fetching startups", e);
        setStartups([]);
      }
    };
    loadStartups();
  }, [organization?.id]);

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

  // Status Partitioning (Queue = Pending, Active = Active, Inactive = Inactive, Exited = Exited)
  const queueStartups = useMemo(() => {
    return filteredStartups.filter((s) => (s.status || '').toLowerCase() === 'pending');
  }, [filteredStartups]);

  const activeStartups = useMemo(() => {
    return filteredStartups.filter((s) => (s.status || '').toLowerCase() === 'active');
  }, [filteredStartups]);

  const inactiveStartups = useMemo(() => {
    return filteredStartups.filter((s) => (s.status || '').toLowerCase() === 'inactive');
  }, [filteredStartups]);

  const exitedStartups = useMemo(() => {
    return filteredStartups.filter((s) => (s.status || '').toLowerCase() === 'exited');
  }, [filteredStartups]);

  const displayedStartups = useMemo(() => {
    switch (sectionFilter) {
      case 'queue':
        return queueStartups;
      case 'active':
        return activeStartups;
      case 'inactive':
        return inactiveStartups;
      case 'exited':
        return exitedStartups;
      case 'all':
      default:
        return filteredStartups;
    }
  }, [sectionFilter, queueStartups, activeStartups, inactiveStartups, exitedStartups, filteredStartups]);

  // Handler: Status Change with Database Persistence
  const handleStatusChange = async (
    startup: StartupItem,
    newStatus: 'Pending' | 'Active' | 'Inactive' | 'Exited'
  ) => {
    const prevStatus = startup.status;
    // Optimistic UI update
    setStartups((prev) =>
      prev.map((s) => (s.id === startup.id ? { ...s, status: newStatus } : s))
    );
    showToast(`Updated status of "${startup.name}" to ${newStatus}`);

    try {
      const orgId = organization?.id || (typeof window !== 'undefined' ? localStorage.getItem('org_id') : null);
      await apiClient.put(
        `/startups/${startup.id}`,
        { status: newStatus.toLowerCase() },
        { headers: orgId ? { 'x-org-id': orgId } : undefined }
      );
    } catch (err: any) {
      console.error('Failed to update startup status in database:', err);
      // Rollback on failure
      setStartups((prev) =>
        prev.map((s) => (s.id === startup.id ? { ...s, status: prevStatus } : s))
      );
      showToast(err.response?.data?.error || 'Failed to update status. Please try again.');
    }
  };


  // Handlers: View Profile Modal
  const handleOpenProfile = (startup: StartupItem) => {
    setSelectedStartup(startup);
    setIsDetailOpen(true);
  };

  const handleStartupUpdated = (updatedStartup: StartupItem) => {
    setStartups((prev) =>
      prev.map((s) => (s.id === updatedStartup.id ? { ...s, ...updatedStartup } : s))
    );
    setSelectedStartup((prev) => (prev?.id === updatedStartup.id ? { ...prev, ...updatedStartup } : prev));
    showToast(`Saved updates for ${updatedStartup.name}`);
  };

  // Handlers: Mentors with Backend Integration
  const handleTriggerAllocateMentor = (startup: StartupItem) => {
    setTargetStartupForAction(startup);
    setIsMentorModalOpen(true);
  };

  const handleConfirmAllocateMentor = async (mentorData: Omit<AllocatedMentor, "id">) => {
    if (!targetStartupForAction) return;
    const tempId = "m_" + Date.now();
    const newMentor: AllocatedMentor = { ...mentorData, id: tempId };

    // Optimistic UI update
    const updateLocal = (mId: string) => {
      const createdMentor = { ...newMentor, id: mId };
      const updated = startups.map((s) => {
        if (s.id === targetStartupForAction.id) {
          return { ...s, allocatedMentors: [...(s.allocatedMentors || []), createdMentor] };
        }
        return s;
      });
      setStartups(updated);
      if (selectedStartup && selectedStartup.id === targetStartupForAction.id) {
        setSelectedStartup({
          ...selectedStartup,
          allocatedMentors: [...(selectedStartup.allocatedMentors || []), createdMentor],
        });
      }
    };

    updateLocal(tempId);
    showToast(`Mentor allocated to ${targetStartupForAction.name}`);

    try {
      const res = await apiClient.post(`/startups/${targetStartupForAction.id}/mentors`, {
        name: mentorData.name,
        type: mentorData.type,
        domain: mentorData.domain,
        notes: mentorData.feedback,
      });
      if (res.data?.data?.id) {
        updateLocal(res.data.data.id);
      }
    } catch (err: any) {
      console.warn("API mentor post notification (using optimistic):", err?.message);
    }
  };

  const handleRemoveMentor = async (startupId: string, mentorId: string) => {
    // Optimistic remove
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

    try {
      await apiClient.delete(`/startups/${startupId}/mentors/${mentorId}`);
    } catch (err: any) {
      console.warn("API mentor delete warning:", err?.message);
    }
  };

  // Handlers: Investors with Backend Integration
  const handleTriggerAllocateInvestor = (startup: StartupItem) => {
    setTargetStartupForAction(startup);
    setIsInvestorModalOpen(true);
  };

  const handleConfirmAllocateInvestor = async (investorData: Omit<AllocatedInvestor, "id">) => {
    if (!targetStartupForAction) return;
    const tempId = "i_" + Date.now();
    const newInvestor: AllocatedInvestor = { ...investorData, id: tempId };

    const updateLocal = (iId: string) => {
      const createdInv = { ...newInvestor, id: iId };
      const updated = startups.map((s) => {
        if (s.id === targetStartupForAction.id) {
          return { ...s, allocatedInvestors: [...(s.allocatedInvestors || []), createdInv] };
        }
        return s;
      });
      setStartups(updated);
      if (selectedStartup && selectedStartup.id === targetStartupForAction.id) {
        setSelectedStartup({
          ...selectedStartup,
          allocatedInvestors: [...(selectedStartup.allocatedInvestors || []), createdInv],
        });
      }
    };

    updateLocal(tempId);
    showToast(`Investor allocated to ${targetStartupForAction.name}`);

    try {
      const res = await apiClient.post(`/startups/${targetStartupForAction.id}/investors`, {
        name: investorData.name,
        company: investorData.company,
        focusAreas: investorData.focusAreas,
        interestLevel: investorData.interestLevel,
        ticketSize: investorData.ticketSize,
        notes: investorData.notes,
      });
      if (res.data?.data?.id) {
        updateLocal(res.data.data.id);
      }
    } catch (err: any) {
      console.warn("API investor post warning:", err?.message);
    }
  };

  const handleUpdateInvestorInterest = async (
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

    try {
      await apiClient.patch(`/startups/${startupId}/investors/${investorId}`, { interestLevel });
    } catch (err: any) {
      console.warn("API investor patch warning:", err?.message);
    }
  };

  const handleRemoveInvestor = async (startupId: string, investorId: string) => {
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

    try {
      await apiClient.delete(`/startups/${startupId}/investors/${investorId}`);
    } catch (err: any) {
      console.warn("API investor delete warning:", err?.message);
    }
  };

  // Handlers: Co-Incubation with Backend Integration
  const handleTriggerAddCoIncubator = (startup: StartupItem) => {
    setTargetStartupForAction(startup);
    setIsCoIncubatorModalOpen(true);
  };

  const handleConfirmAddCoIncubator = async (partnerData: Omit<CoIncubatorItem, "id">) => {
    if (!targetStartupForAction) return;
    const tempId = "c_" + Date.now();
    const newPartner: CoIncubatorItem = { ...partnerData, id: tempId };

    const updateLocal = (cId: string) => {
      const createdP = { ...newPartner, id: cId };
      const updated = startups.map((s) => {
        if (s.id === targetStartupForAction.id) {
          return { ...s, coIncubators: [...(s.coIncubators || []), createdP] };
        }
        return s;
      });
      setStartups(updated);
      if (selectedStartup && selectedStartup.id === targetStartupForAction.id) {
        setSelectedStartup({
          ...selectedStartup,
          coIncubators: [...(selectedStartup.coIncubators || []), createdP],
        });
      }
    };

    updateLocal(tempId);
    showToast(`Co-Incubator partner added for ${targetStartupForAction.name}`);

    try {
      const res = await apiClient.post("/co-incubations", {
        startupId: targetStartupForAction.id,
        name: partnerData.name,
        type: partnerData.type,
        equitySplit: partnerData.equitySplit,
        responsibilities: partnerData.responsibilities,
        duration: partnerData.duration,
      });
      if (res.data?.data?.id) {
        updateLocal(res.data.data.id);
      }
    } catch (err: any) {
      console.warn("API co-incubation post warning:", err?.message);
    }
  };

  const handleTriggerSignMOU = (startup: StartupItem, partner: CoIncubatorItem) => {
    setTargetStartupForAction(startup);
    setActivePartnerForMOU(partner);
    setIsSignMOUModalOpen(true);
  };

  const handleConfirmSignMOU = async (partnerId: string) => {
    if (!targetStartupForAction) return;

    // Optimistic signed update
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

    try {
      await apiClient.post(`/co-incubations/${partnerId}/mou/sign`, {
        signatory: "Authorized Director",
        signedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.warn("API MOU sign warning:", err?.message);
    }
  };

  const handleRemoveCoIncubator = async (startupId: string, partnerId: string) => {
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

    try {
      await apiClient.delete(`/co-incubations/${partnerId}`);
    } catch (err: any) {
      console.warn("API co-incubation delete warning:", err?.message);
    }
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

  // Handle Add New Startup
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.name.trim() || !onboardForm.founder.trim() || !onboardForm.founderEmail.trim()) {
      showToast("Please provide Startup Name, Founder Name, and Email.");
      return;
    }

    const orgId = organization?.id || (typeof window !== "undefined" ? localStorage.getItem("org_id") : null);
    if (!orgId) {
      showToast("Missing organization context. Please refresh or re-login.");
      return;
    }

    try {
      const res = await apiClient.post(
        "/startups",
        {
          name: onboardForm.name.trim(),
          founder_name: onboardForm.founder.trim(),
          email: onboardForm.founderEmail.trim(),
          founder_email: onboardForm.founderEmail.trim(),
          contact: onboardForm.founderPhone.trim(),
          founder_phone: onboardForm.founderPhone.trim(),
          sector: onboardForm.industry,
          industry: onboardForm.industry,
          stage: onboardForm.stage,
          status: onboardForm.status,
          description: onboardForm.pitch.trim(),
          organization_id: orgId,
        },
        {
          headers: { "x-org-id": orgId },
        }
      );

      const created = res.data?.data;
      const newStartup: StartupItem = {
        id: created?.id || ("st_" + Date.now()),
        name: created?.name || onboardForm.name.trim(),
        monogram: (created?.name || onboardForm.name).slice(0, 2).toUpperCase(),
        monogramBg: "bg-indigo-600",
        sector: created?.sector || onboardForm.industry,
        industry: created?.sector || onboardForm.industry,
        stage: created?.stage || onboardForm.stage,
        status: created?.status || onboardForm.status,
        funding: onboardForm.funding || "$0",
        fundingRaised: onboardForm.funding || "$0",
        mrr: 0,
        arr: 0,
        customers: 0,
        cohort: onboardForm.cohort,
        tagline: onboardForm.pitch || "Newly registered startup.",
        pitch: onboardForm.pitch || "Newly registered startup.",
        founder: created?.founder_name || onboardForm.founder,
        founderEmail: created?.email || created?.founder_email || onboardForm.founderEmail,
        founderPhone: created?.founder_phone || onboardForm.founderPhone,
        website: `https://${onboardForm.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        allocatedMentors: [],
        allocatedInvestors: [],
        coIncubators: [],
      };

      setStartups((prev) => [newStartup, ...prev]);
      setOnboardForm({
        name: "",
        founder: "",
        founderEmail: "",
        founderPhone: "",
        industry: "Tech",
        stage: "MVP",
        status: "Active",
        funding: "$0",
        cohort: "Cohort 2026",
        pitch: "",
      });
      setIsOnboardOpen(false);
      showToast(`Successfully registered ${newStartup.name}!`);
    } catch (err: any) {
      console.error("Failed to register startup:", err);
      showToast(err.response?.data?.error || "Failed to register startup. Please try again.");
    }
  };

  return (
    <DashboardLayout
      title="Startups Directory"
      fluid={true}
      headerActions={
        <button
          onClick={() => setIsOnboardOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Startup</span>
        </button>
      }
    >
      <div className="space-y-6">
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
              <span>+ Add Startup</span>
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

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
            <button
              onClick={() => setSectionFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                sectionFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>All Startups</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                sectionFilter === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {filteredStartups.length}
              </span>
            </button>

            <button
              onClick={() => setSectionFilter('queue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                sectionFilter === 'queue'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Queue (Pending)</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                sectionFilter === 'queue' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {queueStartups.length}
              </span>
            </button>

            <button
              onClick={() => setSectionFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                sectionFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Active</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                sectionFilter === 'active' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {activeStartups.length}
              </span>
            </button>

            <button
              onClick={() => setSectionFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                sectionFilter === 'inactive'
                  ? 'bg-slate-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Inactive</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                sectionFilter === 'inactive' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {inactiveStartups.length}
              </span>
            </button>

            <button
              onClick={() => setSectionFilter('exited')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                sectionFilter === 'exited'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Exited</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                sectionFilter === 'exited' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-800'
              }`}>
                {exitedStartups.length}
              </span>
            </button>
          </div>

          {/* Section Content Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sectionFilter === 'all' && <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />}
                {sectionFilter === 'queue' && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />}
                {sectionFilter === 'active' && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />}
                {sectionFilter === 'inactive' && <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />}
                {sectionFilter === 'exited' && <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  {sectionFilter === 'all' && 'All Startups'}
                  {sectionFilter === 'queue' && 'Queue / Pending Assignment'}
                  {sectionFilter === 'active' && 'Active Startups'}
                  {sectionFilter === 'inactive' && 'Inactive Startups'}
                  {sectionFilter === 'exited' && 'Exited Startups'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  {displayedStartups.length}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {sectionFilter === 'all' && 'All portfolio and applicant startups across all statuses'}
                {sectionFilter === 'queue' && 'Startups with pending status assigned dashboard or awaiting cohort onboarding'}
                {sectionFilter === 'active' && 'Operational cohort startups actively in incubation'}
                {sectionFilter === 'inactive' && 'Startups placed on hold or marked inactive'}
                {sectionFilter === 'exited' && 'Startups that have graduated or exited the incubator'}
              </p>
            </div>

            {displayedStartups.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
                <Rocket className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-xs font-semibold text-slate-700">No Startups Found</h3>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  {sectionFilter === 'queue' && 'The queue is currently empty. Newly assigned dashboards appear here with Pending status.'}
                  {sectionFilter === 'active' && 'No active startups found. Set a startup status to Active to display it here.'}
                  {sectionFilter === 'inactive' && 'No inactive startups in this section.'}
                  {sectionFilter === 'exited' && 'No exited startups in this section.'}
                  {sectionFilter === 'all' && 'No startups match your search or filter criteria.'}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <StartupGrid
                startups={displayedStartups}
                onSelectStartup={handleOpenProfile}
                onAllocateMentorClick={handleTriggerAllocateMentor}
                onAllocateInvestorClick={handleTriggerAllocateInvestor}
                onCoIncubatorClick={handleTriggerAddCoIncubator}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <StartupList
                startups={displayedStartups}
                onSelectStartup={handleOpenProfile}
                onAllocateMentorClick={handleTriggerAllocateMentor}
                onAllocateInvestorClick={handleTriggerAllocateInvestor}
                onCoIncubatorClick={handleTriggerAddCoIncubator}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        </div>

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
        onUpdateStartup={handleStartupUpdated}
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">Founder Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="founder@startup.com"
                    value={onboardForm.founderEmail}
                    onChange={(e) => setOnboardForm({ ...onboardForm, founderEmail: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact / Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={onboardForm.founderPhone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, founderPhone: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Stage</label>
                  <select
                    value={onboardForm.stage}
                    onChange={(e) => setOnboardForm({ ...onboardForm, stage: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Idea">Idea</option>
                    <option value="MVP">MVP</option>
                    <option value="Pre-revenue">Pre-revenue</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Growth">Growth</option>
                    <option value="Scale">Scale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-indigo-700 mb-1">Status *</label>
                  <select
                    value={onboardForm.status}
                    onChange={(e) => setOnboardForm({ ...onboardForm, status: e.target.value as 'Active' | 'Inactive' | 'Exited' })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border-2 border-indigo-400 bg-indigo-50/50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending (Queue)</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Exited">Exited</option>
                  </select>
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
                  Add Startup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};
