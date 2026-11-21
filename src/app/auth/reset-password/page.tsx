'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/backend/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  // Consume the recovery token from the reset link so Supabase establishes
  // a temporary session. updateUser() (used below) requires an active session.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get('token_hash');
    const type = params.get('type') || 'recovery';

    if (!token_hash) {
      setReady(true);
      return;
    }

    let cancelled = false;
    (async () => {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'recovery' | 'email' | 'signup',
      });
      if (cancelled) return;
      if (verifyError) {
        setError(verifyError.message || 'Invalid or expired reset link.');
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let updated = false;
      let lastErrMsg = '';

      try {
        const { error: updateErr } = await supabase.auth.updateUser({
          password,
        });
        if (!updateErr) {
          updated = true;
        } else {
          lastErrMsg = updateErr.message;
        }
      } catch (clientErr: any) {
        lastErrMsg = clientErr?.message || '';
      }

      // If client-side failed (e.g. Failed to fetch or CORS), fall back to server API route
      if (!updated) {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const email = sessionData?.session?.user?.email;

        const res = await fetch('/api/v1/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ password, email, access_token: token }),
        });

        const data = await res.json().catch(() => null);
        if (res.ok && data?.success) {
          updated = true;
        } else {
          throw new Error(data?.error || lastErrMsg || 'Failed to update password');
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('failed to fetch') || msg.includes('network')) {
        setError('Network error updating password. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to update password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-sm">
        {success ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Password Reset Complete
            </h1>
            <p className="text-xs text-slate-500">
              Your password has been updated. Redirecting to login...
            </p>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Set New Password
            </h1>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Enter your new secure password below.
            </p>

            {error && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium space-y-2">
                <div>{error}</div>
                <Link
                  href="/auth/forgot-password"
                  className="inline-block text-[11px] font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  Request a new reset link
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !ready}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{!ready ? 'Verifying reset link…' : 'Reset Password'}</span>
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition"
                >
                  Cancel and return to login
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
