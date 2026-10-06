import React from 'react';
import { Users, Plus, Trash2, Calendar, MessageSquare, Award } from 'lucide-react';
import { AllocatedMentor } from '../types';

interface MentorAllocationSectionProps {
  mentors?: AllocatedMentor[];
  onOpenAllocateModal: () => void;
  onRemoveMentor: (mentorId: string) => void;
}

export function MentorAllocationSection({
  mentors = [],
  onOpenAllocateModal,
  onRemoveMentor,
}: MentorAllocationSectionProps) {
  return (
    <div className="p-5 border-t border-slate-100 space-y-4">
      {/* Header and Allocate CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Allocated Mentors
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Designated industry advisors guiding this startup.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAllocateModal}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Allocate Mentor</span>
        </button>
      </div>

      {/* Mentors List */}
      {mentors.length === 0 ? (
        <div className="p-6 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
          <p>No mentors currently allocated to this startup.</p>
          <button
            type="button"
            onClick={onOpenAllocateModal}
            className="mt-2 text-blue-600 font-semibold hover:underline text-xs inline-block"
          >
            Assign a mentor now →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors text-xs flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {mentor.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{mentor.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          mentor.type === 'SME'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {mentor.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-700">{mentor.domain}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Allocated: {mentor.allocatedDate}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveMentor(mentor.id)}
                  title="Remove allocation"
                  aria-label={`Remove mentor ${mentor.name}`}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mentor Feedback (if any) */}
              {mentor.feedback && (
                <div className="mt-1 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg">
                  <div className="flex items-center gap-1 text-amber-600 font-semibold mb-0.5">
                    <MessageSquare className="w-3 h-3" />
                    <span>Session Feedback</span>
                  </div>
                  <p className="italic text-slate-600">&ldquo;{mentor.feedback}&rdquo;</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
