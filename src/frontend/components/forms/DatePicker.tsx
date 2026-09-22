'use client';

import React from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function DatePicker({ label, error, className = '', ...props }: DatePickerProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
      <div className="relative">
        <input
          type="date"
          className={`w-full text-xs rounded-xl bg-white border border-slate-200 pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${className}`}
          {...props}
        />
        <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export function TimePicker({ label, error, className = '', ...props }: DatePickerProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
      <div className="relative">
        <input
          type="time"
          className={`w-full text-xs rounded-xl bg-white border border-slate-200 pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${className}`}
          {...props}
        />
        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}
