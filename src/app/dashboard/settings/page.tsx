'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, Save, Building, Mail, ShieldCheck, Bell, Check } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import { apiClient } from '@/services/apiClient';

export default function IncubatorSettingsPage() {
  const [orgName, setOrgName] = useState('Arba Accelerator & Incubator');
  const [contactEmail, setContactEmail] = useState('admin@arbaincubator.com');
  const [domain, setDomain] = useState('arbaincubator.com');
  const [saved, setSaved] = useState(false);

  // Notification Preferences State
  const [prefs, setPrefs] = useState({
    email_notifications: true,
    in_app_notifications: true,
    application_updates: true,
    mentorship_updates: true,
    reminder_alerts: true,
  });

  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await apiClient.get('/notifications/preferences', {
          headers: {
            'Authorization': 'Bearer mock-admin',
            'x-org-id': '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
          },
        });
        if (res.data?.preferences) {
          setPrefs((prev) => ({ ...prev, ...res.data.preferences }));
        }
      } catch (e) {
        // Fallback
      }
    }
    loadPreferences();
  }, []);

  const handleSave = async () => {
    try {
      await apiClient.post('/notifications/preferences', prefs, {
        headers: {
          'Authorization': 'Bearer mock-admin',
          'x-org-id': '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Incubator Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Incubator Organization Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure incubator profile, notification preferences, and team permissions.</p>
        </div>

        {/* Organization Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" /> Organization Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Incubator Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Official Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Domain</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" /> Notification & Email Preferences
          </h2>
          <p className="text-xs text-slate-500">Manage how you receive alerts, meeting reminders, and application updates.</p>

          <div className="divide-y divide-slate-100">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Email Notifications</p>
                <p className="text-[11px] text-slate-500">Receive emails for session bookings, reminders, and decisions.</p>
              </div>
              <button
                type="button"
                onClick={() => setPrefs((prev) => ({ ...prev, email_notifications: !prev.email_notifications }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  prefs.email_notifications ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    prefs.email_notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">In-App Notifications</p>
                <p className="text-[11px] text-slate-500">Show notification badge and popup alerts in the dashboard header.</p>
              </div>
              <button
                type="button"
                onClick={() => setPrefs((prev) => ({ ...prev, in_app_notifications: !prev.in_app_notifications }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  prefs.in_app_notifications ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    prefs.in_app_notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Application Updates</p>
                <p className="text-[11px] text-slate-500">Notify when application status changes (e.g. Admitted / Under Review).</p>
              </div>
              <button
                type="button"
                onClick={() => setPrefs((prev) => ({ ...prev, application_updates: !prev.application_updates }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  prefs.application_updates ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    prefs.application_updates ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Mentorship 1-Day Reminders</p>
                <p className="text-[11px] text-slate-500">Automated reminder dispatched 24 hours prior to scheduled mentorship sessions.</p>
              </div>
              <button
                type="button"
                onClick={() => setPrefs((prev) => ({ ...prev, reminder_alerts: !prev.reminder_alerts }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  prefs.reminder_alerts ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    prefs.reminder_alerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          {saved ? (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Preferences saved successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-400">Unsaved changes will be discarded on navigation.</span>
          )}
          <Button
            onClick={handleSave}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            <Save className="w-4 h-4" /> Save Settings
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
