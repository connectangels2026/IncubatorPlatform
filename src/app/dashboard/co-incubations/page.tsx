'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Plus,
  Search,
  Filter,
  FileCheck,
  CheckCircle2,
  Clock,
  Mail,
  User,
  X,
  Loader2,
  Layers,
} from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';

interface CoIncubation {
  id: string;
  partner_organization_name: string;
  lead_contact_name: string;
  lead_contact_email: string;
  status: 'active' | 'pending' | 'completed' | 'terminated';
  mou_signed: boolean;
  mou_signed_at?: string;
  startups_count?: number;
}

const defaultCoIncubations: CoIncubation[] = [
  {
    id: 'coinc_1',
    partner_organization_name: 'IIT Bombay - SINE Bio-Incubator',
    lead_contact_name: 'Dr. Anand Rao',
    lead_contact_email: 'anand.rao@sineiitb.org',
    status: 'active',
    mou_signed: true,
    startups_count: 3,
  },
  {
    id: 'coinc_2',
    partner_organization_name: 'NASSCOM 10,000 Startups Hub',
    lead_contact_name: 'Rohit Shenoy',
    lead_contact_email: 'rohit@nasscom.in',
    status: 'active',
    mou_signed: true,
    startups_count: 5,
  },
  {
    id: 'coinc_3',
    partner_organization_name: 'T-Hub Innovation Center',
    lead_contact_name: 'Sneha Reddy',
    lead_contact_email: 'sneha.r@t-hub.co',
    status: 'pending',
    mou_signed: false,
    startups_count: 1,
  },
];

export default function CoIncubationsPage() {
  const [coincubations, setCoincubations] = useState<CoIncubation[]>(defaultCoIncubations);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form inputs
  const [partnerName, setPartnerName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    async function fetchCoIncubations() {
      try {
        const res = await fetch('/api/v1/co-incubations', {
          headers: {
            Authorization: 'Bearer mock-admin',
            'x-org-id': '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setCoincubations(json.data);
          }
        }
      } catch (err) {
        // Fallback to sample data
      }
    }
    fetchCoIncubations();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) return;
    setLoading(true);

    const payload = {
      partner_organization_name: partnerName,
      lead_contact_name: contactName,
      lead_contact_email: contactEmail,
      status: 'pending',
    };

    try {
      const res = await fetch('/api/v1/co-incubations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-admin',
          'x-org-id': '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        setCoincubations((prev) => [json.data, ...prev]);
      } else {
        const newLocal: CoIncubation = {
          id: 'coinc_' + Date.now(),
          partner_organization_name: partnerName,
          lead_contact_name: contactName,
          lead_contact_email: contactEmail,
          status: 'pending',
          mou_signed: false,
          startups_count: 0,
        };
        setCoincubations((prev) => [newLocal, ...prev]);
      }
    } catch (err) {
      const newLocal: CoIncubation = {
        id: 'coinc_' + Date.now(),
        partner_organization_name: partnerName,
        lead_contact_name: contactName,
        lead_contact_email: contactEmail,
        status: 'pending',
        mou_signed: false,
        startups_count: 0,
      };
      setCoincubations((prev) => [newLocal, ...prev]);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setPartnerName('');
      setContactName('');
      setContactEmail('');
    }
  };

  const filtered = coincubations.filter((c) => {
    const matchesSearch =
      c.partner_organization_name.toLowerCase().includes(search.toLowerCase()) ||
      c.lead_contact_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Incubator Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              Co-Incubation Arrangements
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Cross-incubator programs, shared laboratory facilities, and joint cohort incubation tracks.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Co-Incubation
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search partner incubator or lead contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {['all', 'active', 'pending', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      item.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : item.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{item.partner_organization_name}</h3>
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lead: <strong className="text-slate-800">{item.lead_contact_name}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{item.lead_contact_email}</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <FileCheck
                    className={`w-4 h-4 ${item.mou_signed ? 'text-emerald-600' : 'text-slate-400'}`}
                  />
                  MOU: {item.mou_signed ? <strong className="text-emerald-700">Signed</strong> : 'Draft'}
                </span>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {item.startups_count ?? 2} Startups
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No co-incubation partnerships found</h3>
            <p className="text-xs text-slate-500 mt-1">Create your first arrangement with a partner incubator.</p>
          </div>
        )}

        {/* Modal: Create Co-Incubation */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-slate-900 mb-1">New Co-Incubation Agreement</h2>
              <p className="text-xs text-slate-500 mb-5">
                Establish a shared resources and joint incubation partnership.
              </p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Partner Incubator Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SINE IIT Bombay"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Anand Rao"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Contact Email</label>
                  <input
                    type="email"
                    placeholder="lead@partner-incubator.org"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs font-semibold px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Agreement'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
