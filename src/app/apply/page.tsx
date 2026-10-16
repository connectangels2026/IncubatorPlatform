'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  Building2,
  TrendingUp,
  Clock,
  DollarSign,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';
import Logo from '@/frontend/components/ui/Logo';

interface Incubator {
  id: string;
  name: string;
  logo: string;
  category: string;
  grant: string;
  equity: string;
  duration: string;
  location: string;
  daysLeft: number;
  shortDescription: string;
  verified: boolean;
}

const MOCK_INCUBATORS: Incubator[] = [
  {
    id: 'inc-1',
    name: 'Nexus AI Foundry',
    logo: 'NAI',
    category: 'AI & DeepTech',
    grant: '$100k - $250k',
    equity: '5% - 7%',
    duration: '12 Weeks',
    location: 'San Francisco, CA & Remote',
    daysLeft: 4,
    shortDescription: 'Accelerating frontier artificial intelligence and agentic workflows.',
    verified: true,
  },
  {
    id: 'inc-2',
    name: 'FinPulse Labs',
    logo: 'FPL',
    category: 'FinTech',
    grant: '$150k - $300k',
    equity: '6%',
    duration: '14 Weeks',
    location: 'New York, NY',
    daysLeft: 5,
    shortDescription: 'Empowering next-gen fintech rails and cross-border payments.',
    verified: true,
  },
  {
    id: 'inc-3',
    name: 'TerraVentures Climate Studio',
    logo: 'TVC',
    category: 'Climate',
    grant: '$50k - $100k',
    equity: '3% - 5%',
    duration: '10 Weeks',
    location: 'Global / Remote',
    daysLeft: 21,
    shortDescription: 'Backing bold innovators in carbon capture and renewable energy.',
    verified: true,
  },
  {
    id: 'inc-4',
    name: 'BioPulse Health Lab',
    logo: 'BPH',
    category: 'HealthTech',
    grant: '$100k - $200k',
    equity: '7%',
    duration: '16 Weeks',
    location: 'Boston, MA',
    daysLeft: 6,
    shortDescription: 'Pioneering digital therapeutics and AI diagnostics.',
    verified: true,
  },
];

export default function ApplyPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [incubators, setIncubators] = useState<Incubator[]>(MOCK_INCUBATORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const categories = ['All', 'AI & DeepTech', 'FinTech', 'HealthTech', 'Climate', 'SaaS'];

  const filteredIncubators = incubators.filter((inc) => {
    const matchesSearch =
      inc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || inc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleApply = async (incubatorId: string) => {
    if (appliedIds.includes(incubatorId)) {
      setToastMessage('You have already applied to this incubator');
    } else {
      setAppliedIds([...appliedIds, incubatorId]);
      setToastMessage('Application submitted! We will keep you updated.');
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBookmark = (incubatorId: string) => {
    if (bookmarkedIds.includes(incubatorId)) {
      setBookmarkedIds(bookmarkedIds.filter((id) => id !== incubatorId));
      setToastMessage('Removed from bookmarks');
    } else {
      setBookmarkedIds([...bookmarkedIds, incubatorId]);
      setToastMessage('Added to bookmarks');
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const getLogoBg = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-600 to-indigo-900',
      'bg-gradient-to-br from-cyan-500 to-blue-700',
      'bg-gradient-to-br from-emerald-500 to-teal-800',
      'bg-gradient-to-br from-rose-500 to-red-800',
      'bg-gradient-to-br from-purple-600 to-indigo-800',
    ];
    return colors[index % colors.length];
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -left-24 w-[420px] h-[420px] rounded-full bg-cyan-400/35 blur-[120px]" />
        <div className="absolute top-10 -right-24 w-[440px] h-[440px] rounded-full bg-blue-500/25 blur-[130px]" />
        <div className="absolute -bottom-24 -left-20 w-[420px] h-[420px] rounded-full bg-blue-400/30 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-[460px] h-[460px] rounded-full bg-cyan-300/35 blur-[130px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-slate-200/50 bg-white/50 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Logo size="md" href="/" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Apply to Incubators</h1>
                <p className="text-xs text-slate-500 mt-0.5">Find and apply to accelerators that match your startup</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by incubator name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-sm text-slate-600">
            Showing {filteredIncubators.length} of {incubators.length} incubators
          </p>
        </div>

        {/* Incubator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncubators.map((inc, idx) => (
            <div
              key={inc.id}
              className="bg-white rounded-2xl border border-slate-200/50 hover:border-slate-300 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
            >
              {/* Logo Section */}
              <div className={`${getLogoBg(idx)} p-6 text-white flex items-end justify-between h-32 relative overflow-hidden`}>
                {/* Background effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition bg-gradient-to-br from-white to-transparent" />

                <div className="relative z-10">
                  <div className="text-3xl font-bold opacity-90">{inc.logo}</div>
                  {inc.verified && (
                    <div className="flex items-center gap-1 mt-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="relative z-10 flex gap-2">
                  <button
                    onClick={() => handleBookmark(inc.id)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                      bookmarkedIds.includes(inc.id)
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    title="Bookmark"
                  >
                    <Heart className={`w-4 h-4 ${bookmarkedIds.includes(inc.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4">
                {/* Name and Category */}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{inc.name}</h3>
                  <p className="text-xs font-semibold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
                    {inc.category}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 line-clamp-2">{inc.shortDescription}</p>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-200/50">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Grant</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{inc.grant}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Equity</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{inc.equity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Duration</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{inc.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Deadline</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{inc.daysLeft}d left</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">{inc.location}</p>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => handleApply(inc.id)}
                  disabled={appliedIds.includes(inc.id)}
                  className={`w-full h-10 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition ${
                    appliedIds.includes(inc.id)
                      ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {appliedIds.includes(inc.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Applied
                    </>
                  ) : (
                    <>
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredIncubators.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No incubators found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
