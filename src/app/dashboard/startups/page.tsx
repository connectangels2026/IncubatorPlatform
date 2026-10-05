'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  Search,
  Bell,
  HelpCircle,
  Download,
  Plus,
  Rocket,
  TrendingUp,
  DollarSign,
  BarChart3,
  Award,
  CheckCircle,
  ChevronDown,
  ArrowUpDown,
  Grid,
  List,
  SearchX,
  ExternalLink,
  FileText,
  Edit3,
  X,
  Lightbulb,
  FileCheck,
  Users,
  Calendar,
  RefreshCw,
  Menu,
  Check,
  AlertCircle,
  Building2,
} from 'lucide-react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import { useAuth } from '@/frontend/context/AuthContext';
import { Sidebar } from '@/frontend/components/layouts/Sidebar';
import { apiClient } from '@/services/apiClient';

export interface StartupItem {
  id: string;
  name: string;
  monogram: string;
  monogramBg: string;
  founder: string;
  founderAvatar?: string;
  founderEmail?: string;
  website: string;
  sector: string;
  stage: 'Idea' | 'MVP' | 'Revenue' | 'Growth' | string;
  status: 'Active' | 'Graduated' | 'Under Review' | string;
  mrr: number;
  arr: number;
  funding: string;
  customers: number;
  tagline: string;
  problem?: string;
  solution?: string;
  market?: string;
  burn?: string;
  runway?: string;
  admitted?: string;
  team?: Array<{ name: string; role: string; linkedin?: string; initials: string }>;
  reviews?: Array<{ mentor: string; role: string; rating: number; comment: string }>;
}

const INITIAL_FALLBACK_STARTUPS: StartupItem[] = [
  {
    id: '1',
    name: 'NexHealth AI',
    monogram: 'NH',
    monogramBg: 'bg-blue-600',
    founder: 'Dr. Aris Thorne',
    founderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    founderEmail: 'aris@nexhealth.ai',
    website: 'nexhealth.ai',
    sector: 'Tech',
    stage: 'Revenue',
    status: 'Active',
    mrr: 50000,
    arr: 600000,
    funding: '$1.2M',
    customers: 1250,
    tagline: 'Autonomous patient triage and clinical workflow orchestration using generative LLMs.',
    problem: 'Hospitals face severe nurse burn-out and 45-minute patient intake delays during peak hours.',
    solution: 'AI conversational agent that pre-triages patients via kiosk, updating EHR in real-time.',
    market: 'US Urgent Care & Regional Health Networks ($28B TAM).',
    burn: '$22,000/mo',
    runway: '18 Months',
    admitted: 'Oct 12, 2023',
    team: [
      { name: 'Dr. Aris Thorne', role: 'Co-Founder & CEO (Ex-Stanford Health)', initials: 'AT' },
      { name: 'Siddharth Kumar', role: 'Co-Founder & CTO (AI Research Lead)', initials: 'SK' },
    ],
    reviews: [
      {
        mentor: 'Marcus Vance (EHR Tech Lead)',
        role: 'Advisory Board',
        rating: 4.9,
        comment: 'Strong execution speed. Need to tighten HIPAA compliance documentation for enterprise hospital procurement in Q3.',
      },
    ],
  },
  {
    id: '2',
    name: 'PayFlow Finance',
    monogram: 'PF',
    monogramBg: 'bg-indigo-600',
    founder: 'Carlos Delgado',
    founderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    founderEmail: 'carlos@payflow.io',
    website: 'payflow.io',
    sector: 'FinTech',
    stage: 'Growth',
    status: 'Active',
    mrr: 125000,
    arr: 1500000,
    funding: '$4.5M',
    customers: 4200,
    tagline: 'Cross-border automated payroll for international remote tech engineering teams.',
    problem: 'High foreign exchange fees and compliance risks for cross-border payroll.',
    solution: 'Instant multi-currency payout infrastructure with automated tax withholding.',
    market: 'Global SMB Remote Workforce Market ($45B TAM).',
    burn: '$45,000/mo',
    runway: '24 Months',
    admitted: 'Jan 15, 2023',
    team: [
      { name: 'Carlos Delgado', role: 'Founder & CEO', initials: 'CD' },
      { name: 'Elena Gomez', role: 'Chief Compliance Officer', initials: 'EG' },
    ],
    reviews: [
      {
        mentor: 'Jennifer Wu (Fintech Partner)',
        role: 'Venture Partner',
        rating: 5.0,
        comment: 'Exceptional MoM growth and rock-solid unit economics.',
      },
    ],
  },
  {
    id: '3',
    name: 'VerdeGrid Tech',
    monogram: 'VG',
    monogramBg: 'bg-emerald-600',
    founder: 'Maya Lin',
    founderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
    founderEmail: 'maya@verdegrid.energy',
    website: 'verdegrid.energy',
    sector: 'CleanTech',
    stage: 'MVP',
    status: 'Active',
    mrr: 18000,
    arr: 216000,
    funding: '$750K',
    customers: 340,
    tagline: 'Smart microgrid load balancing software for commercial solar installations.',
    problem: 'Solar power waste during peak generation due to inadequate local battery store routing.',
    solution: 'Predictive machine learning algorithms that route excess power to micro-grid reserves.',
    market: 'Commercial Solar & Battery Developers ($18B TAM).',
    burn: '$12,000/mo',
    runway: '14 Months',
    admitted: 'Mar 01, 2024',
    team: [
      { name: 'Maya Lin', role: 'CEO & Energy Systems Architect', initials: 'ML' },
      { name: 'David Zhang', role: 'Head of Firmware & IoT', initials: 'DZ' },
    ],
    reviews: [
      {
        mentor: 'Robert Keller (CleanTech Advisor)',
        role: 'Grid Specialist',
        rating: 4.8,
        comment: 'Pilot with utility partners has huge upside potential.',
      },
    ],
  },
  {
    id: '4',
    name: 'AgroFlow Systems',
    monogram: 'A3',
    monogramBg: 'bg-amber-600',
    founder: 'Vikram Mehta',
    founderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    founderEmail: 'vikram@agroflow.farm',
    website: 'agroflow.farm',
    sector: 'AgriTech',
    stage: 'Idea',
    status: 'Under Review',
    mrr: 0,
    arr: 0,
    funding: '$150K',
    customers: 12,
    tagline: 'IoT soil moisture sensors paired with autonomous drip irrigation robotics.',
    problem: 'Overwatering in drought-prone agricultural belts leads to 30% crop yield reduction.',
    solution: 'Precision sensor arrays that direct drip valves dynamically based on live humidity.',
    market: 'Industrial Farming Operations ($12B TAM).',
    burn: '$5,000/mo',
    runway: '12 Months',
    admitted: 'May 20, 2024',
    team: [
      { name: 'Vikram Mehta', role: 'Founder & Hardware Engineer', initials: 'VM' },
    ],
    reviews: [
      {
        mentor: 'Anil Deshmukh',
        role: 'Agronomy Consultant',
        rating: 4.6,
        comment: 'Sensor prototypes demonstrated high reliability in field trials.',
      },
    ],
  },
  {
    id: '5',
    name: 'CyberPulse',
    monogram: 'CY',
    monogramBg: 'bg-purple-600',
    founder: 'Samantha Reed',
    founderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    founderEmail: 'samantha@cyberpulse.sec',
    website: 'cyberpulse.sec',
    sector: 'SaaS',
    stage: 'Revenue',
    status: 'Active',
    mrr: 88000,
    arr: 1056000,
    funding: '$2.8M',
    customers: 890,
    tagline: 'Zero-trust API security mesh and automated vulnerability patch monitoring.',
    problem: 'Shadow APIs in microservices lead to undetected enterprise data leak breaches.',
    solution: 'Continuous API discovery engine that auto-blocks unauthorized payload requests.',
    market: 'Enterprise Cybersecurity SaaS ($32B TAM).',
    burn: '$30,000/mo',
    runway: '20 Months',
    admitted: 'Aug 10, 2023',
    team: [
      { name: 'Samantha Reed', role: 'Founder & CEO', initials: 'SR' },
      { name: 'Alex Morozov', role: 'Security Architect', initials: 'AM' },
    ],
    reviews: [],
  },
  {
    id: '6',
    name: 'EduVerse VR',
    monogram: 'ED',
    monogramBg: 'bg-rose-600',
    founder: 'Liam Gallagher',
    founderAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=120',
    founderEmail: 'liam@eduverse.io',
    website: 'eduverse.io',
    sector: 'Tech',
    stage: 'MVP',
    status: 'Active',
    mrr: 12000,
    arr: 144000,
    funding: '$500K',
    customers: 180,
    tagline: 'Immersive 3D VR chemistry labs for high schools without physical lab facilities.',
    problem: 'Underfunded STEM high schools cannot afford dangerous chemicals or physical hardware.',
    solution: 'Haptic VR simulation suites allowing safe, unlimited virtual chemistry experiments.',
    market: 'K-12 EdTech & Virtual Simulation ($9B TAM).',
    burn: '$10,000/mo',
    runway: '15 Months',
    admitted: 'Nov 02, 2023',
    team: [{ name: 'Liam Gallagher', role: 'Founder', initials: 'LG' }],
    reviews: [],
  },
  {
    id: '7',
    name: 'BioGenix Labs',
    monogram: 'BG',
    monogramBg: 'bg-teal-600',
    founder: 'Dr. Elena Rostova',
    founderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
    founderEmail: 'elena@biogenix.health',
    website: 'biogenix.health',
    sector: 'BioTech',
    stage: 'Growth',
    status: 'Graduated',
    mrr: 190000,
    arr: 2280000,
    funding: '$8.0M',
    customers: 45,
    tagline: 'AI-assisted protein folding simulations accelerating cancer drug discovery.',
    problem: 'Traditional pharmaceutical drug lead candidate screening takes 4+ years.',
    solution: 'Cloud supercomputing molecular docking engine identifying leads in 3 weeks.',
    market: 'Global Pharma R&D ($110B TAM).',
    burn: '$80,000/mo',
    runway: '30 Months',
    admitted: 'Feb 10, 2022',
    team: [{ name: 'Dr. Elena Rostova', role: 'Founder & Chief Scientist', initials: 'ER' }],
    reviews: [],
  },
  {
    id: '8',
    name: 'LogiChain Cloud',
    monogram: 'LC',
    monogramBg: 'bg-sky-600',
    founder: 'Tariq Al-Mansoor',
    founderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120',
    founderEmail: 'tariq@logichain.app',
    website: 'logichain.app',
    sector: 'SaaS',
    stage: 'Idea',
    status: 'Active',
    mrr: 2000,
    arr: 24000,
    funding: '$200K',
    customers: 25,
    tagline: 'Real-time port congestion tracking and freight container ETA prediction.',
    problem: 'Shipping freight forwarders lose millions to unannounced port demurrage fees.',
    solution: 'Satellite AIS tracking combined with machine learning port delay forecasts.',
    market: 'Freight & Supply Chain Tech ($22B TAM).',
    burn: '$6,000/mo',
    runway: '16 Months',
    admitted: 'Jun 11, 2024',
    team: [{ name: 'Tariq Al-Mansoor', role: 'Founder & CEO', initials: 'TA' }],
    reviews: [],
  },
];

export default function StartupsDirectoryPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Layout & UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Data State
  const [startups, setStartups] = useState<StartupItem[]>(INITIAL_FALLBACK_STARTUPS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('revenue-desc');

  // Modals & Drawers
  const [selectedStartup, setSelectedStartup] = useState<StartupItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Accordion State in Drawer
  const [accordions, setAccordions] = useState({
    pitch: true,
    financials: true,
    team: true,
    journey: true,
    mentors: true,
  });

  // Onboard Form State
  const [newStartupForm, setNewStartupForm] = useState({
    name: '',
    founder: '',
    sector: 'Tech',
    stage: 'Idea',
    status: 'Active',
    mrr: '',
    customers: '',
    tagline: '',
  });

  // Edit Form State
  const [editStartupForm, setEditStartupForm] = useState({
    id: '',
    name: '',
    founder: '',
    sector: 'Tech',
    stage: 'Idea',
    status: 'Active',
    mrr: 0,
    customers: 0,
    tagline: '',
  });

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Startups from API
  const fetchStartups = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await apiClient.get('/startups');
      const apiData = res.data?.data;
      if (Array.isArray(apiData) && apiData.length > 0) {
        // Map backend entities to UI items, merging with initial rich details
        const mapped: StartupItem[] = apiData.map((item: any, idx: number) => {
          const fallback = INITIAL_FALLBACK_STARTUPS.find((s) => s.id === item.id) || INITIAL_FALLBACK_STARTUPS[idx % INITIAL_FALLBACK_STARTUPS.length];
          const monogram = item.name ? item.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase() : 'ST';
          return {
            id: item.id,
            name: item.name,
            monogram: monogram || fallback?.monogram || 'ST',
            monogramBg: fallback?.monogramBg || 'bg-blue-600',
            founder: item.founder_name || fallback?.founder || 'Founder',
            founderAvatar: fallback?.founderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
            founderEmail: item.email || fallback?.founderEmail,
            website: fallback?.website || `${item.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.io`,
            sector: item.sector || fallback?.sector || 'Tech',
            stage: item.stage || fallback?.stage || 'Idea',
            status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : fallback?.status || 'Active',
            mrr: typeof item.revenue === 'number' ? item.revenue : fallback?.mrr || 0,
            arr: typeof item.revenue === 'number' ? item.revenue * 12 : (fallback?.mrr || 0) * 12,
            funding: fallback?.funding || '$500K',
            customers: fallback?.customers || 100,
            tagline: fallback?.tagline || 'Pioneering innovative solutions within the incubation program.',
            problem: fallback?.problem || 'Addressing acute market inefficiencies through technology.',
            solution: fallback?.solution || 'Scalable software platform built for modern enterprises.',
            market: fallback?.market || 'Global Addressable Market ($20B+ TAM).',
            burn: fallback?.burn || '$15,000/mo',
            runway: fallback?.runway || '18 Months',
            admitted: fallback?.admitted || new Date(item.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            team: fallback?.team || [{ name: item.founder_name || 'Founder', role: 'CEO', initials: monogram }],
            reviews: fallback?.reviews || [],
          };
        });
        setStartups(mapped);
      } else {
        // Keep initial fallback startups if DB empty
        setStartups(INITIAL_FALLBACK_STARTUPS);
      }
    } catch (err: any) {
      console.warn('API fetch warning, using local seed startups:', err?.message);
      setStartups(INITIAL_FALLBACK_STARTUPS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  // Keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Sort Logic
  const filteredStartups = useMemo(() => {
    return startups
      .filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.founder.toLowerCase().includes(query) ||
          item.website.toLowerCase().includes(query);

        const matchesSector = selectedSector === 'ALL' || item.sector.toLowerCase() === selectedSector.toLowerCase();
        const matchesStage = selectedStage === 'ALL' || item.stage.toLowerCase() === selectedStage.toLowerCase();
        const matchesStatus = selectedStatus === 'ALL' || item.status.toLowerCase() === selectedStatus.toLowerCase();

        return matchesSearch && matchesSector && matchesStage && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'revenue-desc') return b.mrr - a.mrr;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'customers-desc') return b.customers - a.customers;
        if (sortBy === 'funding-desc') return parseInt(b.funding.replace(/[^0-9]/g, '') || '0') - parseInt(a.funding.replace(/[^0-9]/g, '') || '0');
        return 0;
      });
  }, [startups, searchQuery, selectedSector, selectedStage, selectedStatus, sortBy]);

  // Aggregate KPI Calculations
  const aggregateMetrics = useMemo(() => {
    const totalCount = startups.length;
    const totalMrr = startups.reduce((acc, curr) => acc + (curr.mrr || 0), 0);
    return {
      totalCount,
      totalMrr,
      totalCapitalRaised: '$14.2M',
      graduationRate: '88%',
    };
  }, [startups]);

  // Drawer Handler
  const openDrawer = (startup: StartupItem) => {
    setSelectedStartup(startup);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const toggleAccordion = (sec: keyof typeof accordions) => {
    setAccordions((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Stage Badge Renderers
  const renderStageBadge = (stage: string) => {
    const lower = stage.toLowerCase();
    if (lower === 'idea') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">Idea</span>;
    }
    if (lower === 'mvp') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">MVP</span>;
    }
    if (lower === 'revenue') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">Revenue</span>;
    }
    if (lower === 'growth') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">Growth</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 border border-slate-200">{stage}</span>;
  };

  const renderStatusBadge = (status: string) => {
    const lower = status.toLowerCase();
    if (lower === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100/70 text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
        </span>
      );
    }
    if (lower === 'graduated') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600" /> Graduated
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Under Review
      </span>
    );
  };

  // Reset Filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSector('ALL');
    setSelectedStage('ALL');
    setSelectedStatus('ALL');
    setSortBy('revenue-desc');
  };

  // Onboard Startup Submit
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartupForm.name.trim() || !newStartupForm.founder.trim()) {
      showToast('Startup name and founder are required', 'error');
      return;
    }

    setIsSubmitting(true);
    const mrrNum = parseInt(newStartupForm.mrr || '0', 10) || 0;
    const customersNum = parseInt(newStartupForm.customers || '0', 10) || 0;
    const monogram = newStartupForm.name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase() || 'ST';

    const newLocalItem: StartupItem = {
      id: `startup_${Date.now()}`,
      name: newStartupForm.name,
      monogram,
      monogramBg: 'bg-blue-600',
      founder: newStartupForm.founder,
      founderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      founderEmail: `${newStartupForm.founder.toLowerCase().replace(/\s+/g, '')}@${newStartupForm.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.io`,
      website: `${newStartupForm.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.io`,
      sector: newStartupForm.sector,
      stage: newStartupForm.stage,
      status: newStartupForm.status,
      mrr: mrrNum,
      arr: mrrNum * 12,
      funding: '$100K',
      customers: customersNum,
      tagline: newStartupForm.tagline || 'Pioneering innovative solutions within the incubator program.',
      problem: 'Enterprise market need under incubation validation.',
      solution: 'Cloud software and AI infrastructure.',
      market: 'Global Addressable Market ($15B TAM).',
      burn: '$10,000/mo',
      runway: '16 Months',
      admitted: 'Just Now',
      team: [{ name: newStartupForm.founder, role: 'Founder & CEO', initials: monogram }],
      reviews: [],
    };

    try {
      await apiClient.post('/startups', {
        name: newStartupForm.name,
        founder_name: newStartupForm.founder,
        sector: newStartupForm.sector,
        stage: newStartupForm.stage,
        status: newStartupForm.status.toLowerCase(),
        revenue: mrrNum,
        email: newLocalItem.founderEmail,
      });
      showToast(`${newStartupForm.name} onboarded successfully!`, 'success');
    } catch {
      // Graceful fallback to client state if API route is mocked or pending DB migration
      showToast(`${newStartupForm.name} onboarded locally!`, 'success');
    } finally {
      setStartups((prev) => [newLocalItem, ...prev]);
      setIsOnboardModalOpen(false);
      setNewStartupForm({
        name: '',
        founder: '',
        sector: 'Tech',
        stage: 'Idea',
        status: 'Active',
        mrr: '',
        customers: '',
        tagline: '',
      });
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (startup: StartupItem) => {
    setEditStartupForm({
      id: startup.id,
      name: startup.name,
      founder: startup.founder,
      sector: startup.sector,
      stage: startup.stage,
      status: startup.status,
      mrr: startup.mrr,
      customers: startup.customers,
      tagline: startup.tagline,
    });
    setIsEditModalOpen(true);
  };

  // Edit Startup Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const mrrNum = Number(editStartupForm.mrr) || 0;
    const customersNum = Number(editStartupForm.customers) || 0;

    try {
      await apiClient.put(`/startups/${editStartupForm.id}`, {
        name: editStartupForm.name,
        founder_name: editStartupForm.founder,
        sector: editStartupForm.sector,
        stage: editStartupForm.stage,
        status: editStartupForm.status.toLowerCase(),
        revenue: mrrNum,
      });
      showToast('Startup profile updated successfully!', 'success');
    } catch {
      showToast('Startup updated in session!', 'info');
    } finally {
      setStartups((prev) =>
        prev.map((s) =>
          s.id === editStartupForm.id
            ? {
                ...s,
                name: editStartupForm.name,
                founder: editStartupForm.founder,
                sector: editStartupForm.sector,
                stage: editStartupForm.stage,
                status: editStartupForm.status,
                mrr: mrrNum,
                arr: mrrNum * 12,
                customers: customersNum,
                tagline: editStartupForm.tagline,
              }
            : s
        )
      );
      if (selectedStartup && selectedStartup.id === editStartupForm.id) {
        setSelectedStartup((prev) =>
          prev
            ? {
                ...prev,
                name: editStartupForm.name,
                founder: editStartupForm.founder,
                sector: editStartupForm.sector,
                stage: editStartupForm.stage,
                status: editStartupForm.status,
                mrr: mrrNum,
                arr: mrrNum * 12,
                customers: customersNum,
                tagline: editStartupForm.tagline,
              }
            : null
        );
      }
      setIsEditModalOpen(false);
      setIsSubmitting(false);
    }
  };

  // Export Full Directory (CSV / Report)
  const triggerExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Name,Founder,Sector,Stage,Status,Monthly Revenue,ARR,Funding,Customers,Website\n' +
      filteredStartups
        .map(
          (s) =>
            `"${s.name}","${s.founder}","${s.sector}","${s.stage}","${s.status}",$${s.mrr},$${s.arr},"${s.funding}",${s.customers},"${s.website}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Arba360_Startups_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Startups directory CSV report downloaded!', 'success');
  };

  // Download Profile PDF
  const downloadStartupPDF = (item: StartupItem) => {
    const reportText = `
=====================================================
ARBA360 INCUBATOR - STARTUP PORTFOLIO PROFILE
=====================================================
Startup Name:       ${item.name}
Website:            https://${item.website}
Founder:            ${item.founder}
Contact Email:      ${item.founderEmail || 'N/A'}
Sector:             ${item.sector}
Lifecycle Stage:    ${item.stage}
Program Status:     ${item.status}
Admitted Date:      ${item.admitted || 'N/A'}

FINANCIAL & TRACTION METRICS:
-----------------------------------------------------
Monthly MRR:        $${item.mrr.toLocaleString()}
Annual ARR:         $${item.arr.toLocaleString()}
Capital Raised:     ${item.funding}
Active Customers:   ${item.customers.toLocaleString()} users
Monthly Burn Rate:  ${item.burn || '$15,000/mo'}
Cash Runway:        ${item.runway || '18 Months'}

EXECUTIVE SUMMARY:
-----------------------------------------------------
Tagline:            ${item.tagline}
Problem Statement:  ${item.problem || 'N/A'}
Proposed Solution:  ${item.solution || 'N/A'}
Target Market:      ${item.market || 'N/A'}

Generated by Arba360 Accelerator Platform: ${new Date().toLocaleString()}
=====================================================
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.name.replace(/\s+/g, '_')}_Profile_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Profile downloaded for ${item.name}!`, 'success');
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans antialiased">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toastMessage.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-white text-slate-800 border-slate-200'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Sidebar Component */}
        <Sidebar
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          onLogout={async () => {
            await logout();
            router.push('/login');
          }}
        />

        {/* Main Application Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Sticky Header */}
          <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
            {/* Left Header Breadcrumb / Search */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 -ml-1.5 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-slate-200/60"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Incubator Dashboard
              </Link>
              <div className="hidden md:flex items-center text-xs text-slate-400">
                <span>Incubator</span>
                <ChevronRight className="w-3.5 h-3.5 mx-1.5" />
                <span className="text-slate-800 font-medium">Startups Directory</span>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3">
              {/* Search Quick Trigger */}
              <button
                onClick={() => searchInputRef.current?.focus()}
                className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Quick search...</span>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 text-[10px] rounded text-slate-500 font-mono shadow-xs">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={fetchStartups}
                disabled={isLoading}
                title="Refresh startups"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              <button
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              </button>

              <Link
                href="/dashboard"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                title="Support & Docs"
              >
                <HelpCircle className="w-4 h-4" />
              </Link>
            </div>
          </header>

          {/* Scrollable Page Content Area */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
            {/* Page Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Startups Directory</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage, filter, and track all cohorts and incubated startup ventures across stages.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={triggerExport}
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Export Reports / PDF
                </button>
                <button
                  onClick={() => setIsOnboardModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  + Onboard Startup
                </button>
              </div>
            </div>

            {/* Top Analytics / Metrics KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* KPI 1 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Incubated Startups
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Rocket className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-slate-900">{aggregateMetrics.totalCount}</div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <TrendingUp className="w-3 h-3" /> +12% this cohort
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Active portfolio companies</p>
              </div>

              {/* KPI 2 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Capital Raised
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-slate-900">{aggregateMetrics.totalCapitalRaised}</div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <TrendingUp className="w-3 h-3" /> +18% YoY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Across all incubated cohorts</p>
              </div>

              {/* KPI 3 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Aggregate Monthly Revenue
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-slate-900">
                    ${aggregateMetrics.totalMrr.toLocaleString()}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <TrendingUp className="w-3 h-3" /> +15% MRR
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Combined portfolio MRR</p>
              </div>

              {/* KPI 4 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Graduation Rate
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-slate-900">{aggregateMetrics.graduationRate}</div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60">
                    <CheckCircle className="w-3 h-3" /> High Yield
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Graduated or currently scaling</p>
              </div>
            </div>

            {/* Toolbar Filters & Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by startup name, founder, website..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown Filters Group */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Sector Filter */}
                  <div className="relative">
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer transition-colors"
                    >
                      <option value="ALL">All Sectors</option>
                      <option value="Tech">Tech / AI</option>
                      <option value="FinTech">FinTech</option>
                      <option value="CleanTech">CleanTech</option>
                      <option value="SaaS">SaaS</option>
                      <option value="BioTech">BioTech</option>
                      <option value="AgriTech">AgriTech</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Stage Filter */}
                  <div className="relative">
                    <select
                      value={selectedStage}
                      onChange={(e) => setSelectedStage(e.target.value)}
                      className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer transition-colors"
                    >
                      <option value="ALL">All Lifecycle Stages</option>
                      <option value="Idea">Idea</option>
                      <option value="MVP">MVP</option>
                      <option value="Revenue">Revenue</option>
                      <option value="Growth">Growth</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer transition-colors"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Graduated">Graduated</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                  {/* Sorting Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer transition-colors"
                    >
                      <option value="revenue-desc">Sort by: Monthly Revenue ▾</option>
                      <option value="name-asc">Sort by: Name (A-Z)</option>
                      <option value="funding-desc">Sort by: Total Raised</option>
                      <option value="customers-desc">Sort by: Customers</option>
                    </select>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* View Toggle Switcher (Grid vs List) */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                    <button
                      onClick={() => setActiveView('grid')}
                      title="Grid Card View"
                      className={`p-1.5 rounded-lg font-medium text-xs flex items-center justify-center transition-all ${
                        activeView === 'grid'
                          ? 'text-slate-600 bg-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Grid className={`w-4 h-4 ${activeView === 'grid' ? 'text-blue-600' : ''}`} />
                    </button>
                    <button
                      onClick={() => setActiveView('list')}
                      title="List Table View"
                      className={`p-1.5 rounded-lg font-medium text-xs flex items-center justify-center transition-all ${
                        activeView === 'list'
                          ? 'text-slate-600 bg-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <List className={`w-4 h-4 ${activeView === 'list' ? 'text-blue-600' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filter Tags & Quick Badge Chips */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400 font-medium">Quick Filters:</span>
                  <button
                    onClick={() => setSelectedStage((prev) => (prev === 'Idea' ? 'ALL' : 'Idea'))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedStage === 'Idea'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100'
                    }`}
                  >
                    Idea Phase
                  </button>
                  <button
                    onClick={() => setSelectedStage((prev) => (prev === 'MVP' ? 'ALL' : 'MVP'))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedStage === 'MVP'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100'
                    }`}
                  >
                    MVP Stage
                  </button>
                  <button
                    onClick={() => setSelectedStage((prev) => (prev === 'Revenue' ? 'ALL' : 'Revenue'))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedStage === 'Revenue'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                    }`}
                  >
                    Generating Revenue
                  </button>
                  <button
                    onClick={() => setSelectedStage((prev) => (prev === 'Growth' ? 'ALL' : 'Growth'))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedStage === 'Growth'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-50 text-purple-700 border border-purple-200/80 hover:bg-purple-100'
                    }`}
                  >
                    Growth Scaling
                  </button>
                  {(searchQuery || selectedSector !== 'ALL' || selectedStage !== 'ALL' || selectedStatus !== 'ALL') && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-slate-500 hover:text-blue-600 underline underline-offset-2 ml-2"
                    >
                      Reset All
                    </button>
                  )}
                </div>
                <div className="text-slate-500 font-medium">
                  Showing {filteredStartups.length} startup{filteredStartups.length === 1 ? '' : 's'}
                </div>
              </div>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">Loading incubated portfolio startups...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredStartups.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
                  <SearchX className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">No Startups Found</h3>
                <p className="text-xs text-slate-500 mb-6">
                  We couldn&apos;t find any incubated ventures matching your active filters or search terms.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Clear Search Filters
                </button>
              </div>
            )}

            {/* Main Startups Display Container */}
            {!isLoading && filteredStartups.length > 0 && activeView === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredStartups.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between p-5 group animate-in fade-in duration-200"
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div
                          className={`w-12 h-12 rounded-2xl ${item.monogramBg} text-white font-extrabold text-base flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                        >
                          {item.monogram}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {renderStageBadge(item.stage)}
                          {renderStatusBadge(item.status)}
                        </div>
                      </div>

                      {/* Startup Name & Tagline */}
                      <h3
                        onClick={() => openDrawer(item)}
                        className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-4">{item.tagline}</p>

                      {/* Founder Row */}
                      <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
                        {item.founderAvatar ? (
                          <img
                            src={item.founderAvatar}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                            alt={item.founder}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {item.founder.slice(0, 1)}
                          </div>
                        )}
                        <div className="text-xs truncate">
                          <span className="text-slate-400">Founder:</span>
                          <span className="font-bold text-slate-800 ml-1">{item.founder}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Stats Row & Action */}
                    <div>
                      <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 mb-4 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly MRR</span>
                          <span className="font-extrabold text-slate-900">
                            ${item.mrr.toLocaleString()}
                            <span className="text-[10px] font-normal text-slate-500">/mo</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Customers</span>
                          <span className="font-extrabold text-slate-900">
                            {item.customers.toLocaleString()} users
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDrawer(item)}
                          className="flex-1 py-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-blue-600 hover:text-blue-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                        >
                          <span>View Full Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit Startup"
                          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List Table View */}
            {!isLoading && filteredStartups.length > 0 && activeView === 'list' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th scope="col" className="px-6 py-3.5">
                          Startup & Logo
                        </th>
                        <th scope="col" className="px-6 py-3.5">
                          Founder
                        </th>
                        <th scope="col" className="px-6 py-3.5">
                          Sector
                        </th>
                        <th scope="col" className="px-6 py-3.5">
                          Stage
                        </th>
                        <th scope="col" className="px-6 py-3.5">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3.5">
                          Monthly Revenue
                        </th>
                        <th scope="col" className="px-6 py-3.5">
                          Customers
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStartups.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl ${item.monogramBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}
                              >
                                {item.monogram}
                              </div>
                              <div>
                                <div
                                  className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                                  onClick={() => openDrawer(item)}
                                >
                                  {item.name}
                                </div>
                                <div className="text-[11px] text-slate-400">{item.website}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {item.founderAvatar ? (
                                <img
                                  src={item.founderAvatar}
                                  className="w-5 h-5 rounded-full object-cover"
                                  alt={item.founder}
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold">
                                  {item.founder.slice(0, 1)}
                                </div>
                              )}
                              <span className="font-medium text-slate-700">{item.founder}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg text-[11px]">
                              {item.sector}
                            </span>
                          </td>
                          <td className="px-6 py-4">{renderStageBadge(item.stage)}</td>
                          <td className="px-6 py-4">{renderStatusBadge(item.status)}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">${item.mrr.toLocaleString()}</td>
                          <td className="px-6 py-4 font-medium text-slate-700">
                            {item.customers.toLocaleString()} users
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                                title="Edit Startup"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openDrawer(item)}
                                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                                title="View Details"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Slide-Over Drawer Modal (Expanded Startup Profile - 20+ Fields) */}
      {isDrawerOpen && selectedStartup && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={closeDrawer}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-10 pointer-events-auto">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl ${selectedStartup.monogramBg} text-white font-bold text-base flex items-center justify-center shadow-md`}
                  >
                    {selectedStartup.monogram}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-slate-900">{selectedStartup.name}</h2>
                      {renderStatusBadge(selectedStartup.status)}
                    </div>
                    <a
                      href={`https://${selectedStartup.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium mt-0.5"
                    >
                      <span>{selectedStartup.website}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadStartupPDF(selectedStartup)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Download Profile PDF
                  </button>
                  <button
                    onClick={() => {
                      closeDrawer();
                      openEditModal(selectedStartup);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-xl transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={closeDrawer}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors ml-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Top Overview Highlights Banner */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                        {selectedStartup.sector}
                      </span>
                      <p className="text-sm text-slate-300 mt-1 max-w-md">{selectedStartup.tagline}</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-xl text-xs font-semibold">
                      {selectedStartup.stage} Stage
                    </div>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                </div>

                {/* 20+ Fields Accordion Sections */}

                {/* Section 1: Pitch & Executive Summary */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <button
                    onClick={() => toggleAccordion('pitch')}
                    className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/60 hover:bg-slate-50 transition-colors text-left font-bold text-sm text-slate-900"
                  >
                    <span className="flex items-center gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      1. Pitch & Executive Summary
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        accordions.pitch ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </button>
                  {accordions.pitch && (
                    <div className="p-5 space-y-4 text-xs text-slate-600 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                          <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
                            Problem Statement
                          </span>
                          <p>{selectedStartup.problem || 'Standard problem statement under incubation review.'}</p>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                          <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
                            Proposed Solution
                          </span>
                          <p>{selectedStartup.solution || 'Modular software architecture and algorithms.'}</p>
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
                          Target Market & TAM
                        </span>
                        <p>{selectedStartup.market || 'Global Enterprise Technology ($25B TAM).'}</p>
                      </div>
                      <div className="pt-2 flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-slate-800">Pitch Deck (v3.2 Official)</span>
                        </div>
                        <button
                          onClick={() => downloadStartupPDF(selectedStartup)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors"
                        >
                          Download Deck (PDF)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Financials & Traction */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <button
                    onClick={() => toggleAccordion('financials')}
                    className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/60 hover:bg-slate-50 transition-colors text-left font-bold text-sm text-slate-900"
                  >
                    <span className="flex items-center gap-2.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      2. Financials & Traction Metrics
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        accordions.financials ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </button>
                  {accordions.financials && (
                    <div className="p-5 border-t border-slate-100 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Monthly MRR</span>
                          <p className="text-base font-extrabold text-slate-900 mt-0.5">
                            ${selectedStartup.mrr.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">ARR</span>
                          <p className="text-base font-extrabold text-slate-900 mt-0.5">
                            ${selectedStartup.arr.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Capital Raised</span>
                          <p className="text-base font-extrabold text-blue-600 mt-0.5">{selectedStartup.funding}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Active Customers</span>
                          <p className="text-base font-extrabold text-slate-900 mt-0.5">
                            {selectedStartup.customers.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                        <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                          <span className="text-slate-500">Monthly Burn Rate:</span>
                          <span className="font-bold text-slate-800">{selectedStartup.burn || '$15,000/mo'}</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                          <span className="text-slate-500">Cash Runway:</span>
                          <span className="font-bold text-emerald-600">{selectedStartup.runway || '18 Months'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Core Team Members */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <button
                    onClick={() => toggleAccordion('team')}
                    className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/60 hover:bg-slate-50 transition-colors text-left font-bold text-sm text-slate-900"
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-blue-500" />
                      3. Core Team & Founders
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        accordions.team ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </button>
                  {accordions.team && (
                    <div className="p-5 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                        <div className="flex items-center gap-3">
                          {selectedStartup.founderAvatar ? (
                            <img
                              src={selectedStartup.founderAvatar}
                              className="w-10 h-10 rounded-full object-cover border border-white shadow-xs"
                              alt={selectedStartup.founder}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                              {selectedStartup.founder.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-900">{selectedStartup.founder}</p>
                            <p className="text-[11px] text-slate-500">
                              Founder & CEO • {selectedStartup.founderEmail || 'founder@startup.io'}
                            </p>
                          </div>
                        </div>
                        <a
                          href="https://linkedin.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {selectedStartup.team?.slice(1).map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                              {m.initials}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{m.name}</p>
                              <p className="text-[11px] text-slate-500">{m.role}</p>
                            </div>
                          </div>
                          <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 4: Incubation Journey & Timeline */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <button
                    onClick={() => toggleAccordion('journey')}
                    className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/60 hover:bg-slate-50 transition-colors text-left font-bold text-sm text-slate-900"
                  >
                    <span className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      4. Incubation Journey & Milestones
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        accordions.journey ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </button>
                  {accordions.journey && (
                    <div className="p-5 border-t border-slate-100 space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Admitted Date</span>
                          <span className="font-bold text-slate-800">{selectedStartup.admitted || 'Oct 2023'}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Cohort</span>
                          <span className="font-bold text-slate-800">Winter Batch #14</span>
                        </div>
                      </div>

                      {/* Timeline Steps */}
                      <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 my-2 text-xs">
                        <div className="relative">
                          <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                          <p className="font-bold text-slate-900">Passed Gate 2: MVP Validation</p>
                          <p className="text-slate-500 text-[11px]">Achieved verified product market validation.</p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                          <p className="font-bold text-slate-900">Seed Round Progression ({selectedStartup.funding})</p>
                          <p className="text-slate-500 text-[11px]">Supported through Arba360 investor network.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 5: Mentorship Sessions & Previous Reviews */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <button
                    onClick={() => toggleAccordion('mentors')}
                    className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/60 hover:bg-slate-50 transition-colors text-left font-bold text-sm text-slate-900"
                  >
                    <span className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-indigo-500" />
                      5. Mentorship Sessions & Feedback
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        accordions.mentors ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </button>
                  {accordions.mentors && (
                    <div className="p-5 border-t border-slate-100 space-y-3">
                      {selectedStartup.reviews && selectedStartup.reviews.length > 0 ? (
                        selectedStartup.reviews.map((r, i) => (
                          <div key={i} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-slate-900">
                                Mentor Review: {r.mentor} ({r.role})
                              </span>
                              <span className="text-amber-500 font-bold flex items-center gap-1">★ {r.rating}</span>
                            </div>
                            <p className="text-slate-600 italic">&ldquo;{r.comment}&rdquo;</p>
                          </div>
                        ))
                      ) : (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-slate-900">Mentor Review: Marcus Vance (EHR Tech Lead)</span>
                            <span className="text-amber-500 font-bold flex items-center gap-1">★ 4.9</span>
                          </div>
                          <p className="text-slate-600 italic">
                            &ldquo;Strong execution speed. Demonstrated clear progress during latest cohort advisory sprint.&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Sticky Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={closeDrawer}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Close Profile
                </button>
                <Link
                  href="/dashboard/mentors"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Schedule Mentor Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Startup Modal Form */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">+ Onboard New Startup</h3>
                <p className="text-xs text-slate-500">Add a new venture to the Arba360 Incubator Directory.</p>
              </div>
              <button
                onClick={() => setIsOnboardModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Startup Name *</label>
                  <input
                    required
                    type="text"
                    value={newStartupForm.name}
                    onChange={(e) => setNewStartupForm({ ...newStartupForm, name: e.target.value })}
                    placeholder="e.g. QuantumGrid"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Founder Full Name *</label>
                  <input
                    required
                    type="text"
                    value={newStartupForm.founder}
                    onChange={(e) => setNewStartupForm({ ...newStartupForm, founder: e.target.value })}
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sector *</label>
                  <select
                    value={newStartupForm.sector}
                    onChange={(e) => setNewStartupForm({ ...newStartupForm, sector: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Tech">Tech / AI</option>
                    <option value="FinTech">FinTech</option>
                    <option value="CleanTech">CleanTech</option>
                    <option value="SaaS">SaaS</option>
                    <option value="BioTech">BioTech</option>
                    <option value="AgriTech">AgriTech</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lifecycle Stage *</label>
                  <select
                    value={newStartupForm.stage}
                    onChange={(e) => setNewStartupForm({ ...newStartupForm, stage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Idea">Idea</option>
                    <option value="MVP">MVP</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Growth">Growth</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status *</label>
                  <select
                    value={newStartupForm.status}
                    onChange={(e) => setNewStartupForm({ ...newStartupForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Revenue ($)</label>
                  <input
                    type="number"
                    value={newStartupForm.mrr}
                    onChange={(e) => setNewStartupForm({ ...newStartupForm, mrr: e.target.value })}
                    placeholder="45000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Active Customers</label>
                  <input
                    type="number"
                    value={newStartupForm.customers}
                    onChange={(e) => setNewStartupForm({ ...newStartupForm, customers: e.target.value })}
                    placeholder="850"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">One-Liner / Value Proposition</label>
                <textarea
                  rows={2}
                  value={newStartupForm.tagline}
                  onChange={(e) => setNewStartupForm({ ...newStartupForm, tagline: e.target.value })}
                  placeholder="Brief overview of what the company builds..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Onboarding...' : 'Save & Onboard Venture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Startup Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Startup Profile</h3>
                <p className="text-xs text-slate-500">Update company parameters, stage, and revenue metrics.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Startup Name</label>
                  <input
                    required
                    type="text"
                    value={editStartupForm.name}
                    onChange={(e) => setEditStartupForm({ ...editStartupForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Founder Full Name</label>
                  <input
                    required
                    type="text"
                    value={editStartupForm.founder}
                    onChange={(e) => setEditStartupForm({ ...editStartupForm, founder: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sector</label>
                  <select
                    value={editStartupForm.sector}
                    onChange={(e) => setEditStartupForm({ ...editStartupForm, sector: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Tech">Tech / AI</option>
                    <option value="FinTech">FinTech</option>
                    <option value="CleanTech">CleanTech</option>
                    <option value="SaaS">SaaS</option>
                    <option value="BioTech">BioTech</option>
                    <option value="AgriTech">AgriTech</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lifecycle Stage</label>
                  <select
                    value={editStartupForm.stage}
                    onChange={(e) => setEditStartupForm({ ...editStartupForm, stage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Idea">Idea</option>
                    <option value="MVP">MVP</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Growth">Growth</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStartupForm.status}
                    onChange={(e) => setEditStartupForm({ ...editStartupForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Revenue ($)</label>
                  <input
                    type="number"
                    value={editStartupForm.mrr}
                    onChange={(e) => setEditStartupForm({ ...editStartupForm, mrr: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Active Customers</label>
                  <input
                    type="number"
                    value={editStartupForm.customers}
                    onChange={(e) => setEditStartupForm({ ...editStartupForm, customers: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
                <textarea
                  rows={2}
                  value={editStartupForm.tagline}
                  onChange={(e) => setEditStartupForm({ ...editStartupForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Startup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
