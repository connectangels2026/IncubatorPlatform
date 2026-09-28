'use client';

import { useState } from 'react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, Save, Building, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';

export default function IncubatorSettingsPage() {
  const [orgName, setOrgName] = useState('Arba Accelerator & Incubator');
  const [contactEmail, setContactEmail] = useState('admin@arbaincubator.com');
  const [domain, setDomain] = useState('arbaincubator.com');
  const [saved, setSaved] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Incubator Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Incubator Organization Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure incubator profile, notification preferences, and team permissions.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Incubator Name</label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Official Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Domain</label>
                <input
                  type="text"
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {saved ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Changes saved successfully!
              </span>
            ) : <span />}
            <Button
              onClick={() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
              }}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              <Save className="w-4 h-4" /> Save Settings
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
