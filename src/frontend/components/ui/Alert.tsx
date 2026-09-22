'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export function Alert({ type = 'info', title, message, onClose, className = '' }: AlertProps) {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900 icon-text-emerald-600',
    error: 'bg-red-50 border-red-200 text-red-900 icon-text-red-600',
    warning: 'bg-amber-50 border-amber-200 text-amber-900 icon-text-amber-600',
    info: 'bg-blue-50 border-blue-200 text-blue-900 icon-text-blue-600',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles[type]} ${className}`} role="alert">
      {icons[type]}
      <div className="flex-1">
        {title && <h4 className="text-sm font-semibold mb-0.5">{title}</h4>}
        <p className="text-xs leading-relaxed opacity-90">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 rounded hover:bg-black/5 transition">
          <X className="w-4 h-4 opacity-70" />
        </button>
      )}
    </div>
  );
}
