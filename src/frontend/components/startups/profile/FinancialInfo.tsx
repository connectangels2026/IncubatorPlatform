import React from 'react';
import { StartupItem } from '../types';

interface FinancialInfoProps {
  startup: StartupItem;
}

export function FinancialInfo({ startup }: FinancialInfoProps) {
  return (
    <div className="p-5 border-t border-slate-100 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Monthly MRR</span>
          <p className="text-base font-extrabold text-slate-900 mt-0.5 tabular-nums">
            ${startup.mrr.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">ARR</span>
          <p className="text-base font-extrabold text-slate-900 mt-0.5 tabular-nums">
            ${startup.arr.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Capital Raised</span>
          <p className="text-base font-extrabold text-blue-600 mt-0.5">{startup.funding}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Customers</span>
          <p className="text-base font-extrabold text-slate-900 mt-0.5 tabular-nums">
            {startup.customers.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
        <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
          <span className="text-slate-500">Monthly Burn Rate:</span>
          <span className="font-bold text-slate-800">{startup.burn || '$15,000/mo'}</span>
        </div>
        <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
          <span className="text-slate-500">Cash Runway:</span>
          <span className="font-bold text-emerald-600">{startup.runway || '18 Months'}</span>
        </div>
      </div>
    </div>
  );
}
