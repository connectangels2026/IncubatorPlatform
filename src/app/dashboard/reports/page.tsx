'use client';

import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, Download, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';

export default function ReportsPage() {
  const reports = [
    { title: 'Startup Portfolio Health Report', type: 'PDF', period: 'Q3 2026', size: '2.4 MB' },
    { title: 'Funding & Capital Deployed Summary', type: 'XLSX', period: 'FY 2025-26', size: '1.1 MB' },
    { title: 'Mentorship Sessions & Feedback Log', type: 'CSV', period: 'September 2026', size: '480 KB' },
    { title: 'Cohort Progress & Graduation Milestones', type: 'PDF', period: 'Cohort 2026-B', size: '3.8 MB' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Incubator Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Incubator Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Export structured KPI summaries and quarterly portfolio analytics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{r.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{r.period} • {r.type} ({r.size})</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
