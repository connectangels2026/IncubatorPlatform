'use client';

import React, { useState } from 'react';
import {
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Rocket,
  Globe,
  Mail,
  Phone,
  Building2,
  TrendingUp,
  Users,
  Target,
  ShieldCheck,
  FileCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { StartupItem, TeamMember } from '../types';

interface StartupProfileEditProps {
  startup: StartupItem;
  onSave: (updatedData: Partial<StartupItem>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function StartupProfileEdit({
  startup,
  onSave,
  onCancel,
  isSaving,
}: StartupProfileEditProps) {
  // Form State initialized from current startup
  const [formData, setFormData] = useState({
    name: startup.startup_name || startup.name || '',
    sector: startup.sector || 'Technology',
    stage: startup.stage || 'MVP',
    status: startup.status || 'Active',
    tagline: startup.tagline || startup.description || '',
    website: startup.website || '',
    founder_name: startup.founder_name || startup.founder || '',
    founder_email: startup.founder_email || startup.founderEmail || '',
    founder_phone: startup.founder_phone || startup.founderPhone || '',
    problem_statement: startup.problem_statement || startup.problem || '',
    solution_description: startup.solution_description || startup.solution || startup.pitch || '',
    target_market: startup.target_market || startup.market || '',
    business_model: startup.business_model || '',
    revenue_model: startup.revenue_model || '',
    mrr: Number(startup.mrr || startup.monthly_revenue || 0),
    funding_raised: Number(startup.funding_raised || (startup.funding ? startup.funding.replace(/[^0-9.]/g, '') : 0)),
    customer_count: Number(startup.customers ?? startup.customer_count ?? 0),
    registration_type: startup.registration_type || 'Private Limited',
    registration_number: startup.registration_number || '',
    pan_number: startup.pan_number || '',
    gst_number: startup.gst_number || '',
    cin_number: startup.cin_number || '',
    pitch_deck_url: startup.pitch_deck_url || '',
    business_plan_url: startup.business_plan_url || '',
  });

  // Team Members
  const initialTeam: TeamMember[] = (startup.teamMembers || startup.team || []).map((m: any) => ({
    name: m.name || '',
    role: m.role || '',
    email: m.email || '',
    linkedin: m.linkedin || '',
    initials: m.initials || (m.name ? m.name.slice(0, 2).toUpperCase() : 'TM'),
  }));
  const [teamList, setTeamList] = useState<TeamMember[]>(initialTeam);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleAddTeamMember = () => {
    setTeamList((prev) => [
      ...prev,
      { name: '', role: 'Team Member', email: '', linkedin: '', initials: 'TM' },
    ]);
  };

  const handleUpdateTeamMember = (index: number, field: keyof TeamMember, val: string) => {
    setTeamList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      if (field === 'name') {
        next[index].initials = val ? val.slice(0, 2).toUpperCase() : 'TM';
      }
      return next;
    });
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Startup name is required.');
      return;
    }
    if (!formData.founder_name.trim()) {
      setErrorMsg('Founder name is required.');
      return;
    }

    try {
      const resolvedName = formData.name.trim();
      const payload: Partial<StartupItem> = {
        startup_name: resolvedName,
        name: resolvedName,
        sector: formData.sector,
        stage: formData.stage,
        status: formData.status,
        description: formData.tagline.trim(),
        tagline: formData.tagline.trim(),
        website: formData.website.trim(),
        founder: formData.founder_name.trim(),
        founder_name: formData.founder_name.trim(),
        founder_email: formData.founder_email.trim(),
        founderEmail: formData.founder_email.trim(),
        founder_phone: formData.founder_phone.trim(),
        founderPhone: formData.founder_phone.trim(),
        problem_statement: formData.problem_statement.trim(),
        problem: formData.problem_statement.trim(),
        solution_description: formData.solution_description.trim(),
        solution: formData.solution_description.trim(),
        target_market: formData.target_market.trim(),
        market: formData.target_market.trim(),
        business_model: formData.business_model.trim(),
        revenue_model: formData.revenue_model.trim(),
        mrr: Number(formData.mrr) || 0,
        arr: (Number(formData.mrr) || 0) * 12,
        monthly_revenue: Number(formData.mrr) || 0,
        annual_revenue: (Number(formData.mrr) || 0) * 12,
        revenue: Number(formData.mrr) || 0,
        funding_raised: Number(formData.funding_raised) || 0,
        funding: `$${(Number(formData.funding_raised) || 0).toLocaleString()}`,
        customer_count: Number(formData.customer_count) || 0,
        customers: Number(formData.customer_count) || 0,
        registration_type: formData.registration_type,
        registration_number: formData.registration_number.trim(),
        pan_number: formData.pan_number.trim(),
        gst_number: formData.gst_number.trim(),
        cin_number: formData.cin_number.trim(),
        pitch_deck_url: formData.pitch_deck_url.trim(),
        business_plan_url: formData.business_plan_url.trim(),
        teamMembers: teamList.filter((m) => m.name.trim() !== ''),
        team: teamList.filter((m) => m.name.trim() !== ''),
        team_members: teamList.filter((m) => m.name.trim() !== ''),
        team_size: teamList.filter((m) => m.name.trim() !== '').length + 1,
      };

      await onSave(payload);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update startup details. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Header Banner & Identity */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Basic Startup Information</h3>
          </div>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            Editable by Incubator
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Startup Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
              placeholder="e.g. NexHealth AI"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">One-Line Tagline</label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
              placeholder="e.g. Autonomous clinical workflow orchestration using LLMs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sector / Domain</label>
            <select
              name="sector"
              value={formData.sector}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition bg-white"
            >
              <option value="Tech">Technology / Software</option>
              <option value="Health & Biotech">HealthTech / BioTech</option>
              <option value="FinTech">FinTech / Web3</option>
              <option value="CleanTech">CleanTech / Sustainability</option>
              <option value="Hardware / IoT">Hardware & DeepTech</option>
              <option value="EdTech">EdTech</option>
              <option value="AgriTech">AgriTech</option>
              <option value="General">Other / General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Incubation Stage</label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition bg-white"
            >
              <option value="Idea">Idea Phase</option>
              <option value="MVP">MVP (Prototype Built)</option>
              <option value="Pre-revenue">Pre-Revenue Pilots</option>
              <option value="Revenue">Revenue Generating</option>
              <option value="Growth">Growth / Scaling</option>
              <option value="Scale">Scale / Series A+</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition bg-white"
            >
              <option value="Active">Active</option>
              <option value="Queue">Queue / Onboarding</option>
              <option value="Inactive">Inactive</option>
              <option value="Exited">Exited / Graduated</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>

      {/* 2. Founder Details */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Founder & Primary Contact</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Founder Full Name *</label>
            <input
              type="text"
              name="founder_name"
              value={formData.founder_name}
              onChange={handleInputChange}
              required
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
              placeholder="Founder full name"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Founder Email</label>
            <input
              type="email"
              name="founder_email"
              value={formData.founder_email}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
              placeholder="founder@startup.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Founder Phone</label>
            <input
              type="text"
              name="founder_phone"
              value={formData.founder_phone}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
      </div>

      {/* 3. Business & Product Information */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Target className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Business Model & Problem/Solution</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Problem Statement</label>
            <textarea
              name="problem_statement"
              rows={3}
              value={formData.problem_statement}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition resize-none"
              placeholder="Describe the critical bottleneck or market inefficiency..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Solution</label>
            <textarea
              name="solution_description"
              rows={3}
              value={formData.solution_description}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition resize-none"
              placeholder="Describe how the startup's product resolves this problem..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Market & TAM</label>
            <input
              type="text"
              name="target_market"
              value={formData.target_market}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
              placeholder="e.g. US Urgent Care ($28B TAM)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Revenue Model</label>
            <input
              type="text"
              name="revenue_model"
              value={formData.revenue_model}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
              placeholder="e.g. B2B SaaS per seat / Usage-based tier"
            />
          </div>
        </div>
      </div>

      {/* 4. Financials & Growth Traction */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Financials & Growth Traction</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Monthly MRR ($)</label>
            <input
              type="number"
              name="mrr"
              min="0"
              value={formData.mrr}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
              placeholder="50000"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Funding Raised ($)</label>
            <input
              type="number"
              name="funding_raised"
              min="0"
              value={formData.funding_raised}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
              placeholder="1200000"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Active Customers / Pilots</label>
            <input
              type="number"
              name="customer_count"
              min="0"
              value={formData.customer_count}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
              placeholder="120"
            />
          </div>
        </div>
      </div>

      {/* 5. Legal & Corporate Compliance */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Legal & Corporate Registration</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Registration Entity Type</label>
            <select
              name="registration_type"
              value={formData.registration_type}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition bg-white"
            >
              <option value="Private Limited">Private Limited (Pvt Ltd)</option>
              <option value="LLP">Limited Liability Partnership (LLP)</option>
              <option value="Partnership">Partnership Firm</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="C-Corp">Delaware C-Corp</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Registration Number</label>
            <input
              type="text"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-mono"
              placeholder="U72900KA2024PTC123456"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">PAN Number</label>
            <input
              type="text"
              name="pan_number"
              value={formData.pan_number}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-mono uppercase"
              placeholder="ABCDE1234F"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">GST Number</label>
            <input
              type="text"
              name="gst_number"
              value={formData.gst_number}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-mono uppercase"
              placeholder="29ABCDE1234F1Z5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">CIN Number</label>
            <input
              type="text"
              name="cin_number"
              value={formData.cin_number}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition font-mono uppercase"
              placeholder="L22219MH2024PLC000000"
            />
          </div>
        </div>
      </div>

      {/* 6. Documents & Official Links */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Documents & Deck Links</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pitch Deck URL (PDF / Drive)</label>
            <input
              type="text"
              name="pitch_deck_url"
              value={formData.pitch_deck_url}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Business Plan URL</label>
            <input
              type="text"
              name="business_plan_url"
              value={formData.business_plan_url}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
              placeholder="https://drive.google.com/..."
            />
          </div>
        </div>
      </div>

      {/* 7. Team Members Management */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Key Team Members</h3>
          </div>
          <button
            type="button"
            onClick={handleAddTeamMember}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Member
          </button>
        </div>

        {teamList.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No additional team members listed. Click Add Member to add.</p>
        ) : (
          <div className="space-y-3">
            {teamList.map((m, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                  {m.initials || 'TM'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => handleUpdateTeamMember(idx, 'name', e.target.value)}
                    placeholder="Member Name"
                    className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={m.role}
                    onChange={(e) => handleUpdateTeamMember(idx, 'role', e.target.value)}
                    placeholder="Role (e.g. CTO)"
                    className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                  <input
                    type="email"
                    value={m.email || ''}
                    onChange={(e) => handleUpdateTeamMember(idx, 'email', e.target.value)}
                    placeholder="Email Address"
                    className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTeamMember(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition shrink-0"
                  title="Remove Member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 right-0 left-0 sm:left-auto sm:w-[calc(100%-2rem)] max-w-4xl bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 px-6 shadow-2xl flex items-center justify-end gap-3 z-50">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Save Startup Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}

