'use client';

import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import { DashboardLayout } from '@/frontend/components/layouts/DashboardLayout';

export default function ReportsPage() {
  const reports = [
    { title: 'Startup portfolio health report', type: 'PDF', period: 'Q3 2026', size: '2.4 MB' },
    { title: 'Funding & capital deployed summary', type: 'XLSX', period: 'FY 2025-26', size: '1.1 MB' },
    { title: 'Mentorship sessions & feedback log', type: 'CSV', period: 'September 2026', size: '480 KB' },
    { title: 'Cohort progress & graduation milestones', type: 'PDF', period: 'Cohort 2026-B', size: '3.8 MB' },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={[{ label: 'Reports' }]}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Incubator reports & analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Export structured KPI summaries and quarterly portfolio analytics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-xs hover:border-slate-300 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-slate-900 text-sm truncate">{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{r.period} • {r.type} ({r.size})</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0 ml-3 h-9 rounded-lg">
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
