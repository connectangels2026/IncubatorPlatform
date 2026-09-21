'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
    <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none sticky top-0 h-screen overflow-y-auto z-40">
      <div>
        {/* Brand Header */}
        <div className="p-5 pb-5 border-b border-slate-100">
          <Link href="/super-admin/dashboard" className="flex items-center gap-3 group">
            {/* Logo Chevron */}
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
                <path
                  d="M5 24L16 7L27 24"
                  stroke="url(#arbaCaretGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="arbaCaretGrad" x1="5" y1="24" x2="27" y2="7" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#06b6d4" />
                    <stop offset="1" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div>
              <h2 className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition">
                Arba Incubator
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Master Console
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/super-admin/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {/* Active Indicator Bar on Left */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-500 rounded-r-full" />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${item.badgeColor}`}
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
      <div className="p-4 border-t border-slate-100 space-y-2.5">
        <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Root Admin"
              className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate leading-none">Root Admin</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">User Admin</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/super-admin/login')}
            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => router.push('/super-admin/login')}
          className="w-full py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:border-slate-300 transition shadow-2xs text-center block"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
