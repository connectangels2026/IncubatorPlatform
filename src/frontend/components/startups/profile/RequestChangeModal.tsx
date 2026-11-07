'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface RequestChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  startupId: string;
  startupName: string;
  initialField?: string;
  onSuccess: (field: string, note: string) => void;
}

const FIELD_OPTIONS = [
  'Basic information',
  'Problem & solution',
  'Market & business model',
  'Financials & traction',
  'Legal & compliance',
  'Documents & pitch deck',
  'Founder & team contact',
  'Other',
];

export function RequestChangeModal({
  isOpen,
  onClose,
  startupId,
  startupName,
  initialField = 'Basic information',
  onSuccess,
}: RequestChangeModalProps) {
  const [field, setField] = useState(initialField);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setField(initialField);
      setNote('');
      setError(null);
      setIsSuccess(false);
    }
  }, [isOpen, initialField]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Please provide details for the requested change.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const orgId = searchParams?.get('org') || (typeof window !== 'undefined' ? localStorage.getItem('org_id') : null);

      await apiClient.put(
        `/startups/${startupId}`,
        {
          action: 'request_change',
          field,
          note: note.trim(),
        },
        {
          params: orgId ? { org_id: orgId } : undefined,
        }
      );

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(field, note.trim());
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Failed to submit change request:', err);
      setError(err?.response?.data?.error || 'Failed to submit change request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-sans">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Request change</h3>
              <p className="text-[11px] text-slate-500">Notify founder about profile updates</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-in zoom-in-75 duration-200" />
            <h4 className="text-sm font-semibold text-slate-900">Change request logged</h4>
            <p className="text-xs text-slate-500">The request has been written to the activity log.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Section or field
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {FIELD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Change details & instructions
              </label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe what information needs to be updated by the startup..."
                className="w-full text-xs border border-slate-300 rounded-lg p-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Founder will see this request and can update their profile directly.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

