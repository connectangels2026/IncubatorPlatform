'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Star,
  Check,
} from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';
import { signInWithGoogle } from '@/backend/services/auth';
import Logo from '@/frontend/components/ui/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const res = await login(email, password);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Invalid credentials');
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    }
  };

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="relative min-h-screen bg-[#f8fafc] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden select-none">
      {/* Ambient background glow spots & dot grid matching mockup */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -left-24 w-[420px] h-[420px] rounded-full bg-cyan-400/35 blur-[120px]" />
        <div className="absolute top-10 -right-24 w-[440px] h-[440px] rounded-full bg-blue-500/25 blur-[130px]" />
        <div className="absolute -bottom-24 -left-20 w-[420px] h-[420px] rounded-full bg-blue-400/30 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-[460px] h-[460px] rounded-full bg-cyan-300/35 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.35)_1.2px,transparent_0)] [background-size:24px_24px]" />
      </div>

      {/* Top Right Floating Action */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex justify-end">
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 text-xs font-semibold text-slate-700 hover:text-blue-600 transition"
        >
          <span>New to Arba360? Apply / Register</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Content: Left Hero + Right Card */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center my-auto py-4">
        {/* Left Side: Brand Showcase matching image */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-7">
          {/* Logo */}
          <Logo size="lg" href="/" />

          {/* Headline - Exact 3-line quote formatting */}
          <h1 className="text-[34px] sm:text-[40px] lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.18]">
            &lsquo;Accelerate Your<br />
            Startup Journey with<br />
            <span className="text-[#2563eb]">Arba360</span>&rsquo;
          </h1>

          {/* Feature Bullets with matching circular checkmark */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3 text-slate-800 font-medium text-sm sm:text-[15px]">
              <div className="w-5 h-5 rounded-full border-[1.5px] border-[#2563eb] flex items-center justify-center text-[#2563eb] shrink-0">
                <svg className="w-3 h-3 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span>Seed Funding Support</span>
            </div>

            <div className="flex items-center gap-3 text-slate-800 font-medium text-sm sm:text-[15px]">
              <div className="w-5 h-5 rounded-full border-[1.5px] border-[#2563eb] flex items-center justify-center text-[#2563eb] shrink-0">
                <svg className="w-3 h-3 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span>1-on-1 Dedicated Mentorship</span>
            </div>

            <div className="flex items-center gap-3 text-slate-800 font-medium text-sm sm:text-[15px]">
              <div className="w-5 h-5 rounded-full border-[1.5px] border-[#2563eb] flex items-center justify-center text-[#2563eb] shrink-0">
                <svg className="w-3 h-3 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span>Demo Day Investor Access</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4 pt-3">
            <div className="grid grid-cols-3 gap-1.5 w-24">
              {avatars.map((url, i) => (
                <div key={i} className="w-7 h-7 rounded-full overflow-hidden border border-white shadow-2xs">
                  <img src={url} alt="Founder" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-snug">
                Joined by <span className="text-slate-900 font-extrabold">500+ funded</span><br />
                startups and 12 cohorts
              </p>
              <div className="flex items-center gap-1 mt-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card matching image */}
        <div className="lg:col-span-6 xl:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_15px_35px_-5px_rgba(37,99,235,0.08),0_5px_15px_rgba(0,0,0,0.03)] p-8 sm:p-9 transition-all">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back, Founder</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Sign in to access your startup dashboard, mentors,<br className="hidden sm:block" /> and program resources.
              </p>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 h-11 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-xs font-semibold text-slate-700"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 h-11 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-xs font-semibold text-slate-700"
              >
                <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-5">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute px-3 bg-white text-[11px] text-slate-400">
                Or continue with work email
              </span>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email with icon on LEFT matching image */}
              <div>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Founder / Work Email"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                </div>
              </div>

              {/* Password with eye & lock on RIGHT matching image */}
              <div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-11 px-3.5 pr-14 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                  <div className="absolute right-3 flex items-center gap-1.5 text-slate-400">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <Lock className="w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Keep me logged in & Forgot password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-cyan-500"
                  />
                  <span>Keep me logged in</span>
                </label>
                <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-700 transition">
                  Forgot password?
                </Link>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#00d4ff] hover:from-blue-700 hover:to-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(0,180,255,0.35)] transition-all cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Switch to Super Admin Portal matching image */}
            <div className="text-center pt-5 mt-5 border-t border-slate-100 text-xs text-slate-500">
              <span>Looking for Platform Governance? </span>
              <Link href="/super-admin/login" className="font-semibold text-blue-600 hover:underline">
                Switch to Super Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div />
    </div>
  );
}
