'use client';

import { useState } from 'react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, Building2, Plus, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';

export default function StartupsDirectoryPage() {
  const startups = [
    { id: 'startup_1', name: 'NexHealth AI', founder: 'Dr. Sarah Connor', sector: 'Health & Biotech', stage: 'MVP', status: 'Active', revenue: '₹50,000' },
    { id: 'startup_2', name: 'PayFlow Finance', founder: 'John Miller', sector: 'FinTech', stage: 'Growth', status: 'Incubating', revenue: '₹2,50,000' },
    { id: 'startup_3', name: 'EcoPack Solutions', founder: 'Neha Patel', sector: 'Sustainability', stage: 'Idea', status: 'Active', revenue: '₹0' },
    { id: 'startup_4', name: 'CloudScale OS', founder: 'Vikram Seth', sector: 'SaaS', stage: 'Scaling', status: 'Graduated', revenue: '₹12,00,000' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Incubator Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Startups Directory</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and track all cohorts and incubated startup ventures.</p>
          </div>
          <Button className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
            <Plus className="w-4 h-4" /> Onboard Startup
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {startups.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    s.status === 'Graduated' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{s.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Founder: {s.founder}</p>
                <div className="flex gap-2 mt-4 text-xs text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-slate-100">{s.sector}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100">{s.stage}</span>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Monthly Revenue</span>
                <span className="font-bold text-slate-800">{s.revenue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
