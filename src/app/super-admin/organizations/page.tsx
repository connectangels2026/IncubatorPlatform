'use client';

import React, { useState } from 'react';
import SuperAdminSidebar from '@/frontend/components/super-admin/Sidebar';
import {
  Search,
  Bell,
  Plus,
  Download,
  Filter,
  MoreHorizontal,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Sliders,
  CreditCard,
  Ban,
  Copy,
  Send,
  FileText,
  MessageSquare,
  Check,
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  logo: string;
  website: string;
  adminName: string;
  adminEmail: string;
  phone: string;
  address: string;
  tier: 'Free' | 'Pro' | 'Enterprise';
  cost: number;
  billingEmail: string;
  trialDaysLeft?: number;
  usersCount: number;
  startupsCount: number;
  maxStartups: number;
  paymentStatus: 'Paid' | 'Overdue' | 'Suspended' | 'Pending';
  lastPayment: string;
  nextBilling: string;
  status: 'Active' | 'Blocked' | 'Suspended';
  features: string[];
  invoices: { id: string; date: string; amount: number; status: string }[];
  notes: { text: string; author: string; time: string }[];
}

const initialOrgs: Organization[] = [
  {
    id: 'org-1',
    name: 'TechStars Hub',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    website: 'https://techstars.io',
    adminName: 'Admin Admin',
    adminEmail: 'sarah@techstars.io',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Austin, TX',
    tier: 'Enterprise',
    cost: 1299,
    billingEmail: 'billing@techstars.io',
    usersCount: 36,
    startupsCount: 5,
    maxStartups: 100,
    paymentStatus: 'Paid',
    lastPayment: 'Jan 11, 2026',
    nextBilling: 'Feb 1, 2026',
    status: 'Active',
    features: ['1-on-1 Mentorship CRM', 'Custom Subdomain', 'Demo Day Portal', 'Stripe Auto-Billing', 'Export Reports'],
    invoices: [
      { id: '#INV-2026-09', date: 'Jan 11, 2026', amount: 1299, status: 'Paid' },
      { id: '#INV-2025-12', date: 'Dec 11, 2025', amount: 1299, status: 'Paid' },
      { id: '#INV-2025-11', date: 'Nov 11, 2025', amount: 1299, status: 'Paid' },
    ],
    notes: [
      { text: 'Requested 10 extra startup seats next month.', author: 'Root Admin', time: '2 days ago' },
    ],
  },
  {
    id: 'org-2',
    name: 'Nexlify Labs',
    logo: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=100&auto=format&fit=crop&q=80',
    website: 'https://nexlify.co',
    adminName: 'Nexlify Labs',
    adminEmail: 'david@nexlify.co',
    phone: '+1 (555) 890-1234',
    address: '100 Silicon Ave, San Francisco, CA',
    tier: 'Pro',
    cost: 499,
    billingEmail: 'accounts@nexlify.co',
    usersCount: 24,
    startupsCount: 6,
    maxStartups: 50,
    paymentStatus: 'Overdue',
    lastPayment: 'Jan 11, 2026',
    nextBilling: 'Feb 1, 2026',
    status: 'Active',
    features: ['Mentorship CRM', 'Demo Day Portal', 'Basic Reports'],
    invoices: [
      { id: '#INV-2026-08', date: 'Jan 11, 2026', amount: 499, status: 'Overdue' },
      { id: '#INV-2025-12', date: 'Dec 11, 2025', amount: 499, status: 'Paid' },
    ],
    notes: [
      { text: 'Sent reminder email regarding invoice #INV-2026-08.', author: 'Root Admin', time: 'Yesterday' },
    ],
  },
  {
    id: 'org-3',
    name: 'VentureScale',
    logo: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&auto=format&fit=crop&q=80',
    website: 'https://venturescale.com',
    adminName: 'VentureScale',
    adminEmail: 'elena@venturescale.com',
    phone: '+1 (555) 456-7890',
    address: '50 Wall St, New York, NY',
    tier: 'Free',
    cost: 0,
    billingEmail: 'elena@venturescale.com',
    trialDaysLeft: 0,
    usersCount: 18,
    startupsCount: 0,
    maxStartups: 10,
    paymentStatus: 'Suspended',
    lastPayment: 'Nov 5, 2025',
    nextBilling: 'Jan 1, 2026',
    status: 'Suspended',
    features: ['Basic Analytics', 'Up to 10 Startups'],
    invoices: [
      { id: '#INV-2025-10', date: 'Nov 5, 2025', amount: 0, status: 'Paid' },
    ],
    notes: [
      { text: 'Account suspended for policy verification.', author: 'Security Team', time: '1 week ago' },
    ],
  },
  {
    id: 'org-4',
    name: 'Growth Accelerate',
    logo: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=100&auto=format&fit=crop&q=80',
    website: 'https://growthaccel.io',
    adminName: 'Growth Plann',
    adminEmail: 'team@growthaccel.io',
    phone: '+1 (555) 345-6789',
    address: '320 Pine St, Seattle, WA',
    tier: 'Pro',
    cost: 499,
    billingEmail: 'finance@growthaccel.io',
    trialDaysLeft: 14,
    usersCount: 23,
    startupsCount: 5,
    maxStartups: 50,
    paymentStatus: 'Paid',
    lastPayment: 'Nov 3, 2025',
    nextBilling: 'Feb 1, 2026',
    status: 'Active',
    features: ['Mentorship CRM', 'Demo Day Portal', 'Custom Branding'],
    invoices: [
      { id: '#INV-2025-11', date: 'Nov 3, 2025', amount: 499, status: 'Paid' },
    ],
    notes: [],
  },
  {
    id: 'org-5',
    name: 'Idea Catalyst',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=80',
    website: 'https://ideacatalyst.org',
    adminName: 'Idea Admin',
    adminEmail: 'director@ideacatalyst.org',
    phone: '+1 (555) 987-6543',
    address: '220 Innovation Way, Boston, MA',
    tier: 'Enterprise',
    cost: 1299,
    billingEmail: 'billing@ideacatalyst.org',
    usersCount: 39,
    startupsCount: 5,
    maxStartups: 150,
    paymentStatus: 'Paid',
    lastPayment: 'Nov 5, 2025',
    nextBilling: 'Jan 1, 2026',
    status: 'Active',
    features: ['Unlimited Startups', 'Custom Subdomain', 'Dedicated Account Manager'],
    invoices: [
      { id: '#INV-2025-11', date: 'Nov 5, 2025', amount: 1299, status: 'Paid' },
    ],
    notes: [],
  },
];

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>(initialOrgs);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [newNoteText, setNewNoteText] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [showBlockInput, setShowBlockInput] = useState(false);

  // Filtered organizations
  const filteredOrgs = orgs.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.adminEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'All' || org.tier === tierFilter;
    const matchesStatus = statusFilter === 'All' || org.status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || org.paymentStatus === paymentFilter;
    return matchesSearch && matchesTier && matchesStatus && matchesPayment;
  });

  const handleAddNote = () => {
    if (!newNoteText.trim() || !selectedOrg) return;
    const updated = {
      ...selectedOrg,
      notes: [
        { text: newNoteText, author: 'Root Admin', time: 'Just now' },
        ...selectedOrg.notes,
      ],
    };
    setSelectedOrg(updated);
    setOrgs(orgs.map((o) => (o.id === updated.id ? updated : o)));
    setNewNoteText('');
  };

  const handleToggleBlock = () => {
    if (!selectedOrg) return;
    const newStatus = selectedOrg.status === 'Blocked' ? 'Active' : 'Blocked';
    const updated = { ...selectedOrg, status: newStatus as Organization['status'] };
    setSelectedOrg(updated);
    setOrgs(orgs.map((o) => (o.id === updated.id ? updated : o)));
    setShowBlockInput(false);
    setBlockReason('');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* Left Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar / Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-900">Organizations Directory</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-slate-200 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <button className="relative p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition text-slate-600">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                1
              </span>
            </button>

            <button
              onClick={() => alert('New organization modal')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Organization</span>
            </button>
          </div>
        </header>

        {/* Inner Content Area */}
        <main className="p-6 sm:p-8 space-y-5 flex-1">
          {/* Section Tab Header */}
          <div className="border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button className="pb-3 text-sm font-bold text-blue-600 border-b-2 border-blue-600 -mb-[1px]">
                Organizations Management
              </button>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by org name, admin email..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              {/* Tier Filter */}
              <div className="relative">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="All">Tier: All (Free/Pro/Enterprise)</option>
                  <option value="Free">Tier: Free</option>
                  <option value="Pro">Tier: Pro</option>
                  <option value="Enterprise">Tier: Enterprise</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="All">Status: All</option>
                  <option value="Active">Status: Active</option>
                  <option value="Suspended">Status: Suspended</option>
                  <option value="Blocked">Status: Blocked</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Payment Status Filter */}
              <div className="relative">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="All">Payment: All</option>
                  <option value="Paid">Payment: Paid</option>
                  <option value="Overdue">Payment: Overdue</option>
                  <option value="Suspended">Payment: Suspended</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <div className="relative">
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
                  <span>Sort: Recent</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <button
                onClick={() => alert('Exporting organizations to CSV...')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Organizations Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4 w-10">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </th>
                    <th className="py-4 px-3">Organization Name</th>
                    <th className="py-4 px-3">Admin Name</th>
                    <th className="py-4 px-3">Subscription Tier</th>
                    <th className="py-4 px-3 text-center">Users</th>
                    <th className="py-4 px-3 text-center">Startups</th>
                    <th className="py-4 px-3">Payment Status</th>
                    <th className="py-4 px-3">Last Payment</th>
                    <th className="py-4 px-3">Next Billing</th>
                    <th className="py-4 px-3">Status</th>
                    <th className="py-4 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredOrgs.map((org, index) => {
                    const isSelected = selectedOrg?.id === org.id;

                    return (
                      <tr
                        key={org.id}
                        onClick={() => setSelectedOrg(org)}
                        className={`hover:bg-cyan-50/40 transition cursor-pointer group ${
                          isSelected ? 'bg-cyan-50/60' : index === 0 ? 'bg-cyan-50/20' : ''
                        }`}
                      >
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-slate-300" />
                        </td>
                        <td className="py-4 px-3">
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {org.name}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-slate-600">{org.adminName}</td>
                        <td className="py-4 px-3">
                          <span className="font-semibold text-slate-800">
                            {org.tier} Tier
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center font-bold text-slate-800">{org.usersCount}</td>
                        <td className="py-4 px-3 text-center font-bold text-slate-800">{org.startupsCount}</td>
                        <td className="py-4 px-3">
                          {org.paymentStatus === 'Paid' && (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                              Paid
                            </span>
                          )}
                          {org.paymentStatus === 'Overdue' && (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-xs">
                              <AlertTriangle className="w-3.5 h-3.5 fill-amber-500 text-white" />
                              Overdue
                            </span>
                          )}
                          {org.paymentStatus === 'Suspended' && (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-xs">
                              <XCircle className="w-3.5 h-3.5 fill-rose-500 text-white" />
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-slate-600">{org.lastPayment}</td>
                        <td className="py-4 px-3 text-slate-600">{org.nextBilling}</td>
                        <td className="py-4 px-3">
                          {org.status === 'Active' && (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                              Active
                            </span>
                          )}
                          {org.status === 'Suspended' && (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-xs">
                              <XCircle className="w-3.5 h-3.5 fill-rose-500 text-white" />
                              Suspended
                            </span>
                          )}
                          {org.status === 'Blocked' && (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-xs">
                              <XCircle className="w-3.5 h-3.5 fill-rose-500 text-white" />
                              Blocked
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedOrg(org)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination Controls */}
            <div className="p-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <span className="text-slate-500">
                Showing 1-{filteredOrgs.length} of 124 organizations
              </span>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <span>Rows</span>
                  <div className="relative">
                    <select className="appearance-none pl-2 pr-6 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-xs focus:outline-none">
                      <option>25 per page</option>
                      <option>50 per page</option>
                      <option>100 per page</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="px-3 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                    Previous
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-300 text-blue-600 font-bold text-xs">
                    1
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs">
                    2
                  </button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs">
                    3
                  </button>
                  <button className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Organization Details Right Slide-over Drawer matching image */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-[760px] h-full shadow-2xl border-l border-slate-200/90 flex flex-col justify-between overflow-y-auto p-7 sm:p-8 space-y-5 animate-in slide-in-from-right duration-200">
            {/* Top Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrg(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Header: Logo, Name, Status, Website */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0f172a] flex items-center justify-center text-cyan-400 p-2 shrink-0 shadow-md">
                <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
                  <rect x="5" y="5" width="14" height="14" rx="4" stroke="#2563eb" strokeWidth="3" />
                  <rect x="13" y="13" width="14" height="14" rx="4" stroke="#06b6d4" strokeWidth="3" />
                </svg>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {selectedOrg.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    ● Active Tenant • Health 99%
                  </span>
                </div>

                <a
                  href={selectedOrg.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <span>{selectedOrg.website}</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </div>
            </div>

            {/* 2-Column Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-700 pt-1">
              <div className="space-y-1.5">
                <p>Admin Name: <span className="font-semibold text-slate-900">{selectedOrg.adminName}</span></p>
                <div className="flex items-center gap-1.5">
                  <span>Email:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedOrg.adminEmail);
                      alert('Copied email: ' + selectedOrg.adminEmail);
                    }}
                    className="font-semibold text-slate-900 hover:text-cyan-600 flex items-center gap-1 group"
                    title="Click to copy email"
                  >
                    <span>{selectedOrg.adminEmail}</span>
                    <Copy className="w-3 h-3 text-slate-400 group-hover:text-cyan-600" />
                  </button>
                </div>
                <p>Contact Person: <span className="font-semibold text-slate-900">Alex Vance</span></p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span>Phone:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedOrg.phone);
                      alert('Copied phone: ' + selectedOrg.phone);
                    }}
                    className="font-semibold text-slate-900 hover:text-cyan-600 flex items-center gap-1 group"
                    title="Click to copy phone"
                  >
                    <span>{selectedOrg.phone}</span>
                    <Copy className="w-3 h-3 text-slate-400 group-hover:text-cyan-600" />
                  </button>
                </div>
                <p>Address: <span className="font-semibold text-slate-900">{selectedOrg.address}</span></p>
              </div>
            </div>

            {/* Action Buttons Toolbar (2 Rows) */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => alert(`Upgrading ${selectedOrg.name} to Pro`)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs shadow-xs transition"
                >
                  Upgrade to Pro / Change Tier
                </button>

                <button
                  onClick={() => alert(`Payment reminder email sent to ${selectedOrg.billingEmail}`)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Send Payment Reminder</span>
                </button>

                <button
                  onClick={() => alert('View invoices modal')}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Invoices</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => alert('View activity log')}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <span>↺</span>
                  <span>View Activity Log</span>
                </button>

                <button
                  onClick={() => alert('Trial extended by 14 days')}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                >
                  Extend Trial (+14 Days)
                </button>

                <button
                  onClick={handleToggleBlock}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 text-rose-600 font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{selectedOrg.status === 'Blocked' ? 'Unblock Organization' : 'Block Organization'}</span>
                </button>
              </div>
            </div>

            {/* Current Subscription Plan Card */}
            <div className="rounded-2xl border border-blue-200/90 bg-slate-50/60 p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Current Subscription Plan</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                  Tier: Incubator Pro Tier
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                <p>Monthly Cost: <span className="font-bold text-slate-900">${selectedOrg.cost}.00/mo</span></p>
                <p>Billing Email: <span className="font-bold text-slate-900">{selectedOrg.billingEmail}</span></p>
                <p>Trial Remaining: <span className="font-bold text-slate-900">12 Days Left</span></p>
              </div>

              {/* Quota Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>Startups Usage: 64 of 100 Startups (64%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    style={{ width: '64%' }}
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                  />
                </div>
              </div>

              {/* 6 Features Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {[
                  '1-on-1 Mentorship CRM',
                  'Custom Subdomain',
                  'Demo Day Investor Portal',
                  'Automated Stripe Billing',
                  'Data Export & Analytics',
                  'Priority Support',
                ].map((feat) => (
                  <span
                    key={feat}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/90 text-slate-700 text-[11px] font-medium flex items-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-3 h-3 text-cyan-600 stroke-[3]" />
                    <span className="truncate">{feat}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Invoices Table (Last 5 Billing Cycles) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent Invoices (Last 5 Billing Cycles)</h3>
                <button
                  onClick={() => alert('View all invoices')}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>View All Invoices</span>
                  <span>→</span>
                </button>
              </div>

              <div className="border border-slate-200/90 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {[
                      { id: '#INV-2026-09', date: 'Sep 12, 2026', amount: '$499.00' },
                      { id: '#INV-2026-08', date: 'Aug 12, 2026', amount: '$499.00' },
                      { id: '#INV-2026-07', date: 'Jul 12, 2026', amount: '$499.00' },
                      { id: '#INV-2026-06', date: 'Jun 12, 2026', amount: '$499.00' },
                      { id: '#INV-2026-05', date: 'May 12, 2026', amount: '$499.00' },
                    ].map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{row.id}</td>
                        <td className="py-2.5 px-4 text-slate-600">{row.date}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{row.amount}</td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            Paid
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => alert(`Downloading ${row.id}`)}
                            className="text-slate-600 hover:text-blue-600 font-semibold inline-flex items-center gap-1"
                          >
                            <span>⤓</span>
                            <span>[Download PDF]</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Internal Admin Notes Section */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">Internal Admin Notes</h3>
                <span className="text-slate-400 text-xs">🔒 (Confidential)</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add private internal note about this organization..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shrink-0"
                >
                  Add Note
                </button>
              </div>

              <p className="text-xs text-slate-700 pt-1">
                <span className="font-semibold text-slate-900">Note: </span>
                Spoke with founder Alex on Sep 10: plans to add 15 new startups next quarter.
                <span className="text-slate-400 ml-1.5">— by Root Admin • 2 days ago</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
