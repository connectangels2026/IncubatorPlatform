'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/super-admin/dashboard');
    }, 800);
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Ambient background blur spots & dot grid matching image */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-cyan-400/25 blur-[90px]" />
        <div className="absolute top-10 -right-16 w-96 h-96 rounded-full bg-blue-500/20 blur-[110px]" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 rounded-full bg-cyan-300/25 blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-blue-400/20 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.30)_1.2px,transparent_0)] [background-size:28px_28px]" />
      </div>

      <div className="relative z-10 w-full max-w-[460px] flex flex-col items-center">
        {/* Header Branding */}
        <div className="flex items-center justify-center mb-8">
          <Link
            href="/"
            className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent hover:opacity-90 transition"
          >
            Arba Incubator
          </Link>
        </div>

        {/* Super Admin Login Card */}
        <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-[0_15px_35px_-5px_rgba(37,99,235,0.08),0_5px_15px_rgba(0,0,0,0.03)] p-8 sm:p-10 transition-all">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Super Admin Authentication</h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Access multi-tenant management and platform-wide controls
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Super Admin Work Email"
                  className="w-full h-12 px-4 pr-11 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition bg-slate-50/30 focus:bg-white"
                />
                <Mail className="absolute right-4 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Security Password / Passkey"
                  className="w-full h-12 px-4 pr-16 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition bg-slate-50/30 focus:bg-white"
                />
                <div className="absolute right-3.5 flex items-center gap-1.5 text-slate-400">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <Lock className="w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-cyan-500 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="font-medium text-slate-500 hover:text-blue-600 transition">
                Forgot Master Credentials?
              </a>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(6,182,212,0.35)] hover:shadow-[0_8px_25px_rgba(6,182,212,0.45)] transition-all cursor-pointer disabled:opacity-75 active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Switch Portal Card */}
        <div className="w-full mt-6 bg-white/90 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm backdrop-blur-sm">
          <div className="text-left">
            <p className="text-xs text-slate-500 font-medium">Looking for Organization Portal?</p>
            <p className="text-xs font-semibold text-slate-800">Switch to Tenant Admin Login →</p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition shadow-xs"
          >
            Clean outline
          </Link>
        </div>
      </div>
    </div>
  );
}
