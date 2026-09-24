'use client';

import React from 'react';
import Link from 'next/link';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-slate-200/80 px-6 sm:px-12 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <Link href="/" className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Arba Incubator
        </Link>

        <div className="flex items-center gap-6 text-xs font-semibold text-slate-600">
          <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
          <Link href="/login" className="hover:text-blue-600 transition">Sign In</Link>
          <Link href="/signup" className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 max-w-6xl">{children}</main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 px-12 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Incubator Platform. All rights reserved.
      </footer>
    </div>
  );
}
