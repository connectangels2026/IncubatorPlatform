'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/context/AuthContext';
import {
  Menu,
  Building2,
  ChevronRight,
  Settings,
  LogOut,
  User,
} from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface IncubatorTopBarProps {
  breadcrumbs?: BreadcrumbItem[];
  onOpenMobileSidebar?: () => void;
  orgNameOverride?: string;
}

export function IncubatorTopBar({
  breadcrumbs,
  onOpenMobileSidebar,
  orgNameOverride,
}: IncubatorTopBarProps) {
  const router = useRouter();
  const { user, organization, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const orgName =
    orgNameOverride ||
    organization?.name ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('org_name') || localStorage.getItem('user_org_name')
      : null) ||
    'My Incubator';

  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user as any)?.name ||
    user?.email?.split('@')[0] ||
    'Incubator Admin';

  const userEmail = user?.email || '';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      if (logout) await logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const monogram = (userDisplayName || 'IA').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0">
      {/* Left: Mobile hamburger + Breadcrumbs + Incubator Chip */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="p-1.5 -ml-1.5 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden transition"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
          <Link href="/incubator" className="hover:text-blue-600 transition font-medium">
            Dashboard
          </Link>
          {breadcrumbs && breadcrumbs.length > 0 && breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-blue-600 transition font-medium truncate">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-900 truncate">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Incubator Chip on the Left */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 ml-2">
          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-semibold text-xs text-slate-800 truncate max-w-[200px]">
            {orgName}
          </span>
        </div>
      </div>

      {/* Right: Avatar Dropdown Only */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-100 transition cursor-pointer"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {monogram}
          </div>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-900 truncate">{userDisplayName}</p>
              {userEmail && <p className="text-[11px] text-slate-500 truncate mt-0.5">{userEmail}</p>}
              <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Incubator manager
              </div>
            </div>

            <div className="py-1">
              <Link
                href="/incubator/settings"
                onClick={() => setDropdownOpen(false)}
                className="w-full px-4 py-2 text-xs text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Incubator settings</span>
              </Link>
            </div>

            <div className="border-t border-slate-100 my-1" />

            <div className="px-1.5 pb-0.5">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-3 py-2 text-xs text-left font-normal text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2.5 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default IncubatorTopBar;

