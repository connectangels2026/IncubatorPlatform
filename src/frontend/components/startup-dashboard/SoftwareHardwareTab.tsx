'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Plus,
  CheckCircle2,
  Clock,
  Wrench,
  Activity,
  Check,
  Calendar,
} from 'lucide-react';

interface TechItem {
  category: 'FRONTEND' | 'BACKEND' | 'CLOUD & DATABASE' | 'AI MODELS';
  items: string[];
}

const DEFAULT_STACK: TechItem[] = [
  {
    category: 'FRONTEND',
    items: ['Next.js 16', 'React 19', 'Tailwind CSS v4', 'TypeScript', 'Zustand', 'Recharts'],
  },
  {
    category: 'BACKEND',
    items: ['Node.js 22', 'GraphQL', 'Python FastAPI', 'gRPC', 'Redis Cache'],
  },
  {
    category: 'CLOUD & DATABASE',
    items: ['AWS Lambda', 'PostgreSQL (Supabase)', 'Pinecone Vector DB', 'Docker', 'Kubernetes'],
  },
  {
    category: 'AI MODELS',
    items: ['Gemini 1.5 Pro', 'Claude 3.5 Sonnet', 'Whisper V3', 'Custom Llama-3 Fine-Tune'],
  },
];

interface Props {
  track?: 'hardware' | 'software' | 'both';
}

export function SoftwareHardwareTab({ track = 'both' }: Props) {
  const [techStack, setTechStack] = useState<TechItem[]>(DEFAULT_STACK);
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [targetCategory, setTargetCategory] = useState<string>('FRONTEND');

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setTechStack((prev) =>
      prev.map((cat) =>
        cat.category === targetCategory ? { ...cat, items: [...cat.items, newTag.trim()] } : cat
      )
    );
    setNewTag('');
    setShowAddTagModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Software Tech Stack Architecture (Top Card) */}
      {(track === 'software' || track === 'both') && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-[#1A2151]">
                  Software Tech Stack Architecture
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Categorized technology pills and infrastructure modules
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTagModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tech Tag</span>
            </button>
          </div>

          {/* 4 Categorized Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
            {techStack.map((cat) => (
              <div
                key={cat.category}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/70">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {cat.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {cat.items.length} ITEMS
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200/90 text-slate-800 shadow-2xs hover:border-blue-400 transition"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Hardware BOM + Lab Equipment + Fabrication Pipeline (Bottom Row) */}
      {(track === 'hardware' || track === 'both') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: Hardware BOM Status */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black text-[#1A2151]">Hardware BOM Status</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-50 text-cyan-700 border border-cyan-200">
                  v1.8 Sourced
                </span>
              </div>

              <div className="space-y-3 pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Estimated Unit Cost (COGS)</span>
                  <span className="font-mono font-black text-slate-900">$142.50 / unit</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Component Sourcing Lead Time</span>
                  <span className="font-extrabold text-amber-600">12 Days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Sourced Components</span>
                  <span className="font-bold text-slate-800">18 / 20 components</span>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Key Components Checklist
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> NPU Edge AI Accelerator
                        Chip
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">In Stock</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Custom Molded Thermal
                        Casing
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">In Stock</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> WiFi 6E Sub-board
                      </span>
                      <span className="text-[10px] font-bold text-amber-600">In Transit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Incubator Lab Equipment */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black text-[#1A2151]">Incubator Lab Equipment</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600">
                  3 Allocated
                </span>
              </div>

              <div className="space-y-3 pt-4">
                {/* Equipment 1 */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A2151]">Formlabs Form 3+ (SLA)</h4>
                    <p className="text-[11px] text-slate-500">3D Resin Printer</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Reserved Today
                  </span>
                </div>

                {/* Equipment 2 */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A2151]">Rigol DS1054Z Oscilloscope</h4>
                    <p className="text-[11px] text-slate-500">Benchtop Test station</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                    In Use
                  </span>
                </div>

                {/* Equipment 3 */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A2151]">Voltera V-One PCB Printer</h4>
                    <p className="text-[11px] text-slate-500">Prototyping Circuit Bench</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-600">
                    Available
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => alert('Booking calendar opens...')}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer text-center"
              >
                Book New Equipment Time
              </button>
            </div>
          </div>

          {/* Card C: Fabrication Pipeline */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black text-[#1A2151]">Fabrication Pipeline</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700">
                  Step 3 of 5
                </span>
              </div>

              <div className="space-y-2.5 pt-4">
                {/* Step 1 */}
                <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 font-bold">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Schematic & Design</h5>
                    <p className="text-[10px] text-slate-500">Gerber files approved</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 font-bold">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">PCB Milling & Print</h5>
                    <p className="text-[10px] text-slate-500">Printed in Lab B</p>
                  </div>
                </div>

                {/* Step 3 (Active) */}
                <div className="p-2.5 rounded-xl border-2 border-indigo-500 bg-indigo-50/40 flex items-center gap-2.5 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-[#1A2151]">SMT Component Assembly</h5>
                    <p className="text-[10px] text-indigo-700 font-bold">In Progress now</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center gap-2.5 opacity-70">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px] shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-slate-700">Enclosure Fitment</h5>
                    <p className="text-[10px] text-slate-400">Resin casing print pending</p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center gap-2.5 opacity-70">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px] shrink-0 font-bold">
                    5
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-slate-700">Thermal & Stress Testing</h5>
                    <p className="text-[10px] text-slate-400">Final QA gate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal to add custom tech tag */}
      {showAddTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101638]/50 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-black text-[#1A2151]">Add Tech Stack Item</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Category</label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                >
                  <option value="FRONTEND">FRONTEND</option>
                  <option value="BACKEND">BACKEND</option>
                  <option value="CLOUD & DATABASE">CLOUD & DATABASE</option>
                  <option value="AI MODELS">AI MODELS</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Technology Name</label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g. Next.js, Redis, PyTorch"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTagModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
