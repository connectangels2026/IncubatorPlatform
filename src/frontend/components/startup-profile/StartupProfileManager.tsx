'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Target,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Award,
  FileText,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Layers,
  Sparkles,
  GitBranch,
  Video,
  Play,
  Code,
} from 'lucide-react';
import { ProfileCompletionWidget } from './ProfileCompletionWidget';
import { LogoImageUploader } from './LogoImageUploader';
import { apiClient } from '@/services/apiClient';

interface StartupProfileManagerProps {
  initialStartup: any;
  organization?: any;
  onStartupUpdate?: (updated: any) => void;
  isReadOnly?: boolean;
}

export const StartupProfileManager: React.FC<StartupProfileManagerProps> = ({
  initialStartup,
  organization,
  onStartupUpdate,
  isReadOnly = false,
}) => {
  const [startup, setStartup] = useState<any>(initialStartup || {});
  const [activeEditingSection, setActiveEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(initialStartup || {});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (initialStartup) {
      setStartup(initialStartup);
      setFormData(initialStartup);
    }
  }, [initialStartup]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStartEdit = (section: string) => {
    if (isReadOnly) return;
    setFormData({ ...startup });
    setActiveEditingSection(section);
  };

  const handleCancelEdit = () => {
    setFormData({ ...startup });
    setActiveEditingSection(null);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSection = async (section: string) => {
    setIsSaving(true);
    try {
      // Build section-specific payload
      const payload: Record<string, any> = {};

      if (section === 'basic') {
        payload.startup_name = formData.startup_name || formData.name;
        payload.tagline = formData.tagline;
        payload.logo_url = formData.logo_url;
        payload.website = formData.website;
        payload.sector = formData.sector;
        payload.stage = formData.stage;
        payload.founded_date = formData.founded_date;
      } else if (section === 'team') {
        payload.founder_name = formData.founder_name;
        payload.founder_email = formData.founder_email;
        payload.founder_phone = formData.founder_phone;
        payload.team_size = Number(formData.team_size) || 1;
        payload.cofounders = formData.cofounders || [];
        payload.team_members = formData.team_members || [];
      } else if (section === 'overview') {
        payload.description = formData.description;
        payload.problem_statement = formData.problem_statement;
        payload.solution_description = formData.solution_description;
        payload.target_market = formData.target_market;
      } else if (section === 'business') {
        payload.business_model = formData.business_model;
        payload.revenue_model = formData.revenue_model;
      } else if (section === 'legal') {
        payload.registration_type = formData.registration_type;
        payload.registration_number = formData.registration_number;
        payload.pan_number = formData.pan_number ? formData.pan_number.toUpperCase() : null;
        payload.gst_number = formData.gst_number ? formData.gst_number.toUpperCase() : null;
        payload.cin_number = formData.cin_number ? formData.cin_number.toUpperCase() : null;
      } else if (section === 'financials') {
        payload.mrr = Number(formData.mrr) || 0;
        payload.monthly_revenue = Number(formData.monthly_revenue) || 0;
        payload.annual_revenue = Number(formData.annual_revenue) || (Number(formData.monthly_revenue) || 0) * 12;
        payload.funding_raised = Number(formData.funding_raised) || 0;
        payload.customer_count = Number(formData.customer_count) || 0;
      } else if (section === 'documents') {
        payload.pitch_deck_url = formData.pitch_deck_url;
        payload.business_plan_url = formData.business_plan_url;
        payload.github_url = formData.github_url;
        payload.figma_url = formData.figma_url;
        payload.demo_url = formData.demo_url;
        payload.demo_video_url = formData.demo_video_url;
      }

      const res = await apiClient.put('/startups/me', payload);

      if (res.data?.success && res.data?.startup) {
        setStartup(res.data.startup);
        setFormData(res.data.startup);
        onStartupUpdate?.(res.data.startup);
        showToast('Section updated and saved successfully!', 'success');
        setActiveEditingSection(null);
      } else {
        throw new Error(res.data?.error || 'Failed to update startup section');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Error updating section';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Co-founder array helpers
  const handleAddCofounder = () => {
    const list = Array.isArray(formData.cofounders) ? [...formData.cofounders] : [];
    list.push({ name: '', role: 'Co-Founder', email: '', linkedin: '' });
    handleFieldChange('cofounders', list);
  };

  const handleUpdateCofounder = (index: number, key: string, val: string) => {
    const list = Array.isArray(formData.cofounders) ? [...formData.cofounders] : [];
    if (list[index]) {
      list[index] = { ...list[index], [key]: val };
      handleFieldChange('cofounders', list);
    }
  };

  const handleRemoveCofounder = (index: number) => {
    const list = Array.isArray(formData.cofounders) ? [...formData.cofounders] : [];
    list.splice(index, 1);
    handleFieldChange('cofounders', list);
  };

  // Team member array helpers
  const handleAddTeamMember = () => {
    const list = Array.isArray(formData.team_members) ? [...formData.team_members] : [];
    list.push({ name: '', role: 'Engineer', email: '' });
    handleFieldChange('team_members', list);
  };

  const handleUpdateTeamMember = (index: number, key: string, val: string) => {
    const list = Array.isArray(formData.team_members) ? [...formData.team_members] : [];
    if (list[index]) {
      list[index] = { ...list[index], [key]: val };
      handleFieldChange('team_members', list);
    }
  };

  const handleRemoveTeamMember = (index: number) => {
    const list = Array.isArray(formData.team_members) ? [...formData.team_members] : [];
    list.splice(index, 1);
    handleFieldChange('team_members', list);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveEditingSection(sectionId);
    }
  };

  const displayName = startup?.startup_name || startup?.name || 'My Startup';

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Dynamic Profile Completeness Widget */}
      <ProfileCompletionWidget startup={startup} onFocusSection={scrollToSection} />

      {/* Section 1: Basic Information */}
      <div id="section-basic" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">1. Basic Information</h3>
              <p className="text-xs text-slate-500">Core company identity, stage, branding, and web presence.</p>
            </div>
          </div>
          {!isReadOnly && activeEditingSection !== 'basic' && (
            <button
              onClick={() => handleStartEdit('basic')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/90 hover:bg-blue-100 text-blue-700 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" /> Edit Section
            </button>
          )}
        </div>

        {activeEditingSection === 'basic' ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Startup Name *</label>
                <input
                  type="text"
                  value={formData.startup_name || formData.name || ''}
                  onChange={(e) => handleFieldChange('startup_name', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Acme Innovations"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector *</label>
                <select
                  value={formData.sector || 'Technology'}
                  onChange={(e) => handleFieldChange('sector', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Technology">Technology</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="FinTech">FinTech</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="CleanTech">CleanTech</option>
                  <option value="EdTech">EdTech</option>
                  <option value="AgriTech">AgriTech</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="DeepTech">DeepTech</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Development Stage *</label>
                <select
                  value={formData.stage || 'MVP'}
                  onChange={(e) => handleFieldChange('stage', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Idea">Idea</option>
                  <option value="MVP">MVP</option>
                  <option value="Pre-revenue">Pre-revenue</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Growth">Growth</option>
                  <option value="Scale">Scale</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Founded Date</label>
                <input
                  type="date"
                  value={formData.founded_date ? formData.founded_date.split('T')[0] : ''}
                  onChange={(e) => handleFieldChange('founded_date', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => handleFieldChange('website', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Elevator Tagline</label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => handleFieldChange('tagline', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Next-generation AI copilot for hardware lab engineering"
                />
              </div>
              <div className="sm:col-span-2">
                <LogoImageUploader
                  value={formData.logo_url || ''}
                  onChange={(url) => handleFieldChange('logo_url', url)}
                  maxImages={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSection('basic')}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Basic Info
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1 text-xs">
            <div className="col-span-2 sm:col-span-3">
              <span className="text-slate-400 font-medium block">Elevator Tagline</span>
              <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                {startup?.tagline || '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Startup Name</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{displayName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Industry Sector</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{startup?.sector || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Current Stage</span>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px]">
                {startup?.stage || 'Idea'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Cohort &amp; Program Track</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[11px]">
                  {startup?.batch || 'Batch 2026'}
                </span>
                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                  {startup?.track === 'both' ? 'DeepTech' : startup?.track || 'DeepTech'}
                </span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Founded Date</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{startup?.founded_date ? new Date(startup.founded_date).toLocaleDateString() : '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Official Website</span>
              {startup?.website ? (
                <a
                  href={startup.website.startsWith('http') ? startup.website : `https://${startup.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 mt-0.5 truncate max-w-[180px]"
                >
                  <span>{startup.website}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="font-semibold text-slate-400 mt-0.5 block">—</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Active Logo</span>
              {startup?.logo_url ? (
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={startup.logo_url}
                    alt={displayName}
                    className="w-7 h-7 rounded-lg object-contain bg-slate-50 border border-slate-200"
                  />
                  <span className="font-semibold text-emerald-700 text-xs">Uploaded & Active</span>
                </div>
              ) : (
                <span className="font-semibold text-slate-400 mt-0.5 block">—</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Founder & Team */}
      <div id="section-team" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">2. Founder & Team</h3>
              <p className="text-xs text-slate-500">Primary founder details, co-founders roster, and team members.</p>
            </div>
          </div>
          {!isReadOnly && activeEditingSection !== 'team' && (
            <button
              onClick={() => handleStartEdit('team')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/90 hover:bg-blue-100 text-blue-700 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" /> Edit Section
            </button>
          )}
        </div>

        {activeEditingSection === 'team' ? (
          <div className="space-y-5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Founder Full Name *</label>
                <input
                  type="text"
                  value={formData.founder_name || ''}
                  onChange={(e) => handleFieldChange('founder_name', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Founder Email</label>
                <input
                  type="email"
                  value={formData.founder_email || ''}
                  onChange={(e) => handleFieldChange('founder_email', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Founder Phone</label>
                <input
                  type="tel"
                  value={formData.founder_phone || ''}
                  onChange={(e) => handleFieldChange('founder_phone', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Team Size</label>
                <input
                  type="number"
                  min="1"
                  value={formData.team_size || 1}
                  onChange={(e) => handleFieldChange('team_size', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Co-Founders sub-editor */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Co-Founders</span>
                <button
                  type="button"
                  onClick={handleAddCofounder}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Co-Founder
                </button>
              </div>

              {Array.isArray(formData.cofounders) && formData.cofounders.length > 0 ? (
                <div className="space-y-2">
                  {formData.cofounders.map((cf: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 items-center">
                      <input
                        type="text"
                        placeholder="Name"
                        value={cf.name || ''}
                        onChange={(e) => handleUpdateCofounder(idx, 'name', e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Role (e.g. CTO)"
                        value={cf.role || ''}
                        onChange={(e) => handleUpdateCofounder(idx, 'role', e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={cf.email || ''}
                        onChange={(e) => handleUpdateCofounder(idx, 'email', e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="LinkedIn URL"
                          value={cf.linkedin || ''}
                          onChange={(e) => handleUpdateCofounder(idx, 'linkedin', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCofounder(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No co-founders registered yet.</p>
              )}
            </div>

            {/* Team Members sub-editor */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Key Team Members</span>
                <button
                  type="button"
                  onClick={handleAddTeamMember}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Member
                </button>
              </div>

              {Array.isArray(formData.team_members) && formData.team_members.length > 0 ? (
                <div className="space-y-2">
                  {formData.team_members.map((tm: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 items-center">
                      <input
                        type="text"
                        placeholder="Member Name"
                        value={tm.name || ''}
                        onChange={(e) => handleUpdateTeamMember(idx, 'name', e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Title / Role"
                        value={tm.role || ''}
                        onChange={(e) => handleUpdateTeamMember(idx, 'role', e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          placeholder="Email"
                          value={tm.email || ''}
                          onChange={(e) => handleUpdateTeamMember(idx, 'email', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No key team members added yet.</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSection('team')}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Team Info
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-400 font-medium block">Primary Founder</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{startup?.founder_name || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Founder Email</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">{startup?.founder_email || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Phone Number</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{startup?.founder_phone || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Total Team Size</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{startup?.team_size || 1} people</span>
              </div>
            </div>

            {/* Co-founders display cards */}
            {Array.isArray(startup?.cofounders) && startup.cofounders.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider block mb-2">
                  Co-Founders ({startup.cofounders.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {startup.cofounders.map((cf: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="font-bold text-slate-900">{cf.name || 'Co-Founder'}</div>
                      <div className="text-slate-500 text-[11px]">{cf.role || 'Partner'} • {cf.email || 'No email'}</div>
                      {cf.linkedin && (
                        <a href={cf.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[11px] inline-flex items-center gap-0.5 mt-1">
                          <span>LinkedIn</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 3: Startup Overview */}
      <div id="section-overview" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">3. Startup Overview</h3>
              <p className="text-xs text-slate-500">Problem statement, solution pitch, target audience, and summary.</p>
            </div>
          </div>
          {!isReadOnly && activeEditingSection !== 'overview' && (
            <button
              onClick={() => handleStartEdit('overview')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/90 hover:bg-blue-100 text-blue-700 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" /> Edit Section
            </button>
          )}
        </div>

        {activeEditingSection === 'overview' ? (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Elevator Tagline / One-Liner</label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Autonomous agentic workflow infrastructure for enterprise IT"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Problem Statement</label>
              <textarea
                rows={3}
                value={formData.problem_statement || ''}
                onChange={(e) => handleFieldChange('problem_statement', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What critical pain point does your customer experience?"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Solution Description / Unique Value Prop</label>
              <textarea
                rows={3}
                value={formData.solution_description || ''}
                onChange={(e) => handleFieldChange('solution_description', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How does your product solve this pain point 10x better than existing alternatives?"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Market & Customer Profile</label>
              <textarea
                rows={2}
                value={formData.target_market || ''}
                onChange={(e) => handleFieldChange('target_market', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your ICP, beachhead vertical, and total addressable market."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSection('overview')}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Overview
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Tagline / Overview</span>
              <p className="font-semibold text-slate-800 mt-0.5">{startup?.description || '—'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-bold block mb-1">Problem Statement</span>
                <p className="text-slate-700 leading-relaxed">{startup?.problem_statement || 'No problem statement recorded.'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-bold block mb-1">Solution Description</span>
                <p className="text-slate-700 leading-relaxed">{startup?.solution_description || 'No solution description recorded.'}</p>
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Target Market</span>
              <p className="font-semibold text-slate-800 mt-0.5">{startup?.target_market || '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Business Model */}
      <div id="section-business" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">4. Business Model</h3>
              <p className="text-xs text-slate-500">Go-to-market mechanics, commercialization, and revenue architecture.</p>
            </div>
          </div>
          {!isReadOnly && activeEditingSection !== 'business' && (
            <button
              onClick={() => handleStartEdit('business')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/90 hover:bg-blue-100 text-blue-700 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" /> Edit Section
            </button>
          )}
        </div>

        {activeEditingSection === 'business' ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Model Type</label>
                <select
                  value={formData.business_model || 'B2B'}
                  onChange={(e) => handleFieldChange('business_model', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="B2B">B2B (Business to Business)</option>
                  <option value="B2C">B2C (Business to Consumer)</option>
                  <option value="B2B2C">B2B2C (Platform Partner Distribution)</option>
                  <option value="D2C">D2C (Direct to Consumer)</option>
                  <option value="Marketplace">Two-Sided Marketplace</option>
                  <option value="Enterprise SaaS">Enterprise SaaS</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Revenue Model</label>
                <select
                  value={formData.revenue_model || 'Subscription SaaS'}
                  onChange={(e) => handleFieldChange('revenue_model', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Subscription SaaS">Subscription / SaaS</option>
                  <option value="Commission / Take Rate">Commission / Marketplace Take Rate</option>
                  <option value="Usage-Based">Usage-Based / Pay-as-you-go</option>
                  <option value="Transactional Fee">Transactional / Processing Fee</option>
                  <option value="Direct Sales / Hardware">Direct Sales / Hardware Unit</option>
                  <option value="Freemium + Upsell">Freemium + Upsell</option>
                  <option value="Advertising">Advertising / Sponsorship</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSection('business')}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Business Model
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Business Model</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{startup?.business_model || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Revenue Model</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{startup?.revenue_model || '—'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Section 5: Legal Details */}
      <div id="section-legal" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">5. Legal & Registration Details</h3>
              <p className="text-xs text-slate-500">Corporate entity structure, registration numbers, PAN, GST, and CIN.</p>
            </div>
          </div>
          {!isReadOnly && activeEditingSection !== 'legal' && (
            <button
              onClick={() => handleStartEdit('legal')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/90 hover:bg-blue-100 text-blue-700 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" /> Edit Section
            </button>
          )}
        </div>

        {activeEditingSection === 'legal' ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registration Entity Type</label>
                <select
                  value={formData.registration_type || 'Private Limited'}
                  onChange={(e) => handleFieldChange('registration_type', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Private Limited">Private Limited Company (Pvt Ltd)</option>
                  <option value="Limited Liability Partnership">Limited Liability Partnership (LLP)</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership Firm">Partnership Firm</option>
                  <option value="One Person Company">One Person Company (OPC)</option>
                  <option value="Unregistered / Pre-incorporation">Unregistered / Pre-incorporation</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registration / Certificate No.</label>
                <input
                  type="text"
                  value={formData.registration_number || ''}
                  onChange={(e) => handleFieldChange('registration_number', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. REG-2026-9812"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company PAN Number</label>
                <input
                  type="text"
                  value={formData.pan_number || ''}
                  onChange={(e) => handleFieldChange('pan_number', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="e.g. ABCDE1234F"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN (GST Number)</label>
                <input
                  type="text"
                  value={formData.gst_number || ''}
                  onChange={(e) => handleFieldChange('gst_number', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="e.g. 27ABCDE1234F1Z5"
                  maxLength={15}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CIN Number</label>
                <input
                  type="text"
                  value={formData.cin_number || ''}
                  onChange={(e) => handleFieldChange('cin_number', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="e.g. U72900MH2026PTC123456"
                  maxLength={25}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSection('legal')}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Legal Details
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-1 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Entity Type</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{startup?.registration_type || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Reg. Number</span>
              <span className="font-semibold text-slate-800 mt-0.5 block font-mono">{startup?.registration_number || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">PAN Number</span>
              <span className="font-semibold text-slate-800 mt-0.5 block font-mono">{startup?.pan_number || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">GST Number</span>
              <span className="font-semibold text-slate-800 mt-0.5 block font-mono">{startup?.gst_number || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">CIN Number</span>
              <span className="font-semibold text-slate-800 mt-0.5 block font-mono truncate">{startup?.cin_number || '—'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Section 6: Financials & Traction */}
      <div id="section-financials" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">6. Financials & Traction</h3>
              <p className="text-xs text-slate-500">Revenue figures, MRR, capital raised, and active customer base.</p>
            </div>
          </div>
          {!isReadOnly && activeEditingSection !== 'financials' && (
            <button
              onClick={() => handleStartEdit('financials')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/90 hover:bg-blue-100 text-blue-700 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" /> Edit Section
            </button>
          )}
        </div>

        {activeEditingSection === 'financials' ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Recurring Revenue ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.mrr !== undefined ? formData.mrr : 0}
                  onChange={(e) => handleFieldChange('mrr', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Revenue ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthly_revenue !== undefined ? formData.monthly_revenue : 0}
                  onChange={(e) => handleFieldChange('monthly_revenue', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Funding Raised ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.funding_raised !== undefined ? formData.funding_raised : 0}
                  onChange={(e) => handleFieldChange('funding_raised', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Active Customer Count</label>
                <input
                  type="number"
                  min="0"
                  value={formData.customer_count !== undefined ? formData.customer_count : 0}
                  onChange={(e) => handleFieldChange('customer_count', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSection('financials')}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Financials
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 font-medium block">Monthly Recurring (MRR)</span>
              <span className="font-extrabold text-slate-900 text-base mt-0.5 block">
                ${Number(startup?.mrr || startup?.monthly_revenue || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 font-medium block">Annual Run Rate (ARR)</span>
              <span className="font-extrabold text-slate-900 text-base mt-0.5 block">
                ${Number(startup?.annual_revenue || (startup?.mrr ? startup.mrr * 12 : 0)).toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 font-medium block">Total Funding Raised</span>
              <span className="font-extrabold text-emerald-700 text-base mt-0.5 block">
                ${Number(startup?.funding_raised || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 font-medium block">Active Customers</span>
              <span className="font-extrabold text-blue-700 text-base mt-0.5 block">
                {Number(startup?.customer_count || 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Section 7: Incubation Details */}
      <div id="section-incubation" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">7. Incubation Details</h3>
              <p className="text-xs text-slate-500">Host incubator affiliation, lifecycle milestone, and program tenure.</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
            Managed by Incubator
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Host Incubator</span>
            <span className="font-bold text-slate-900 mt-0.5 block truncate">
              {organization?.name || startup?.organization_name || 'Primary Accelerator'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Incubation Status</span>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px] uppercase">
              {startup?.status || 'active'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Lifecycle Stage</span>
            <span className="font-semibold text-slate-800 mt-0.5 block capitalize">
              {startup?.lifecycle_stage || 'Incubation'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Incubation Tenure</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {startup?.incubation_start_date ? new Date(startup.incubation_start_date).toLocaleDateString() : 'Active'}
              {startup?.incubation_end_date ? ` to ${new Date(startup.incubation_end_date).toLocaleDateString()}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Section 8: Pitch Deck, Prototypes & Product Links */}
      <div id="section-documents" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">8. Pitch, Prototype &amp; Product Links</h3>
              <p className="text-xs text-slate-500">Official investor pitch deck, business plan, GitHub repository, Figma designs, and live demos.</p>
            </div>
          </div>
          {!isReadOnly && activeEditingSection !== 'documents' && (
            <button
              onClick={() => handleStartEdit('documents')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/90 hover:bg-blue-100 text-blue-700 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" /> Edit Section
            </button>
          )}
        </div>

        {activeEditingSection === 'documents' ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pitch Deck URL</label>
                <input
                  type="url"
                  value={formData.pitch_deck_url || ''}
                  onChange={(e) => handleFieldChange('pitch_deck_url', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://drive.google.com/... or https://docsend.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Plan / Whitepaper URL</label>
                <input
                  type="url"
                  value={formData.business_plan_url || ''}
                  onChange={(e) => handleFieldChange('business_plan_url', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Repository URL</label>
                <input
                  type="url"
                  value={formData.github_url || ''}
                  onChange={(e) => handleFieldChange('github_url', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/organization/repo"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Figma Design System URL</label>
                <input
                  type="url"
                  value={formData.figma_url || ''}
                  onChange={(e) => handleFieldChange('figma_url', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://figma.com/file/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Interactive Live Demo URL</label>
                <input
                  type="url"
                  value={formData.demo_url || ''}
                  onChange={(e) => handleFieldChange('demo_url', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://demo.myplatform.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Demo / Loom Video URL</label>
                <input
                  type="url"
                  value={formData.demo_video_url || ''}
                  onChange={(e) => handleFieldChange('demo_video_url', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://loom.com/share/... or YouTube link"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSection('documents')}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Product Links
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 text-xs">
            {/* 1. Pitch Deck */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">Pitch Deck</span>
                  <span className="text-[11px] text-slate-500">
                    {startup?.pitch_deck_url ? 'Linked' : 'Not linked'}
                  </span>
                </div>
              </div>
              {startup?.pitch_deck_url && (
                <a
                  href={startup.pitch_deck_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold shadow-2xs hover:bg-slate-50 transition shrink-0 ml-2"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>

            {/* 2. Business Plan */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">Business Plan</span>
                  <span className="text-[11px] text-slate-500">
                    {startup?.business_plan_url ? 'Linked' : 'Not linked'}
                  </span>
                </div>
              </div>
              {startup?.business_plan_url && (
                <a
                  href={startup.business_plan_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold shadow-2xs hover:bg-slate-50 transition shrink-0 ml-2"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>

            {/* 3. GitHub Repo */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold shrink-0">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">GitHub Repo</span>
                  <span className="text-[11px] text-slate-500">
                    {startup?.github_url ? 'Linked' : 'Not linked'}
                  </span>
                </div>
              </div>
              {startup?.github_url && (
                <a
                  href={startup.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold shadow-2xs hover:bg-slate-50 transition shrink-0 ml-2"
                >
                  <span>Repo</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>

            {/* 4. Figma Design */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">Figma Prototype</span>
                  <span className="text-[11px] text-slate-500">
                    {startup?.figma_url ? 'Linked' : 'Not linked'}
                  </span>
                </div>
              </div>
              {startup?.figma_url && (
                <a
                  href={startup.figma_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold shadow-2xs hover:bg-slate-50 transition shrink-0 ml-2"
                >
                  <span>Figma</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>

            {/* 5. Live Demo */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                  <Play className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">Live Demo</span>
                  <span className="text-[11px] text-slate-500">
                    {startup?.demo_url ? 'Active Demo' : 'Not linked'}
                  </span>
                </div>
              </div>
              {startup?.demo_url && (
                <a
                  href={startup.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold shadow-2xs hover:bg-slate-50 transition shrink-0 ml-2"
                >
                  <span>Launch</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>

            {/* 6. Demo Video / Loom */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">Video Walkthrough</span>
                  <span className="text-[11px] text-slate-500">
                    {startup?.demo_video_url ? 'Video linked' : 'Not linked'}
                  </span>
                </div>
              </div>
              {startup?.demo_video_url && (
                <a
                  href={startup.demo_video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold shadow-2xs hover:bg-slate-50 transition shrink-0 ml-2"
                >
                  <span>Watch</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

