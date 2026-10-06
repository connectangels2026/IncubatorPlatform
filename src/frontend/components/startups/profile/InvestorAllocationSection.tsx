import React from 'react';
import { DollarSign, Plus, Trash2, Building, ChevronDown, FileText } from 'lucide-react';
import { AllocatedInvestor } from '../types';

interface InvestorAllocationSectionProps {
  investors?: AllocatedInvestor[];
  onOpenAllocateModal: () => void;
  onUpdateInterest: (investorId: string, newLevel: AllocatedInvestor['interestLevel']) => void;
  onRemoveInvestor: (investorId: string) => void;
}

export function InvestorAllocationSection({
  investors = [],
  onOpenAllocateModal,
  onUpdateInterest,
  onRemoveInvestor,
}: InvestorAllocationSectionProps) {
  const renderInterestBadge = (level: AllocatedInvestor['interestLevel']) => {
    switch (level) {
      case 'Invested':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Offer':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Warm Lead':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="p-5 border-t border-slate-100 space-y-4">
      {/* Header and Allocate CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Allocated Investors
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            VCs, angel syndicates, and corporate venture partners tracking this round.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAllocateModal}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Allocate Investor</span>
        </button>
      </div>

      {/* Investors List */}
      {investors.length === 0 ? (
        <div className="p-6 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
          <p>No investors currently allocated to this startup.</p>
          <button
            type="button"
            onClick={onOpenAllocateModal}
            className="mt-2 text-emerald-600 font-semibold hover:underline text-xs inline-block"
          >
            Introduce an investor now →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {investors.map((investor) => (
            <div
              key={investor.id}
              className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors text-xs flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                    {investor.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{investor.name}</span>
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        {investor.company}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {investor.focusAreas.map((f, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.2 bg-white text-slate-600 border border-slate-200 rounded text-[10px]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Interest Level Dropdown */}
                  <div className="relative">
                    <select
                      value={investor.interestLevel}
                      onChange={(e) =>
                        onUpdateInterest(investor.id, e.target.value as AllocatedInvestor['interestLevel'])
                      }
                      className={`appearance-none pl-2.5 pr-7 py-1 rounded-full text-[10px] font-semibold border cursor-pointer ${renderInterestBadge(
                        investor.interestLevel
                      )}`}
                    >
                      <option value="Warm Lead">Warm Lead</option>
                      <option value="Active">Active</option>
                      <option value="Offer">Offer</option>
                      <option value="Invested">Invested</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveInvestor(investor.id)}
                    title="Remove investor allocation"
                    aria-label={`Remove investor ${investor.name}`}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Investor Notes */}
              {investor.notes && (
                <div className="mt-1 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg">
                  <div className="flex items-center gap-1 text-slate-700 font-semibold mb-0.5">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>Investment Summary / Notes</span>
                  </div>
                  <p className="text-slate-600">{investor.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
