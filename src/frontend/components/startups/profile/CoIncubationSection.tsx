import React from 'react';
import { Building2, Plus, Trash2, FileCheck2, Clock, ExternalLink } from 'lucide-react';
import { CoIncubatorItem } from '../types';

interface CoIncubationSectionProps {
  coIncubators?: CoIncubatorItem[];
  onOpenAddModal: () => void;
  onOpenSignMOUModal: (coIncubator: CoIncubatorItem) => void;
  onRemoveCoIncubator: (id: string) => void;
}

export function CoIncubationSection({
  coIncubators = [],
  onOpenAddModal,
  onOpenSignMOUModal,
  onRemoveCoIncubator,
}: CoIncubationSectionProps) {
  const renderStatusBadge = (status: CoIncubatorItem['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Terminated':
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  return (
    <div className="p-5 border-t border-slate-100 space-y-4">
      {/* Header and Add CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            Co-Incubators
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Institutional partners and partner accelerators sharing resources.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl border border-purple-200 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Co-Incubator</span>
        </button>
      </div>

      {/* Co-Incubators List */}
      {coIncubators.length === 0 ? (
        <div className="p-6 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
          <p>No partner incubators currently attached to this venture.</p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="mt-2 text-purple-600 font-semibold hover:underline text-xs inline-block"
          >
            Initiate co-incubation partnership →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {coIncubators.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors text-xs flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                    {item.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.name}</span>
                      {/* MOU Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.mouStatus === 'Signed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        MOU: {item.mouStatus}
                      </span>
                      {/* Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${renderStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span className="font-medium text-slate-700">Type: {item.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Duration: {item.durationMonths} Months
                      </span>
                      {item.equitySplit && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-purple-700">Equity: {item.equitySplit}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sign MOU Button if pending */}
                  {item.mouStatus === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => onOpenSignMOUModal(item)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <FileCheck2 className="w-3 h-3" />
                      <span>Sign MOU</span>
                    </button>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => onRemoveCoIncubator(item.id)}
                    title="Remove co-incubator"
                    aria-label={`Remove ${item.name}`}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Responsibilities / Document Link */}
              {(item.responsibilities || item.documentUrl) && (
                <div className="mt-1 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="truncate max-w-sm">
                    {item.responsibilities ? `Scope: ${item.responsibilities}` : 'Collaborative incubator partnership'}
                  </span>
                  {item.documentUrl ? (
                    <a
                      href={item.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 shrink-0 ml-2"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400">Standard Agreement</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
