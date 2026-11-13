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

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxDim = 1600;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const outMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          const ext = outMime === 'image/png' ? '.png' : '.jpg';
          const safeName = file.name.replace(/\.[^.]+$/, '') + ext;
          resolve(new File([blob], safeName, { type: outMime }));
        },
        outMime,
        0.82
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
}

function getVideoDurationSeconds(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Number.isFinite(video.duration) ? video.duration : null);
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    video.src = objectUrl;
  });
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

  // Upload Progress & Inline Error States
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [onePagerMeta, setOnePagerMeta] = useState<{ size?: number; date?: string } | null>(null);

  // Video Submission State (Upload-then-review flow for Demo & Elevator pitch)
  const [videoSubmissions, setVideoSubmissions] = useState<{ demo: any; elevator: any }>({
    demo: null,
    elevator: null,
  });
  const [videoUrls, setVideoUrls] = useState<{ demo: string | null; elevator: string | null }>({
    demo: null,
    elevator: null,
  });
  const [cancellingKind, setCancellingKind] = useState<'demo' | 'elevator' | null>(null);

  // Tech Stack Tag Input State
  const [tagInput, setTagInput] = useState('');
  const [viewerFile, setViewerFile] = useState<{ url: string; title: string; subtitle?: string; type?: 'pdf' | 'video' | 'image' | 'auto' } | null>(null);

  // Hidden File Input Refs
  const pitchFileInputRef = useRef<HTMLInputElement>(null);
  const bizFileInputRef = useRef<HTMLInputElement>(null);
  const onePagerInputRef = useRef<HTMLInputElement>(null);
  const demoVideoInputRef = useRef<HTMLInputElement>(null);
  const elevatorVideoInputRef = useRef<HTMLInputElement>(null);

  // Fetch Video Submission Status
  const fetchVideoSubmission = async () => {
    try {
      const orgId = formData?.organization_id || (typeof window !== 'undefined' ? localStorage.getItem('org_id') : null);
      const endpoint = formData?.id ? `/startups/${formData.id}/video-submission` : '/startups/me/video-submission';
      const res = await apiClient.get(endpoint, {
        params: orgId ? { org_id: orgId } : undefined,
      });
      if (res.data?.success) {
        setVideoSubmissions({
          demo: res.data.submissions?.demo ?? res.data.submission ?? null,
          elevator: res.data.submissions?.elevator ?? null,
        });
        setVideoUrls({
          demo: res.data.video_urls?.demo ?? res.data.video_url ?? null,
          elevator: res.data.video_urls?.elevator ?? null,
        });
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchVideoSubmission();
  }, [formData?.id]);

  // Cancel Video Review Submission
  const handleCancelVideoSubmission = async (kind: 'demo' | 'elevator') => {
    setCancellingKind(kind);
    setFieldErrors((prev) => ({ ...prev, [kind]: '' }));
    try {
      const endpoint = formData?.id ? `/startups/${formData.id}/video-submission` : '/startups/me/video-submission';
      await apiClient.post(endpoint, { action: 'cancel', kind });
      setVideoSubmissions((prev) => ({ ...prev, [kind]: null }));
      setVideoUrls((prev) => ({ ...prev, [kind]: null }));
    } catch (err: any) {
      setFieldErrors((prev) => ({
        ...prev,
        [kind]: err.response?.data?.error || 'Failed to cancel video review.',
      }));
    } finally {
      setCancellingKind(null);
    }
  };

  // Upload Video File (demo <= 200MB, elevator <= 50MB & <= 60s)
  const handleVideoUpload = async (file: File, kind: 'demo' | 'elevator') => {
    const fieldKey = kind === 'elevator' ? 'elevator_video' : 'demo_video';
    const ext = file.name.split('.').pop()?.toLowerCase();
    setFieldErrors((prev) => ({ ...prev, [fieldKey]: '' }));
    setUploadError(null);

    if (ext !== 'mp4') {
      setFieldErrors((prev) => ({ ...prev, [fieldKey]: 'Only MP4 videos are accepted.' }));
      return;
    }

    const maxBytes = kind === 'elevator' ? 50 * 1024 * 1024 : 200 * 1024 * 1024;
    if (file.size > maxBytes) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldKey]: kind === 'elevator' ? 'Elevator pitch must be 50MB or less.' : 'File exceeds maximum size of 200MB.',
      }));
      return;
    }

    let durationSeconds: number | null = null;
    if (kind === 'elevator') {
      durationSeconds = await getVideoDurationSeconds(file);
      if (durationSeconds !== null && durationSeconds > 60) {
        setFieldErrors((prev) => ({
          ...prev,
          [fieldKey]: 'Elevator pitch must be 60 seconds or less',
        }));
        return;
      }
    }

    setUploadingField(fieldKey);
    setUploadProgress((prev) => ({ ...prev, [fieldKey]: 10 }));

    const data = new FormData();
    data.append('file', file);
    data.append('type', fieldKey);
    if (durationSeconds !== null) {
      data.append('duration_seconds', String(Math.round(durationSeconds)));
    }
    if (formData?.id) {
      data.append('startup_id', formData.id);
    }

    try {
      const res = await apiClient.post('/startups/documents/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 90) / progressEvent.total);
            setUploadProgress((prev) => ({ ...prev, [fieldKey]: pct }));
          }
        },
      });

      if (res.data?.success) {
        setUploadProgress((prev) => ({ ...prev, [fieldKey]: 100 }));
        setVideoSubmissions((prev) => ({
          ...prev,
          [kind]: res.data.submission || {
            status: 'pending',
            kind,
            duration_seconds: durationSeconds !== null ? Math.round(durationSeconds) : null,
            file_path: res.data.file_name,
            submitted_at: new Date().toISOString(),
          },
        }));
        if (res.data.url) {
          setVideoUrls((prev) => ({ ...prev, [kind]: res.data.url }));
        }
        setTimeout(() => {
          setUploadProgress((prev) => {
            const next = { ...prev };
            delete next[fieldKey];
            return next;
          });
        }, 800);
      } else {
        throw new Error(res.data?.error || 'Video upload failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Error uploading video.';
      setFieldErrors((prev) => ({ ...prev, [fieldKey]: msg }));
      setUploadProgress((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    } finally {
      setUploadingField(null);
    }
  };

  // Upload File Handler with Size Validation, Image Compression & Progress
  const handleFileUpload = async (
    rawFile: File,
    type: 'pitch_deck' | 'business_plan' | 'one_pager',
    targetField: string
  ) => {
    setFieldErrors((prev) => ({ ...prev, [targetField]: '' }));
    setUploadError(null);

    let file = rawFile;
    if (type === 'one_pager') {
      const ext = rawFile.name.split('.').pop()?.toLowerCase() || '';
      if (!['pdf', 'png', 'jpg', 'jpeg'].includes(ext)) {
        setFieldErrors((prev) => ({
          ...prev,
          [targetField]: 'Invalid format: Accept PDF, PNG, or JPG only.',
        }));
        return;
      }
      if (rawFile.type.startsWith('image/') || ['png', 'jpg', 'jpeg'].includes(ext)) {
        file = await compressImageFile(rawFile);
      }
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({
          ...prev,
          [targetField]: 'One-pager file exceeds maximum size of 5MB.',
        }));
        return;
      }
    } else if (rawFile.size > 10 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        [targetField]: 'File exceeds maximum size of 10MB.',
      }));
      return;
    }

    setUploadingField(targetField);
    setUploadProgress((prev) => ({ ...prev, [targetField]: 10 }));

    const data = new FormData();
    data.append('file', file);
    data.append('type', type);
    if (formData?.id) {
      data.append('startup_id', formData.id);
    }

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
        if (type === 'one_pager') {
          setOnePagerMeta({
            size: file.size,
            date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          });
        }
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
      setFieldErrors((prev) => ({ ...prev, [targetField]: msg }));
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

  const renderVideoCard = (kind: 'demo' | 'elevator') => {
    const isElevator = kind === 'elevator';
    const fieldKey = isElevator ? 'elevator_video' : 'demo_video';
    const sub = videoSubmissions[kind];
    const publishedUrl = isElevator
      ? videoUrls.elevator || formData.elevator_video_url
      : videoUrls.demo || formData.demo_video_url;
    const isApproved = sub?.status === 'approved' || Boolean(isElevator ? formData.elevator_video_url : formData.demo_video_url);
    const isPending = sub?.status === 'pending';
    const isRejected = sub?.status === 'rejected';
    const inputRef = isElevator ? elevatorVideoInputRef : demoVideoInputRef;
    const label = isElevator ? 'Elevator pitch' : 'Product demo';
    const subtitle = isElevator
      ? 'MP4 up to 50MB · max 60 seconds'
      : 'MP4 up to 200MB · for incubator review';
    const cardError = fieldErrors[fieldKey];

    return (
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between">
        <div>
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-indigo-600" />
            <span>{label}</span>
          </label>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5">{subtitle}</p>
        </div>

        {isPending && (
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold text-amber-900">Under review</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-300">
                    Pending review
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  Your MP4 {isElevator ? 'elevator pitch' : 'demo video'} is awaiting incubator review.
                </p>
                {sub?.submitted_at && (
                  <p className="text-[10px] text-amber-600 mt-0.5">
                    Submitted: {new Date(sub.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
              <button
                type="button"
                onClick={() => handleCancelVideoSubmission(kind)}
                disabled={cancellingKind === kind}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg transition cursor-pointer"
              >
                {cancellingKind === kind ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploadingField === fieldKey}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace</span>
              </button>
            </div>
          </div>
        )}

        {isApproved && !isPending && (
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold text-emerald-900">Approved</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">
                  Your {isElevator ? 'elevator pitch' : 'product demo'} is approved and live.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200/60">
              {publishedUrl && (
                <button
                  type="button"
                  onClick={() =>
                    setViewerFile({
                      url: publishedUrl,
                      title: isElevator ? 'Elevator pitch' : 'Product demo video',
                      subtitle: formData.startup_name || formData.businessName || formData.name,
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
                onClick={() => inputRef.current?.click()}
                disabled={uploadingField === fieldKey}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace</span>
              </button>
            </div>
          </div>
        )}

        {isRejected && !isPending && (
          <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold text-rose-900">Submission not approved</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-800 border border-rose-300">
                    Changes requested
                  </span>
                </div>
                <p className="text-xs text-rose-800 mt-1 font-medium">
                  {sub.reason || 'Video did not meet incubator guidelines.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-rose-200/60">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploadingField === fieldKey}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg transition cursor-pointer shadow-2xs"
              >
                <Upload className="w-3 h-3" />
                <span>Upload a new video</span>
              </button>
            </div>
          </div>
        )}

        {!isPending && !isApproved && !isRejected && (
          <div
            onClick={() => inputRef.current?.click()}
            className="p-5 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 text-center cursor-pointer transition group"
          >
            <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 mx-auto mb-1.5 transition" />
            <p className="text-xs font-semibold text-slate-800">Upload MP4</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isElevator ? 'MP4 only, max 60 seconds and 50MB' : 'MP4 file up to 200MB'}
            </p>
          </div>
        )}

        {uploadingField === fieldKey && (
          <div className="space-y-1">
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress[fieldKey] || 0}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Uploading MP4 {uploadProgress[fieldKey] || 0}%...
            </span>
          </div>
        )}

        {cardError && (
          <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{cardError}</span>
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,.mp4"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleVideoUpload(file, kind);
            e.target.value = '';
          }}
        />
      </div>
    );
  };

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
                  <p className="text-[10px] text-slate-400 mt-0.5">PDF, PPT, or PPTX up to 10MB</p>
                </div>
              )}

              {fieldErrors.pitch_deck_url && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.pitch_deck_url}</span>
                </p>
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
                  className="p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 text-center cursor-pointer transition group"
                >
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 mx-auto mb-1 transition" />
                  <p className="text-xs font-medium text-slate-700">Click to upload business plan</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PDF, PPT, or PPTX up to 10MB</p>
                </div>
              )}

              {fieldErrors.business_plan_url && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.business_plan_url}</span>
                </p>
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

      {/* 1b. One-pager (Private document row: PDF, PNG, JPG up to 5MB) */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>One-pager</span>
          </label>
          <span className="text-[10px] text-slate-500 inline-flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>View-only private storage</span>
          </span>
        </div>

        {formData.one_pager_url ? (
          <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-900 truncate">
                  {getFileNameFromUrl(formData.one_pager_url, 'One-pager')}
                </p>
                <span className="text-[10px] text-slate-500 font-normal">
                  {[
                    onePagerMeta?.size ? formatFileSize(onePagerMeta.size) : null,
                    onePagerMeta?.date || null,
                    !onePagerMeta ? 'PDF / Image · Private' : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setViewerFile({
                    url: formData.one_pager_url,
                    title: 'One-pager',
                    subtitle: formData.startup_name || formData.businessName || formData.name,
                    type: 'auto',
                  })
                }
                className="px-2 py-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-md text-xs font-medium inline-flex items-center gap-1 transition cursor-pointer"
                title="View document"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
              <button
                type="button"
                onClick={() => onePagerInputRef.current?.click()}
                className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md text-xs font-medium inline-flex items-center gap-1 transition cursor-pointer"
                title="Replace file"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onFieldChange('one_pager_url', '');
                  setOnePagerMeta(null);
                }}
                className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md text-xs font-medium inline-flex items-center gap-1 transition cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onePagerInputRef.current?.click()}
            className="p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 text-center cursor-pointer transition group"
          >
            <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 mx-auto mb-1 transition" />
            <p className="text-xs font-medium text-slate-700">Click to upload one-pager</p>
            <p className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, or JPG up to 5MB (images compressed automatically)</p>
          </div>
        )}

        {uploadingField === 'one_pager_url' && (
          <div className="space-y-1">
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress['one_pager_url'] || 0}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Uploading {uploadProgress['one_pager_url']}%...
            </span>
          </div>
        )}

        {fieldErrors.one_pager_url && (
          <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{fieldErrors.one_pager_url}</span>
          </p>
        )}

        <input
          ref={onePagerInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, 'one_pager', 'one_pager_url');
            e.target.value = '';
          }}
        />
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

      {/* 3. Videos: Product demo & Elevator pitch (Upload-then-review flow) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderVideoCard('demo')}
        {renderVideoCard('elevator')}
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
        subtitle={viewerFile?.subtitle || formData?.startup_name || formData?.businessName || formData?.name}
        type={viewerFile?.type || 'auto'}
      />
    </div>
  );
};

