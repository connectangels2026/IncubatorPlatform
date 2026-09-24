'use client';

import { useState } from 'react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';

export default function ApplicationsPage() {
  const [filter, setFilter] = useState('all');

  const applications = [
    { id: 'app_1', startup: 'GreenSight AI', founder: 'Maya Lin', sector: 'CleanTech', stage: 'Idea', status: 'pending', date: '2026-09-21' },
    { id: 'app_2', startup: 'PayBridge', founder: 'Rohan Sharma', sector: 'FinTech', stage: 'MVP', status: 'approved', date: '2026-09-19' },
    { id: 'app_3', startup: 'NeuroMed Tech', founder: 'Dr. John Croft', sector: 'HealthTech', stage: 'Validation', status: 'under_review', date: '2026-09-18' },
    { id: 'app_4', startup: 'UrbanFarms Pvt Ltd', founder: 'Ananya Roy', sector: 'AgriTech', stage: 'Early Revenue', status: 'rejected', date: '2026-09-15' },
  ];

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Incubator Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Applications Review</h1>
            <p className="text-sm text-slate-500 mt-1">Review, approve, or reject new startup incubation applications.</p>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'under_review', 'approved'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${filter === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Startup</th>
                  <th className="py-3.5 px-4">Founder</th>
                  <th className="py-3.5 px-4">Sector</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{app.startup}</td>
                    <td className="py-3 px-4 text-slate-600">{app.founder}</td>
                    <td className="py-3 px-4 text-slate-600">{app.sector}</td>
                    <td className="py-3 px-4 text-slate-600">{app.stage}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        app.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        app.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{app.date}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button className="px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition">View</button>
                      <button className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition">Approve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
