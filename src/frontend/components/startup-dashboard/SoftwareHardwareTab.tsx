'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  Layers,
  Plus,
  CheckCircle2,
  Clock,
  Wrench,
  Activity,
  Check,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';

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

export interface HardwareBomItem {
  id: string;
  name: string;
  qty: number;
  unit_cost: number;
  status: 'In Stock' | 'In Transit' | 'Ordered' | 'Pending';
  lead_time_days?: number;
}

export interface LabEquipmentItem {
  id: string;
  name: string;
  type: string;
  status: string;
  allocated_at?: string;
}

export interface FabricationStep {
  id: string;
  step_number: number;
  title: string;
  subtitle?: string;
  status: 'completed' | 'in_progress' | 'pending';
}

interface Props {
  track?: 'hardware' | 'software' | 'both';
  startup?: any;
  onStartupUpdate?: (updated: any) => void;
  readOnly?: boolean;
}

export function SoftwareHardwareTab({ track = 'both', startup, onStartupUpdate, readOnly = false }: Props) {
  // 1. Software Tech Stack
  const [techStack, setTechStack] = useState<TechItem[]>(() => {
    if (Array.isArray(startup?.tech_stack) && startup.tech_stack.length > 0) {
      if (typeof startup.tech_stack[0] === 'object' && startup.tech_stack[0]?.category) {
        return startup.tech_stack as TechItem[];
      }
    }
    return DEFAULT_STACK;
  });
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [targetCategory, setTargetCategory] = useState<string>('FRONTEND');

  // 2. Hardware BOM (read & write from startups.hardware_bom)
  const [hardwareBom, setHardwareBom] = useState<HardwareBomItem[]>(() => {
    return Array.isArray(startup?.hardware_bom) ? startup.hardware_bom : [];
  });
  const [showAddBomModal, setShowAddBomModal] = useState(false);
  const [newBomName, setNewBomName] = useState('');
  const [newBomQty, setNewBomQty] = useState(1);
  const [newBomCost, setNewBomCost] = useState(0);
  const [newBomStatus, setNewBomStatus] = useState<'In Stock' | 'In Transit' | 'Ordered' | 'Pending'>('In Stock');

  // 3. Lab Equipment (view-only for startup, assigned by incubator)
  const labEquipment: LabEquipmentItem[] = useMemo(() => {
    return Array.isArray(startup?.lab_equipment) ? startup.lab_equipment : [];
  }, [startup?.lab_equipment]);

  // 4. Fabrication Pipeline (read & write from startups.fabrication_pipeline)
  const [fabricationPipeline, setFabricationPipeline] = useState<FabricationStep[]>(() => {
    return Array.isArray(startup?.fabrication_pipeline) ? startup.fabrication_pipeline : [];
  });
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepSubtitle, setNewStepSubtitle] = useState('');

  // Sync state from prop updates
  useEffect(() => {
    if (Array.isArray(startup?.tech_stack) && startup.tech_stack.length > 0) {
      if (typeof startup.tech_stack[0] === 'object' && startup.tech_stack[0]?.category) {
        setTechStack(startup.tech_stack as TechItem[]);
      }
    }
  }, [startup?.tech_stack]);

  useEffect(() => {
    if (Array.isArray(startup?.hardware_bom)) {
      setHardwareBom(startup.hardware_bom);
    }
  }, [startup?.hardware_bom]);

  useEffect(() => {
    if (Array.isArray(startup?.fabrication_pipeline)) {
      setFabricationPipeline(startup.fabrication_pipeline);
    }
  }, [startup?.fabrication_pipeline]);

  // Persist helper
  const persistField = async (fieldKey: string, value: any) => {
    try {
      if (onStartupUpdate) {
        onStartupUpdate({ [fieldKey]: value });
      } else {
        const endpoint = startup?.id ? `/startups/${startup.id}` : '/startups/me';
        await apiClient.put(endpoint, { [fieldKey]: value });
      }
    } catch (err) {
      console.warn(`Failed to save ${fieldKey}:`, err);
    }
  };

  // Tech stack tag handler
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    const updated = techStack.map((cat) =>
      cat.category === targetCategory ? { ...cat, items: [...cat.items, newTag.trim()] } : cat
    );
    setTechStack(updated);
    setNewTag('');
    setShowAddTagModal(false);
    await persistField('tech_stack', updated);
  };

  // Hardware BOM handlers
  // COGS = sum(qty x unit_cost), strictly computed, never typed
  const computedCogs = useMemo(() => {
    return hardwareBom.reduce((sum, item) => sum + (Number(item.qty || 1) * Number(item.unit_cost || 0)), 0);
  }, [hardwareBom]);

  const inStockCount = useMemo(() => {
    return hardwareBom.filter((item) => item.status === 'In Stock').length;
  }, [hardwareBom]);

  const handleAddBomItem = async () => {
    if (!newBomName.trim()) return;
    const newItem: HardwareBomItem = {
      id: `bom-${Date.now()}`,
      name: newBomName.trim(),
      qty: Math.max(1, Number(newBomQty) || 1),
      unit_cost: Math.max(0, Number(newBomCost) || 0),
      status: newBomStatus,
    };
    const updated = [...hardwareBom, newItem];
    setHardwareBom(updated);
    setNewBomName('');
    setNewBomQty(1);
    setNewBomCost(0);
    setShowAddBomModal(false);
    await persistField('hardware_bom', updated);
  };

  const handleDeleteBomItem = async (id: string) => {
    if (readOnly) return;
    const updated = hardwareBom.filter((item) => item.id !== id);
    setHardwareBom(updated);
    await persistField('hardware_bom', updated);
  };

  // Fabrication Pipeline handlers
  const handleAddPipelineStep = async () => {
    if (!newStepTitle.trim()) return;
    const nextStepNum = fabricationPipeline.length + 1;
    const newStep: FabricationStep = {
      id: `step-${Date.now()}`,
      step_number: nextStepNum,
      title: newStepTitle.trim(),
      subtitle: newStepSubtitle.trim() || undefined,
      status: nextStepNum === 1 ? 'in_progress' : 'pending',
    };
    const updated = [...fabricationPipeline, newStep];
    setFabricationPipeline(updated);
    setNewStepTitle('');
    setNewStepSubtitle('');
    setShowAddStepModal(false);
    await persistField('fabrication_pipeline', updated);
  };

  const handleToggleStepStatus = async (stepId: string) => {
    if (readOnly) return;
    const updated = fabricationPipeline.map((step) => {
      if (step.id !== stepId) return step;
      const nextStatus: 'completed' | 'in_progress' | 'pending' =
        step.status === 'completed'
          ? 'pending'
          : step.status === 'in_progress'
          ? 'completed'
          : 'in_progress';
      return { ...step, status: nextStatus };
    });
    setFabricationPipeline(updated);
    await persistField('fabrication_pipeline', updated);
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
            {!readOnly && (
              <button
                type="button"
                onClick={() => setShowAddTagModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tech Tag</span>
              </button>
            )}
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
                    <span className="text-xs font-medium text-slate-500">
                      {cat.category}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {cat.items.length} {cat.items.length === 1 ? 'item' : 'items'}
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
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => setShowAddBomModal(true)}
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer"
                    title="Add BOM Component"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {hardwareBom.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">No BOM components added</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    Add components to calculate COGS automatically and track sourcing.
                  </p>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => setShowAddBomModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add component</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 pt-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Estimated Unit Cost (COGS)</span>
                    <span className="font-mono font-black text-slate-900">
                      ${computedCogs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / unit
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Total Components</span>
                    <span className="font-extrabold text-slate-700">{hardwareBom.length} items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Sourced Components</span>
                    <span className="font-bold text-slate-800">
                      {inStockCount} / {hardwareBom.length} in stock
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-xs font-medium text-slate-500">
                      Component Checklist
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {hardwareBom.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-[11px] p-1.5 rounded-lg hover:bg-slate-50 transition"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-slate-700 truncate max-w-[150px]">
                            {item.status === 'In Stock' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                            <span className="truncate">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">x{item.qty}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono text-slate-600">
                              ${(item.qty * item.unit_cost).toFixed(2)}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                item.status === 'In Stock'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {item.status}
                            </span>
                            {!readOnly && (
                              <button
                                type="button"
                                onClick={() => handleDeleteBomItem(item.id)}
                                className="text-slate-300 hover:text-rose-600 transition"
                                title="Delete component"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card B: Incubator Lab Equipment (View-Only for Startup) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black text-[#1A2151]">Incubator Lab Equipment</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600">
                  {labEquipment.length} Allocated
                </span>
              </div>

              {labEquipment.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">No lab equipment allocated</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    Your incubator allocates equipment access (view-only for startups).
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pt-4">
                  {labEquipment.map((eq) => (
                    <div
                      key={eq.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-[#1A2151]">{eq.name}</h4>
                        <p className="text-[11px] text-slate-500">{eq.type}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {eq.status || 'Allocated'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card C: Fabrication Pipeline (Startup can edit) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black text-[#1A2151]">Fabrication Pipeline</h3>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => setShowAddStepModal(true)}
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer"
                    title="Add Pipeline Stage"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {fabricationPipeline.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">No pipeline stages configured</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    Add prototyping and fabrication phases to track stage progress.
                  </p>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => setShowAddStepModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add stage</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5 pt-4">
                  {fabricationPipeline.map((step, index) => {
                    const isDone = step.status === 'completed';
                    const isInProgress = step.status === 'in_progress';

                    return (
                      <div
                        key={step.id}
                        onClick={() => handleToggleStepStatus(step.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                          isDone
                            ? 'border-emerald-200 bg-emerald-50/40'
                            : isInProgress
                            ? 'border-2 border-indigo-500 bg-indigo-50/40 shadow-2xs'
                            : 'border-slate-200/80 bg-slate-50/50 opacity-70'
                        }`}
                        title="Click to toggle status"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                              isDone
                                ? 'bg-emerald-500 text-white'
                                : isInProgress
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isDone ? <Check className="w-3.5 h-3.5" /> : index + 1}
                          </div>
                          <div className="truncate">
                            <h5 className="text-xs font-bold text-slate-800 truncate">{step.title}</h5>
                            {step.subtitle && (
                              <p className="text-[10px] text-slate-500 truncate">{step.subtitle}</p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-2 ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : isInProgress
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isDone ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Tech Tag */}
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
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer shadow-md"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Hardware BOM Item */}
      {showAddBomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101638]/50 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-[#1A2151]">Add Hardware BOM Component</h3>
              <button
                type="button"
                onClick={() => setShowAddBomModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Component Name *</label>
                <input
                  type="text"
                  value={newBomName}
                  onChange={(e) => setNewBomName(e.target.value)}
                  placeholder="e.g. NPU Edge AI Accelerator Chip"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={newBomQty}
                    onChange={(e) => setNewBomQty(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Unit Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newBomCost}
                    onChange={(e) => setNewBomCost(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Sourcing Status</label>
                <select
                  value={newBomStatus}
                  onChange={(e) => setNewBomStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Ordered">Ordered</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/60 text-[11px] text-blue-900">
                <span>Calculated Line Item Cost: </span>
                <span className="font-bold font-mono">${(newBomQty * newBomCost).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBomModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddBomItem}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer shadow-md"
              >
                Add Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Fabrication Pipeline Step */}
      {showAddStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101638]/50 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-[#1A2151]">Add Prototyping Stage</h3>
              <button
                type="button"
                onClick={() => setShowAddStepModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Stage Title *</label>
                <input
                  type="text"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  placeholder="e.g. SMT Component Assembly"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Subtitle / Note</label>
                <input
                  type="text"
                  value={newStepSubtitle}
                  onChange={(e) => setNewStepSubtitle(e.target.value)}
                  placeholder="e.g. PCB fabricated in Lab B"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddStepModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPipelineStep}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer shadow-md"
              >
                Add Stage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
