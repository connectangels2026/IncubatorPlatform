'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import { supabase } from '@/backend/lib/supabase';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your registered email';
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(!!token);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const verifyToken = async () => {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });
          if (!error) {
            setVerified(true);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsVerifying(false);
        }
      };
      verifyToken();
    }
  }, [token]);

  const handleResend = async () => {
    setResending(true);
    setResendMessage(null);
    try {
      if (email && email.includes('@')) {
        await supabase.auth.resend({ type: 'signup', email });
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
              Your email has been verified. You can now access your incubator dashboard.
            </p>
            <Link
              href="/login"
              className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Continue to Login
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              We have sent a verification link to <strong className="text-slate-900">{email}</strong>. Please check your inbox and click the link to activate your account.
            </p>

            {isVerifying && (
              <p className="text-xs font-semibold text-blue-600 flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying link...</span>
              </p>
            )}

            {resendMessage && (
              <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                {resendMessage}
              </p>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {resending && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Resend Verification Link</span>
              </button>

              <Link
                href="/login"
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition"
              >
                Back to Sign In
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
