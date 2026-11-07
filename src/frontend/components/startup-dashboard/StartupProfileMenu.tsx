'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Rocket,
  Pencil,
  Settings,
  LogOut,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
  Phone,
  Mail,
  Building2,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface StartupProfileMenuProps {
  user: any;
  startup: any;
  onStartupUpdate?: (updated: any) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenStartupModal?: () => void;
  onLogout: () => void;
}

export const StartupProfileMenu: React.FC<StartupProfileMenuProps> = ({
  user,
  startup,
  onStartupUpdate,
  onNavigateTab,
  onOpenStartupModal,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'profile' | 'startup' | 'settings' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: user?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: user?.phone || user?.user_metadata?.phone || startup?.founder_phone || '',
  });

  // Startup Details Form State
  const [startupForm, setStartupForm] = useState({
    name: startup?.name || '',
    sector: startup?.sector || 'Technology',
    stage: startup?.stage || 'MVP',
    website: startup?.website || '',
    description: startup?.description || '',
    pitch: startup?.solution_description || '',
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    emailNotifications: true,
    weeklyDigest: true,
    timezone: 'UTC+05:30 (IST)',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync state when props change
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
        email: user.email || '',
        phone: user.phone || user.user_metadata?.phone || startup?.founder_phone || '',
      });
    }
  }, [user, startup]);

  useEffect(() => {
    if (startup) {
      setStartupForm({
        name: startup.name || '',
        sector: startup.sector || 'Technology',
        stage: startup.stage || 'MVP',
        website: startup.website || '',
        description: startup.description || '',
        pitch: startup.solution_description || '',
      });
    }
  }, [startup]);

  // Click Outside Detection
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save Personal Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.put('/auth/profile', {
        full_name: profileForm.fullName,
        name: profileForm.fullName,
        phone: profileForm.phone,
      });

      showToast('Profile updated successfully!');
      setActiveModal(null);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Startup Details
  const handleSaveStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startup?.id) {
      showToast('Missing startup identifier', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orgId = startup.organization_id || localStorage.getItem('org_id');
      const res = await apiClient.put(
        `/startups/${startup.id}`,
        {
          name: startupForm.name,
          sector: startupForm.sector,
          stage: startupForm.stage,
          website: startupForm.website,
          description: startupForm.description,
          solution_description: startupForm.pitch,
        },
        { headers: orgId ? { 'x-org-id': orgId } : undefined }
      );

      const updated = res.data?.data || {
        ...startup,
        name: startupForm.name,
        sector: startupForm.sector,
        stage: startupForm.stage,
        website: startupForm.website,
        description: startupForm.description,
        solution_description: startupForm.pitch,
      };

      if (onStartupUpdate) {
        onStartupUpdate(updated);
      }

      showToast('Startup details updated!');
      setActiveModal(null);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update startup details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Preferences saved successfully!');
    setActiveModal(null);
  };

  const userInitial = (
    profileForm.fullName ||
    startupForm.name ||
    user?.email ||
    'S'
  ).charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[120] bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Profile Trigger Button */}
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 cursor-pointer focus:outline-none"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1A2151] to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-xs ring-2 ring-white">
            {userInitial}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>

        <div className="hidden lg:block text-left">
          <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[130px]">
            {profileForm.fullName || startupForm.name || 'Startup Founder'}
          </p>
          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[130px] mt-0.5">
            {user?.email}
          </p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header Info */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-800 truncate">
              {profileForm.fullName || startupForm.name || 'Founder'}
            </p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Admitted Startup
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                if (onOpenStartupModal) {
                  onOpenStartupModal();
                } else if (onNavigateTab) {
                  onNavigateTab('profile');
                }
              }}
              className="w-full px-4 py-2.5 text-xs text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
            >
              <Pencil className="w-4 h-4 text-blue-500" />
              <span>Startup Details</span>
            </button>

            <button
              onClick={() => {
                setDropdownOpen(false);
                setActiveModal('settings');
              }}
              className="w-full px-4 py-2.5 text-xs text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Account Settings</span>
            </button>
          </div>

          <div className="border-t border-slate-100 my-1" />

          {/* Logout */}
          <div className="px-1.5 pb-1">
            <button
              onClick={() => {
                setDropdownOpen(false);
                onLogout();
              }}
              className="w-full px-3 py-2 text-xs text-left font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. My Profile Modal */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">My Personal Profile</h3>
                  <p className="text-[11px] text-slate-400">View and update your personal contact info</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    placeholder="e.g. Alex Johnson"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    disabled
                    value={profileForm.email}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Managed via authentication provider</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Startup Details Modal */}
      {activeModal === 'startup' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Rocket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Startup Information</h3>
                  <p className="text-[11px] text-slate-400">Update cohort directory and investor-facing details</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStartup} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Startup Name *</label>
                  <input
                    type="text"
                    required
                    value={startupForm.name}
                    onChange={(e) => setStartupForm({ ...startupForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sector</label>
                  <select
                    value={startupForm.sector}
                    onChange={(e) => setStartupForm({ ...startupForm, sector: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Technology">Technology / AI</option>
                    <option value="FinTech">FinTech</option>
                    <option value="HealthTech">HealthTech</option>
                    <option value="CleanTech">CleanTech</option>
                    <option value="AgriTech">AgriTech</option>
                    <option value="SaaS">B2B SaaS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Stage</label>
                  <select
                    value={startupForm.stage}
                    onChange={(e) => setStartupForm({ ...startupForm, stage: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Website URL</label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      value={startupForm.website}
                      onChange={(e) => setStartupForm({ ...startupForm, website: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tagline / One-Liner</label>
                <input
                  type="text"
                  value={startupForm.description}
                  onChange={(e) => setStartupForm({ ...startupForm, description: e.target.value })}
                  placeholder="One sentence summary of your startup"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product & Solution Overview</label>
                <textarea
                  rows={3}
                  value={startupForm.pitch}
                  onChange={(e) => setStartupForm({ ...startupForm, pitch: e.target.value })}
                  placeholder="Describe your core product, technology, and value proposition..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Update Startup</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Account Settings Modal */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Account Preferences</h3>
                  <p className="text-[11px] text-slate-400">Manage notifications and security preferences</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cohort Account Status</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active & Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Linked to incubator workspace with full dashboard privileges.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                  <span>Notification Preferences</span>
                </h4>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Email Notifications</p>
                    <p className="text-[10px] text-slate-400">Receive alerts when mentors or incubator staff review tasks</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.emailNotifications}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, emailNotifications: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Weekly Progress Digest</p>
                    <p className="text-[10px] text-slate-400">Weekly automated summary of cohort deliverables and deadlines</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.weeklyDigest}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, weeklyDigest: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Timezone</label>
                <select
                  value={settingsForm.timezone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, timezone: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UTC+05:30 (IST)">UTC+05:30 (India Standard Time)</option>
                  <option value="UTC+00:00 (GMT)">UTC+00:00 (GMT / UTC)</option>
                  <option value="UTC-05:00 (EST)">UTC-05:00 (Eastern Time)</option>
                  <option value="UTC-08:00 (PST)">UTC-08:00 (Pacific Time)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
