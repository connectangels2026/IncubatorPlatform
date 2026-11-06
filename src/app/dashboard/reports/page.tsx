'use client';

import React from 'react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import { DashboardLayout } from '@/frontend/components/layouts/DashboardLayout';
import { Download, FileText, BarChart3 } from 'lucide-react';
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
      <DashboardLayout title="Reports & Analytics">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <BarChart3 className="w-7 h-7 sm:w-8 h-8 text-blue-600" />
                Incubator Reports & Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Export structured KPI summaries and quarterly portfolio analytics.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-xs hover:border-slate-300 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{r.period} • {r.type} ({r.size})</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0 ml-3">
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
