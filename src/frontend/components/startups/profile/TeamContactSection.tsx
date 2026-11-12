'use client';

import React from 'react';
import { Mail, Phone, Users, MessageSquare, ExternalLink } from 'lucide-react';
import { StartupItem, TeamMember } from '../types';

interface TeamContactSectionProps {
  startup: StartupItem;
  onRequestChange: (sectionName: string) => void;
}

export function TeamContactSection({ startup, onRequestChange }: TeamContactSectionProps) {
  const founderName = startup.founder_name || startup.founder || 'Founder';
  const founderEmail = startup.founder_email || startup.founderEmail || '';
  const founderPhone = startup.founder_phone || startup.founderPhone || '';
  const teamList: TeamMember[] = startup.teamMembers || startup.team || [];

  return (
    <div className="space-y-6">
      {/* 1. Founder & Primary Contact */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Primary founder contact
            </h4>
            <p className="text-[11px] text-slate-500">
              Lead contact and executive representation for this startup.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRequestChange('Founder contact')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-md transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Request change</span>
          </button>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
              {founderName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{founderName}</p>
              <p className="text-xs text-indigo-600 font-medium">Founder & CEO</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {founderEmail ? (
                <a href={`mailto:${founderEmail}`} className="hover:text-indigo-600 hover:underline">
                  {founderEmail}
                </a>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {founderPhone ? (
                <a href={`tel:${founderPhone}`} className="hover:text-indigo-600 hover:underline">
                  {founderPhone}
                </a>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Team Members */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Team members ({teamList.length})
            </h4>
            <p className="text-[11px] text-slate-500">
              Core contributors and executive personnel registered by the startup.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRequestChange('Team members')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-md transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Request change</span>
          </button>
        </div>

        {teamList.length === 0 ? (
          <div className="py-4 px-4 bg-slate-50/60 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>No additional team members listed.</span>
            <button
              type="button"
              onClick={() => onRequestChange('Team members')}
              className="text-indigo-600 font-medium hover:underline inline-flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              Request founder update
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white">
            {teamList.map((member, idx) => (
              <div
                key={idx}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                    {member.initials || (member.name ? member.name.slice(0, 2).toUpperCase() : 'TM')}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{member.name}</p>
                    <p className="text-[11px] text-slate-500">{member.role || 'Team member'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="hover:text-indigo-600 hover:underline flex items-center gap-1"
                      title={member.email}
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">{member.email}</span>
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors inline-flex items-center gap-1 text-[11px]"
                      title="LinkedIn profile"
                    >
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
