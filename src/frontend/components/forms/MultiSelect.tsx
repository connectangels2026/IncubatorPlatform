'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface MultiSelectProps {
  label?: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((item) => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const removeTag = (opt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== opt));
  };

  return (
    <div className="w-full space-y-1.5 relative">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[42px] p-2 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center gap-1.5 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500"
      >
        {selected.length === 0 ? (
          <span className="text-xs text-slate-400 pl-1.5">{placeholder}</span>
        ) : (
          selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/80"
            >
              {item}
              <button onClick={(e) => removeTag(item, e)} className="hover:text-blue-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200/90 max-h-48 overflow-y-auto p-1 animate-in fade-in duration-100">
          {options.map((opt) => {
            const isChecked = selected.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => toggleOption(opt)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition ${
                  isChecked ? 'bg-blue-50/70 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{opt}</span>
                {isChecked && <Check className="w-4 h-4 text-blue-600" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
