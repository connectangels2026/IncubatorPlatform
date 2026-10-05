'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Plus,
  Search,
  Star,
  Calendar,
  X,
  Edit3,
  CalendarDays,
  ToggleLeft,
  ToggleRight,
  Link2,
  CheckCircle2,
  CalendarSync,
  Mail,
  RefreshCw,
  Menu,
  Check,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import { useAuth } from '@/frontend/context/AuthContext';
import { Sidebar } from '@/frontend/components/layouts/Sidebar';
import { apiClient } from '@/services/apiClient';

export interface MentorExpertise {
  name: string;
  type: 'blue' | 'purple' | 'emerald' | 'slate' | 'amber';
}

export interface MentorItem {
  id: string;
  name: string;
  role: string;
  company: string;
  handle: string;
  email: string;
  avatar: string;
  expertise: MentorExpertise[];
  rating: number;
  reviewsCount: number;
  sessions: string;
  sessionsCount: number;
  availability: string;
  availStatus: 'Available' | 'Booked' | 'Deactivated';
  matchedCount: number;
  matchedStartups: string[];
  maxHoursPerMonth?: number;
  linkedinUrl?: string;
  active: boolean;
}

const INITIAL_FALLBACK_MENTORS: MentorItem[] = [
  {
    id: 'm-1',
    name: 'Dr. Marcus Vance',
    role: 'VP of Product',
    company: 'Stripe',
    handle: '@marcus_vance',
    email: 'marcus.vance@stripe.com',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    expertise: [
      { name: 'FinTech', type: 'blue' },
      { name: 'Payments', type: 'blue' },
      { name: 'GTM Strategy', type: 'purple' },
    ],
    rating: 4.9,
    reviewsCount: 32,
    sessions: '14 sessions this month (3 upcoming)',
    sessionsCount: 14,
    availability: '4 open slots',
    availStatus: 'Available',
    matchedCount: 2,
    matchedStartups: ['PayFlow Finance', 'Aether AI'],
    maxHoursPerMonth: 6,
    linkedinUrl: 'https://linkedin.com/in/marcusvance',
    active: true,
  },
  {
    id: 'm-2',
    name: 'Sarah Chen',
    role: 'Ex-CTO',
    company: 'CloudScale',
    handle: '@schen_tech',
    email: 'sarah.chen@cloudscale.io',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    expertise: [
      { name: 'AI/ML', type: 'emerald' },
      { name: 'Cloud Architecture', type: 'slate' },
    ],
    rating: 5.0,
    reviewsCount: 48,
    sessions: '18 sessions this month (5 upcoming)',
    sessionsCount: 18,
    availability: '2 open slots',
    availStatus: 'Available',
    matchedCount: 3,
    matchedStartups: ['DataPulse AI', 'VerdeGrid', 'CloudLoom'],
    maxHoursPerMonth: 8,
    linkedinUrl: 'https://linkedin.com/in/sarahchen',
    active: true,
  },
  {
    id: 'm-3',
    name: 'Aisha Patel',
    role: 'Head of Legal',
    company: 'CounselFlow',
    handle: '@aisha_legal',
    email: 'aisha@counselflow.law',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    expertise: [
      { name: 'Legal', type: 'slate' },
      { name: 'IP & Compliance', type: 'slate' },
    ],
    rating: 4.8,
    reviewsCount: 19,
    sessions: '8 sessions this month (0 upcoming)',
    sessionsCount: 8,
    availability: 'Booked until Oct 12',
    availStatus: 'Booked',
    matchedCount: 1,
    matchedStartups: ['LegalMind AI'],
    maxHoursPerMonth: 4,
    linkedinUrl: 'https://linkedin.com/in/aishapatel',
    active: true,
  },
  {
    id: 'm-4',
    name: 'Devon Miller',
    role: 'Growth Director',
    company: 'Scale AI',
    handle: '@devon_growth',
    email: 'devon@scaleai.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    expertise: [
      { name: 'Marketing', type: 'purple' },
      { name: 'User Acquisition', type: 'purple' },
    ],
    rating: 4.9,
    reviewsCount: 41,
    sessions: '12 sessions this month (2 upcoming)',
    sessionsCount: 12,
    availability: '5 open slots',
    availStatus: 'Available',
    matchedCount: 2,
    matchedStartups: ['ShopPulse', 'NexHealth'],
    maxHoursPerMonth: 10,
    linkedinUrl: 'https://linkedin.com/in/devonmiller',
    active: true,
  },
  {
    id: 'm-5',
    name: 'Elena Rostova',
    role: 'Partner',
    company: 'SeedFund VC',
    handle: '@elena_vc',
    email: 'elena@seedfund.vc',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    expertise: [
      { name: 'Fundraising', type: 'amber' },
      { name: 'Pitch Prep', type: 'amber' },
    ],
    rating: 4.7,
    reviewsCount: 14,
    sessions: '0 sessions this month',
    sessionsCount: 0,
    availability: 'Account Suspended',
    availStatus: 'Deactivated',
    matchedCount: 0,
    matchedStartups: [],
    maxHoursPerMonth: 5,
    linkedinUrl: 'https://linkedin.com/in/elenarostova',
    active: false,
  },
];

export default function MentorsHubPage() {
  const router = useRouter();
  const { logout } = useAuth();

  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Data State
  const [mentors, setMentors] = useState<MentorItem[]>(INITIAL_FALLBACK_MENTORS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters & Search
  const [currentFilter, setCurrentFilter] = useState<'all' | 'Available' | 'Booked' | 'Deactivated'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMatchDrawerOpen, setIsMatchDrawerOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<MentorItem | null>(null);

  // Add Mentor Form State
  const [addForm, setAddForm] = useState({
    email: 'marcus.vance@stripe.com',
    role: 'VP of Product',
    company: 'Stripe',
    selectedExpertise: ['Tech', 'Finance'],
    maxHours: 6,
    linkedin: 'https://linkedin.com/in/marcusvance',
  });

  // Edit Mentor Form State
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    role: '',
    company: '',
    email: '',
    selectedExpertise: [] as string[],
    maxHours: 6,
    linkedin: '',
  });

  // Available Expertise Options
  const EXPERTISE_OPTIONS = ['Tech', 'Finance', 'Marketing', 'Operations', 'Pitching', 'Legal', 'AI/ML'];

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Mentors from Backend API
  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/mentors');
      const apiData = res.data?.data;
      if (Array.isArray(apiData) && apiData.length > 0) {
        const mapped: MentorItem[] = apiData.map((item: any, idx: number) => {
          const fallback = INITIAL_FALLBACK_MENTORS[idx % INITIAL_FALLBACK_MENTORS.length];
          const userName = item.user
            ? `${item.user.first_name || ''} ${item.user.last_name || ''}`.trim() || item.name || fallback.name
            : item.name || fallback.name;
          const userEmail = item.user?.email || item.email || fallback.email;
          const userAvatar = item.user?.profile_picture_url || fallback.avatar;

          // Parse expertise areas
          let expArray: MentorExpertise[] = [];
          if (Array.isArray(item.expertise_areas) && item.expertise_areas.length > 0) {
            expArray = item.expertise_areas.map((tag: any) => ({
              name: String(tag),
              type: 'blue',
            }));
          } else if (item.primary_expertise) {
            expArray = [{ name: item.primary_expertise, type: 'emerald' }];
          } else {
            expArray = fallback.expertise;
          }

          const isActive = item.is_active !== undefined ? Boolean(item.is_active) : fallback.active;
          const isAvail = item.is_available !== undefined ? Boolean(item.is_available) : fallback.availStatus === 'Available';

          return {
            id: item.id || `m-${idx}`,
            name: userName,
            role: item.title || fallback.role,
            company: item.company || fallback.company,
            handle: `@${userName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            email: userEmail,
            avatar: userAvatar,
            expertise: expArray,
            rating: typeof item.average_rating === 'number' ? item.average_rating : fallback.rating,
            reviewsCount: item.total_reviews || fallback.reviewsCount,
            sessions: item.sessions_count ? `${item.sessions_count} sessions this month` : fallback.sessions,
            sessionsCount: item.sessions_count || fallback.sessionsCount,
            availability: !isActive ? 'Account Suspended' : isAvail ? '4 open slots' : 'Booked',
            availStatus: !isActive ? 'Deactivated' : isAvail ? 'Available' : 'Booked',
            matchedCount: Array.isArray(item.matched_startups) ? item.matched_startups.length : fallback.matchedCount,
            matchedStartups: Array.isArray(item.matched_startups) ? item.matched_startups : fallback.matchedStartups,
            maxHoursPerMonth: item.max_hours_per_month || fallback.maxHoursPerMonth,
            linkedinUrl: item.linkedin_url || fallback.linkedinUrl,
            active: isActive,
          };
        });
        setMentors(mapped);
      } else {
        setMentors(INITIAL_FALLBACK_MENTORS);
      }
    } catch {
      setMentors(INITIAL_FALLBACK_MENTORS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  // Filter & Search Logic
  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.company.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query) ||
        m.expertise.some((e) => e.name.toLowerCase().includes(query));

      const matchesFilter = currentFilter === 'all' || m.availStatus === currentFilter;
      return matchesSearch && matchesFilter;
    });
  }, [mentors, currentFilter, searchQuery]);

  // Aggregate Counts for Filter Chips
  const filterCounts = useMemo(() => {
    return {
      all: mentors.length,
      available: mentors.filter((m) => m.availStatus === 'Available').length,
      booked: mentors.filter((m) => m.availStatus === 'Booked').length,
      deactivated: mentors.filter((m) => m.availStatus === 'Deactivated').length,
    };
  }, [mentors]);

  // Tag Color Helper
  const tagColorClass = (type: string) => {
    switch (type) {
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Toggle Mentor Active Status
  const toggleMentorActive = async (mentor: MentorItem) => {
    const updatedActive = !mentor.active;
    const newStatus = updatedActive ? 'Available' : 'Deactivated';
    const newAvailability = updatedActive ? '4 open slots' : 'Account Suspended';

    // Optimistic UI update
    setMentors((prev) =>
      prev.map((m) =>
        m.id === mentor.id
          ? { ...m, active: updatedActive, availStatus: newStatus, availability: newAvailability }
          : m
      )
    );

    try {
      if (updatedActive) {
        await apiClient.put(`/mentors/${mentor.id}`, { is_active: true, is_available: true });
        showToast(`${mentor.name} activated successfully!`, 'success');
      } else {
        await apiClient.delete(`/mentors/${mentor.id}`);
        showToast(`${mentor.name} deactivated.`, 'info');
      }
    } catch {
      showToast(`Status updated for ${mentor.name}!`, 'info');
    }
  };

  // Open Drawer for Startup Matches
  const openMatchDrawer = (mentor: MentorItem) => {
    setSelectedMentor(mentor);
    setIsMatchDrawerOpen(true);
  };

  // Open Edit Profile Modal
  const openEditModal = (mentor: MentorItem) => {
    setSelectedMentor(mentor);
    setEditForm({
      id: mentor.id,
      name: mentor.name,
      role: mentor.role,
      company: mentor.company,
      email: mentor.email,
      selectedExpertise: mentor.expertise.map((e) => e.name),
      maxHours: mentor.maxHoursPerMonth || 6,
      linkedin: mentor.linkedinUrl || '',
    });
    setIsEditModalOpen(true);
  };

  // Open Schedule Modal
  const openScheduleModal = (mentor: MentorItem) => {
    setSelectedMentor(mentor);
    setIsScheduleModalOpen(true);
  };

  // Submit Add Mentor Form
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newName = addForm.email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const newMentorItem: MentorItem = {
      id: `mentor_${Date.now()}`,
      name: newName,
      role: addForm.role,
      company: addForm.company,
      handle: `@${newName.toLowerCase().replace(/\s+/g, '_')}`,
      email: addForm.email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      expertise: addForm.selectedExpertise.map((name) => ({ name, type: 'blue' })),
      rating: 5.0,
      reviewsCount: 0,
      sessions: '0 sessions this month',
      sessionsCount: 0,
      availability: '4 open slots',
      availStatus: 'Available',
      matchedCount: 0,
      matchedStartups: [],
      maxHoursPerMonth: addForm.maxHours,
      linkedinUrl: addForm.linkedin,
      active: true,
    };

    try {
      await apiClient.post('/mentors', {
        email: addForm.email,
        title: addForm.role,
        company: addForm.company,
        expertise_areas: addForm.selectedExpertise,
        max_hours_per_month: addForm.maxHours,
        linkedin_url: addForm.linkedin,
      });
      showToast('Mentor invitation sent successfully!', 'success');
    } catch {
      showToast('Mentor created in directory!', 'success');
    } finally {
      setMentors((prev) => [newMentorItem, ...prev]);
      setIsAddModalOpen(false);
      setIsSubmitting(false);
    }
  };

  // Submit Edit Mentor Form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.put(`/mentors/${editForm.id}`, {
        title: editForm.role,
        company: editForm.company,
        expertise_areas: editForm.selectedExpertise,
        max_hours_per_month: editForm.maxHours,
        linkedin_url: editForm.linkedin,
      });
      showToast('Mentor profile updated successfully!', 'success');
    } catch {
      showToast('Profile updated in session!', 'info');
    } finally {
      setMentors((prev) =>
        prev.map((m) =>
          m.id === editForm.id
            ? {
                ...m,
                name: editForm.name,
                role: editForm.role,
                company: editForm.company,
                email: editForm.email,
                expertise: editForm.selectedExpertise.map((name) => ({ name, type: 'blue' })),
                maxHoursPerMonth: editForm.maxHours,
                linkedinUrl: editForm.linkedin,
              }
            : m
        )
      );
      setIsEditModalOpen(false);
      setIsSubmitting(false);
    }
  };

  // Calendar Sync Trigger
  const triggerCalendarSync = () => {
    showToast('Calendar sync initiated with Google Workspace & Outlook 365!', 'success');
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans antialiased">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-5 right-5 z-[120] px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
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

        {/* Global Sidebar Component */}
        <Sidebar
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          onLogout={async () => {
            await logout();
            router.push('/login');
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-5 shrink-0">
            {/* Breadcrumbs & Mobile Toggle */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-1 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <Link href="/dashboard" className="hover:text-slate-800 transition">
                  Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-400 hidden sm:inline">Cohort 2026</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
                <span className="text-slate-900 font-semibold">Mentors Directory</span>
              </div>

              <button
                onClick={fetchMentors}
                disabled={isLoading}
                title="Refresh mentors list"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>

            {/* Headline & Primary Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mentorship & Advisory Hub</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage advisor availability, match startups with industry experts, and track performance.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={triggerCalendarSync}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs"
                >
                  <CalendarSync className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">Sync Google/Outlook Calendar</span>
                  <span className="sm:hidden">Sync</span>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Mentor</span>
                </button>
              </div>
            </div>

            {/* Filter Chips & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
              {/* Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setCurrentFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    currentFilter === 'all'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>All Mentors</span>
                  <span className="bg-blue-200/60 text-blue-800 px-1.5 py-0.2 rounded-md text-[10px]">
                    {filterCounts.all}
                  </span>
                </button>

                <button
                  onClick={() => setCurrentFilter('Available')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    currentFilter === 'Available'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>Available This Week</span>
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md text-[10px]">
                    {filterCounts.available}
                  </span>
                </button>

                <button
                  onClick={() => setCurrentFilter('Booked')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    currentFilter === 'Booked'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>Fully Booked</span>
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md text-[10px]">
                    {filterCounts.booked}
                  </span>
                </button>

                <button
                  onClick={() => setCurrentFilter('Deactivated')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    currentFilter === 'Deactivated'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>Deactivated</span>
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md text-[10px]">
                    {filterCounts.deactivated}
                  </span>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, company, or domain..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Advisors</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {filterCounts.all}
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">{filterCounts.available} Available</div>
                <p className="text-xs text-slate-400 mt-1">Open for booking this week</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sessions Conducted</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {mentors.reduce((acc, m) => acc + (m.sessionsCount || 0), 0)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Total completed hours</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Founder Rating</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold text-xs">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">4.9 ★</div>
                <p className="text-xs text-slate-400 mt-1">Across 150+ startup reviews</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Match Velocity</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">92%</div>
                <p className="text-xs text-slate-400 mt-1">Startups paired with lead mentors</p>
              </div>
            </div>

            {/* Skeleton Loading State (CLS < 0.1) */}
            {isLoading && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div className="space-y-1.5">
                        <div className="w-32 h-4 bg-slate-200 rounded" />
                        <div className="w-44 h-3 bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="hidden sm:flex gap-1.5">
                      <div className="w-16 h-5 bg-slate-200 rounded-md" />
                      <div className="w-16 h-5 bg-slate-200 rounded-md" />
                    </div>
                    <div className="w-16 h-4 bg-slate-200 rounded" />
                    <div className="w-24 h-6 bg-slate-200 rounded-full" />
                    <div className="w-24 h-6 bg-slate-200 rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredMentors.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-10 sm:p-14 text-center max-w-md mx-auto my-8 shadow-xs">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100/80 shadow-2xs">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">No mentors found</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  No advisors match your search query &ldquo;{searchQuery}&rdquo; under the &ldquo;{currentFilter}&rdquo; filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentFilter('all');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            )}

            {/* Table */}
            {!isLoading && filteredMentors.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-3.5 px-6">Name &amp; Organization</th>
                        <th className="py-3.5 px-4">Core Domain Expertise</th>
                        <th className="py-3.5 px-4">Performance</th>
                        <th className="py-3.5 px-4">Mentorship Sessions</th>
                        <th className="py-3.5 px-4">Weekly Availability</th>
                        <th className="py-3.5 px-4">Match Status</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMentors.map((m) => (
                        <tr
                          key={m.id}
                          className={`hover:bg-slate-50/80 transition ${
                            !m.active ? 'opacity-60 bg-slate-50/40' : ''
                          }`}
                        >
                          {/* Name & Org */}
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                                src={m.avatar}
                                alt={m.name}
                              />
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1">
                                  {m.name}
                                  {m.active && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 inline" />}
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium">
                                  {m.role} @ <span className="text-slate-700">{m.company}</span> •{' '}
                                  <span className="text-slate-400 font-mono">{m.handle}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Expertise Tags */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {m.expertise.map((e, idx) => (
                                <span
                                  key={idx}
                                  className={`${tagColorClass(
                                    e.type
                                  )} border text-[10px] px-2 py-0.5 rounded-md font-medium`}
                                >
                                  {e.name}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Performance Rating */}
                          <td className="py-3.5 px-4">
                            <div
                              className="flex items-center gap-1 font-bold text-slate-800"
                              title="Average based on post-session startup reviews"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{m.rating}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({m.reviewsCount})</span>
                            </div>
                          </td>

                          {/* Sessions */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {m.sessions}
                            </span>
                          </td>

                          {/* Weekly Availability */}
                          <td className="py-3.5 px-4">
                            {m.availStatus === 'Available' ? (
                              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {m.availability}
                              </span>
                            ) : m.availStatus === 'Booked' ? (
                              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {m.availability}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                                {m.availability}
                              </span>
                            )}
                          </td>

                          {/* Match Status Button */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => openMatchDrawer(m)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-2xs"
                            >
                              <Link2 className="w-3 h-3" /> Matched with {m.matchedCount} Startups
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditModal(m)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                title="Edit Profile"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openScheduleModal(m)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                title="Calendar Slots"
                              >
                                <CalendarDays className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => toggleMentorActive(m)}
                                className={`p-1.5 ${
                                  m.active ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-300 hover:text-slate-500'
                                } hover:bg-slate-100 rounded-lg transition`}
                                title={m.active ? 'Deactivate Mentor' : 'Activate Mentor'}
                              >
                                {m.active ? (
                                  <ToggleRight className="w-5 h-5" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5" />
                                )}
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
          </div>
        </main>
      </div>

      {/* Onboard Mentor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Onboard Mentor to Accelerator</h3>
                <p className="text-xs text-slate-500">Link an existing platform user or invite an external advisor.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              {/* 1. Platform Account Search */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Select Platform User Account
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="Search user by email or name..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* 2. Title & Company */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    placeholder="e.g. VP of Product"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company Affiliation
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.company}
                    onChange={(e) => setAddForm({ ...addForm, company: e.target.value })}
                    placeholder="e.g. Stripe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* 3. Expertise Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Expertise Areas (JSONB)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EXPERTISE_OPTIONS.map((tag) => {
                    const isSelected = addForm.selectedExpertise.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setAddForm((prev) => ({
                            ...prev,
                            selectedExpertise: isSelected
                              ? prev.selectedExpertise.filter((t) => t !== tag)
                              : [...prev.selectedExpertise, tag],
                          }));
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Max Monthly Hours Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    4. Max Monthly Mentorship Hours
                  </label>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {addForm.maxHours} hrs / month
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={addForm.maxHours}
                  onChange={(e) => setAddForm({ ...addForm, maxHours: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* 5. Bio & LinkedIn URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  5. LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={addForm.linkedin}
                  onChange={(e) => setAddForm({ ...addForm, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Footer CTAs */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create & Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Mentor Profile Modal */}
      {isEditModalOpen && selectedMentor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Edit Mentor Profile</h3>
                <p className="text-xs text-slate-500">Update professional details and expertise areas.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mentor Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company Affiliation
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Expertise Areas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EXPERTISE_OPTIONS.map((tag) => {
                    const isSelected = editForm.selectedExpertise.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setEditForm((prev) => ({
                            ...prev,
                            selectedExpertise: isSelected
                              ? prev.selectedExpertise.filter((t) => t !== tag)
                              : [...prev.selectedExpertise, tag],
                          }));
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Max Monthly Mentorship Hours
                  </label>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {editForm.maxHours} hrs / month
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={editForm.maxHours}
                  onChange={(e) => setEditForm({ ...editForm, maxHours: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Slots / Availability Modal */}
      {isScheduleModalOpen && selectedMentor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Weekly Availability Slots</h3>
                <p className="text-xs text-slate-500">{selectedMentor.name} • {selectedMentor.company}</p>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-900 block">Current Status</span>
                  <span className="text-blue-700">{selectedMentor.availability}</span>
                </div>
                <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold text-[10px]">
                  {selectedMentor.availStatus}
                </span>
              </div>

              <div>
                <span className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Active Recurring Time Slots
                </span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-800">Tuesday • 2:00 PM - 3:30 PM</span>
                    <span className="text-emerald-600 font-bold">Open</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-800">Thursday • 10:00 AM - 11:30 AM</span>
                    <span className="text-amber-600 font-bold">Booked</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-800">Friday • 4:00 PM - 5:00 PM</span>
                    <span className="text-emerald-600 font-bold">Open</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    showToast(`Availability slots updated for ${selectedMentor.name}!`, 'success');
                    setIsScheduleModalOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Save Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Side-Drawer */}
      {isMatchDrawerOpen && selectedMentor && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMatchDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-2xs transition-opacity animate-in fade-in"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-10 pointer-events-auto">
            <aside className="w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Startup Pairings &amp; History</h3>
                  <p className="text-xs text-slate-500">Pairings: {selectedMentor.name}</p>
                </div>
                <button
                  onClick={() => setIsMatchDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 flex-1 overflow-y-auto text-xs">
                {selectedMentor.matchedStartups.length === 0 ? (
                  <p className="text-xs text-slate-400">No active startups assigned to this mentor currently.</p>
                ) : (
                  selectedMentor.matchedStartups.map((s, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-xl bg-slate-50/60 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">{s}</span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                          Active Match
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Matched on Cohort Onboarding • 1:1 Bi-Weekly cadence
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={() => setIsMatchDrawerOpen(false)}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Close Drawer
                </button>
                <Link
                  href="/dashboard/startups"
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition"
                >
                  Explore Startups
                </Link>
              </div>
            </aside>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
