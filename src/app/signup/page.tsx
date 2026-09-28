'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  Users,
  Building2,
  Rocket,
  ArrowRight,
  Star,
  Check,
} from 'lucide-react';
import { useAuth } from '@/frontend/context/AuthContext';
import { signInWithGoogle } from '@/backend/services/auth';
import Logo from '@/frontend/components/ui/Logo';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [startupName, setStartupName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signup } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please accept terms & privacy policy to continue.');
      return;
    }
    setIsLoading(true);
    setError(null);
    const res = await signup(email, password);
    if (res.success) {
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } else {
      setError(res.error || 'Failed to create account');
    }
    setIsLoading(false);
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google signup failed');
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

      <div />

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

        {/* Right Side: Signup / Get Started Card matching image */}
        <div className="lg:col-span-6 xl:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_15px_35px_-5px_rgba(37,99,235,0.08),0_5px_15px_rgba(0,0,0,0.03)] p-8 sm:p-9 transition-all">
            <div className="text-center mb-5">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Get Started</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Choose how you want to access your founder account
              </p>
            </div>

            {/* Google Signup */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-2.5 h-11 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-xs font-semibold text-slate-700"
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
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute px-2.5 bg-white text-[11px] text-slate-400">or</span>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-3.5">
              {/* Field 1: Full Name */}
              <div>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name / Founder Name"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                </div>
              </div>

              {/* Field 2: Startup Name with building & rocket on right */}
              <div>
                <div className="relative flex items-center">
                  <Users className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="Startup / Project Name"
                    className="w-full h-11 pl-10 pr-16 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                  <div className="absolute right-3.5 flex items-center gap-1.5 text-slate-400 pointer-events-none">
                    <Building2 className="w-3.5 h-3.5" />
                    <Rocket className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Field 3: Work Email */}
              <div>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Work Email"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                </div>
              </div>

              {/* Field 4: Password with 3 green bars and 'Strong' */}
              <div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-11 pl-10 pr-24 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                  <div className="absolute right-3 flex items-center gap-1.5 pointer-events-none">
                    <div className="flex gap-1">
                      <span className="w-3 h-1 rounded-full bg-emerald-500" />
                      <span className="w-3 h-1 rounded-full bg-emerald-500" />
                      <span className="w-3 h-1 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600">Strong</span>
                  </div>
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-start gap-2 pt-0.5 text-xs">
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-cyan-500 mt-0.5 cursor-pointer"
                />
                <span className="text-slate-600 text-[11px] leading-tight">
                  I agree to the Terms of Service & Incubator Code of Conduct
                </span>
              </div>

              {/* Submit CTA */}
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
                      <span>Get Started</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer matching image */}
            <div className="text-center pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
              <span>Already a user? </span>
              <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div />
    </div>
  );
}
