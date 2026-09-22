'use client';

import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

export function Checkbox({ label, className = '', id, ...props }: CheckboxProps) {
  const checkboxId = id || Math.random().toString(36).substring(7);

  return (
    <label htmlFor={checkboxId} className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <input
        type="checkbox"
        id={checkboxId}
        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-2 cursor-pointer"
        {...props}
      />
      <span className="text-xs text-slate-700">{label}</span>
    </label>
  );
}

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  label?: string;
}

export function RadioGroup({ name, options, selectedValue, onChange, label }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>}
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
            selectedValue === opt.value
              ? 'border-blue-600 bg-blue-50/20'
              : 'border-slate-200 hover:bg-slate-50'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={selectedValue === opt.value}
            onChange={() => onChange(opt.value)}
            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
          />
          <div>
            <p className="text-xs font-semibold text-slate-900">{opt.label}</p>
            {opt.description && <p className="text-[11px] text-slate-400 mt-0.5">{opt.description}</p>}
          </div>
        </label>
      ))}
    </div>
  );
}
