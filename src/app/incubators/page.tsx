'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Calendar, 
  MapPin, 
  X, 
  Building2, 
  PlusCircle, 
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Check,
  Heart,
  Scale,
  Users,
  Gift,
  CheckCircle2,
  ArrowUpRight,
  Layers
} from 'lucide-react';
import Logo from '@/frontend/components/ui/Logo';

interface Perk {
  title: string;
  value: string;
}

interface Mentor {
  name: string;
  role: string;
  avatar: string;
}

interface Incubator {
  id: string;
  slug?: string;
  name: string;
  verified: boolean;
  featured: boolean;
  logoBg: string;
  logoText: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  stage: string;
  format: string;
  location: string;
  grant: string;
  equity: string;
  duration: string;
  daysLeft: number;
  batchName: string;
  website: string;
  tags: string[];
  highlights: string[];
  alumniValuation: string;
  topPerks: Perk[];
  mentors: Mentor[];
  alumni: string[];
}

const INITIAL_INCUBATORS: Incubator[] = [
  {
    id: 'inc-1',
    name: 'Nexus AI Foundry',
    verified: true,
    featured: true,
    logoBg: 'bg-gradient-to-br from-blue-600 to-indigo-900',
    logoText: 'NAI',
    shortDescription: 'Accelerating frontier artificial intelligence, agentic workflows, and LLM infrastructure startups.',
    fullDescription: 'Nexus AI Foundry is a world-class accelerator dedicated to founders building foundational AI models, agentic applications, and specialized hardware tech. Selected startups receive dedicated GPU credits, mentorship from world-leading researchers, and direct exposure to tier-1 venture partners.',
    category: 'AI & DeepTech',
    stage: 'MVP',
    format: 'Hybrid',
    location: 'San Francisco, CA & Remote',
    grant: '$100k - $250k',
    equity: '5% - 7%',
    duration: '12 Weeks',
    daysLeft: 4,
    batchName: 'Fall 2026 Cohort',
    website: 'https://nexusai.io',
    tags: ['GenAI', 'LLM Infrastructure', 'Autonomous Systems'],
    highlights: ['500k GPU Credits', 'Ex-OpenAI Mentors', 'Demo Day in SF'],
    alumniValuation: '$1.4B+',
    topPerks: [
      { title: 'AWS Cloud Credits', value: '$100,000' },
      { title: 'NVIDIA GPU Cluster Access', value: 'Unlimited Sprint' },
      { title: 'Legal & IP Structuring', value: '$15,000 Value' }
    ],
    mentors: [
      { name: 'Dr. Aris Thorne', role: 'AI Lead ex-DeepMind', avatar: 'AT' },
      { name: 'Elena Vance', role: 'Partner @ Sequoia', avatar: 'EV' }
    ],
    alumni: ['Agentic.ai', 'NeuroPulse', 'SynthData']
  },
  {
    id: 'inc-2',
    name: 'FinPulse Labs',
    verified: true,
    featured: true,
    logoBg: 'bg-gradient-to-br from-cyan-500 to-blue-700',
    logoText: 'FPL',
    shortDescription: 'Empowering next-gen fintech rails, cross-border payments, and decentralized financial systems.',
    fullDescription: 'FinPulse Labs bridges regulatory expertise with rapid engineering sprint support. We help fintech pioneers launch compliant payment solutions, embedded finance modules, and institutional blockchain infrastructure.',
    category: 'FinTech',
    stage: 'Seed',
    format: 'In-Person',
    location: 'New York, NY',
    grant: '$150k - $300k',
    equity: '6%',
    duration: '14 Weeks',
    daysLeft: 5,
    batchName: 'Winter 2026',
    website: 'https://finpulselabs.com',
    tags: ['Payments', 'Embedded Finance', 'RegTech'],
    highlights: ['Direct Bank API Sandbox', 'SEC & FCA Regulatory Advisors', 'Tier-1 Bank Pilots'],
    alumniValuation: '$850M',
    topPerks: [
      { title: 'Stripe Fee Waiver', value: '$50,000 Volume' },
      { title: 'Banking API Sandbox', value: 'Free Tier' },
      { title: 'Compliance Audit', value: '$20,000 Package' }
    ],
    mentors: [
      { name: 'Marcus Sterling', role: 'FinTech Angel & Ex-Stripe', avatar: 'MS' },
      { name: 'Sarah Chen', role: 'Compliance Partner', avatar: 'SC' }
    ],
    alumni: ['PayLoom', 'VaultFlow', 'CrossPay']
  },
  {
    id: 'inc-3',
    name: 'TerraVentures Climate Studio',
    verified: true,
    featured: false,
    logoBg: 'bg-gradient-to-br from-emerald-500 to-teal-800',
    logoText: 'TVC',
    shortDescription: 'Backing bold innovators in carbon capture, renewable energy grids, and circular economy solutions.',
    fullDescription: 'TerraVentures is the premier ecosystem for climate resilience technology. We offer lab access, pilot trial support with industrial heavyweights, and catalytic growth grants.',
    category: 'Climate',
    stage: 'Ideation',
    format: 'Virtual',
    location: 'Global / Remote',
    grant: '$50k - $100k',
    equity: '3% - 5%',
    duration: '10 Weeks',
    daysLeft: 21,
    batchName: 'Cohort VII',
    website: 'https://terraventures.climate',
    tags: ['Carbon Capture', 'Clean Tech', 'Grid Storage'],
    highlights: ['Non-Dilutive Matching Grants', 'Prototyping Labs', 'Corporate Offtake Partners'],
    alumniValuation: '$620M',
    topPerks: [
      { title: 'Green Energy Lab Access', value: '12 Months Free' },
      { title: 'Patent Filing Grant', value: '$10,000' },
      { title: 'Carbon Offset Credits', value: '500 Tons' }
    ],
    mentors: [
      { name: 'David Suzuki', role: 'Climate Tech Venture Partner', avatar: 'DS' },
      { name: 'Dr. Clara Hertz', role: 'CleanTech Hardware Lead', avatar: 'CH' }
    ],
    alumni: ['BioLoop', 'SolarGridX', 'CarbonZero']
  },
  {
    id: 'inc-4',
    name: 'BioPulse Health Lab',
    verified: true,
    featured: false,
    logoBg: 'bg-gradient-to-br from-rose-500 to-red-800',
    logoText: 'BPH',
    shortDescription: 'Pioneering digital therapeutics, AI diagnostics, and precision medtech hardware.',
    fullDescription: 'BioPulse provides early-stage bio and digital health entrepreneurs with clinical trial pipelines, IRB approval advisory, and fast-track FDA regulatory strategy.',
    category: 'HealthTech',
    stage: 'MVP',
    format: 'Hybrid',
    location: 'Boston, MA',
    grant: '$100k - $200k',
    equity: '7%',
    duration: '16 Weeks',
    daysLeft: 6,
    batchName: '2026 Health Sprint',
    website: 'https://biopulsehealth.org',
    tags: ['MedTech', 'AI Diagnostics', 'Digital Health'],
    highlights: ['Hospital Network Pilot Access', 'HIPAA Ready Infra', 'Bio-Lab Equipment Access'],
    alumniValuation: '$980M',
    topPerks: [
      { title: 'Hospital Trial Sandboxes', value: '3 Active Partners' },
      { title: 'HIPAA Infrastructure', value: '$25,000 Credits' },
      { title: 'FDA Fast-Track Consulting', value: 'Full Package' }
    ],
    mentors: [
      { name: 'Dr. Robert Kim', role: 'Chief Medical Officer ex-Mayo', avatar: 'RK' },
      { name: 'Lisa Ray', role: 'HealthTech Investor', avatar: 'LR' }
    ],
    alumni: ['GenomX', 'PulseCare', 'OncoDetect']
  },
  {
    id: 'inc-5',
    name: 'CloudScale SaaS Incubator',
    verified: false,
    featured: false,
    logoBg: 'bg-gradient-to-br from-purple-600 to-indigo-800',
    logoText: 'CSI',
    shortDescription: 'Scaling B2B SaaS solutions from 0 to $1M ARR through product-led growth mastery.',
    fullDescription: 'CloudScale focuses exclusively on software-as-a-service companies. Our intensive curriculum tackles enterprise sales cycles, pricing optimization, and PLG flywheels.',
    category: 'SaaS',
    stage: 'MVP',
    format: 'Virtual',
    location: 'Remote',
    grant: '$75k - $125k',
    equity: '5%',
    duration: '12 Weeks',
    daysLeft: 18,
    batchName: 'Summer 2026',
    website: 'https://cloudscalesaas.com',
    tags: ['B2B Enterprise', 'PLG', 'Workflow Automation'],
    highlights: ['1-on-1 Growth Coaching', 'G2 & ProductHunt Feature Prep', 'Design Partner Intro'],
    alumniValuation: '$450M',
    topPerks: [
      { title: 'Intercom & Hubspot Perks', value: '90% Off 1 Year' },
      { title: 'Design Agency Sprint', value: '$12,000 Credit' },
      { title: 'Google Cloud Credits', value: '$100,000' }
    ],
    mentors: [
      { name: 'Jason Lemkin', role: 'SaaS Mentor & Investor', avatar: 'JL' },
      { name: 'Aria Montgomery', role: 'VP Growth ex-Notion', avatar: 'AM' }
    ],
    alumni: ['WorkFlowX', 'DocuSync', 'MetricPulse']
  },
  {
    id: 'inc-6',
    name: 'QuantumLeap DeepTech',
    verified: true,
    featured: true,
    logoBg: 'bg-gradient-to-br from-blue-700 to-slate-900',
    logoText: 'QLD',
    shortDescription: 'Hardware, quantum computing, robotics, and advanced semiconductor innovation.',
    fullDescription: 'QuantumLeap provides specialized fabrication tooling, prototyping grants, and engineering mentorship for physical tech and deep science breakthroughs.',
    category: 'AI & DeepTech',
    stage: 'Ideation',
    format: 'In-Person',
    location: 'Austin, TX',
    grant: '$200k - $500k',
    equity: '8%',
    duration: '20 Weeks',
    daysLeft: 3,
    batchName: 'Quantum Alpha 2026',
    website: 'https://quantumleap.tech',
    tags: ['Robotics', 'Quantum Hardware', 'Semiconductors'],
    highlights: ['Cleanroom Access', 'Hardtech Prototyping Grant', 'Defense Tech Intros'],
    alumniValuation: '$2.1B',
    topPerks: [
      { title: 'Fab Lab Prototyping', value: 'Unrestricted Access' },
      { title: 'Government SBIR Grant Help', value: 'Guaranteed Review' },
      { title: 'Cadence Design Credits', value: '$50,000' }
    ],
    mentors: [
      { name: 'Prof. Alan Vance', role: 'Quantum Physicist MIT', avatar: 'AV' },
      { name: 'Gemma Rossi', role: 'DeepTech Venture Director', avatar: 'GR' }
    ],
    alumni: ['QubitWave', 'AeroRobotics', 'NanoChip']
  }
];

const CATEGORIES = ["All", "AI & DeepTech", "FinTech", "HealthTech", "Climate", "SaaS"];
const STAGES = ["All Stages", "Ideation", "MVP", "Seed"];
const FORMATS = ["All Formats", "Virtual", "Hybrid", "In-Person"];

interface DatabaseOrganization {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  city?: string;
  state?: string;
  country?: string;
  subscription_tier?: string;
  founder_name?: string;
  industry?: string;
  stage?: string;
  format?: string;
  grant_amount?: string;
  equity?: string;
  duration?: string;
  tags?: string[];
}

function mapOrganizationToIncubator(org: DatabaseOrganization): Incubator {
  const initials = org.name
    ? org.name
        .split(' ')
        .map((w: string) => w[0])
        .slice(0, 3)
        .join('')
        .toUpperCase()
    : 'INC';
  const location = [org.city, org.state, org.country].filter(Boolean).join(', ') || 'Global / Remote';
  const colors = [
    'bg-gradient-to-br from-blue-600 to-indigo-900',
    'bg-gradient-to-br from-cyan-500 to-blue-700',
    'bg-gradient-to-br from-emerald-500 to-teal-800',
    'bg-gradient-to-br from-purple-600 to-indigo-800',
    'bg-gradient-to-br from-rose-500 to-red-800',
  ];
  const colorIndex = Math.abs((org.name || '').length) % colors.length;

  return {
    id: org.id,
    slug: org.slug || org.id,
    name: org.name,
    verified: true,
    featured: Boolean(org.subscription_tier && org.subscription_tier !== 'free'),
    logoBg: colors[colorIndex],
    logoText: initials,
    shortDescription: org.description || 'Enterprise startup incubation and acceleration program.',
    fullDescription: org.description || 'Dedicated to supporting early-stage founders with world-class mentorship, infrastructure, and demo day investment access.',
    category: org.industry || 'AI & DeepTech',
    stage: org.stage || 'MVP',
    format: org.format || (org.city ? 'In-Person' : 'Hybrid'),
    location: location,
    grant: org.grant_amount || '$75k - $150k',
    equity: org.equity || '5% - 7%',
    duration: org.duration || '12 Weeks',
    daysLeft: 12,
    batchName: `${org.name} Active Cohort`,
    website: org.website || 'https://arba360.com',
    tags: org.tags && org.tags.length > 0 ? org.tags : ['Incubation', 'Acceleration', 'Mentorship'],
    highlights: ['Venture Mentors', 'Demo Day Access', 'Cloud Perks'],
    alumniValuation: '$500M+',
    topPerks: [
      { title: 'Cloud Infrastructure Credits', value: '$100,000' },
      { title: 'Dedicated Mentorship Access', value: 'Included' },
      { title: 'Legal & IP Structuring', value: '$15,000 Value' }
    ],
    mentors: [
      { name: org.founder_name || 'Program Director', role: 'Head of Incubation', avatar: 'PD' }
    ],
    alumni: ['Portfolio Startup 1', 'Portfolio Startup 2']
  };
}

export default function IncubatorsPage() {
  const [incubators, setIncubators] = useState<Incubator[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All Stages');
  const [selectedFormat, setSelectedFormat] = useState('All Formats');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'deadline' | 'grant'>('deadline');

  useEffect(() => {
    async function loadIncubatorsFromDatabase() {
      try {
        const res = await fetch('/api/v1/incubators');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map(mapOrganizationToIncubator);
          setIncubators(mapped);
        } else {
          setIncubators(INITIAL_INCUBATORS);
        }
      } catch (err) {
        console.error('Failed to load incubators from Supabase:', err);
        setIncubators(INITIAL_INCUBATORS);
      } finally {
        setIsLoading(false);
      }
    }
    loadIncubatorsFromDatabase();
  }, []);
  
  const [selectedIncubator, setSelectedIncubator] = useState<Incubator | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'mentors' | 'perks'>('overview');
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['inc-1', 'inc-3']);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Dynamic light tracking FX
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const filteredIncubators = useMemo(() => {
    return incubators.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesStage = selectedStage === 'All Stages' || item.stage === selectedStage;
      const matchesFormat = selectedFormat === 'All Formats' || item.format === selectedFormat;
      const matchesSaved = !showSavedOnly || bookmarkedIds.includes(item.id);

      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCategory && matchesStage && matchesFormat && matchesSaved && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        return a.daysLeft - b.daysLeft;
      } else {
        const aVal = parseInt(a.grant.replace(/[^0-9]/g, '')) || 0;
        const bVal = parseInt(b.grant.replace(/[^0-9]/g, '')) || 0;
        return bVal - aVal;
      }
    });
  }, [incubators, searchTerm, selectedCategory, selectedStage, selectedFormat, showSavedOnly, bookmarkedIds, sortBy]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleToggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter(item => item !== id));
      triggerToast("Removed from saved list");
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
      triggerToast("Saved to your bookmarks");
    }
  };

  const handleToggleCompare = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(item => item !== id));
    } else {
      if (selectedForCompare.length >= 3) {
        triggerToast("Maximum 3 incubators can be compared at once!");
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const handleApply = (e: React.MouseEvent, incubator: Incubator) => {
    e.stopPropagation();
    if (!appliedIds.includes(incubator.id)) {
      setAppliedIds([...appliedIds, incubator.id]);
      triggerToast(`Application draft started for ${incubator.name}`);
    } else {
      triggerToast(`You have already applied to ${incubator.name}`);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStage('All Stages');
    setSelectedFormat('All Formats');
    setShowSavedOnly(false);
    setSortBy('deadline');
  };

  return (
    <div className="min-h-screen bg-[#EDF2FA] text-slate-800 font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      
      {/* Background FX: Dot-Matrix & Interactive Dynamic Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div 
          className="absolute inset-0 opacity-[0.35]" 
          style={{
            backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Dynamic Cursor-Following Glow */}
        <div 
          className="absolute w-[32rem] h-[32rem] bg-cyan-400/15 rounded-full blur-[140px] transition-transform duration-700 ease-out pointer-events-none"
          style={{
            transform: `translate(${mousePos.x - 250}px, ${mousePos.y - 250}px)`
          }}
        />

        {/* Ambient Top Fixed Orbs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-20 w-[28rem] h-[28rem] bg-cyan-500/15 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navigation Sticky Glass Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="md" href="/" />
              <span className="text-slate-300 font-light">/</span>
              <span className="bg-slate-100 text-[#1A2151] px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border border-slate-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Incubators Directory
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full text-xs font-semibold text-blue-900">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <span>Active Cohorts 2026</span>
              </div>

              {/* Bookmark Toggle Badge */}
              <button
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                  showSavedOnly 
                    ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                <span>Saved ({bookmarkedIds.length})</span>
              </button>

              <Link
                href="/login"
                className="hidden md:inline-flex text-xs font-semibold text-slate-700 hover:text-[#2563EB] px-3 py-2 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-xs font-semibold text-white px-4 py-2 rounded-xl shadow-xs transition"
                style={{ backgroundColor: '#1A2151' }}
              >
                Apply as Startup
              </Link>
            </div>
          </div>
        </header>

        {/* Hero & Glassmorphic Search Bar */}
        <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <div className="inline-flex items-center gap-2 bg-white/90 border border-blue-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-700 shadow-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Discover Global Venture Accelerators &amp; Incubation Labs</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A2151] tracking-tight leading-tight">
              Fast-Track Your Startup&apos;s <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600">Growth Engine</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Compare funding grants, program durations, equity terms, and application deadlines across top-rated incubation cohorts worldwide.
            </p>
          </div>

          {/* Floating Glassmorphic Search Bar */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl blur-sm opacity-30 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative flex items-center bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl px-4 py-2.5">
                <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by incubator name, tech (e.g., AI, Climate, FinTech)..."
                  className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-sm sm:text-base font-medium"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="hidden sm:flex items-center pl-3 border-l border-slate-200 ml-2 text-xs text-slate-400 font-mono">
                  {isLoading ? '...' : `${filteredIncubators.length} result${filteredIncubators.length !== 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
          </div>

          {/* Category Tabs & Active Count Badge */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200/70 pb-5">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {CATEGORIES.map(cat => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#1A2151] text-white shadow-md shadow-blue-900/20 scale-105' 
                        : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-3">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isLoading ? 'Loading Cohorts...' : `Showing ${filteredIncubators.length} Cohorts`}
              </span>
            </div>
          </div>

          {/* Dropdown Filters Toolbar */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <label className="text-xs text-slate-400 font-medium">Stage:</label>
                <select 
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#1A2151] focus:outline-none cursor-pointer"
                >
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <label className="text-xs text-slate-400 font-medium">Format:</label>
                <select 
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#1A2151] focus:outline-none cursor-pointer"
                >
                  {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <label className="text-xs text-slate-400 font-medium">Sort By:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'deadline' | 'grant')}
                  className="bg-transparent text-xs font-bold text-[#1A2151] focus:outline-none cursor-pointer"
                >
                  <option value="deadline">Closing Soonest</option>
                  <option value="grant">Highest Grant Value</option>
                </select>
              </div>
            </div>

            {(selectedCategory !== 'All' || selectedStage !== 'All Stages' || selectedFormat !== 'All Formats' || showSavedOnly || searchTerm !== '') && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </section>

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs animate-pulse flex flex-col justify-between space-y-4 min-h-[380px]">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-4 bg-slate-200 rounded-md" />
                      <div className="w-6 h-6 bg-slate-100 rounded-full" />
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-2xl shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="w-32 h-4 bg-slate-200 rounded" />
                        <div className="w-20 h-3 bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-slate-100 rounded" />
                      <div className="w-5/6 h-3 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                      <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl" />
                      <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl" />
                      <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl" />
                    </div>
                    <div className="h-10 bg-slate-200/80 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredIncubators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIncubators.map((incubator) => {
                const isApplied = appliedIds.includes(incubator.id);
                const isBookmarked = bookmarkedIds.includes(incubator.id);
                const isCompared = selectedForCompare.includes(incubator.id);
                const isUrgent = incubator.daysLeft <= 7;

                return (
                  <div
                    key={incubator.id}
                    onClick={() => {
                      setSelectedIncubator(incubator);
                      setDrawerTab('overview');
                    }}
                    className={`group relative bg-white rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
                      isUrgent 
                        ? 'p-[1.5px] bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500 shadow-md hover:shadow-cyan-500/20' 
                        : 'border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    <div className="bg-white rounded-[15px] h-full flex flex-col justify-between p-5">
                      
                      <div>
                        {/* Top Action Bar */}
                        <div className="flex items-center justify-between mb-3">
                          <label 
                            onClick={(e) => e.stopPropagation()} 
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer select-none"
                          >
                            <input 
                              type="checkbox" 
                              checked={isCompared}
                              onChange={(e) => handleToggleCompare(e, incubator.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <span>Compare</span>
                          </label>

                          <div className="flex items-center gap-2">
                            {isUrgent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Closing Soon
                              </span>
                            )}

                            <button
                              onClick={(e) => handleToggleBookmark(e, incubator.id)}
                              className="p-1.5 hover:bg-slate-100 rounded-full transition"
                              title={isBookmarked ? "Remove Bookmark" : "Save Incubator"}
                            >
                              <Heart className={`w-4 h-4 transition-transform active:scale-125 ${
                                isBookmarked ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-slate-600'
                              }`} />
                            </button>
                          </div>
                        </div>

                        {/* Incubator Header Logo & Details */}
                        <div className="flex items-start space-x-3 mb-3">
                          <div className={`w-12 h-12 rounded-2xl ${incubator.logoBg} text-white font-bold flex items-center justify-center text-sm shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}>
                            {incubator.logoText}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-extrabold text-[#1A2151] text-base group-hover:text-blue-600 transition-colors line-clamp-1">
                                {incubator.name}
                              </h3>
                              {incubator.verified && (
                                <ShieldCheck className="w-4 h-4 text-cyan-500 fill-cyan-50 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center text-xs text-slate-500 gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {incubator.format}
                              </span>
                              <span>•</span>
                              <span className="font-semibold text-slate-700">{incubator.stage}</span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                          {incubator.shortDescription}
                        </p>

                        {/* Badges / Sector Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {incubator.tags.map((tag, idx) => (
                            <span 
                              key={idx} 
                              className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-0.5 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Program Metrics Pill Bar */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl mb-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-emerald-600" /> Grant
                            </span>
                            <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">
                              {incubator.grant}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-blue-600" /> Duration
                            </span>
                            <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">
                              {incubator.duration}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 gap-2">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {incubator.daysLeft} days left
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIncubator(incubator);
                              setDrawerTab('overview');
                            }}
                            className="text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1 shadow-xs bg-[#1A2151] hover:bg-blue-700 text-white"
                          >
                            Apply <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-[#1A2151]">No Cohorts Match Search</h3>
              <p className="text-sm text-slate-500 mt-2 mb-6">
                Try resetting your search query or altering selected stage, sector, or saved filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 bg-[#1A2151] hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          )}
        </main>

        {selectedForCompare.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1A2151]/95 text-white backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-cyan-500/40 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-bold">
                Comparing {selectedForCompare.length} / 3 Cohorts
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCompareModal(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-sm transition"
              >
                Compare Now
              </button>
              <button
                onClick={() => setSelectedForCompare([])}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* List Incubator Footer CTA */}
        <footer className="bg-[#1A2151] text-white py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-800 relative overflow-hidden mt-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="text-center lg:text-left max-w-2xl">
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                For Incubator Directors &amp; Venture Studios
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Are you leading an Incubator or Venture Studio?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-2">
                List your upcoming cohort on Arba360 to attract high-intent founders, automate pre-screening, and accelerate intake.
              </p>
            </div>

            <Link 
              href="/signup?role=incubator_admin"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition duration-200 flex items-center gap-2 flex-shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              List Your Incubator
            </Link>
          </div>
        </footer>

        {/* Drawer Details View */}
        {selectedIncubator && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity">
            <div 
              className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Top Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl ${selectedIncubator.logoBg} text-white font-bold flex items-center justify-center text-sm`}>
                    {selectedIncubator.logoText}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-1.5">
                      {selectedIncubator.name}
                      {selectedIncubator.verified && <ShieldCheck className="w-4 h-4 text-cyan-500" />}
                    </h2>
                    <p className="text-xs text-slate-500">{selectedIncubator.batchName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIncubator(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Tab Header */}
              <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
                <button
                  onClick={() => setDrawerTab('overview')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
                    drawerTab === 'overview' ? 'border-[#1A2151] text-[#1A2151]' : 'border-transparent text-slate-500'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Overview
                </button>
                <button
                  onClick={() => setDrawerTab('mentors')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
                    drawerTab === 'mentors' ? 'border-[#1A2151] text-[#1A2151]' : 'border-transparent text-slate-500'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Mentors &amp; Alumni
                </button>
                <button
                  onClick={() => setDrawerTab('perks')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
                    drawerTab === 'perks' ? 'border-[#1A2151] text-[#1A2151]' : 'border-transparent text-slate-500'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" /> Perks Stack
                </button>
              </div>

              {/* Drawer Tab Contents */}
              <div className="p-6 space-y-6 flex-1">
                {drawerTab === 'overview' && (
                  <>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-blue-900">Application Deadline</div>
                        <div className="text-sm font-extrabold text-blue-700 mt-0.5">
                          Closing in {selectedIncubator.daysLeft} Days
                        </div>
                      </div>
                      <a 
                        href={selectedIncubator.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        Official Site <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Program Summary</h3>
                      <p className="text-sm text-slate-700 leading-relaxed">{selectedIncubator.fullDescription}</p>
                    </div>

                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Key Terms</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                          <span className="text-xs text-slate-500 font-medium">Grant / Funding</span>
                          <div className="text-sm font-extrabold text-[#1A2151] mt-0.5">{selectedIncubator.grant}</div>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                          <span className="text-xs text-slate-500 font-medium">Equity %</span>
                          <div className="text-sm font-extrabold text-[#1A2151] mt-0.5">{selectedIncubator.equity}</div>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                          <span className="text-xs text-slate-500 font-medium">Program Length</span>
                          <div className="text-sm font-extrabold text-[#1A2151] mt-0.5">{selectedIncubator.duration}</div>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                          <span className="text-xs text-slate-500 font-medium">Cohort Format</span>
                          <div className="text-sm font-extrabold text-[#1A2151] mt-0.5">{selectedIncubator.format}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {drawerTab === 'mentors' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Lead Mentors</h3>
                      <div className="space-y-3">
                        {selectedIncubator.mentors.map((m, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                            <div className="w-10 h-10 rounded-full bg-[#1A2151] text-cyan-400 font-bold flex items-center justify-center text-xs">
                              {m.avatar}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{m.name}</div>
                              <div className="text-xs text-slate-500">{m.role}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Notable Portfolio Alumni</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedIncubator.alumni.map((company, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-900 font-bold text-xs px-3 py-1.5 rounded-lg border border-blue-200">
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'perks' && (
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Included Startup Perks</h3>
                    <div className="space-y-3">
                      {selectedIncubator.topPerks.map((perk, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-cyan-500" />
                            <span className="text-xs font-bold text-slate-800">{perk.title}</span>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {perk.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Action Footer: Dual Program Applications */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/90 backdrop-blur-xs flex flex-col sm:flex-row items-center gap-3">
                {/* Button 1: Apply for Pre-Incubator */}
                <Link
                  href={`/incubators/${selectedIncubator.slug || selectedIncubator.id}/apply?program=pre-incubator`}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 bg-white text-[#1A2151] border-2 border-slate-200/90 hover:border-[#1A2151] hover:bg-slate-100/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 group"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600 group-hover:scale-105 transition-transform" />
                  <span>Apply for Pre-Incubator</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1A2151] group-hover:translate-x-0.5 transition-all" />
                </Link>

                {/* Button 2: Apply for Incubator */}
                <Link
                  href={`/incubators/${selectedIncubator.slug || selectedIncubator.id}/apply?program=incubator`}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-extrabold text-white transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-[#1A2151] via-blue-700 to-[#2563EB] hover:from-[#13173d] hover:to-blue-600 shadow-md hover:shadow-blue-600/25 hover:-translate-y-0.5 group"
                >
                  <Building2 className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-105 transition-transform" />
                  <span>Apply for Incubator</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Side-by-Side Comparison Modal */}
        {showCompareModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  <h2 className="font-extrabold text-[#1A2151] text-lg">Side-by-Side Cohort Comparison</h2>
                </div>
                <button onClick={() => setShowCompareModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-3 font-extrabold text-slate-400 uppercase w-32">Metric</th>
                      {selectedForCompare.map(id => {
                        const inc = incubators.find(i => i.id === id);
                        return (
                          <th key={id} className="p-3 font-extrabold text-slate-900 text-sm">
                            {inc?.name || id}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-bold text-slate-500">Grant / Funding</td>
                      {selectedForCompare.map(id => (
                        <td key={id} className="p-3 font-extrabold text-emerald-700">
                          {incubators.find(i => i.id === id)?.grant || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-500">Equity Terms</td>
                      {selectedForCompare.map(id => (
                        <td key={id} className="p-3 font-bold text-slate-800">
                          {incubators.find(i => i.id === id)?.equity || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-500">Duration</td>
                      {selectedForCompare.map(id => (
                        <td key={id} className="p-3 font-semibold text-slate-700">
                          {incubators.find(i => i.id === id)?.duration || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-500">Format &amp; Location</td>
                      {selectedForCompare.map(id => {
                        const inc = incubators.find(i => i.id === id);
                        return (
                          <td key={id} className="p-3 text-slate-700">
                            {inc ? `${inc.format} (${inc.location})` : 'N/A'}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-500">Days Left</td>
                      {selectedForCompare.map(id => (
                        <td key={id} className="p-3 font-bold text-amber-600">
                          {incubators.find(i => i.id === id)?.daysLeft ?? 'N/A'} Days
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Global Toast Notification */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1A2151] text-white px-4 py-3 rounded-2xl shadow-2xl border border-cyan-500/30 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
}
