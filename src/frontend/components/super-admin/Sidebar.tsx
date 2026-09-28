'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/frontend/components/ui/Logo';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Sliders,
  ShieldCheck,
  Settings,
  LogOut,
  BellRing,
} from 'lucide-react';

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const navItems = [
    {
      name: 'Dashboard / Overview',
      href: '/super-admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Organizations',
      href: '/super-admin/organizations',
      icon: Building2,
    },
    {
      name: 'Invoices & Billing',
      href: '/super-admin/invoices',
      icon: CreditCard,
      badge: '2 overdue',
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      name: 'Payment Reminders',
      href: '/super-admin/reminders',
      icon: BellRing,
    },
    {
      name: 'Subscriptions & Pricing',
      href: '/super-admin/pricing',
      icon: Sliders,
    },
    {
      name: 'Audit Activity Logs',
      href: '/super-admin/activity-logs',
      icon: ShieldCheck,
    },
    {
      name: 'System Settings',
      href: '/super-admin/settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Desktop spacer to prevent page content reflow */}
      <div className="hidden md:block w-20 shrink-0 transition-all duration-300 pointer-events-none" />

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none z-40 transition-all duration-300 ease-in-out ${
          isHovered ? 'w-[260px] shadow-2xl' : 'w-20'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header - ONLY LOGO ICON (no text) centered perfectly */}
          <div className="h-16 border-b border-slate-100 flex items-center justify-center relative px-2 shrink-0">
            <Logo
              size="lg"
              showText={false}
              href="/super-admin/dashboard"
              className="p-2 rounded-xl hover:bg-slate-100/80 transition flex items-center justify-center"
            />
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/super-admin/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center h-11 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${isHovered ? 'px-3.5 justify-start' : 'justify-center md:px-0 px-3.5'}`}
                  title={!isHovered ? item.name : undefined}
                >
                  {/* Active Indicator Bar on Left */}
                  {isActive && (
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-500 rounded-r-full" />
                  )}

                  <div className="flex items-center min-w-0">
                    <Icon
                      className={`w-5 h-5 shrink-0 transition ${
                        isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span
                      className={`whitespace-nowrap overflow-hidden transition-all duration-200 font-medium ${
                        isHovered
                          ? 'max-w-[150px] opacity-100 ml-3'
                          : 'max-w-0 opacity-0 md:hidden ml-3'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition-all duration-200 ${
                        item.badgeColor
                      } ${
                        isHovered ? 'opacity-100 ml-auto' : 'opacity-0 max-w-0 overflow-hidden md:hidden'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 space-y-2 shrink-0 bg-white">
          <div
            className={`p-2 rounded-xl border border-slate-200/80 bg-slate-50/70 flex items-center transition-all ${
              isHovered ? 'justify-between' : 'justify-center'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Root Admin"
                className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0"
              />
              {isHovered && (
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-800 truncate leading-none">Root Admin</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">User Admin</p>
                </div>
              )}
            </div>
            {isHovered && (
              <button
                onClick={() => router.push('/super-admin/login')}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => router.push('/super-admin/login')}
            className={`w-full py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:border-slate-300 transition shadow-2xs flex items-center justify-center gap-2 ${
              !isHovered ? 'px-0' : 'px-3'
            }`}
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${
                isHovered ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0 md:hidden'
              }`}
            >
              Sign out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
