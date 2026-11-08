'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import { DashboardLayout } from '@/frontend/components/layouts/DashboardLayout';
import StartupDashboard from '@/frontend/components/startup-dashboard/StartupDashboard';
import { StartupDetailModal } from '@/frontend/components/startups/StartupDetailModal';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/frontend/context/AuthContext';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StartupPreviewPage() {
  return (
    <ProtectedRoute>
      <StartupPreviewContent />
    </ProtectedRoute>
  );
}

function StartupPreviewContent() {
  const params = useParams();
  const { organization } = useAuth();
  const startupId = params?.id as string;

  const [startup, setStartup] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    async function fetchStartup() {
      if (!startupId) return;
      setIsLoading(true);
      setNotFound(false);
      try {
        const res = await apiClient.get(`/startups/${startupId}`);
        const data = res.data?.data;

        if (!data) {
          setNotFound(true);
          return;
        }

        // Validate organization ownership: only allow startups belonging to the incubator's organization
        const currentOrgId =
          organization?.id ||
          (typeof window !== 'undefined' ? localStorage.getItem('org_id') : null);

        if (currentOrgId && data.organization_id && data.organization_id !== currentOrgId) {
          setNotFound(true);
          return;
        }

        setStartup(data);
      } catch (err: any) {
        console.warn('Error fetching startup for preview:', err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStartup();
  }, [startupId, organization?.id]);

  const startupName = startup?.startup_name || startup?.name || 'Startup';

  const breadcrumbs = [
    { label: 'Dashboard', href: '/incubator' },
    { label: 'Startups', href: '/incubator/startups' },
    { label: notFound ? 'Not Found' : startupName, href: '/incubator/startups' },
    { label: 'Preview' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs} fluid={true}>
        <div className="min-h-[500px] w-full flex flex-col items-center justify-center gap-3 bg-[#F8FAFC]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading startup preview...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || !startup) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs} fluid={true}>
        <div className="min-h-[500px] w-full flex flex-col items-center justify-center px-4 py-16 bg-[#F8FAFC]">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Startup Not Found</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              This startup could not be found or does not belong to your incubator organization.
            </p>
            <div className="pt-2">
              <Link
                href="/incubator/startups"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Startups</span>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} fluid={true}>
      <StartupDashboard
        startupId={startupId}
        initialStartup={startup}
        readOnly={true}
        onEditAsIncubator={() => setIsDrawerOpen(true)}
        backUrl="/incubator/startups"
      />

      {/* Incubator Edit Drawer */}
      <StartupDetailModal
        startup={startup}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAllocateMentorClick={() => {}}
        onRemoveMentor={() => {}}
        onAllocateInvestorClick={() => {}}
        onUpdateInvestorInterest={() => {}}
        onRemoveInvestor={() => {}}
        onAddCoIncubatorClick={() => {}}
        onSignMOUClick={() => {}}
        onRemoveCoIncubator={() => {}}
        onUpdateStartup={(updated) => {
          setStartup((prev: any) => ({ ...prev, ...updated }));
        }}
      />
    </DashboardLayout>
  );
}

