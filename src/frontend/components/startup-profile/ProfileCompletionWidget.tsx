'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

export interface ProfileFieldDefinition {
  key: string;
  label: string;
  section: string;
}

export const CORE_PROFILE_FIELDS: ProfileFieldDefinition[] = [
  { key: 'startup_name', label: 'Startup Name', section: 'basic' },
  { key: 'logo_url', label: 'Startup Logo', section: 'basic' },
  { key: 'website', label: 'Website URL', section: 'basic' },
  { key: 'sector', label: 'Industry Sector', section: 'basic' },
  { key: 'stage', label: 'Startup Stage', section: 'basic' },
  { key: 'founded_date', label: 'Founded Date', section: 'basic' },
  { key: 'founder_name', label: 'Founder Name', section: 'team' },
  { key: 'founder_email', label: 'Founder Email', section: 'team' },
  { key: 'founder_phone', label: 'Founder Phone', section: 'team' },
  { key: 'description', label: 'Short Tagline/Description', section: 'overview' },
  { key: 'problem_statement', label: 'Problem Statement', section: 'overview' },
  { key: 'solution_description', label: 'Solution Overview', section: 'overview' },
  { key: 'target_market', label: 'Target Market', section: 'overview' },
  { key: 'business_model', label: 'Business Model', section: 'business' },
  { key: 'revenue_model', label: 'Revenue Model', section: 'business' },
  { key: 'registration_type', label: 'Registration Entity Type', section: 'legal' },
  { key: 'registration_number', label: 'Registration / CIN Number', section: 'legal' },
  { key: 'pan_number', label: 'Company PAN', section: 'legal' },
  { key: 'mrr', label: 'MRR / Revenue', section: 'financials' },
  { key: 'pitch_deck_url', label: 'Pitch Deck URL', section: 'documents' },
];

interface ProfileCompletionWidgetProps {
  startup: any;
  onFocusSection?: (section: string) => void;
}

export const ProfileCompletionWidget: React.FC<ProfileCompletionWidgetProps> = ({
  startup,
  onFocusSection,
}) => {
  if (!startup) return null;

  const missingFields: ProfileFieldDefinition[] = [];
  let filledCount = 0;

  CORE_PROFILE_FIELDS.forEach((field) => {
    const val = startup[field.key];
    const isFilled =
      val !== null &&
      val !== undefined &&
      val !== '' &&
      (typeof val !== 'number' || val > 0 || field.key === 'mrr');

    if (isFilled) {
      filledCount += 1;
    } else {
      missingFields.push(field);
    }
  });

  const percentage = Math.round((filledCount / CORE_PROFILE_FIELDS.length) * 100);

  // SVG circular gauge math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorScheme =
    percentage >= 80
      ? { stroke: '#10B981', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Excellent' }
      : percentage >= 50
      ? { stroke: '#3B82F6', bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Good Progress' }
      : { stroke: '#F59E0B', bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Needs Attention' };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Left: Circular Meter + Score */}
      <div className="flex items-center gap-5 shrink-0">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-100"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={colorScheme.stroke}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-900 tracking-tight">{percentage}%</span>
            <span className="text-[10px] font-medium text-slate-400">Score</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 text-sm">Startup profile completeness</h3>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${colorScheme.bg}`}>
              {colorScheme.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Complete your profile to increase visibility to accelerator mentors and potential co-incubators.
          </p>
          <div className="text-xs font-semibold text-slate-700 pt-0.5">
            {filledCount} of {CORE_PROFILE_FIELDS.length} essential fields completed
          </div>
        </div>
      </div>

      {/* Right: Missing Fields Checklist Chips */}
      {missingFields.length > 0 ? (
        <div className="flex-1 w-full md:w-auto md:border-l md:border-slate-100 md:pl-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Missing information ({missingFields.length})
            </span>
            <span className="text-[11px] text-slate-400">Click a chip to edit</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {missingFields.slice(0, 3).map((field) => (
              <button
                key={field.key}
                onClick={() => onFocusSection?.(field.section)}
                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-medium transition cursor-pointer"
                title={`Click to fill ${field.label}`}
              >
                <span>+ {field.label}</span>
              </button>
            ))}
            {missingFields.length > 3 && (
              <button
                type="button"
                onClick={() => onFocusSection?.(missingFields[3].section)}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:underline cursor-pointer"
              >
                +{missingFields.length - 3} more
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>All 20 essential startup fields are completed!</span>
        </div>
      )}
    </div>
  );
};

