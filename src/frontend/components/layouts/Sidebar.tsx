'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/frontend/components/ui/Logo';
import {
  LayoutDashboard,
  ClipboardCheck,
  Building2,
  Users,
  GraduationCap,
  Calendar,
  Settings,
  ArrowLeft,
  LogOut,
  X,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

export const DEFAULT_INCUBATOR_NAV: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Applications', href: '/dashboard/applications', icon: ClipboardCheck, count: 42 },
];

interface SidebarProps {
  items?: NavItem[];
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

export function Sidebar({
  items = DEFAULT_INCUBATOR_NAV,
  mobileOpen = false,
  onCloseMobile,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      router.push('/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Desktop spacer to prevent page layout reflow while sidebar floats on hover */}
      <div className="hidden md:block w-20 shrink-0 transition-all duration-300 pointer-events-none" />

      {/* Sidebar element */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          /* Mobile Drawer */
          mobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${
          /* Desktop Hover Expansion */
          isHovered ? 'md:w-64 md:shadow-2xl' : 'md:w-20'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header - ONLY LOGO ICON (no text) centered perfectly */}
          <div className="h-16 border-b border-slate-100 flex items-center justify-center relative px-2 shrink-0">
            <Logo
              size="lg"
              showText={false}
              href="/"
              className="p-2 rounded-xl hover:bg-slate-100/80 transition flex items-center justify-center"
            />
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="absolute right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 md:hidden"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Section */}
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden">
            <div
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0 hidden md:block'
              }`}
            >
              Navigation
            </div>

            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`group relative flex items-center h-11 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${isHovered ? 'px-3.5 justify-start' : 'justify-center md:px-0 px-3.5'}`}
                  title={!isHovered ? item.label : undefined}
                >
                  {/* Left indicator bar when collapsed */}
                  {isActive && !isHovered && (
                    <span className="hidden md:block absolute left-1 w-1 h-6 bg-blue-600 rounded-r-full" />
                  )}

                  <div className="flex items-center min-w-0">
                    <Icon
                      className={`w-5 h-5 shrink-0 transition ${
                        isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span
                      className={`whitespace-nowrap overflow-hidden transition-all duration-200 font-medium ${
                        isHovered
                          ? 'max-w-[130px] opacity-100 ml-3'
                          : 'max-w-0 opacity-0 md:hidden ml-3'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all duration-200 ${
                        isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      } ${
                        isHovered ? 'opacity-100 ml-auto' : 'opacity-0 max-w-0 overflow-hidden md:hidden'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-3 border-t border-slate-100 space-y-1 shrink-0 bg-white">
          <Link
            href="/"
            onClick={onCloseMobile}
            className={`group flex items-center h-10 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all ${
              isHovered ? 'px-3.5 justify-start' : 'justify-center md:px-0 px-3.5'
            }`}
            title={!isHovered ? 'Back to Website' : undefined}
          >
            <ArrowLeft className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-slate-700" />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${
                isHovered
                  ? 'max-w-[130px] opacity-100 ml-3'
                  : 'max-w-0 opacity-0 md:hidden ml-3'
              }`}
            >
              Back to Website
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className={`group w-full flex items-center h-10 rounded-xl text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all ${
              isHovered ? 'px-3.5 justify-start' : 'justify-center md:px-0 px-3.5'
            }`}
            title={!isHovered ? 'Log Out' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-rose-600" />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${
                isHovered
                  ? 'max-w-[130px] opacity-100 ml-3'
                  : 'max-w-0 opacity-0 md:hidden ml-3'
              }`}
            >
              Log Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
