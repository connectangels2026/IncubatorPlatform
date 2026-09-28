'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Award,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Mail,
  FileText,
  X,
  Send,
  Cpu,
  Leaf,
  Globe,
  ShoppingBag,
  HeartPulse,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  ClipboardCheck,
  ArrowLeft,
  LogOut,
  Menu,
} from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import { useAuth } from '@/frontend/context/AuthContext';
import Logo from '@/frontend/components/ui/Logo';
import { Sidebar } from '@/frontend/components/layouts/Sidebar';

interface ApplicationItem {
  id: string;
  startupName: string;
  sector: string;
  sectorIcon: string;
  founderName: string;
  founderEmail: string;
  type: 'incubator' | 'pre_incubator';
  status: 'submitted' | 'under_review' | 'admitted' | 'rejected';
  score: number;
  submittedDate: string;
  pitchSummary: string;
  teamSize: number;
  fundingAsk: string;
  marketDescription: string;
  scores: { team: number; market: number; innovation: number; traction: number };
}

const INITIAL_APPLICATIONS: ApplicationItem[] = [
  {
    id: "APP-1042",
    startupName: "Aether AI",
    sector: "AI & Machine Learning",
    sectorIcon: "cpu",
    founderName: "Elena Rostova",
    founderEmail: "elena@aetherai.io",
    type: "incubator",
    status: "under_review",
    score: 88,
    submittedDate: "2026-03-18",
    pitchSummary: "Autonomous AI agents for enterprise workflow optimization and legacy code migration.",
    teamSize: 6,
    fundingAsk: "$250,000",
    marketDescription: "Targeting Fortune 500 IT departments looking to automate backend technical debt refactoring.",
    scores: { team: 90, market: 85, innovation: 95, traction: 80 }
  },
  {
    id: "APP-1043",
    startupName: "VerdeGrid Solutions",
    sector: "CleanTech",
    sectorIcon: "leaf",
    founderName: "Marcus Vance",
    founderEmail: "marcus@verdegrid.com",
    type: "incubator",
    status: "admitted",
    score: 94,
    submittedDate: "2026-03-15",
    pitchSummary: "Smart microgrid load management software utilizing predictive weather models for localized renewable storage.",
    teamSize: 9,
    fundingAsk: "$500,000",
    marketDescription: "Municipal utilities and commercial real estate developers in urban renewable transition zones.",
    scores: { team: 95, market: 92, innovation: 96, traction: 92 }
  },
  {
    id: "APP-1044",
    startupName: "PulseHealth Telemetry",
    sector: "HealthTech",
    sectorIcon: "heart",
    founderName: "Dr. Sarah Jenkins",
    founderEmail: "s.jenkins@pulsehealth.med",
    type: "pre_incubator",
    status: "submitted",
    score: 65,
    submittedDate: "2026-03-22",
    pitchSummary: "Non-invasive wearable sensor suite for continuous cardiovascular health monitoring in post-op cardiac patients.",
    teamSize: 3,
    fundingAsk: "$100,000",
    marketDescription: "Outpatient cardiac rehab centers and remote patient monitoring health networks.",
    scores: { team: 70, market: 65, innovation: 75, traction: 50 }
  },
  {
    id: "APP-1045",
    startupName: "QuantumPay Systems",
    sector: "Fintech",
    sectorIcon: "dollar",
    founderName: "Tariq Al-Mansoor",
    founderEmail: "tariq@quantumpay.net",
    type: "incubator",
    status: "rejected",
    score: 42,
    submittedDate: "2026-02-28",
    pitchSummary: "Cross-border settlement platform powered by instant liquidity pools and cryptographic verification.",
    teamSize: 4,
    fundingAsk: "$350,000",
    marketDescription: "B2B import-export merchants in emerging markets suffering high wire transfer fees.",
    scores: { team: 50, market: 45, innovation: 40, traction: 30 }
  },
  {
    id: "APP-1046",
    startupName: "EduPulse Interactive",
    sector: "EdTech",
    sectorIcon: "grad",
    founderName: "Priya Sharma",
    founderEmail: "priya@edupulse.edu",
    type: "pre_incubator",
    status: "under_review",
    score: 79,
    submittedDate: "2026-03-10",
    pitchSummary: "Adaptive learning platform turning standard STEM curriculums into gamified 3D virtual simulations.",
    teamSize: 5,
    fundingAsk: "$150,000",
    marketDescription: "K-12 private school networks and homeschool charter organizations looking for immersive STEM tools.",
    scores: { team: 82, market: 75, innovation: 85, traction: 72 }
  },
  {
    id: "APP-1047",
    startupName: "OmniLogistics Robotics",
    sector: "SaaS",
    sectorIcon: "globe",
    founderName: "David K. Chen",
    founderEmail: "d.chen@omnilogistics.io",
    type: "incubator",
    status: "submitted",
    score: 71,
    submittedDate: "2026-03-21",
    pitchSummary: "Autonomous middle-mile logistics optimization software coordinating regional delivery hubs.",
    teamSize: 7,
    fundingAsk: "$300,000",
    marketDescription: "E-commerce fulfillment centers looking to reduce transit bottleneck delays by 35%.",
    scores: { team: 75, market: 70, innovation: 72, traction: 68 }
  },
  {
    id: "APP-1048",
    startupName: "BioSynth Therapeutics",
    sector: "BioTech",
    sectorIcon: "heart",
    founderName: "Dr. Aris Thorne",
    founderEmail: "athorne@biosynth.org",
    type: "pre_incubator",
    status: "under_review",
    score: 83,
    submittedDate: "2026-03-12",
    pitchSummary: "Computational drug discovery modeling targeted enzymes for rare auto-immune conditions.",
    teamSize: 4,
    fundingAsk: "$200,000",
    marketDescription: "Early-stage pharmaceutical research licensing partnerships and biotech venture labs.",
    scores: { team: 90, market: 80, innovation: 88, traction: 70 }
  },
  {
    id: "APP-1049",
    startupName: "NEXUS Commerce",
    sector: "Commerce",
    sectorIcon: "shop",
    founderName: "Camila Fernandez",
    founderEmail: "camila@nexuscommerce.co",
    type: "incubator",
    status: "admitted",
    score: 91,
    submittedDate: "2026-03-05",
    pitchSummary: "Headless live-stream shopping engine for direct-to-consumer lifestyle brands with instant checkout.",
    teamSize: 11,
    fundingAsk: "$450,000",
    marketDescription: "Mid-market fashion and cosmetics brands with active social commerce followings.",
    scores: { team: 92, market: 90, innovation: 88, traction: 95 }
  },
  {
    id: "APP-1050",
    startupName: "Solaris Carbon Tech",
    sector: "CleanTech",
    sectorIcon: "leaf",
    founderName: "Julian Vance",
    founderEmail: "julian@solariscarbon.com",
    type: "pre_incubator",
    status: "submitted",
    score: 68,
    submittedDate: "2026-03-23",
    pitchSummary: "Direct air capture modular units utilizing agricultural waste biochar filters.",
    teamSize: 3,
    fundingAsk: "$120,000",
    marketDescription: "Corporate sustainability teams looking for verifiable high-integrity carbon removal credits.",
    scores: { team: 72, market: 60, innovation: 80, traction: 55 }
  },
  {
    id: "APP-1051",
    startupName: "CipherVault Security",
    sector: "SaaS",
    sectorIcon: "globe",
    founderName: "Sven Lindqvist",
    founderEmail: "sven@ciphervault.sec",
    type: "incubator",
    status: "rejected",
    score: 51,
    submittedDate: "2026-02-20",
    pitchSummary: "Zero-trust key management layer for multi-cloud Kubernetes clusters.",
    teamSize: 5,
    fundingAsk: "$280,000",
    marketDescription: "Mid-tier FinTech and Healthcare cloud engineering teams with strict compliance needs.",
    scores: { team: 60, market: 50, innovation: 55, traction: 40 }
  },
  {
    id: "APP-1052",
    startupName: "AstraSat Mesh Networks",
    sector: "AI & Machine Learning",
    sectorIcon: "cpu",
    founderName: "Amara Okezie",
    founderEmail: "amara@astrasat.space",
    type: "incubator",
    status: "under_review",
    score: 86,
    submittedDate: "2026-03-14",
    pitchSummary: "LEO satellite mesh bandwidth routing for remote industrial IoT telemetry.",
    teamSize: 8,
    fundingAsk: "$400,000",
    marketDescription: "Offshore energy platforms, maritime shipping lines, and remote mining operations.",
    scores: { team: 88, market: 85, innovation: 90, traction: 80 }
  },
  {
    id: "APP-1053",
    startupName: "AgriFlow Intelligence",
    sector: "CleanTech",
    sectorIcon: "leaf",
    founderName: "Mateo Rossi",
    founderEmail: "m.rossi@agriflow.io",
    type: "pre_incubator",
    status: "submitted",
    score: 74,
    submittedDate: "2026-03-20",
    pitchSummary: "Precision drip irrigation AI controllers adjusting real-time water deliver based on soil moisture sensors.",
    teamSize: 4,
    fundingAsk: "$140,000",
    marketDescription: "Commercial vineyards and high-value fruit orchards in water-stressed agricultural zones.",
    scores: { team: 78, market: 72, innovation: 75, traction: 70 }
  }
];

const StatusBadge = ({ status }: { status: ApplicationItem['status'] }) => {
  const configs = {
    submitted: {
      label: "Submitted",
      style: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400"
    },
    under_review: {
      label: "Under Review",
      style: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500 animate-pulse"
    },
    admitted: {
      label: "Admitted",
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500"
    },
    rejected: {
      label: "Rejected",
      style: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500"
    }
  };

  const config = configs[status] || configs.submitted;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

const TypeBadge = ({ type }: { type: ApplicationItem['type'] }) => {
  const isIncubator = type === 'incubator';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider ${
      isIncubator
        ? 'bg-blue-50 text-blue-700 border border-blue-200'
        : 'bg-amber-50 text-amber-700 border border-amber-200'
    }`}>
      {isIncubator ? 'Incubator' : 'Pre-Incubator'}
    </span>
  );
};

const SectorTag = ({ sector }: { sector: string }) => {
  let Icon = Building2;
  if (sector.includes('AI')) Icon = Cpu;
  else if (sector.includes('Clean')) Icon = Leaf;
  else if (sector.includes('Health')) Icon = HeartPulse;
  else if (sector.includes('Fintech')) Icon = DollarSign;
  else if (sector.includes('EdTech')) Icon = GraduationCap;
  else if (sector.includes('SaaS')) Icon = Globe;
  else if (sector.includes('Bio')) Icon = HeartPulse;
  else if (sector.includes('Commerce')) Icon = ShoppingBag;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded">
      <Icon className="w-3 h-3 text-slate-400" />
      {sector}
    </span>
  );
};

const ScoreBadge = ({ score }: { score: number }) => {
  let color = "text-rose-600 bg-rose-50 border-rose-200";
  let barColor = "bg-rose-500";
  if (score >= 80) {
    color = "text-emerald-700 bg-emerald-50 border-emerald-200";
    barColor = "bg-emerald-500";
  } else if (score >= 65) {
    color = "text-blue-700 bg-blue-50 border-blue-200";
    barColor = "bg-blue-500";
  } else if (score >= 50) {
    color = "text-amber-700 bg-amber-50 border-amber-200";
    barColor = "bg-amber-500";
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`px-2 py-0.5 rounded text-xs font-bold border ${color}`}>
        {score}/100
      </div>
      <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
        <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { logout } = useAuth();

  // Sidebar & Navigation
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Applications Data State
  const [applications, setApplications] = useState<ApplicationItem[]>(INITIAL_APPLICATIONS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal Dialog States
  const [detailsModalApp, setDetailsModalApp] = useState<ApplicationItem | null>(null);
  const [scoreModalApp, setScoreModalApp] = useState<ApplicationItem | null>(null);
  const [decisionModalApp, setDecisionModalApp] = useState<ApplicationItem | null>(null);

  // Rubric Scoring State
  const [rubricScores, setRubricScores] = useState({
    team: 75,
    market: 75,
    innovation: 75,
    traction: 75
  });

  // Decision Modal State
  const [decisionType, setDecisionType] = useState<'admitted' | 'rejected'>('admitted');
  const [decisionFeedback, setDecisionFeedback] = useState('');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (fromDate) count++;
    if (toDate) count++;
    return count;
  }, [searchTerm, statusFilter, typeFilter, fromDate, toDate]);

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          app.startupName.toLowerCase().includes(searchLower) ||
          app.founderName.toLowerCase().includes(searchLower) ||
          app.founderEmail.toLowerCase().includes(searchLower) ||
          app.id.toLowerCase().includes(searchLower);

        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        const matchesType = typeFilter === 'all' || app.type === typeFilter;

        let matchesDate = true;
        if (fromDate) {
          matchesDate = matchesDate && new Date(app.submittedDate) >= new Date(fromDate);
        }
        if (toDate) {
          matchesDate = matchesDate && new Date(app.submittedDate) <= new Date(toDate);
        }

        return matchesSearch && matchesStatus && matchesType && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
        if (sortBy === 'date-asc') return new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime();
        if (sortBy === 'score-high') return b.score - a.score;
        if (sortBy === 'score-low') return a.score - b.score;
        if (sortBy === 'name-asc') return a.startupName.localeCompare(b.startupName);
        if (sortBy === 'name-desc') return b.startupName.localeCompare(a.startupName);
        return 0;
      });
  }, [applications, searchTerm, statusFilter, typeFilter, fromDate, toDate, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, fromDate, toDate, pageSize]);

  const totalPages = Math.ceil(filteredApplications.length / pageSize) || 1;
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, currentPage, pageSize]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allCurrentIds = paginatedApplications.map((app) => app.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allCurrentIds])));
    } else {
      const currentIdsSet = new Set(paginatedApplications.map((app) => app.id));
      setSelectedIds((prev) => prev.filter((id) => !currentIdsSet.has(id)));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllPaginatedSelected =
    paginatedApplications.length > 0 &&
    paginatedApplications.every((app) => selectedIds.includes(app.id));

  const handleBatchStatusUpdate = (newStatus: 'admitted' | 'rejected') => {
    setApplications((prev) =>
      prev.map((app) =>
        selectedIds.includes(app.id) ? { ...app, status: newStatus } : app
      )
    );
    showToast(`Updated status for ${selectedIds.length} applications to '${newStatus.replace('_', ' ')}'`);
    setSelectedIds([]);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setFromDate('');
    setToDate('');
    setSortBy('date-desc');
    showToast('Filters cleared');
  };

  const handleExportCSV = () => {
    if (filteredApplications.length === 0) {
      showToast('No applications to export', 'error');
      return;
    }

    const headers = ["ID", "Startup Name", "Sector", "Founder", "Email", "Type", "Status", "Score", "Submitted Date", "Funding Ask"];
    const rows = filteredApplications.map((app) => [
      app.id,
      `"${app.startupName.replace(/"/g, '""')}"`,
      `"${app.sector}"`,
      `"${app.founderName}"`,
      app.founderEmail,
      app.type,
      app.status,
      app.score,
      app.submittedDate,
      `"${app.fundingAsk}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Arba360_Applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded CSV with ${filteredApplications.length} records`);
  };

  const openScoreModal = (app: ApplicationItem) => {
    setScoreModalApp(app);
    setRubricScores(app.scores || { team: 75, market: 75, innovation: 75, traction: 75 });
  };

  const handleSaveScores = () => {
    if (!scoreModalApp) return;
    const calculatedTotal = Math.round(
      rubricScores.team * 0.3 +
      rubricScores.market * 0.25 +
      rubricScores.innovation * 0.25 +
      rubricScores.traction * 0.2
    );

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === scoreModalApp.id) {
          return {
            ...app,
            score: calculatedTotal,
            scores: { ...rubricScores }
          };
        }
        return app;
      })
    );

    showToast(`Saved score ${calculatedTotal}/100 for ${scoreModalApp.startupName}`);
    setScoreModalApp(null);
  };

  const openDecisionModal = (app: ApplicationItem, initialDecision: 'admitted' | 'rejected' = 'admitted') => {
    setDecisionModalApp(app);
    setDecisionType(initialDecision);
    setDecisionFeedback(
      initialDecision === 'admitted'
        ? `Dear ${app.founderName},\n\nWe are pleased to inform you that ${app.startupName} has been accepted into the Arba360 cohort. Our evaluation committee was impressed by your proposal.`
        : `Dear ${app.founderName},\n\nThank you for applying to Arba360 with ${app.startupName}. After careful review, we regret to inform you that we are unable to advance your application at this time.`
    );
  };

  const handleSaveDecision = () => {
    if (!decisionModalApp) return;
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === decisionModalApp.id) {
          return { ...app, status: decisionType };
        }
        return app;
      })
    );

    const emailNote = sendEmailNotification ? " Notification email dispatched." : "";
    showToast(`Application marked as ${decisionType}.${emailNote}`);
    setDecisionModalApp(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex">
        {/* Sidebar Component with hover animation and icon-only logo */}
        <Sidebar
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-xs">
            <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-1.5 -ml-1.5 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Link href="/dashboard" className="hover:text-blue-600 transition">
                    Dashboard
                  </Link>
                  <span>/</span>
                  <span className="font-semibold text-slate-900">Applications</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/programs">
                  <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs">
                    Programs
                  </Button>
                </Link>
                <Link href="/" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="text-slate-700 hover:bg-slate-100 text-xs">
                    Home
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 gap-1.5 transition text-xs"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </Button>
              </div>
            </div>
          </nav>

          {/* Main Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Applications Management
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Review applicant submissions, score rubric metrics, and admit startups to Arba360.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Download CSV
                </button>
              </div>
            </div>

            {/* Toast Notification */}
            {toast && (
              <div
                className={`p-3.5 rounded-lg border shadow-lg flex items-center justify-between text-xs font-semibold ${
                  toast.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-slate-900 text-white border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {toast.type === 'error' ? (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>{toast.message}</span>
                </div>
                <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Filters & Search Control Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
                {/* Search Bar */}
                <div className="lg:col-span-4 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search startup, founder, email or #ID..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>

                {/* Status Filter */}
                <div className="lg:col-span-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
                  >
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="admitted">Admitted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Program Type Filter */}
                <div className="lg:col-span-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
                  >
                    <option value="all">All Types</option>
                    <option value="incubator">Incubator</option>
                    <option value="pre_incubator">Pre-Incubator</option>
                  </select>
                </div>

                {/* Sort Selector */}
                <div className="lg:col-span-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="score-high">Highest Score</option>
                    <option value="score-low">Lowest Score</option>
                    <option value="name-asc">Startup Name (A-Z)</option>
                  </select>
                </div>

                {/* Reset Filter Button */}
                <div className="lg:col-span-2 flex items-center justify-end">
                  <button
                    onClick={handleResetFilters}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    Reset
                    {activeFiltersCount > 0 && (
                      <span className="ml-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Date Range:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>From</span>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>To</span>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="text-slate-500">
                  Showing <span className="font-semibold text-slate-900">{filteredApplications.length}</span> of {applications.length} applications
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredApplications.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs my-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">No applications found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                  No startup applications match your current filters. Try changing your search query or dates.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-xs hover:bg-blue-700 transition"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Filters
                </button>
              </div>
            ) : (
              /* Data Table */
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4 w-10">
                          <input
                            type="checkbox"
                            checked={isAllPaginatedSelected}
                            onChange={handleSelectAll}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                        </th>
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Startup</th>
                        <th className="py-3 px-4">Founder</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {paginatedApplications.map((app) => {
                        const isSelected = selectedIds.includes(app.id);
                        const initial = app.startupName.charAt(0);

                        return (
                          <tr
                            key={app.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isSelected ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectRow(app.id)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                              />
                            </td>

                            <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-500">
                              {app.id}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                                  {initial}
                                </div>
                                <div>
                                  <div
                                    className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                                    onClick={() => setDetailsModalApp(app)}
                                  >
                                    {app.startupName}
                                  </div>
                                  <div className="mt-0.5">
                                    <SectorTag sector={app.sector} />
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-900">{app.founderName}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {app.founderEmail}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <TypeBadge type={app.type} />
                            </td>

                            <td className="py-3.5 px-4">
                              <StatusBadge status={app.status} />
                            </td>

                            <td className="py-3.5 px-4">
                              <ScoreBadge score={app.score} />
                            </td>

                            <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                              {new Date(app.submittedDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openScoreModal(app)}
                                  title="Evaluate Score"
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                  <Award className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDetailsModalApp(app)}
                                  title="View Pitch Details"
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openDecisionModal(app, 'admitted')}
                                  title="Admit / Reject Decision"
                                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-3">
                    <span>Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-slate-400">|</span>
                    <span>
                      Showing {Math.min((currentPage - 1) * pageSize + 1, filteredApplications.length)} to {Math.min(currentPage * pageSize, filteredApplications.length)} of {filteredApplications.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2 font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Floating Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center gap-2 text-xs font-semibold border-r border-slate-700 pr-4">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {selectedIds.length}
              </span>
              <span>Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBatchStatusUpdate('admitted')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Batch Admit
              </button>
              <button
                onClick={() => handleBatchStatusUpdate('rejected')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <XCircle className="w-3.5 h-3.5" />
                Batch Reject
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Modal 1: Details */}
        {detailsModalApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
              <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-blue-400 font-bold">{detailsModalApp.id}</span>
                    <TypeBadge type={detailsModalApp.type} />
                  </div>
                  <h2 className="text-xl font-bold">{detailsModalApp.startupName}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{detailsModalApp.sector}</p>
                </div>
                <button
                  onClick={() => setDetailsModalApp(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-slate-700 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-slate-400">Founder</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{detailsModalApp.founderName}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Funding Ask</div>
                    <div className="font-semibold text-emerald-600 mt-0.5">{detailsModalApp.fundingAsk}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Team Size</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{detailsModalApp.teamSize} members</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Score</div>
                    <div className="font-semibold text-blue-600 mt-0.5">{detailsModalApp.score}/100</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" /> Pitch Summary
                  </h4>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    {detailsModalApp.pitchSummary}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" /> Target Market
                  </h4>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    {detailsModalApp.marketDescription}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" /> Contact Info
                  </h4>
                  <div className="text-slate-600 space-y-0.5">
                    <p><span className="font-medium text-slate-800">Email:</span> {detailsModalApp.founderEmail}</p>
                    <p><span className="font-medium text-slate-800">Submitted:</span> {detailsModalApp.submittedDate}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Update Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['submitted', 'under_review', 'admitted', 'rejected'] as const).map((statusVal) => (
                      <button
                        key={statusVal}
                        onClick={() => {
                          setApplications((prev) =>
                            prev.map((a) => (a.id === detailsModalApp.id ? { ...a, status: statusVal } : a))
                          );
                          setDetailsModalApp((prev) => (prev ? { ...prev, status: statusVal } : null));
                          showToast(`Status updated to ${statusVal.replace('_', ' ')}`);
                        }}
                        className={`px-3 py-1.5 rounded-lg font-semibold capitalize border transition ${
                          detailsModalApp.status === statusVal
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {statusVal.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setDetailsModalApp(null)}
                  className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Scoring */}
        {scoreModalApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Evaluation Rubric</span>
                  <h3 className="text-lg font-bold text-slate-900">{scoreModalApp.startupName}</h3>
                </div>
                <button onClick={() => setScoreModalApp(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <p className="text-slate-500">
                  Adjust evaluation metrics below. Total score recalculates in real-time according to Arba360 weighting.
                </p>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center font-medium mb-1">
                      <span className="text-slate-700">Team & Founders (30%)</span>
                      <span className="font-bold text-blue-600">{rubricScores.team}/100</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rubricScores.team}
                      onChange={(e) => setRubricScores({ ...rubricScores, team: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center font-medium mb-1">
                      <span className="text-slate-700">Market Potential (25%)</span>
                      <span className="font-bold text-blue-600">{rubricScores.market}/100</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rubricScores.market}
                      onChange={(e) => setRubricScores({ ...rubricScores, market: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center font-medium mb-1">
                      <span className="text-slate-700">Innovation & Technology (25%)</span>
                      <span className="font-bold text-blue-600">{rubricScores.innovation}/100</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rubricScores.innovation}
                      onChange={(e) => setRubricScores({ ...rubricScores, innovation: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center font-medium mb-1">
                      <span className="text-slate-700">Traction & Growth (20%)</span>
                      <span className="font-bold text-blue-600">{rubricScores.traction}/100</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rubricScores.traction}
                      onChange={(e) => setRubricScores({ ...rubricScores, traction: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Total Score</div>
                    <div className="text-[10px] text-slate-400">Weighted sum of 4 evaluation pillars</div>
                  </div>
                  <div className="text-xl font-extrabold text-emerald-400">
                    {Math.round(
                      rubricScores.team * 0.3 +
                      rubricScores.market * 0.25 +
                      rubricScores.innovation * 0.25 +
                      rubricScores.traction * 0.2
                    )}
                    <span className="text-xs text-slate-400 font-normal"> / 100</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setScoreModalApp(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveScores}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Save Score
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Decision */}
        {decisionModalApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Cohort Decision</h3>
                  <p className="text-xs text-slate-500">{decisionModalApp.startupName} ({decisionModalApp.founderName})</p>
                </div>
                <button onClick={() => setDecisionModalApp(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">Final Outcome</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDecisionType('admitted');
                        setDecisionFeedback(`Dear ${decisionModalApp.founderName},\n\nWe are pleased to inform you that ${decisionModalApp.startupName} has been accepted into the Arba360 cohort.`);
                      }}
                      className={`py-2.5 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition ${
                        decisionType === 'admitted'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Admit to Cohort
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDecisionType('rejected');
                        setDecisionFeedback(`Dear ${decisionModalApp.founderName},\n\nThank you for applying to Arba360 with ${decisionModalApp.startupName}. After careful review, we regret to inform you that we are unable to advance your application.`);
                      }}
                      className={`py-2.5 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition ${
                        decisionType === 'rejected'
                          ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Reject Application
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Applicant Feedback Message
                  </label>
                  <textarea
                    rows={4}
                    value={decisionFeedback}
                    onChange={(e) => setDecisionFeedback(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={sendEmailNotification}
                    onChange={(e) => setSendEmailNotification(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <label htmlFor="sendEmail" className="text-slate-600 font-medium">
                    Send notification email to <span className="font-mono text-slate-800">{decisionModalApp.founderEmail}</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setDecisionModalApp(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDecision}
                  className={`px-4 py-1.5 text-white rounded-lg font-semibold flex items-center gap-1.5 transition ${
                    decisionType === 'admitted' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Confirm Decision
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
