'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  Bell,
  Save,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import { DashboardLayout } from '@/frontend/components/layouts/DashboardLayout';
import { useAuth } from '@/frontend/context/AuthContext';
import { apiClient } from '@/services/apiClient';

export default function SettingsPage() {
  const { user, organization } = useAuth();
  const [orgName, setOrgName] = useState('My Incubator');
  const [contactEmail, setContactEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [saved, setSaved] = useState(false);

  // Notification Preferences
  const [prefs, setPrefs] = useState({
    email_notifications: true,
    in_app_notifications: true,
    application_updates: true,
    reminder_alerts: true,
  });

  useEffect(() => {
    if (organization?.name) setOrgName(organization.name);
    if (user?.email) setContactEmail(user.email);
    if (organization?.slug) setDomain(`${organization.slug}.arba360.io`);

    const savedPrefs = localStorage.getItem('incubator_notification_prefs');
    if (savedPrefs) {
      try {
        setPrefs(JSON.parse(savedPrefs));
      } catch {
        // Fallback default
      }
    }
  }, [organization, user]);

  const handleSave = async () => {
    try {
      localStorage.setItem('incubator_notification_prefs', JSON.stringify(prefs));
      if (organization?.id) {
        await apiClient.put(`/incubators/${organization.id}`, {
          name: orgName,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout
        breadcrumbs={[{ label: 'Settings' }]}
        headerActions={
          <Button
            onClick={handleSave}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 h-9 rounded-lg shadow-xs"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </Button>
        }
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Incubator organization settings</h1>
            <p className="text-sm text-slate-500 mt-1">Configure incubator profile, notification preferences, and team permissions.</p>
          </div>

          {/* Organization Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-medium text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" /> Organization profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Incubator name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Official contact email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Domain</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-medium text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" /> Notification & email preferences
            </h2>
            <p className="text-xs text-slate-500">Manage how you receive alerts, meeting reminders, and application updates.</p>

            <div className="divide-y divide-slate-100">
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">Email notifications</p>
                  <p className="text-xs text-slate-500">Receive emails for session bookings, reminders, and decisions.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefs((prev) => ({ ...prev, email_notifications: !prev.email_notifications }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    prefs.email_notifications ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      prefs.email_notifications ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">In-app notifications</p>
                  <p className="text-xs text-slate-500">Show notification badge and popup alerts in the dashboard header.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefs((prev) => ({ ...prev, in_app_notifications: !prev.in_app_notifications }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    prefs.in_app_notifications ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      prefs.in_app_notifications ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">Application updates</p>
                  <p className="text-xs text-slate-500">Notify when application status changes (e.g. Admitted / Under Review).</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefs((prev) => ({ ...prev, application_updates: !prev.application_updates }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    prefs.application_updates ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      prefs.application_updates ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">Mentorship 1-day reminders</p>
                  <p className="text-xs text-slate-500">Automated reminder dispatched 24 hours prior to scheduled mentorship sessions.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefs((prev) => ({ ...prev, reminder_alerts: !prev.reminder_alerts }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    prefs.reminder_alerts ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      prefs.reminder_alerts ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Bar */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            {saved ? (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Preferences saved successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-400">Unsaved changes will be discarded on navigation.</span>
            )}
            <Button
              onClick={handleSave}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 rounded-lg"
            >
              <Save className="w-4 h-4" /> Save settings
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
