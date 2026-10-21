'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import { supabase } from '@/backend/lib/supabase';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your registered email';
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(!!token);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    if (token) {
      const verifyToken = async () => {
        try {
          const verifyUrl = new URL('/api/v1/auth/verify-email', window.location.origin);
          verifyUrl.searchParams.append('token_hash', token);
          verifyUrl.searchParams.append('type', 'email');

          const res = await fetch(verifyUrl.toString());
          const data = await res.json();

          if (data.success) {
            setVerified(true);
            setTimeout(() => {
              router.push('/auth/choose-role');
            }, 2000);
          }
        } catch (err) {
          console.error('Verification error:', err);
        } finally {
          setIsVerifying(false);
        }
      };
      verifyToken();
    }
  }, [token, router]);

  // Listen for Supabase session after user clicks Gmail confirmation link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email && !verified) {
        // Mark email_verified in public.users via API
        try {
          await fetch('/api/v1/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session.user.email, token: 'mock-token' }),
          });
        } catch (e) {
          // Best-effort: Supabase Auth already confirmed the email
        }
        setVerified(true);
        setIsVerifying(false);
        setTimeout(() => {
          router.push('/auth/choose-role');
        }, 2000);
      }
    });
    return () => subscription.unsubscribe();
  }, [router, verified]);

  const handleResend = async () => {
    setResending(true);
    setResendMessage(null);
    try {
      if (email && email.includes('@')) {
        const { error } = await supabase.auth.resend({ type: 'signup', email });
        if (error) {
          const msg = (error.message || '').toLowerCase();
          if (msg.includes('rate limit') || msg.includes('too many') || (error as any).status === 429) {
            setIsRateLimited(true);
            setResendMessage('Too many email requests sent. Please wait 24hours before requesting a new link.');
            return;
          }
          setResendMessage(error.message || 'Failed to resend. Please try again later.');
          return;
        }
      }
      setResendMessage('Verification link resent successfully!');
    } catch {
      setResendMessage('Failed to resend. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-sm text-center">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center mb-4">
          {verified ? <CheckCircle2 className="w-7 h-7 text-emerald-500" /> : <Mail className="w-7 h-7" />}
        </div>

        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {verified ? 'Email Verified Successfully!' : 'Verify Your Email'}
        </h1>

        {verified ? (
          <div className="mt-3 space-y-4">
            <p className="text-xs text-slate-500">
              Your email has been verified. Redirecting you to select your role...
            </p>
            <div className="flex items-center justify-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span className="text-xs font-semibold text-blue-600">Redirecting...</span>
            </div>
            <Link
              href="/auth/choose-role"
              className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Continue to Role Selection
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              We have sent a verification link to <strong className="text-slate-900">{email}</strong>. Please check your inbox and click the link to verify your email.
            </p>

            {isVerifying && (
              <p className="text-xs font-semibold text-blue-600 flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying link...</span>
              </p>
            )}

            {resendMessage && (
              <p
                className={`text-xs font-semibold p-3 rounded-xl border leading-relaxed ${
                  isRateLimited
                    ? 'text-amber-800 bg-amber-50 border-amber-200'
                    : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                }`}
              >
                {resendMessage}
              </p>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleResend}
                disabled={resending || isRateLimited}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
              >
                {resending && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>{isRateLimited ? 'Resend Blocked (Rate Limited)' : 'Resend Verification Link'}</span>
              </button>

              <Link
                href="/signup"
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition"
              >
                Back to Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
