'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Plus,
  Search,
  Filter,
  ExternalLink,
  FileCheck,
  Building,
  Mail,
  Phone,
  Briefcase,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import { Badge } from '@/frontend/components/ui/Badge';

interface Collaborator {
  id: string;
  name: string;
  type: 'Investor' | 'Partner' | 'Corporate' | 'Academic';
  contact_name: string;
  email: string;
  phone?: string;
  mou_signed: boolean;
  matched_startups?: string[];
  created_at?: string;
}

const defaultCollaborators: Collaborator[] = [
  {
    id: 'collab_1',
    name: 'Sequoia Capital India',
    type: 'Investor',
    contact_name: 'Rajesh Nair',
    email: 'rajesh@sequoia.com',
    phone: '+91-98201-44552',
    mou_signed: true,
    matched_startups: ['NeuroHealth AI', 'FinTech Spark'],
  },
  {
    id: 'collab_2',
    name: 'Amazon Web Services (AWS)',
    type: 'Corporate',
    contact_name: 'Priya Sharma',
    email: 'priya.s@amazon.com',
    phone: '+91-99882-11223',
    mou_signed: true,
    matched_startups: ['CloudScale DevOps', 'LogiTrack'],
  },
  {
    id: 'collab_3',
    name: 'IIT Bombay - SINE',
    type: 'Academic',
    contact_name: 'Dr. Anand Rao',
    email: 'anand.rao@sineiitb.org',
    mou_signed: false,
    matched_startups: ['BioGenetics Lab'],
  },
  {
    id: 'collab_4',
    name: 'Blume Ventures',
    type: 'Investor',
    contact_name: 'Arun Mehra',
    email: 'arun@blume.vc',
    phone: '+91-98765-43210',
    mou_signed: true,
    matched_startups: ['SaaSify AI'],
  },
];

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(defaultCollaborators);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'Investor' | 'Partner' | 'Corporate' | 'Academic'>('Investor');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    async function fetchCollaborators() {
      try {
        const res = await fetch('/api/v1/collaborators', {
          headers: {
            Authorization: 'Bearer mock-admin',
            'x-org-id': '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setCollaborators(json.data);
          }
        }
      } catch (err) {
        // Fallback to default mock list
      }
    }
    fetchCollaborators();
  }, []);

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const payload = {
      name,
      type,
      contact_name: contactName,
      email,
      phone,
    };

    try {
      const res = await fetch('/api/v1/collaborators', {
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
        setCollaborators((prev) => [json.data, ...prev]);
      } else {
        // Local state addition
        const newLocal: Collaborator = {
          id: 'collab_' + Date.now(),
          name,
          type,
          contact_name: contactName,
          email,
          phone,
          mou_signed: false,
          matched_startups: [],
        };
        setCollaborators((prev) => [newLocal, ...prev]);
      }
    } catch (err) {
      const newLocal: Collaborator = {
        id: 'collab_' + Date.now(),
        name,
        type,
        contact_name: contactName,
        email,
        phone,
        mou_signed: false,
        matched_startups: [],
      };
      setCollaborators((prev) => [newLocal, ...prev]);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setName('');
      setContactName('');
      setEmail('');
      setPhone('');
    }
  };

  const filtered = collaborators.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || c.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
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
              <Users className="w-8 h-8 text-blue-600" />
              Collaborator Network
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage investment partners, corporate affiliates, and academic institutional linkages.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Collaborator
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search partner name, contact, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Type:
            </span>
            {['all', 'Investor', 'Corporate', 'Academic', 'Partner'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  typeFilter === t
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'all' ? 'All Partners' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Collaborators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {c.name.charAt(0)}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      c.type === 'Investor'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : c.type === 'Corporate'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                        : c.type === 'Academic'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    }`}
                  >
                    {c.type}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lead: <strong className="text-slate-800">{c.contact_name}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{c.email}</span>
                  </p>
                  {c.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <FileCheck
                    className={`w-4 h-4 ${c.mou_signed ? 'text-emerald-600' : 'text-slate-400'}`}
                  />
                  MOU: {c.mou_signed ? <strong className="text-emerald-700">Signed</strong> : 'Pending'}
                </span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {c.matched_startups?.length || 0} Startups
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No collaborators found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search or category filter.</p>
          </div>
        )}

        {/* Modal: Add Collaborator */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Add New Collaborator</h2>
              <p className="text-xs text-slate-500 mb-5">
                Register an institutional investor, corporate, or academic partner.
              </p>

              <form onSubmit={handleAddCollaborator} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Matrix Partners India"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Partner Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="Investor">Investor</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Academic">Academic</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram Singhania"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="vikram@partner.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91-98..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
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
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Partner'}
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
