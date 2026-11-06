'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/button';
import { useAuth } from '@/frontend/context/AuthContext';
import {
  Menu,
  Building2,
  ChevronRight,
  LogOut,
} from 'lucide-react';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
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
  const { user, organization, logout } = useAuth();
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

  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user as any)?.name ||
    user?.email?.split('@')[0] ||
    'Incubator Admin';

  const userEmail = user?.email || 'admin@incubator.com';

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
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center shrink-0">
          {/* Left: Mobile hamburger & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 -ml-1.5 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
              <Link href="/dashboard" className="hover:text-blue-600 transition font-medium">
                Dashboard
              </Link>
              {breadcrumbs && breadcrumbs.length > 0 ? (
                breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={i}>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-blue-600 transition font-medium truncate">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-900 truncate">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))
              ) : title ? (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span className="font-semibold text-slate-900 truncate">{title}</span>
                </>
              ) : null}
            </nav>

            {/* Incubator Workspace Identity Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200/80 ml-2">
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-bold text-xs text-slate-700 truncate max-w-[200px]">
                {orgName}
              </span>
            </div>
          </div>

          {/* Right: Actions, Links & User Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {headerActions}

            <Link href="/programs" className="hidden md:inline-flex">
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs h-8">
                Programs
              </Button>
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            {/* User Profile Info */}
            <div className="flex items-center gap-2.5">
              <Avatar name={userDisplayName} size="sm" />
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[140px]">
                  {userDisplayName}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main
          className={`flex-1 overflow-y-auto overflow-x-hidden ${
            fluid ? 'p-4 sm:p-6 lg:p-8 w-full' : 'p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
