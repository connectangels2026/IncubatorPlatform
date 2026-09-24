'use client';

import React from 'react';
import Link from 'next/link';

interface SimpleLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function SimpleLayout({ children, title, subtitle }: SimpleLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Arba Incubator
          </Link>
          {title && <h2 className="text-xl font-bold text-slate-900 mt-4">{title}</h2>}
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_15px_35px_-5px_rgba(37,99,235,0.08)] p-6 sm:p-8">
          {children}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; {new Date().getFullYear()} Incubator Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
