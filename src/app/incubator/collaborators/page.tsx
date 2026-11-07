'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import { DashboardLayout } from '@/frontend/components/layouts/DashboardLayout';
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
        const orgId = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
        const res = await fetch('/api/v1/collaborators', {
          headers: {
            Authorization: 'Bearer mock-admin',
            ...(orgId ? { 'x-org-id': orgId } : {}),
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
      const orgId = typeof window !== 'undefined' ? localStorage.getItem('org_id') : null;
      const res = await fetch('/api/v1/collaborators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-admin',
          ...(orgId ? { 'x-org-id': orgId } : {}),
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
      <DashboardLayout
        breadcrumbs={[{ label: 'Collaborators' }]}
      >
        <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Collaborators
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage investment partners, corporate affiliates, and academic institutional linkages.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add collaborator</span>
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search partner name, contact, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['all', 'Investor', 'Corporate', 'Academic', 'Partner'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t === 'all' ? 'All partners' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Collaborators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-xs">
                    {c.name.charAt(0)}
                  </div>
                  <span
                    className={`text-xs font-normal px-2 py-0.5 rounded border ${
                      c.type === 'Investor'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {c.type}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-900 text-sm">{c.name}</h3>
                <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Lead: <span className="font-medium text-slate-800">{c.contact_name}</span></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </p>
                  {c.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
                  <FileCheck
                    className={`w-3.5 h-3.5 ${c.mou_signed ? 'text-emerald-600' : 'text-slate-400'}`}
                  />
                  <span>MOU: {c.mou_signed ? <strong className="font-medium text-emerald-700">Signed</strong> : 'Pending'}</span>
                </span>
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {c.matched_startups?.length || 0} {(c.matched_startups?.length || 0) === 1 ? 'startup' : 'startups'}
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
