'use client';

import React, { useState } from 'react';
import {
  Award,
  Users,
  CheckCircle2,
  FileText,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Video,
  ExternalLink,
} from 'lucide-react';
import { MilestoneItem, ScheduleEventItem } from './types';

const INITIAL_MILESTONES: MilestoneItem[] = [
  {
    id: 'm1',
    title: 'Conduct 50 Customer Discovery Interviews',
    category: 'Customer Discovery',
    dueDate: 'Nov 12, 2026',
    completed: true,
    assignedMentor: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80' },
  },
  {
    id: 'm2',
    title: 'Draft 5-Year Financial & Unit Economics Model',
    category: 'Financial Model',
    dueDate: 'Nov 18, 2026',
    completed: true,
    assignedMentor: { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=80' },
  },
  {
    id: 'm3',
    title: 'Architect Vector Search & Gemini 1.5 Integration',
    category: 'Tech Architecture',
    dueDate: 'Nov 22, 2026',
    completed: true,
    assignedMentor: { name: 'David Park', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80' },
  },
  {
    id: 'm4',
    title: 'File Provisional Patent for Context Engine',
    category: 'Legal & IP',
    dueDate: 'Dec 01, 2026',
    completed: true,
    assignedMentor: { name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80' },
  },
  {
    id: 'm5',
    title: 'Validate $100k Pipeline with 5 B2B Pilot Design Partners',
    category: 'Customer Discovery',
    dueDate: 'Dec 10, 2026',
    completed: true,
    assignedMentor: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80' },
  },
  {
    id: 'm6',
    title: 'Complete SOC2 Type I Security Compliance Audit',
    category: 'Legal & IP',
    dueDate: 'Dec 18, 2026',
    completed: true,
    assignedMentor: { name: 'David Park', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80' },
  },
  {
    id: 'm7',
    title: 'Prototype PCB & SMT Assembly Fabrication in Lab',
    category: 'Hardware BOM',
    dueDate: 'Jan 05, 2027',
    completed: true,
    assignedMentor: { name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80' },
  },
  {
    id: 'm8',
    title: 'Beta User Closed Cohort Rollout (First 50 Users)',
    category: 'Traction',
    dueDate: 'Jan 15, 2027',
    completed: false,
    assignedMentor: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80' },
  },
  {
    id: 'm9',
    title: 'Lead VC Term Sheet Practice & Gate 2 Rehearsal',
    category: 'Pitch Review',
    dueDate: 'Jan 25, 2027',
    completed: false,
    assignedMentor: { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=80' },
  },
  {
    id: 'm10',
    title: 'Graduation Demo Day Main Stage Presentation',
    category: 'Graduation',
    dueDate: 'Feb 10, 2027',
    completed: false,
    assignedMentor: { name: 'Dr. Tariq', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80' },
  },
];

const SCHEDULE_EVENTS: ScheduleEventItem[] = [
  {
    id: 'e1',
    type: 'Workshop',
    title: 'Term Sheet Negotiation & Lead VC Dynamics',
    speaker: 'Marcus Vance (General Partner, Apex Ventures)',
    timing: 'Tomorrow, 2:00 PM EST',
    link: '#',
  },
  {
    id: 'e2',
    type: '1-on-1 Session',
    title: '1-on-1 Growth Strategy Review',
    speaker: 'Dr. Aris Thorne (Ex-VP Product, Stripe)',
    timing: 'Nov 04, 10:30 AM EST',
    link: '#',
  },
  {
    id: 'e3',
    type: 'Lab Office Hours',
    title: 'Hardware DFM & Supply Chain Strategy',
    speaker: 'Elena Rostova (Hardware Lab Lead)',
    timing: 'Nov 08, 4:00 PM EST',
    link: '#',
  },
];

export function OverviewTab() {
  const [milestones, setMilestones] = useState<MilestoneItem[]>(INITIAL_MILESTONES);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const completedCount = milestones.filter((m) => m.completed).length;
  const totalCount = milestones.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const toggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
    setToastMessage('Milestone progress updated.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Stage Tracker */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-500">Stage Tracker</span>
              <Award className="w-4 h-4 text-indigo-500" />
            </div>
            <h3 className="text-lg font-black text-[#1A2151]">Validation Phase</h3>
            <p className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+15% velocity this month</span>
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span>Next Gate: Seed Gate</span>
            <span className="font-extrabold text-slate-800">Q1 2027</span>
          </div>
        </div>

        {/* Card 2: Mentors Assigned */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-500">Mentors Assigned</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#1A2151]">4 Active Mentors</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Engaged
              </span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
            <div className="flex -space-x-1.5 overflow-hidden">
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                alt="Mentor 1"
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                alt="Mentor 2"
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=80"
                alt="Mentor 3"
              />
            </div>
            <span className="text-[11px] font-bold text-slate-500">+1 Guest VCs</span>
          </div>
        </div>

        {/* Card 3: Milestone Velocity */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-500">Milestone Velocity</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#1A2151]">
                {completedCount} of {totalCount} Completed
              </h3>
              <span className="text-xs font-extrabold text-blue-600">{progressPercent}%</span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100">
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Pitch Deck Status */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-500">Pitch Deck Status</span>
              <FileText className="w-4 h-4 text-indigo-500" />
            </div>
            <h3 className="text-lg font-black text-[#1A2151]">v2.4 - Seed Ready</h3>
            <p className="text-[11px] font-extrabold text-blue-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Approved by Lead VC</span>
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span>Updated 2d ago</span>
            <span className="font-mono text-slate-700 font-bold">14.2 MB PDF</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Roadmap + Right Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Roadmap): 8 cols */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-black text-[#1A2151]">Incubator Milestone Roadmap</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Toggle checkboxes to update cohort progress dynamically
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              Progress: {completedCount}/{totalCount}
            </span>
          </div>

          {/* Scrollable Milestone Checklist */}
          <div className="space-y-2.5 pt-4 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin">
            {milestones.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleMilestone(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.completed
                    ? 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                      item.completed
                        ? 'bg-indigo-600 text-white'
                        : 'border-2 border-slate-300 hover:border-indigo-500'
                    }`}
                  >
                    {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        item.completed ? 'text-slate-500 line-through' : 'text-slate-800'
                      }`}
                    >
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.assignedMentor.avatar && (
                        <img
                          src={item.assignedMentor.avatar}
                          alt={item.assignedMentor.name}
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.assignedMentor.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-600 mb-0.5">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{item.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Upcoming Schedule): 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-black text-[#1A2151]">Upcoming Schedule</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700">
                {SCHEDULE_EVENTS.length} Events
              </span>
            </div>

            {/* Events List */}
            <div className="space-y-3.5 pt-4">
              {SCHEDULE_EVENTS.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        ev.type === 'Workshop'
                          ? 'bg-purple-100 text-purple-800'
                          : ev.type === '1-on-1 Session'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ev.type}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">{ev.timing}</span>
                  </div>

                  <h4 className="text-xs font-bold text-[#1A2151] leading-snug">{ev.title}</h4>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-500 font-medium truncate max-w-[180px]">
                      {ev.speaker}
                    </span>
                    <a
                      href={ev.link}
                      className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800"
                    >
                      <span>Join</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request 1-on-1 Button */}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Request Mentor 1-on-1 Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simple Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#101638] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

