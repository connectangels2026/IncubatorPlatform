'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, Trash2, Image as ImageIcon, Link as LinkIcon, Plus } from 'lucide-react';

interface ImageItem {
  id: string;
  url: string;
  name: string;
  size?: string;
}

interface LogoImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  maxImages?: number;
}

export const LogoImageUploader: React.FC<LogoImageUploaderProps> = ({
  value = '',
  onChange,
  maxImages = 3,
}) => {
  const [images, setImages] = useState<ImageItem[]>(() => {
    if (value) {
      return [{ id: 'current', url: value, name: 'Active Logo' }];
    }
    return [];
  });
  const [selectedUrl, setSelectedUrl] = useState<string>(value || '');
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when prop value changes
  useEffect(() => {
    if (value && value !== selectedUrl) {
      setSelectedUrl(value);
      setImages((prev) => {
        const exists = prev.some((img) => img.url === value);
        if (!exists) {
          return [{ id: `img_${Date.now()}`, url: value, name: 'Active Logo' }, ...prev].slice(0, maxImages);
        }
        return prev;
      });
    }
  }, [value, maxImages, selectedUrl]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setError(`Maximum ${maxImages} images allowed. Remove an existing image first.`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files (PNG, JPG, SVG, WebP) are supported.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(`Image ${file.name} exceeds 5MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const resultUrl = e.target?.result as string;
        if (resultUrl) {
          const newItem: ImageItem = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            url: resultUrl,
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
          };

          setImages((prev) => {
            const next = [...prev, newItem].slice(0, maxImages);
            return next;
          });

          // Automatically select as active if no active or if it's the first
          setSelectedUrl(resultUrl);
          onChange(resultUrl);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSelectImage = (url: string) => {
    setSelectedUrl(url);
    onChange(url);
  };

  const handleRemoveImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = images.find((img) => img.id === id);
    const updated = images.filter((img) => img.id !== id);
    setImages(updated);

    if (target?.url === selectedUrl) {
      const nextActive = updated[0]?.url || '';
      setSelectedUrl(nextActive);
      onChange(nextActive);
    }
  };

  const handleAddCustomUrl = () => {
    if (!customUrl.trim()) return;
    const trimmed = customUrl.trim();
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed. Remove one first.`);
      return;
    }

    const newItem: ImageItem = {
      id: `url_${Date.now()}`,
      url: trimmed,
      name: 'Linked Image',
    };

    setImages((prev) => [...prev, newItem].slice(0, maxImages));
    setSelectedUrl(trimmed);
    onChange(trimmed);
    setCustomUrl('');
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          Startup Logo & Media <span className="text-slate-400 font-normal">({images.length}/{maxImages} images)</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL link' : 'Or paste image URL'}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            type="button"
            onClick={handleAddCustomUrl}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>
      )}

      {/* Upload Drop Zone if not full */}
      {images.length < maxImages && (
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
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/60'
              : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            multiple
            className="hidden"
          />
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">
              Click to upload or drag & drop images
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Select 2–3 logo variants (PNG, JPG, SVG, WebP up to 5MB each)
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-600 font-semibold">{error}</p>
      )}

      {/* Gallery of Uploaded / Preview Images */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Select Active Logo
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((item) => {
              const isActive = item.url === selectedUrl;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectImage(item.url)}
                  className={`group relative rounded-xl border-2 p-2.5 transition cursor-pointer flex flex-col items-center gap-2 bg-white ${
                    isActive
                      ? 'border-blue-600 shadow-sm ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Badge */}
                  {isActive && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-600 text-white uppercase tracking-wider shadow-2xs">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Active Logo
                    </span>
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveImage(item.id, e)}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-white/80 hover:bg-rose-50 text-slate-400 hover:text-rose-600 opacity-80 group-hover:opacity-100 transition shadow-xs"
                    title="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-full h-20 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-1 mt-3">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  </div>

                  <div className="w-full text-center">
                    <p className="text-[11px] font-bold text-slate-800 truncate">
                      {item.name}
                    </p>
                    {item.size && (
                      <p className="text-[10px] text-slate-400 font-medium">
                        {item.size}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

