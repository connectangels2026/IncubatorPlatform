'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  Calendar,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Startups', href: '/dashboard/startups', icon: Building2 },
  { label: 'Mentors', href: '/dashboard/mentors', icon: GraduationCap },
  { label: 'Investors', href: '/dashboard/investors', icon: Users },
  { label: 'Events', href: '/dashboard/events', icon: Calendar },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({ items = DEFAULT_NAV_ITEMS }: { items?: NavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center">
          <Link href="/" className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Arba Incubator
          </Link>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Support */}
      <div className="p-4 border-t border-slate-100">
        <Link
          href="/support"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Support & Docs</span>
        </Link>
      </div>
    </aside>
  );
}
