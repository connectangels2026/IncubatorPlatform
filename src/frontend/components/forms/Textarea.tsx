'use client';

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = '', id, ...props }: TextareaProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}

      <textarea
        id={inputId}
        rows={4}
        className={`w-full text-xs rounded-xl bg-white border transition duration-150 p-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 resize-y ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-[11px] text-red-600 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
