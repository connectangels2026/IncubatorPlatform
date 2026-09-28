'use client';

import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, Users, Plus, Award } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';

export default function MentorsPage() {
  const mentors = [
    { id: 'm_1', name: 'Dr. Alok Verma', domain: 'AI & Data Science', allocated: 4, status: 'Active' },
    { id: 'm_2', name: 'Samantha Reed', domain: 'Product & Growth', allocated: 6, status: 'Active' },
    { id: 'm_3', name: 'Kavita Pillai', domain: 'Fintech & Compliance', allocated: 3, status: 'Active' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Incubator Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mentor Network</h1>
            <p className="text-sm text-slate-500 mt-1">Manage mentor pool, domain expertise, and startup allocations.</p>
          </div>
          <Button className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
            <Plus className="w-4 h-4" /> Add Mentor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {mentors.map(m => (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{m.name}</h3>
                  <p className="text-xs text-slate-500">{m.domain}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-xs">
                <span className="text-slate-500">Allocated Startups:</span>
                <span className="font-bold text-slate-800">{m.allocated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
