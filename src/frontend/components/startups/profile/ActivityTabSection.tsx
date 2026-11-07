'use client';

import React from 'react';
import { Clock, MessageSquare, CheckCircle2, AlertCircle, User, ArrowRight } from 'lucide-react';
import { StartupItem } from '../types';

interface ActivityTabSectionProps {
  startup: StartupItem;
  onRequestChange: (sectionName: string) => void;
}

export function ActivityTabSection({ startup, onRequestChange }: ActivityTabSectionProps) {
  const logs = startup.activity_logs || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            Activity & audit history ({logs.length})
          </h4>
          <p className="text-[11px] text-slate-500">
            Chronological audit log of incubator adjustments, updates, and change requests.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRequestChange('General')}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-md transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>New change request</span>
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="py-8 px-4 bg-slate-50/60 rounded-xl border border-slate-200/80 text-center text-xs text-slate-500 space-y-2">
          <Clock className="w-8 h-8 text-slate-300 mx-auto" />
          <p>No activity records logged for this startup yet.</p>
          <button
            type="button"
            onClick={() => onRequestChange('General')}
            className="text-indigo-600 font-medium hover:underline inline-flex items-center gap-1 text-xs"
          >
            Submit a change request →
          </button>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {logs.map((log: any, idx: number) => {
            const isChangeRequest = log.action === 'startup_change_requested';
            const isUpdate = log.action === 'startup_updated_by_incubator' || log.action?.includes('update');
            const dateStr = log.created_at
              ? new Date(log.created_at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : 'Recent';

            return (
              <div key={log.id || idx} className="relative group">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white ring-4 ring-white ${
                    isChangeRequest
                      ? 'bg-amber-500'
                      : isUpdate
                      ? 'bg-indigo-600'
                      : 'bg-slate-400'
                  }`}
                >
                  {isChangeRequest ? (
                    <MessageSquare className="w-2.5 h-2.5" />
                  ) : (
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  )}
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isChangeRequest
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : isUpdate
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isChangeRequest
                        ? 'Change request'
                        : isUpdate
                        ? 'Incubator update'
                        : 'System log'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{dateStr}</span>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed font-normal">
                    {log.description || 'Record updated.'}
                  </p>

                  {log.triggered_by && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 truncate max-w-[240px]">
                        <User className="w-3 h-3 text-slate-400" />
                        {log.triggered_by}
                      </span>
                      {log.metadata?.field && (
                        <span className="font-mono text-[10px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-600">
                          {log.metadata.field}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

