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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Lock,
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
import { Modal } from "@/frontend/components/ui/Modal";
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

interface StartupsMemoryCache {
  key: string;
  startups: StartupItem[];
  coIncubatedStartups: StartupItem[];
  totalCount: number;
  overallTotal: number;
  statusCounts: Record<string, number>;
  dashboardsAssignedCount: number;
  timestamp: number;
}
let startupsMemoryCache: StartupsMemoryCache | null = null;

export const StartupsPage: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sectionFilter, setSectionFilter] = useState<"all" | "queue" | "active" | "inactive" | "exited" | "co-incubated">("all");
  const [coIncubatedStartups, setCoIncubatedStartups] = useState<StartupItem[]>(() => startupsMemoryCache?.coIncubatedStartups || []);

  // State
  const { organization, user } = useAuth();
  const userOrgId = (user as any)?.organization_id;
  const userId = user?.id;

  // Restore from memory cache so page loads instantly without flashing skeletons when returning
  const [loading, setLoading] = useState<boolean>(() => !startupsMemoryCache || startupsMemoryCache.startups.length === 0);
  const [startups, setStartups] = useState<StartupItem[]>(() => startupsMemoryCache?.startups || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query to avoid race conditions with backend requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const [selectedIndustry, setSelectedIndustry] = useState("ALL");
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [selectedDashboard, setSelectedDashboard] = useState<string>("all");
  const [dashboardsAssignedCount, setDashboardsAssignedCount] = useState<number>(() => startupsMemoryCache?.dashboardsAssignedCount || 0);
  const [selectedCohort, setSelectedCohort] = useState("ALL");
  const [sortBy, setSortBy] = useState("name-asc");

  // Track last fetched query parameters and timestamp to prevent unnecessary auto-reloading
  const lastFetchedRef = React.useRef<{ key: string; time: number }>({
    key: startupsMemoryCache?.key || "",
    time: startupsMemoryCache?.timestamp || 0,
  });

  // Server-side pagination state synced with URL params (?page=1&limit=5)
  const [page, setPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const p = parseInt(sp.get("page") || "1", 10);
      return p > 0 ? p : 1;
    }
    return 1;
  });
  const [limit, setLimit] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const l = parseInt(sp.get("limit") || "5", 10);
      return [5, 15, 30].includes(l) ? l : 5;
    }
    return 5;
  });
  const [serverTotalCount, setServerTotalCount] = useState<number>(() => startupsMemoryCache?.totalCount || 0);
  const [overallTotal, setOverallTotal] = useState<number>(() => startupsMemoryCache?.overallTotal || 0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>(() => startupsMemoryCache?.statusCounts || {});
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const bulkMenuRef = React.useRef<HTMLDivElement>(null);

  // Sync page and limit to URL search params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));
    window.history.replaceState({}, "", url.toString());
  }, [page, limit]);

  useEffect(() => {
    if (!bulkMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (bulkMenuRef.current && !bulkMenuRef.current.contains(event.target as Node)) {
        setBulkMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [bulkMenuOpen]);

  // Modals state
  const [selectedStartup, setSelectedStartup] = useState<StartupItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Quick Action Modal states
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [isInvestorModalOpen, setIsInvestorModalOpen] = useState(false);
  const [isCoIncubatorModalOpen, setIsCoIncubatorModalOpen] = useState(false);
  const [preselectedPartnerForAction, setPreselectedPartnerForAction] = useState<any>(null);
  const [isSignMOUModalOpen, setIsSignMOUModalOpen] = useState(false);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  const [activePartnerForMOU, setActivePartnerForMOU] = useState<CoIncubatorItem | null>(null);
  const [targetStartupForAction, setTargetStartupForAction] = useState<StartupItem | null>(null);

  // Newly Created Startup Credentials Modal State
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    startupName: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<'all' | 'email' | 'password' | null>(null);
  const [onboardError, setOnboardError] = useState<string | null>(null);

  // New Startup Onboard Form State
  const [onboardForm, setOnboardForm] = useState({
    name: "",
    founder: "",
    founderEmail: "",
    founderPhone: "",
    industry: "",
    stage: "Idea",
    status: "Pending" as "Pending" | "Active" | "Inactive" | "Exited",
    funding: "$0",
    cohort: "",
    pitch: "",
  });

  // Combobox State for Startup Name in Onboard Modal
  interface StartupOptionItem {
    id: string;
    name: string;
    sector: string;
    stage: string;
    founder_name: string;
    founder_email: string;
    phone: string;
    tagline: string;
  }
  const [startupOptions, setStartupOptions] = useState<StartupOptionItem[]>([]);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isNameLocked, setIsNameLocked] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null);
  const comboboxRef = React.useRef<HTMLDivElement>(null);

  const fetchStartupOptions = async (query: string) => {
    setIsOptionsLoading(true);
    try {
      let list: StartupOptionItem[] = [];
      try {
        const res = await apiClient.get('/incubator/startups/options', {
          params: { q: query },
        });
        const data = res.data;
        list = Array.isArray(data) ? data : (data?.data || data?.options || []);
      } catch {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('access_token') || localStorage.getItem('token')) : null;
        const orgId = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (orgId) headers['x-org-id'] = orgId;

        const res = await fetch(`/api/incubator/startups/options?q=${encodeURIComponent(query)}`, {
          headers,
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          list = Array.isArray(data) ? data : (data?.data || data?.options || []);
        }
      }
      setStartupOptions(list);
    } catch (err) {
      console.error("Failed to fetch startup options:", err);
    } finally {
      setIsOptionsLoading(false);
    }
  };

  // Debounced search for existing startups in incubator
  useEffect(() => {
    if (!isOnboardOpen || isNameLocked) return;

    const timer = setTimeout(() => {
      fetchStartupOptions(onboardForm.name.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [onboardForm.name, isOnboardOpen, isNameLocked]);

  // Close dropdown on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsOptionsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOptionsOpen(false);
      }
    };

    if (isOptionsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOptionsOpen]);

  const handleNameFocus = () => {
    if (isNameLocked) return;
    setIsOptionsOpen(true);
    fetchStartupOptions(onboardForm.name.trim());
  };

  const handleSelectStartupOption = (opt: StartupOptionItem) => {
    setSelectedStartupId(opt.id);
    setIsNameLocked(true);
    setIsOptionsOpen(false);
    setOnboardForm((prev) => ({
      ...prev,
      name: opt.name,
      industry: opt.sector || "",
      founder: opt.founder_name || "",
      founderEmail: opt.founder_email || "",
      founderPhone: opt.phone || "",
      stage: opt.stage || "Idea",
      pitch: opt.tagline || "",
    }));
  };

  const handleUnlockName = () => {
    setIsNameLocked(false);
    setSelectedStartupId(null);
    setIsOptionsOpen(true);
  };

  // Assign Dashboard Confirmation Modal State
  const [assignModalStartup, setAssignModalStartup] = useState<StartupItem | null>(null);
  const [isAssigningDashboard, setIsAssigningDashboard] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load from API with fallback
  useEffect(() => {
    const loadStartups = async () => {
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const orgIdFromUrl = searchParams?.get('org') || searchParams?.get('org_id');
      const orgIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
      let orgId = organization?.id || orgIdFromUrl || orgIdFromStorage || userOrgId;

      if (!orgId) {
        try {
          const meRes = await fetch('/api/v1/auth/me');
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData?.organization?.id) {
              orgId = meData.organization.id;
              if (typeof window !== 'undefined') localStorage.setItem('org_id', orgId);
            }
          }
        } catch {}
      }

      if (!orgId) {
        setStartups([]);
        setLoading(false);
        return;
      }

      const statusParam =
        sectionFilter !== "all" && sectionFilter !== "co-incubated"
          ? sectionFilter === "queue"
            ? "pending"
            : sectionFilter
          : undefined;

      const currentKey = `${orgId}_${page}_${limit}_${debouncedSearch}_${selectedIndustry}_${selectedStage}_${selectedDashboard}_${sectionFilter}`;

      // Prevent unnecessary auto-reloading if data for this exact query was already fetched recently (within 5 mins)
      if (
        lastFetchedRef.current.key === currentKey &&
        Date.now() - lastFetchedRef.current.time < 300000 &&
        startups.length > 0
      ) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await apiClient.get("/startups", {
          headers: { "x-org-id": orgId },
          params: {
            org_id: orgId,
            page,
            limit,
            search: debouncedSearch || undefined,
            sector: selectedIndustry !== "ALL" ? selectedIndustry : undefined,
            stage: selectedStage !== "ALL" ? selectedStage : undefined,
            status: statusParam,
            dashboard: selectedDashboard !== "all" ? selectedDashboard : undefined,
          },
        });

        let apiData = res.data?.data;
        // Strictly isolate by organization: only show startups assigned to this incubator
        if (Array.isArray(apiData)) {
          apiData = apiData.filter((item: any) => !item.organization_id || item.organization_id === orgId);
        } else {
          apiData = [];
        }

        const totalResult = typeof res.data?.total === "number" ? res.data.total : apiData.length;
        const assignedResult = typeof res.data?.dashboards_assigned === "number" ? res.data.dashboards_assigned : 0;
        const overallResult = typeof res.data?.overall_total === "number"
          ? res.data.overall_total
          : totalResult;
        const countsResult = res.data?.status_counts && typeof res.data.status_counts === "object"
          ? res.data.status_counts
          : {};

        setServerTotalCount(totalResult);
        setDashboardsAssignedCount(assignedResult);
        setOverallTotal(overallResult);
        setStatusCounts(countsResult);

        let mergedList: StartupItem[] = [];
        if (Array.isArray(apiData)) {
          if (apiData.length === 0) {
            setStartups([]);
          } else {
            mergedList = apiData.map((item: any, idx: number) => {
              return {
                id: item.id || String(idx + 1),
                name: item.startup_name || item.name || 'Startup',
                startup_name: item.startup_name || item.name || 'Startup',
                monogram: (item.startup_name || item.name) ? (item.startup_name || item.name).slice(0, 2).toUpperCase() : 'ST',
                monogramBg: 'bg-blue-600',
                sector: item.sector || '',
                industry: item.sector || '',
                stage: item.stage || 'Idea',
                status: item.status || 'Pending',
                admission_status: item.admission_status || null,
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
            setStartups(mergedList);
          }
        }

        // Load partner co-incubated startups (separated from own cohort)
        let coMapped: StartupItem[] = [];
        try {
          const coincRes = await apiClient.get('/co-incubations', {
            params: { view: 'partner', status: 'active' },
            headers: { 'x-org-id': orgId },
          });
          const cData = coincRes.data?.data;
          if (Array.isArray(cData)) {
            coMapped = cData.map((c: any, idx: number) => {
              const st = c.startup || {};
              const stName = st.startup_name || st.name || 'Co-incubated Startup';
              return {
                id: c.startup_id || ('coinc_st_' + idx),
                name: stName,
                startup_name: stName,
                monogram: stName.slice(0, 2).toUpperCase(),
                monogramBg: 'bg-purple-600',
                sector: st.sector || 'Cross-hub',
                industry: st.sector || 'Cross-hub',
                stage: st.stage || 'MVP',
                status: 'Active',
                mrr: 0,
                arr: 0,
                customers: 0,
                funding: '$0',
                fundingRaised: '$0',
                burn: '$0',
                monthlyBurn: '$0',
                cohort: c.primary_incubator?.name ? `Primary: ${c.primary_incubator.name}` : 'Co-incubated',
                healthScore: '90',
                tagline: `Co-incubated with ${c.primary_incubator?.name || 'partner'}`,
                pitch: '',
                founder: st.founder_email || 'Founder',
                founderEmail: st.founder_email || '',
                website: '',
                location: 'Partner Hub',
                is_active: true,
                is_co_incubated: true,
                co_incubation_id: c.id,
              } as any;
            });
            setCoIncubatedStartups(coMapped);
          }
        } catch {
          setCoIncubatedStartups([]);
        }

        // Save into memory cache to allow instant rendering when navigating between pages
        lastFetchedRef.current = { key: currentKey, time: Date.now() };
        startupsMemoryCache = {
          key: currentKey,
          startups: mergedList,
          coIncubatedStartups: coMapped,
          totalCount: totalResult,
          overallTotal: overallResult,
          statusCounts: countsResult,
          dashboardsAssignedCount: assignedResult,
          timestamp: Date.now(),
        };
      } catch (e) {
        console.warn("Error fetching startups", e);
        if (startups.length === 0) {
          setStartups([]);
        }
      } finally {
        setLoading(false);
      }
    };
    loadStartups();
  }, [organization?.id, userOrgId, userId, page, limit, debouncedSearch, selectedIndustry, selectedStage, selectedDashboard, sectionFilter, reloadTick]);

  // Filtered & Sorted startups
  const filteredStartups = useMemo(() => {
    return startups.filter((s) => {
      const industryVal = s.industry || s.sector || "";
      const matchSearch =
        debouncedSearch === "" ||
        s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (s.founder || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (s.founderEmail || "").toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchIndustry = selectedIndustry === "ALL" || industryVal.toLowerCase().includes(selectedIndustry.toLowerCase());
      const matchStage = selectedStage === "ALL" || s.stage.toLowerCase() === selectedStage.toLowerCase();
      const matchCohort = selectedCohort === "ALL" || (s.cohort || "") === selectedCohort;
      const matchDashboard =
        selectedDashboard === "all" ||
        (selectedDashboard === "assigned" && s.admission_status === "dashboard_assigned") ||
        (selectedDashboard === "unassigned" && s.admission_status !== "dashboard_assigned");

      return matchSearch && matchIndustry && matchStage && matchCohort && matchDashboard;
    }).sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });
  }, [startups, debouncedSearch, selectedIndustry, selectedStage, selectedCohort, selectedDashboard, sortBy]);

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
    if (sectionFilter === 'co-incubated') {
      const filtered = coIncubatedStartups.filter((s) => {
        if (!searchQuery) return true;
        return s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.industry || '').toLowerCase().includes(searchQuery.toLowerCase());
      });
      return filtered.slice((page - 1) * limit, page * limit);
    }
    return filteredStartups;
  }, [sectionFilter, filteredStartups, coIncubatedStartups, searchQuery, page, limit]);

  const effectiveTotal = sectionFilter === 'co-incubated'
    ? coIncubatedStartups.filter((s) => {
        if (!searchQuery) return true;
        return s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.industry || '').toLowerCase().includes(searchQuery.toLowerCase());
      }).length
    : serverTotalCount;

  const totalPages = Math.max(1, Math.ceil(effectiveTotal / limit));
  const from = effectiveTotal === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, effectiveTotal);

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

  const handleBulkStatusUpdate = async () => {
    if (!bulkTargetStatus || isBulkUpdating) return;
    setIsBulkUpdating(true);
    try {
      const orgId = organization?.id || (typeof window !== 'undefined' ? localStorage.getItem('org_id') : null);
      const res = await apiClient.post(
        '/startups/bulk-status',
        { status: bulkTargetStatus },
        { headers: orgId ? { 'x-org-id': orgId } : undefined }
      );
      const updated = typeof res.data?.updated_count === 'number' ? res.data.updated_count : 0;
      const label = bulkTargetStatus.charAt(0).toUpperCase() + bulkTargetStatus.slice(1);

      setBulkTargetStatus(null);
      setBulkMenuOpen(false);
      startupsMemoryCache = null;
      lastFetchedRef.current = { key: '', time: 0 };
      setReloadTick((t) => t + 1);
      showToast(`${label} set for ${updated} startups.`);
    } catch (err: any) {
      console.error('Failed to update statuses in bulk:', err);
      showToast(err?.response?.data?.error || err?.message || 'Failed to update statuses. Please try again.', 'error');
    } finally {
      setIsBulkUpdating(false);
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
    try {
      const res = await apiClient.post(`/startups/${targetStartupForAction.id}/mentors`, {
        mentor_id: mentorData.mentor_id,
        name: mentorData.name,
        type: mentorData.type,
        domain: mentorData.domain,
        notes: mentorData.feedback,
      });
      const createdMentor: AllocatedMentor = res.data?.data || {
        ...mentorData,
        id: "m_" + Date.now(),
        status: "pending",
      };
      setStartups((prev) =>
        prev.map((s) =>
          s.id === targetStartupForAction.id
            ? { ...s, allocatedMentors: [createdMentor, ...(s.allocatedMentors || [])] }
            : s
        )
      );
      if (selectedStartup && selectedStartup.id === targetStartupForAction.id) {
        setSelectedStartup((prev) =>
          prev
            ? { ...prev, allocatedMentors: [createdMentor, ...(prev.allocatedMentors || [])] }
            : prev
        );
      }
      showToast(`Mentor invitation sent to ${mentorData.name} for ${targetStartupForAction.name}`);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to allocate mentor");
      throw err;
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
  const handleTriggerAddCoIncubator = (startup: StartupItem, prefill?: any) => {
    setTargetStartupForAction(startup);
    setPreselectedPartnerForAction(prefill || null);
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
  const totalCount = overallTotal || serverTotalCount || startups.length;
  const activeCount = typeof statusCounts.active === "number"
    ? statusCounts.active
    : startups.filter((s) => s.status.toLowerCase() === "active").length;
  const graduatedCount = startups.filter((s) => s.status.toLowerCase() === "graduated").length;
  const graduationRate = totalCount > 0 ? Math.round((graduatedCount / totalCount) * 100) : 0;
  const totalMentorsAllocated = startups.reduce((acc, s) => acc + (s.allocatedMentors?.length || 0), 0);
  const totalInvestorsAllocated = startups.reduce((acc, s) => acc + (s.allocatedInvestors?.length || 0), 0);
  const totalCoIncubations = startups.reduce((acc, s) => acc + (s.coIncubators?.length || 0), 0);

  // Live count of startups where dashboard is assigned (combines loaded startup admission statuses and server count)
  const liveDashboardsAssignedCount = useMemo(() => {
    const assignedInList = startups.filter((s) => s.admission_status === "dashboard_assigned").length;
    return Math.max(dashboardsAssignedCount, assignedInList);
  }, [startups, dashboardsAssignedCount]);

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

  // Handle in-place dashboard assignment confirm via Modal
  const handleConfirmAssignDashboard = async () => {
    if (!assignModalStartup || isAssigningDashboard) return;
    setIsAssigningDashboard(true);
    try {
      const res = await apiClient.post(
        `/startups/${assignModalStartup.id}/assign-dashboard`
      );
      if (res.data?.success) {
        showToast("Dashboard access assigned successfully", "success");
        setStartups((prev) => {
          const updated = prev.map((s) =>
            s.id === assignModalStartup.id ? { ...s, admission_status: 'dashboard_assigned' } : s
          );
          if (startupsMemoryCache) {
            startupsMemoryCache.startups = updated;
            startupsMemoryCache.dashboardsAssignedCount = Math.max(
              startupsMemoryCache.dashboardsAssignedCount + 1,
              updated.filter((s) => s.admission_status === 'dashboard_assigned').length
            );
          }
          return updated;
        });
        setDashboardsAssignedCount((prev) => prev + 1);
        setAssignModalStartup(null);
      } else {
        showToast(res.data?.error || "Failed to assign dashboard access", "error");
      }
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to assign dashboard access";
      showToast(errMsg, "error");
    } finally {
      setIsAssigningDashboard(false);
    }
  };

  // Handle Add New Startup
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOnboardingLoading) return;
    setOnboardError(null);

    if (!onboardForm.name.trim() || !onboardForm.founder.trim() || !onboardForm.founderEmail.trim()) {
      setOnboardError("Please provide Startup Name, Founder Name, and Email.");
      showToast("Please provide Startup Name, Founder Name, and Email.");
      return;
    }

    let orgId = organization?.id || (typeof window !== "undefined" ? localStorage.getItem("org_id") : null);
    if (!orgId) {
      try {
        const meRes = await fetch('/api/v1/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData?.organization?.id) {
            orgId = String(meData.organization.id);
            if (typeof window !== 'undefined') localStorage.setItem('org_id', orgId);
          }
        }
      } catch {}
    }

    if (!orgId) {
      setOnboardError("Missing organization context. Please refresh or re-login.");
      showToast("Missing organization context. Please refresh or re-login.");
      return;
    }

    setIsOnboardingLoading(true);
    try {
      const res = await apiClient.post(
        "/startups",
        {
          id: selectedStartupId || undefined,
          name: onboardForm.name.trim(),
          founder_name: onboardForm.founder.trim(),
          email: onboardForm.founderEmail.trim(),
          founder_email: onboardForm.founderEmail.trim(),
          contact: onboardForm.founderPhone.trim() || null,
          founder_phone: onboardForm.founderPhone.trim() || null,
          sector: onboardForm.industry.trim() || null,
          industry: onboardForm.industry.trim() || null,
          stage: onboardForm.stage || 'Idea',
          status: (onboardForm.status || 'Pending').toLowerCase(),
          description: onboardForm.pitch.trim() || null,
          organization_id: orgId,
        },
        {
          headers: { "x-org-id": orgId },
        }
      );

      const created = res.data?.data;
      const credentials = res.data?.credentials;

      const newStartup: StartupItem = {
        id: created?.id || selectedStartupId || ("st_" + Date.now()),
        name: created?.name || onboardForm.name.trim(),
        monogram: (created?.name || onboardForm.name).slice(0, 2).toUpperCase(),
        monogramBg: "bg-indigo-600",
        sector: created?.sector || onboardForm.industry || "",
        industry: created?.sector || onboardForm.industry || "",
        stage: created?.stage || onboardForm.stage || "Idea",
        status: (created?.status ? (created.status.charAt(0).toUpperCase() + created.status.slice(1).toLowerCase()) : onboardForm.status) as any,
        funding: "$0",
        fundingRaised: "$0",
        mrr: 0,
        arr: 0,
        customers: 0,
        cohort: onboardForm.cohort || "",
        tagline: onboardForm.pitch || "",
        pitch: onboardForm.pitch || "",
        founder: created?.founder_name || onboardForm.founder,
        founderEmail: created?.email || created?.founder_email || onboardForm.founderEmail,
        founderPhone: created?.founder_phone || onboardForm.founderPhone || "",
        website: created?.website || "",
        allocatedMentors: [],
        allocatedInvestors: [],
        coIncubators: [],
      };

      setStartups((prev) => {
        const matchIdx = prev.findIndex(
          (s) =>
            (created?.id && s.id === created.id) ||
            (selectedStartupId && s.id === selectedStartupId) ||
            (s.name.trim().toLowerCase() === newStartup.name.trim().toLowerCase())
        );
        if (matchIdx >= 0) {
          const next = [...prev];
          next[matchIdx] = { ...next[matchIdx], ...newStartup };
          return next;
        }
        setServerTotalCount((c) => c + 1);
        setOverallTotal((c) => c + 1);
        setStatusCounts((counts) => ({
          ...counts,
          all: (counts.all || 0) + 1,
          queue: (counts.queue || 0) + 1,
        }));
        return [newStartup, ...prev];
      });

      // Reset cache so newly added startup is preserved
      startupsMemoryCache = null;
      lastFetchedRef.current = { key: "", time: 0 };

      setOnboardForm({
        name: "",
        founder: "",
        founderEmail: "",
        founderPhone: "",
        industry: "",
        stage: "Idea",
        status: "Pending",
        funding: "$0",
        cohort: "",
        pitch: "",
      });
      setIsNameLocked(false);
      setSelectedStartupId(null);
      setIsOptionsOpen(false);
      setIsOnboardOpen(false);
      showToast(
        res.data?.is_updated
          ? `Successfully updated ${newStartup.name}!`
          : `Successfully registered ${newStartup.name}!`
      );

      if (credentials?.email && credentials?.password) {
        setCreatedCredentials({
          email: credentials.email,
          password: credentials.password,
          startupName: newStartup.name,
        });
      }
    } catch (err: any) {
      console.error("Failed to register startup:", err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || "Failed to register startup. Please try again.";
      setOnboardError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setIsOnboardingLoading(false);
    }
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Startups' }]}>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-[120] text-xs px-4 py-2.5 rounded-lg shadow-xl animate-in slide-in-from-bottom duration-200 flex items-center gap-2 ${
              toast.type === "error"
                ? "bg-rose-600 text-white"
                : "bg-slate-900 text-white"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Startups
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage cohort startups, track growth milestones, allocate mentors, investors, and MOUs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setOnboardError(null);
                setIsNameLocked(false);
                setSelectedStartupId(null);
                setIsOptionsOpen(false);
                setIsOnboardOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add startup</span>
            </button>
          </div>
        </div>

        {/* KPI Stats Bar (6 Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-normal text-slate-500">Total startups</div>
            <div className="text-xl font-semibold text-slate-900 mt-1">{totalCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">{activeCount} active</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              Dashboards assigned: {liveDashboardsAssignedCount} / {totalCount}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-normal text-slate-500">Capital raised</div>
            <div className="text-xl font-semibold text-slate-900 mt-1">{totalCapitalRaisedFormatted}</div>
            <div className="text-xs text-slate-500 mt-0.5">Across portfolio</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-normal text-slate-500">Graduation rate</div>
            <div className="text-xl font-semibold text-slate-900 mt-1">{graduationRate || 85}%</div>
            <div className="text-xs text-slate-500 mt-0.5">Alumni completed</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-normal text-slate-500">Allocated mentors</div>
            <div className="text-xl font-semibold text-slate-900 mt-1">{totalMentorsAllocated}</div>
            <div className="text-xs text-slate-500 mt-0.5">General & SME pool</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-normal text-slate-500">Investor allocated</div>
            <div className="text-xl font-semibold text-slate-900 mt-1">{totalInvestorsAllocated}</div>
            <div className="text-xs text-slate-500 mt-0.5">Warm to term sheets</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-normal text-slate-500">Co-incubator MOUs</div>
            <div className="text-xl font-semibold text-slate-900 mt-1">{totalCoIncubations}</div>
            <div className="text-xs text-slate-500 mt-0.5">Cross-hub alliances</div>
          </div>
        </div>

        {/* Merged Filter & Status Tabs Row */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => {
                setSectionFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                sectionFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>All</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                sectionFilter === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {statusCounts.all ?? filteredStartups.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSectionFilter('queue');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                sectionFilter === 'queue'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Pending</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                sectionFilter === 'queue' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {statusCounts.queue ?? queueStartups.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSectionFilter('active');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                sectionFilter === 'active'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Active</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                sectionFilter === 'active' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {statusCounts.active ?? activeStartups.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSectionFilter('inactive');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                sectionFilter === 'inactive'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Inactive</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                sectionFilter === 'inactive' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {statusCounts.inactive ?? inactiveStartups.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSectionFilter('exited');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                sectionFilter === 'exited'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Exited</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                sectionFilter === 'exited' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {statusCounts.exited ?? exitedStartups.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSectionFilter('co-incubated');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                sectionFilter === 'co-incubated'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>Co-incubated</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                sectionFilter === 'co-incubated' ? 'bg-purple-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {coIncubatedStartups.length}
              </span>
            </button>
          </div>

          {/* Filters, Search & View Controls */}
          <div className="flex items-center gap-2 flex-1 justify-end min-w-[280px]">
            <div className="relative max-w-xs flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search startups..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedIndustry}
              onChange={(e) => {
                setSelectedIndustry(e.target.value);
                setPage(1);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All industries</option>
              <option value="HealthTech">HealthTech / AI</option>
              <option value="FinTech">FinTech</option>
              <option value="CleanTech">CleanTech</option>
              <option value="AgriTech">AgriTech</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>

            <select
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                setPage(1);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All stages</option>
              <option value="Idea">Idea</option>
              <option value="MVP">MVP</option>
              <option value="Revenue">Revenue</option>
              <option value="Growth">Growth</option>
            </select>

            <select
              value={selectedDashboard}
              onChange={(e) => {
                setSelectedDashboard(e.target.value);
                setPage(1);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All dashboards ({totalCount})</option>
              <option value="assigned">Assigned ({liveDashboardsAssignedCount})</option>
              <option value="unassigned">Not assigned ({Math.max(0, totalCount - liveDashboardsAssignedCount)})</option>
            </select>

            <div className="border-l border-slate-200 pl-2 flex items-center gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-slate-100 text-blue-600 font-semibold"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-slate-100 text-blue-600 font-semibold"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {sectionFilter === 'all' && (
          <div className="flex items-center justify-end">
            <div className="relative" ref={bulkMenuRef}>
              <button
                type="button"
                onClick={() => setBulkMenuOpen((open) => !open)}
                disabled={isBulkUpdating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
              >
                <span>Change status of all</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {bulkMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white border border-slate-200 rounded-lg shadow-xl py-1">
                  {['pending', 'active', 'inactive', 'exited'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setBulkTargetStatus(status);
                        setBulkMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer capitalize"
                    >
                      Set all to {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Content Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-slate-900">
                {loading ? (
                  <span className="text-slate-400">Loading startups...</span>
                ) : (
                  `${displayedStartups.length} ${displayedStartups.length === 1 ? 'startup' : 'startups'}`
                )}
              </h2>
            </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {sectionFilter === 'all' && 'All portfolio and applicant startups across all statuses'}
                {sectionFilter === 'queue' && 'Startups with pending status assigned dashboard or awaiting cohort onboarding'}
                {sectionFilter === 'active' && 'Operational cohort startups actively in incubation'}
                {sectionFilter === 'inactive' && 'Startups placed on hold or marked inactive'}
                {sectionFilter === 'exited' && 'Startups that have graduated or exited the incubator'}
              </p>
            </div>

            {loading ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: limit }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs animate-pulse space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-200" />
                          <div className="space-y-1.5">
                            <div className="h-4 w-28 bg-slate-200 rounded" />
                            <div className="h-3 w-16 bg-slate-100 rounded" />
                          </div>
                        </div>
                        <div className="h-5 w-14 bg-slate-100 rounded-full" />
                      </div>
                      <div className="space-y-2 py-1">
                        <div className="h-3 w-full bg-slate-100 rounded" />
                        <div className="h-3 w-4/5 bg-slate-100 rounded" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <div className="h-7 bg-slate-100 rounded" />
                        <div className="h-7 bg-slate-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {Array.from({ length: limit }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs animate-pulse flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-9 h-9 rounded-lg bg-slate-200" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 w-32 bg-slate-200 rounded" />
                          <div className="h-3 w-20 bg-slate-100 rounded" />
                        </div>
                      </div>
                      <div className="h-5 w-16 bg-slate-100 rounded-full" />
                      <div className="h-7 w-20 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
              )
            ) : displayedStartups.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
                <Rocket className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-xs font-semibold text-slate-700">No startups found</h3>
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
                onAssignDashboard={(startup) => setAssignModalStartup(startup)}
              />
            ) : (
              <StartupList
                startups={displayedStartups}
                onSelectStartup={handleOpenProfile}
                onAllocateMentorClick={handleTriggerAllocateMentor}
                onAllocateInvestorClick={handleTriggerAllocateInvestor}
                onCoIncubatorClick={handleTriggerAddCoIncubator}
                onStatusChange={handleStatusChange}
                onAssignDashboard={(startup) => setAssignModalStartup(startup)}
              />
            )}

            {/* Pagination Controls */}
            {!loading && effectiveTotal > 0 && (
              <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 mt-3">
                <div className="flex items-center gap-3">
                  <span>
                    Showing <span className="font-semibold text-slate-800">{from}–{to}</span> of{" "}
                    <span className="font-semibold text-slate-800">{effectiveTotal}</span>
                  </span>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1.5">
                    <span>Per page:</span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={15}>15</option>
                      <option value={30}>30</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-medium transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      if (
                        totalPages > 6 &&
                        p !== 1 &&
                        p !== totalPages &&
                        Math.abs(p - page) > 1
                      ) {
                        if (p === 2 || p === totalPages - 1) {
                          return <span key={p} className="px-1 text-slate-400">...</span>;
                        }
                        return null;
                      }
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-medium cursor-pointer transition ${
                            p === page
                              ? "bg-slate-900 text-white font-semibold"
                              : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-medium transition"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
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
        isReadOnly={Boolean((selectedStartup as any)?.is_co_incubated)}
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
        onClose={() => {
          setIsCoIncubatorModalOpen(false);
          setPreselectedPartnerForAction(null);
        }}
        onAdd={(created) => {
          if (targetStartupForAction) {
            showToast(`Co-incubation request sent for ${targetStartupForAction.name}`);
            if (selectedStartup && selectedStartup.id === targetStartupForAction.id) {
              setSelectedStartup({
                ...selectedStartup,
                coIncubators: [created, ...(selectedStartup.coIncubators || [])],
              });
            }
          }
        }}
        startupName={targetStartupForAction?.name || "Startup"}
        startupId={targetStartupForAction?.id}
        preselectedPartner={preselectedPartnerForAction}
      />

      <SignMOUModal
        isOpen={isSignMOUModalOpen}
        onClose={() => setIsSignMOUModalOpen(false)}
        onSign={handleConfirmSignMOU}
        partner={activePartnerForMOU}
        startupName={targetStartupForAction?.name || "Startup"}
      />

      {/* Assign Dashboard Confirmation Modal */}
      <Modal
        isOpen={!!assignModalStartup}
        onClose={() => {
          if (!isAssigningDashboard) setAssignModalStartup(null);
        }}
        title="Assign dashboard access"
        maxWidth="sm"
      >
        <p className="text-sm text-slate-600 mb-6">
          Give {assignModalStartup?.name} access to its dashboard?
        </p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              if (!isAssigningDashboard) setAssignModalStartup(null);
            }}
            disabled={isAssigningDashboard}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmAssignDashboard}
            disabled={isAssigningDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait shadow-xs cursor-pointer"
          >
            {isAssigningDashboard && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Assign</span>
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!bulkTargetStatus}
        onClose={() => {
          if (!isBulkUpdating) setBulkTargetStatus(null);
        }}
        title="Change status of all startups"
        maxWidth="sm"
      >
        <p className="text-sm text-slate-600 mb-6">
          This will set the status of every startup in your incubator to{" "}
          <span className="font-semibold text-slate-900 capitalize">{bulkTargetStatus}</span>. This cannot be undone from this page.
        </p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setBulkTargetStatus(null)}
            disabled={isBulkUpdating}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleBulkStatusUpdate}
            disabled={isBulkUpdating}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait shadow-xs cursor-pointer"
          >
            {isBulkUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isBulkUpdating ? 'Updating...' : 'Apply to all'}</span>
          </button>
        </div>
      </Modal>

      {/* Onboard Startup Modal */}
      {isOnboardOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Onboard new startup</h3>
                <p className="text-xs text-slate-500 mt-0.5">Register a startup into the incubator cohort</p>
              </div>
              <button
                onClick={() => {
                  setIsOnboardOpen(false);
                  setIsNameLocked(false);
                  setSelectedStartupId(null);
                  setIsOptionsOpen(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="p-6 space-y-4">
              {onboardError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{onboardError}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative" ref={comboboxRef}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-slate-500">Startup name *</label>
                    {isNameLocked && (
                      <button
                        type="button"
                        onClick={handleUnlockName}
                        className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. HealthSync AI"
                      value={onboardForm.name}
                      readOnly={isNameLocked}
                      onFocus={handleNameFocus}
                      onChange={(e) => {
                        setOnboardForm({ ...onboardForm, name: e.target.value });
                        setSelectedStartupId(null);
                        setIsOptionsOpen(true);
                      }}
                      className={`w-full h-10 text-sm px-3 rounded-lg border text-slate-800 focus:outline-none transition-colors ${
                        isNameLocked
                          ? "bg-slate-50 border-slate-200 text-slate-700 pr-8 cursor-default"
                          : "border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                      }`}
                    />
                    {isNameLocked && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {isOptionsLoading && !isNameLocked && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Dropdown Menu */}
                  {isOptionsOpen && !isNameLocked && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-[130] max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                      {isOptionsLoading ? (
                        <div className="p-3 text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                          <span>Searching startups...</span>
                        </div>
                      ) : startupOptions.length > 0 ? (
                        <>
                          <div className="py-1">
                            {startupOptions.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleSelectStartupOption(opt)}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50/60 transition-colors cursor-pointer group flex flex-col gap-0.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-800 group-hover:text-indigo-600">
                                    {opt.name}
                                  </span>
                                  {opt.stage && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                                      {opt.stage}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2 truncate">
                                  {opt.sector && <span>{opt.sector}</span>}
                                  {opt.founder_name && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">{opt.founder_name}</span>
                                    </>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                          {onboardForm.name.trim() && (
                            <div className="p-1.5 bg-slate-50/70 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsOptionsOpen(false);
                                  setSelectedStartupId(null);
                                }}
                                className="w-full text-left px-2.5 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-md font-medium flex items-center gap-1.5 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Create new: <strong>{onboardForm.name.trim()}</strong></span>
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-3">
                          <p className="text-xs text-slate-400 mb-2">No matching startups found</p>
                          {onboardForm.name.trim() && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsOptionsOpen(false);
                                setSelectedStartupId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-md font-medium flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Create new: <strong>{onboardForm.name.trim()}</strong></span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Industry sector</label>
                  <select
                    value={onboardForm.industry}
                    onChange={(e) => setOnboardForm({ ...onboardForm, industry: e.target.value })}
                    className="w-full h-10 text-sm px-3 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select sector (Optional)</option>
                    <option value="Tech">Technology / AI</option>
                    <option value="FinTech">FinTech</option>
                    <option value="HealthTech">HealthTech</option>
                    <option value="CleanTech">CleanTech</option>
                    <option value="AgriTech">AgriTech</option>
                    <option value="SaaS">B2B SaaS</option>
                    {onboardForm.industry && !["Tech", "FinTech", "HealthTech", "CleanTech", "AgriTech", "SaaS"].includes(onboardForm.industry) && (
                      <option value={onboardForm.industry}>{onboardForm.industry}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Founder full name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={onboardForm.founder}
                    onChange={(e) => setOnboardForm({ ...onboardForm, founder: e.target.value })}
                    className="w-full h-10 text-sm px-3 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Founder email *</label>
                  <input
                    type="email"
                    required
                    placeholder="founder@startup.com"
                    value={onboardForm.founderEmail}
                    onChange={(e) => setOnboardForm({ ...onboardForm, founderEmail: e.target.value })}
                    className="w-full h-10 text-sm px-3 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Contact / phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={onboardForm.founderPhone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, founderPhone: e.target.value })}
                    className="w-full h-10 text-xs px-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Stage</label>
                  <select
                    value={onboardForm.stage}
                    onChange={(e) => setOnboardForm({ ...onboardForm, stage: e.target.value })}
                    className="w-full h-10 text-xs px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Idea">Idea</option>
                    <option value="MVP">MVP</option>
                    <option value="Pre-revenue">Pre-revenue</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Growth">Growth</option>
                    <option value="Scale">Scale</option>
                    {onboardForm.stage && !["Idea", "MVP", "Pre-revenue", "Revenue", "Growth", "Scale"].includes(onboardForm.stage) && (
                      <option value={onboardForm.stage}>{onboardForm.stage}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Status *</label>
                  <select
                    value={onboardForm.status}
                    onChange={(e) => setOnboardForm({ ...onboardForm, status: e.target.value as 'Active' | 'Inactive' | 'Exited' })}
                    className="w-full h-10 text-xs px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending (Queue)</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Exited">Exited</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Elevator pitch / tagline</label>
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
                  disabled={isOnboardingLoading}
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {isOnboardingLoading ? 'Adding...' : 'Add startup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Newly Created Startup Credentials Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Startup Registered Successfully</h3>
                  <p className="text-xs text-slate-500">{createdCredentials.startupName}</p>
                </div>
              </div>
              <button
                onClick={() => setCreatedCredentials(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-800">
              <p className="font-semibold">Founder Login Credentials Created</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Status is set to <span className="font-semibold text-emerald-700">active</span> with startup dashboard access. Share these login details with the founder:
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Founder Email</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdCredentials.email}
                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.email);
                      setCopiedField('email');
                      setTimeout(() => setCopiedField(null), 2000);
                    }}
                    className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    title="Copy email"
                  >
                    {copiedField === 'email' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Password</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdCredentials.password}
                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.password);
                      setCopiedField('password');
                      setTimeout(() => setCopiedField(null), 2000);
                    }}
                    className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    title="Copy password"
                  >
                    {copiedField === 'password' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const text = `Startup: ${createdCredentials.startupName}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
                  navigator.clipboard.writeText(text);
                  setCopiedField('all');
                  setTimeout(() => setCopiedField(null), 2000);
                }}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedField === 'all' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">All Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};
