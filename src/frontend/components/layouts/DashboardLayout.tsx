'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Avatar } from '../ui/Avatar';
import { Bell, Search } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: { name: string; email: string; avatarUrl?: string };
}

export function DashboardLayout({ children, user = { name: 'Admin User', email: 'admin@incubator.com' } }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 w-72">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <Avatar name={user.name} src={user.avatarUrl} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 sm:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
