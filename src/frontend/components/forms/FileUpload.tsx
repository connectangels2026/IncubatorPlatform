'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, File, X } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  onFileSelect?: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({ label, onFileSelect, accept, maxSizeMB = 5 }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selected = files[0];
    if (selected.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    setError(null);
    setFile(selected);
    if (onFileSelect) onFileSelect(selected);
  };

  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            ref={inputRef}
            onChange={(e) => handleFiles(e.target.files)}
            accept={accept}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700">Click to upload or drag and drop</p>
          <p className="text-[10px] text-slate-400 mt-1">Supported formats: PDF, DOCX, PNG (Max {maxSizeMB}MB)</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <File className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
              <p className="text-[10px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFile(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}
