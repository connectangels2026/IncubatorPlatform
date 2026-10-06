import React from 'react';
import { ExternalLink } from 'lucide-react';
import { StartupItem } from '../types';

interface TeamInfoProps {
  startup: StartupItem;
}

export function TeamInfo({ startup }: TeamInfoProps) {
  return (
    <div className="p-5 border-t border-slate-100 space-y-3">
      {/* Founder Profile */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60">
        <div className="flex items-center gap-3">
          {startup.founderAvatar ? (
            <img
              src={startup.founderAvatar}
              className="w-10 h-10 rounded-full object-cover border border-white shadow-xs"
              alt={startup.founder}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
              {startup.founder.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-slate-900">{startup.founder}</p>
            <p className="text-[11px] text-slate-500">
              Founder & CEO • {startup.founderEmail || 'founder@startup.io'}
            </p>
          </div>
        </div>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Additional Team Members */}
      {startup.team?.slice(1).map((m, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
              {m.initials}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{m.name}</p>
              <p className="text-[11px] text-slate-500">{m.role}</p>
            </div>
          </div>
          <a
            href={m.linkedin || 'https://linkedin.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ))}
    </div>
  );
}
