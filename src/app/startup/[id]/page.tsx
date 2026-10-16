'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/frontend/context/AuthContext';
import { Clock, CheckCircle2, FileText, Building2, ArrowRight } from 'lucide-react';

export default function StartupDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const userId = params?.id as string;

  const [appStatus, setAppStatus] = useState('pending_super_admin_review');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 sm:p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Startup Dashboard</h1>
        <p className="text-slate-600 mb-8">User ID: <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">{userId || user?.id}</span></p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Application Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Application Status</h2>
            </div>
            <p className="text-sm font-semibold text-amber-600 mb-1">{appStatus}</p>
            <p className="text-sm text-slate-500">Waiting for super admin assignment to an incubator.</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <a
              href="/startup/application"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition"
            >
              <FileText className="w-4 h-4" />
              Apply / Manage Application
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
