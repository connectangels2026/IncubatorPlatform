'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Link as LinkIcon,
  ExternalLink,
  Trash2,
  RefreshCw,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Video,
  GitBranch,
  Layers,
  Globe,
  Plus,
  X,
  Loader2,
  Check,
  Eye,
} from 'lucide-react';
import axios from 'axios';
import { apiClient } from '@/services/apiClient';
import { FileViewerModal } from '@/frontend/components/common/FileViewerModal';

interface DocumentsSectionEditProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  saveSuccess?: boolean;
}

export function formatIncubationTenure(startDate?: string | null, endDate?: string | null): string {
  if (!startDate && !endDate) return 'Not set';

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (start && end) {
    const diffMonths = Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
    const startStr = `${monthNames[start.getMonth()]} ${start.getFullYear()}`;
    const endStr = `${monthNames[end.getMonth()]} ${end.getFullYear()}`;
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} (${startStr} – ${endStr})`;
  }

  if (start) {
    return `Active since ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
  }

  return 'Not set';
}

function cleanUrlOnBlur(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // If user pasted something like github.com/user/repo, prepend https://
  return `https://${trimmed}`;
}

function getFileNameFromUrl(url: string, defaultName: string): string {
  if (!url) return defaultName;
  try {
    const parts = url.split('?')[0].split('/');
    const last = parts[parts.length - 1];
    if (last && last.includes('.')) {
      // Remove timestamp prefix if present
      return decodeURIComponent(last.replace(/^\d+_/, ''));
    }
  } catch {}
  return defaultName;
}

export const DocumentsSectionEdit: React.FC<DocumentsSectionEditProps> = ({
  formData,
  onFieldChange,
  onSave,
  onCancel,
  isSaving,
  hasChanges,
  saveSuccess,
}) => {
  // Modes for Pitch deck, Business plan: 'upload' | 'link'
  const [pitchMode, setPitchMode] = useState<'upload' | 'link'>('upload');
  const [bizMode, setBizMode] = useState<'upload' | 'link'>('upload');

  // Upload Progress States (0 to 100)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Video Submission State (Upload-then-review flow)
  const [videoSubmission, setVideoSubmission] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoSubmission, setLoadingVideoSubmission] = useState(false);
  const [cancellingVideo, setCancellingVideo] = useState(false);

  // Tech Stack Tag Input State
  const [tagInput, setTagInput] = useState('');
  const [viewerFile, setViewerFile] = useState<{ url: string; title: string; type?: 'pdf' | 'video' | 'auto' } | null>(null);

  // Hidden File Input Refs
  const pitchFileInputRef = useRef<HTMLInputElement>(null);
  const bizFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Video Submission Status
  const fetchVideoSubmission = async () => {
    setLoadingVideoSubmission(true);
    try {
      const orgId = formData?.organization_id || (typeof window !== 'undefined' ? localStorage.getItem('org_id') : null);
      const endpoint = formData?.id ? `/startups/${formData.id}/video-submission` : '/startups/me/video-submission';
      const res = await apiClient.get(endpoint, {
        params: orgId ? { org_id: orgId } : undefined,
      });
      if (res.data?.success) {
        setVideoSubmission(res.data.submission || null);
        if (res.data.video_url) {
          setVideoUrl(res.data.video_url);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoadingVideoSubmission(false);
    }
  };

  useEffect(() => {
    fetchVideoSubmission();
  }, [formData?.id]);

  // Cancel Video Review Submission
  const handleCancelVideoSubmission = async () => {
    setCancellingVideo(true);
    setUploadError(null);
    try {
      const endpoint = formData?.id ? `/startups/${formData.id}/video-submission` : '/startups/me/video-submission';
      await apiClient.post(endpoint, { action: 'cancel' });
      setVideoSubmission(null);
      setVideoUrl(null);
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to cancel video review.');
    } finally {
      setCancellingVideo(false);
    }
  };

  // Upload Video File (Only MP4 up to 200MB)
  const handleVideoUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'mp4') {
      setUploadError('Invalid format: Only MP4 videos are accepted.');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setUploadError('File exceeds maximum size of 200MB.');
      return;
    }

    setUploadingField('demo_video');
    setUploadError(null);
    setUploadProgress((prev) => ({ ...prev, demo_video: 10 }));

    const data = new FormData();
    data.append('file', file);
    data.append('type', 'demo_video');
    if (formData?.id) {
      data.append('startup_id', formData.id);
    }

    try {
      const res = await apiClient.post('/startups/documents/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 90) / progressEvent.total);
            setUploadProgress((prev) => ({ ...prev, demo_video: pct }));
          }
        },
      });

      if (res.data?.success) {
        setUploadProgress((prev) => ({ ...prev, demo_video: 100 }));
        setVideoSubmission(res.data.submission || {
          status: 'pending',
          file_path: res.data.file_name,
          submitted_at: new Date().toISOString(),
        });
        if (res.data.url) {
          setVideoUrl(res.data.url);
        }
        setTimeout(() => {
          setUploadProgress((prev) => {
            const next = { ...prev };
            delete next.demo_video;
            return next;
          });
        }, 800);
      } else {
        throw new Error(res.data?.error || 'Video upload failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Error uploading video.';
      setUploadError(msg);
      setUploadProgress((prev) => {
        const next = { ...prev };
        delete next.demo_video;
        return next;
      });
    } finally {
      setUploadingField(null);
    }
  };

  // Upload File Handler with Progress
  const handleFileUpload = async (file: File, type: 'pitch_deck' | 'business_plan' | 'demo_video', targetField: string) => {
    setUploadingField(targetField);
    setUploadError(null);
    setUploadProgress((prev) => ({ ...prev, [targetField]: 10 }));

    const data = new FormData();
    data.append('file', file);
    data.append('type', type);

    try {
      const res = await apiClient.post('/startups/documents/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 90) / progressEvent.total);
            setUploadProgress((prev) => ({ ...prev, [targetField]: pct }));
          }
        },
      });

      if (res.data?.success && res.data?.url) {
        setUploadProgress((prev) => ({ ...prev, [targetField]: 100 }));
        onFieldChange(targetField, res.data.url);
        setTimeout(() => {
          setUploadProgress((prev) => {
            const next = { ...prev };
            delete next[targetField];
            return next;
          });
        }, 800);
      } else {
        throw new Error(res.data?.error || 'Upload failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Error uploading file.';
      setUploadError(msg);
      setUploadProgress((prev) => {
        const next = { ...prev };
        delete next[targetField];
        return next;
      });
    } finally {
      setUploadingField(null);
    }
  };

  // Tech stack tag helpers
  const currentTags: string[] = Array.isArray(formData.tech_stack)
    ? formData.tech_stack.map((t: any) => (typeof t === 'string' ? t.trim() : (t.name || '')).trim()).filter(Boolean)
    : typeof formData.tech_stack === 'string'
    ? formData.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const handleAddTag = (tag: string) => {
    const clean = tag.trim().replace(/^,+|,+$/g, '');
    if (!clean) return;
    if (!currentTags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      onFieldChange('tech_stack', [...currentTags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (indexToRemove: number) => {
    const next = currentTags.filter((_, idx) => idx !== indexToRemove);
    onFieldChange('tech_stack', next);
  };

  const isVideoApproved = videoSubmission?.status === 'approved' || Boolean(formData.demo_video_url);
  const isVideoPending = videoSubmission?.status === 'pending';
  const isVideoRejected = videoSubmission?.status === 'rejected';

  return (
    <div className="space-y-6 pt-2 font-sans">
      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Official Collateral: Pitch Deck & Business Plan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Pitch Deck Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pitch deck</span>
            </label>
            <div className="inline-flex p-0.5 rounded-lg bg-slate-200/70 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setPitchMode('upload')}
                className={`px-2.5 py-0.5 rounded-md transition cursor-pointer ${
                  pitchMode === 'upload' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={() => setPitchMode('link')}
                className={`px-2.5 py-0.5 rounded-md transition cursor-pointer ${
                  pitchMode === 'link' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Paste link
              </button>
            </div>
          </div>

          {/* Mode 1: Upload File */}
          {pitchMode === 'upload' ? (
            <div>
              {formData.pitch_deck_url ? (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">
                        {getFileNameFromUrl(formData.pitch_deck_url, 'Pitch_Deck.pdf')}
                      </p>
                      <span className="text-[10px] text-slate-500 font-normal">PDF / Presentation</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setViewerFile({
                          url: formData.pitch_deck_url,
                          title: 'Pitch Deck',
                          type: 'pdf',
                        })
                      }
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition cursor-pointer"
                      title="View document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => pitchFileInputRef.current?.click()}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md transition cursor-pointer"
                      title="Replace file"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onFieldChange('pitch_deck_url', '')}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => pitchFileInputRef.current?.click()}
                  className="p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 text-center cursor-pointer transition group"
                >
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 mx-auto mb-1 transition" />
                  <p className="text-xs font-medium text-slate-700">Click to upload pitch deck</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PDF, PPT, or PPTX up to 20MB</p>
                </div>
              )}

              {/* Progress bar */}
              {uploadingField === 'pitch_deck_url' && (
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress['pitch_deck_url'] || 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Uploading {uploadProgress['pitch_deck_url']}%...
                  </span>
                </div>
              )}

              <input
                ref={pitchFileInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'pitch_deck', 'pitch_deck_url');
                  e.target.value = '';
                }}
              />
            </div>
          ) : (
            /* Mode 2: Paste Link */
            <div className="space-y-1">
              <div className="relative flex items-center">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="url"
                  value={formData.pitch_deck_url || ''}
                  onChange={(e) => onFieldChange('pitch_deck_url', e.target.value)}
                  onBlur={(e) => onFieldChange('pitch_deck_url', cleanUrlOnBlur(e.target.value))}
                  placeholder="https://drive.google.com/... or https://docsend.com/..."
                  className="w-full pl-9 pr-20 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formData.pitch_deck_url && (
                  <a
                    href={cleanUrlOnBlur(formData.pitch_deck_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-1.5 px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 rounded transition flex items-center gap-1"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-[10px] text-slate-400">DocSend, Google Drive, or shared slide link.</p>
            </div>
          )}
        </div>

        {/* Business Plan Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Business plan</span>
            </label>
            <div className="inline-flex p-0.5 rounded-lg bg-slate-200/70 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setBizMode('upload')}
                className={`px-2.5 py-0.5 rounded-md transition cursor-pointer ${
                  bizMode === 'upload' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={() => setBizMode('link')}
                className={`px-2.5 py-0.5 rounded-md transition cursor-pointer ${
                  bizMode === 'link' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Paste link
              </button>
            </div>
          </div>

          {/* Mode 1: Upload File */}
          {bizMode === 'upload' ? (
            <div>
              {formData.business_plan_url ? (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">
                        {getFileNameFromUrl(formData.business_plan_url, 'Business_Plan.pdf')}
                      </p>
                      <span className="text-[10px] text-slate-500 font-normal">PDF / Document</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setViewerFile({
                          url: formData.business_plan_url,
                          title: 'Business Plan',
                          type: 'pdf',
                        })
                      }
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-md transition cursor-pointer"
                      title="View document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => bizFileInputRef.current?.click()}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md transition cursor-pointer"
                      title="Replace file"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onFieldChange('business_plan_url', '')}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => bizFileInputRef.current?.click()}
                  className="p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/20 text-center cursor-pointer transition group"
                >
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-600 mx-auto mb-1 transition" />
                  <p className="text-xs font-medium text-slate-700">Click to upload business plan</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PDF, PPT, or PPTX up to 20MB</p>
                </div>
              )}

              {uploadingField === 'business_plan_url' && (
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress['business_plan_url'] || 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Uploading {uploadProgress['business_plan_url']}%...
                  </span>
                </div>
              )}

              <input
                ref={bizFileInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'business_plan', 'business_plan_url');
                  e.target.value = '';
                }}
              />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="relative flex items-center">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="url"
                  value={formData.business_plan_url || ''}
                  onChange={(e) => onFieldChange('business_plan_url', e.target.value)}
                  onBlur={(e) => onFieldChange('business_plan_url', cleanUrlOnBlur(e.target.value))}
                  placeholder="https://drive.google.com/..."
                  className="w-full pl-9 pr-20 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.business_plan_url && (
                  <a
                    href={cleanUrlOnBlur(formData.business_plan_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-1.5 px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 rounded transition flex items-center gap-1"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Financial model, whitepaper, or business roadmap link.</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Repositories & Interactive Product Links */}
      <div className="space-y-3 pt-1">
        <h4 className="text-xs font-semibold text-slate-700">
          Product and code links
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* GitHub Repo */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">GitHub repository</label>
            <div className="relative flex items-center">
              <GitBranch className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="url"
                value={formData.github_url || ''}
                onChange={(e) => onFieldChange('github_url', e.target.value)}
                onBlur={(e) => onFieldChange('github_url', cleanUrlOnBlur(e.target.value))}
                placeholder="https://github.com/organization/repo"
                className="w-full pl-9 pr-20 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {formData.github_url && (
                <a
                  href={cleanUrlOnBlur(formData.github_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-1.5 px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 rounded transition flex items-center gap-1"
                >
                  <span>Open link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Figma Design System */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Figma design system</label>
            <div className="relative flex items-center">
              <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="url"
                value={formData.figma_url || ''}
                onChange={(e) => onFieldChange('figma_url', e.target.value)}
                onBlur={(e) => onFieldChange('figma_url', cleanUrlOnBlur(e.target.value))}
                placeholder="https://figma.com/file/..."
                className="w-full pl-9 pr-20 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {formData.figma_url && (
                <a
                  href={cleanUrlOnBlur(formData.figma_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-1.5 px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 rounded transition flex items-center gap-1"
                >
                  <span>Open link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Interactive Live Demo */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Interactive live demo</label>
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="url"
                value={formData.demo_url || ''}
                onChange={(e) => onFieldChange('demo_url', e.target.value)}
                onBlur={(e) => onFieldChange('demo_url', cleanUrlOnBlur(e.target.value))}
                placeholder="https://app.yourstartup.com or live prototype"
                className="w-full pl-9 pr-20 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {formData.demo_url && (
                <a
                  href={cleanUrlOnBlur(formData.demo_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-1.5 px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 rounded transition flex items-center gap-1"
                >
                  <span>Open link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Product Demo Video (Upload-then-review flow) */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-purple-600" />
            <span>Product demo video</span>
          </label>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5">
            Upload MP4 video walkthrough (up to 200MB) for incubator review and public showcase.
          </p>
        </div>

        {/* State 1: Under review (with Replace and Cancel) */}
        {isVideoPending && (
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-amber-900">Under review</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-300">
                      Pending incubator review
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Your MP4 demo video was submitted and is awaiting incubator review.
                  </p>
                  {videoSubmission?.submitted_at && (
                    <p className="text-[10px] text-amber-600 mt-0.5">
                      Submitted: {new Date(videoSubmission.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
              <button
                type="button"
                onClick={handleCancelVideoSubmission}
                disabled={cancellingVideo}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg transition cursor-pointer"
              >
                {cancellingVideo ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={() => videoFileInputRef.current?.click()}
                disabled={uploadingField === 'demo_video'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace</span>
              </button>
            </div>
          </div>
        )}

        {/* State 2: Approved (Live, with View) */}
        {isVideoApproved && !isVideoPending && (
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-emerald-900">Approved</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Live on profile
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Your product demo video was approved and is now active on the public startup showcase.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200/60">
              {(videoUrl || formData.demo_video_url) && (
                <button
                  type="button"
                  onClick={() =>
                    setViewerFile({
                      url: videoUrl || formData.demo_video_url,
                      title: 'Product Demo Video',
                      type: 'video',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-emerald-700" />
                  <span>View</span>
                  <Eye className="w-3 h-3 text-emerald-600" />
                </button>
              )}
              <button
                type="button"
                onClick={() => videoFileInputRef.current?.click()}
                disabled={uploadingField === 'demo_video'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace</span>
              </button>
            </div>
          </div>
        )}

        {/* State 3: Rejected (shows reason and message, with Upload a new video) */}
        {isVideoRejected && !isVideoPending && (
          <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-rose-900">Submission not approved</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-800 border border-rose-300">
                    Changes requested
                  </span>
                </div>
                <p className="text-xs text-rose-800 mt-1 font-medium">
                  Your video was not approved: {videoSubmission.reason || 'Please provide a clear product walkthrough.'}
                </p>
                <p className="text-[11px] text-rose-600 mt-0.5">
                  You can upload an updated MP4 video file addressing this feedback.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-rose-200/60">
              <button
                type="button"
                onClick={() => videoFileInputRef.current?.click()}
                disabled={uploadingField === 'demo_video'}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg transition cursor-pointer shadow-2xs"
              >
                <Upload className="w-3 h-3" />
                <span>Upload a new video</span>
              </button>
            </div>
          </div>
        )}

        {/* State 4: Default Upload Box */}
        {!isVideoPending && !isVideoApproved && !isVideoRejected && (
          <div
            onClick={() => videoFileInputRef.current?.click()}
            className="p-5 rounded-lg border-2 border-dashed border-purple-200 hover:border-purple-500 bg-white hover:bg-purple-50/20 text-center cursor-pointer transition group"
          >
            <Upload className="w-6 h-6 text-purple-400 group-hover:text-purple-600 mx-auto mb-1.5 transition" />
            <p className="text-xs font-semibold text-slate-800">Upload MP4</p>
            <p className="text-[11px] text-slate-500 mt-0.5">MP4 file up to 200MB</p>
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploadingField === 'demo_video' && (
          <div className="mt-2 space-y-1">
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress.demo_video || 0}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Uploading MP4 video {uploadProgress.demo_video || 0}%...
            </span>
          </div>
        )}

        <input
          ref={videoFileInputRef}
          type="file"
          accept="video/mp4,.mp4"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleVideoUpload(file);
            e.target.value = '';
          }}
        />
      </div>

      {/* 4. Core Technologies & Architecture Stack (Chips) */}
      <div className="space-y-2 pt-1">
        <label className="block text-xs font-semibold text-slate-800">
          Core technologies &amp; architecture stack
        </label>
        <p className="text-[11px] text-slate-500 font-normal">
          Type technology and press Enter or comma to add (e.g. Next.js, PyTorch, Supabase, Docker).
        </p>

        {/* Chip Container */}
        <div className="p-2.5 rounded-xl border border-slate-300 bg-white min-h-[46px] flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
          {currentTags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-medium animate-in fade-in zoom-in-95"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(idx)}
                className="hover:text-rose-600 transition-colors p-0.5 rounded cursor-pointer"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                handleAddTag(tagInput);
              } else if (e.key === 'Backspace' && !tagInput && currentTags.length > 0) {
                handleRemoveTag(currentTags.length - 1);
              }
            }}
            onBlur={() => {
              if (tagInput.trim()) handleAddTag(tagInput);
            }}
            placeholder={currentTags.length === 0 ? 'Type technology and press Enter...' : 'Add more...'}
            className="flex-1 min-w-[120px] px-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* 5. Incubation Tenure Display */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-slate-700 block">Incubation tenure</span>
          <span className="text-[11px] text-slate-500">
            {formatIncubationTenure(formData.incubation_start_date, formData.incubation_end_date)}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Managed by incubator</span>
      </div>

      {/* 6. Action Footer with Save Button State */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Saved</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs ${
              hasChanges && !isSaving
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved</span>
              </>
            ) : (
              <span>Save documents</span>
            )}
          </button>
        </div>
      </div>

      {/* In-app Document & Video Viewer Modal */}
      <FileViewerModal
        isOpen={Boolean(viewerFile)}
        onClose={() => setViewerFile(null)}
        url={viewerFile?.url}
        title={viewerFile?.title}
        type={viewerFile?.type || 'auto'}
      />
    </div>
  );
};

