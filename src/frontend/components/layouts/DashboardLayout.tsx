'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/frontend/context/AuthContext';
import { IncubatorTopBar, BreadcrumbItem } from '@/frontend/components/incubator/IncubatorTopBar';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  headerActions?: React.ReactNode;
  fluid?: boolean;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  breadcrumbs,
  headerActions,
  fluid = false,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { organization, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orgName, setOrgName] = useState('My Incubator');

  useEffect(() => {
    if (organization?.name) {
      setOrgName(organization.name);
    } else if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('org_name') || localStorage.getItem('user_org_name');
      if (cached) setOrgName(cached);
    }
  }, [organization?.name]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const resolvedBreadcrumbs: BreadcrumbItem[] =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs
      : title
      ? [{ label: title }]
      : [];

  return (
    <div className="h-screen flex bg-slate-50 text-slate-800 antialiased overflow-hidden font-sans">
      {/* Sidebar with mobile drawer & desktop hover support */}
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Unified Top Navbar */}
        <IncubatorTopBar
          breadcrumbs={resolvedBreadcrumbs}
          onOpenMobileSidebar={() => setMobileOpen(true)}
          orgNameOverride={orgName}
        />

        {/* Main Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-7xl mx-auto px-6 py-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
