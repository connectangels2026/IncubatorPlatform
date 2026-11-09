'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, FileText, AlertCircle, Loader2, Film, ShieldAlert } from 'lucide-react';
import { supabase } from '@/backend/lib/supabase';

export interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string | null;
  title?: string;
  type?: 'pdf' | 'video' | 'pptx' | 'unsupported' | 'auto';
}

function detectFileType(url?: string | null, explicitType?: string): 'pdf' | 'video' | 'unsupported' {
  if (explicitType && explicitType !== 'auto') {
    if (explicitType === 'video' || explicitType === 'mp4') return 'video';
    if (explicitType === 'pdf') return 'pdf';
    return 'unsupported';
  }
  if (!url) return 'unsupported';

  const cleanUrl = url.split('?')[0].toLowerCase();
  if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov') || cleanUrl.includes('video')) {
    return 'video';
  }
  if (cleanUrl.endsWith('.pdf') || cleanUrl.includes('.pdf?')) {
    return 'pdf';
  }
  // PPT, PPTX, DOC, DOCX, ZIP, etc.
  return 'unsupported';
}

export function FileViewerModal({
  isOpen,
  onClose,
  url,
  title = 'Document Viewer',
  type = 'auto',
}: FileViewerModalProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const fileType = detectFileType(url, type);

  // Resolve private storage URL if needed
  useEffect(() => {
    if (!isOpen || !url) {
      setResolvedUrl(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    const resolveUrl = async () => {
      try {
        // If it's a Supabase storage path or private bucket reference
        if (url.includes('supabase.co/storage/v1/object/') && !url.includes('/public/')) {
          const match = url.match(/\/object\/([^/]+)\/(.+)$/);
          if (match) {
            const bucket = match[1];
            const path = decodeURIComponent(match[2].split('?')[0]);
            const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
            if (error) throw error;
            if (isMounted && data?.signedUrl) {
              setResolvedUrl(data.signedUrl);
              setIsLoading(false);
              return;
            }
          }
        }
        if (isMounted) {
          setResolvedUrl(url);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Failed to resolve signed URL, falling back to original:', err);
          setResolvedUrl(url);
          setIsLoading(false);
        }
      }
    };

    resolveUrl();

    return () => {
      isMounted = false;
    };
  }, [isOpen, url]);

  // Pause and unload video on close
  const handleClose = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
      videoRef.current.load();
    }
    onClose();
  }, [onClose]);

  // Handle ESC key & backdrop click
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4 md:p-6 transition-all animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative flex flex-col w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl bg-white sm:rounded-2xl shadow-2xl overflow-hidden outline-none border border-slate-200/80"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Header: Title and Close (X) only. Strictly NO download button */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/90 select-none shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              {fileType === 'video' ? <Film className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 truncate" title={title}>
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">View only &bull; Protected preview</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center min-h-[300px] sm:min-h-[550px] overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-xs font-medium">Loading secure preview...</p>
            </div>
          ) : !resolvedUrl || fileType === 'unsupported' ? (
            <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-3 bg-white rounded-2xl shadow-sm border border-slate-200 m-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">Preview not available for this file type</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct in-app viewing is supported for PDF documents and MP4 videos. Other presentation formats or unsupported file types cannot be previewed in view-only mode.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          ) : fileType === 'video' ? (
            <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
              <video
                ref={videoRef}
                controls
                autoPlay
                controlsList="nodownload"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="max-w-full max-h-[75vh] rounded-lg shadow-lg bg-black object-contain"
                src={resolvedUrl}
              >
                Your browser does not support HTML5 video preview.
              </video>
            </div>
          ) : (
            <div className="w-full h-full relative bg-slate-100 flex flex-col">
              <iframe
                src={`${resolvedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title={title}
                className="w-full flex-1 border-0 h-full min-h-[550px]"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

