'use client';

import React from 'react';

export const LOGO_SWATCH_COLORS = [
  '#4F46E5', // Indigo
  '#2563EB', // Blue
  '#0D9488', // Teal
  '#059669', // Emerald
  '#D97706', // Amber
  '#E11D48', // Rose
  '#7C3AED', // Purple
  '#334155', // Slate
];

export function getDerivedColor(name: string = ''): string {
  if (!name) return LOGO_SWATCH_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LOGO_SWATCH_COLORS[Math.abs(hash) % LOGO_SWATCH_COLORS.length];
}

export function getDerivedInitials(name: string = '', customInitials?: string | null): string {
  if (customInitials && customInitials.trim()) {
    return customInitials.trim().slice(0, 2).toUpperCase();
  }
  const clean = (name || '').trim();
  if (!clean) return 'ST';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export interface StartupLogoProps {
  name?: string;
  logoUrl?: string | null;
  logoColor?: string | null;
  initials?: string | null;
  className?: string;
  alt?: string;
}

export const StartupLogo: React.FC<StartupLogoProps> = ({
  name = '',
  logoUrl,
  logoColor,
  initials,
  className = 'w-9 h-9 rounded-lg text-xs',
  alt,
}) => {
  if (logoUrl && logoUrl.trim()) {
    return (
      <img
        src={logoUrl}
        alt={alt || name || 'Startup logo'}
        className={`object-cover shrink-0 select-none ${className}`}
      />
    );
  }

  const bgColor = logoColor && logoColor.trim() ? logoColor : getDerivedColor(name);
  const text = getDerivedInitials(name, initials);

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className={`flex items-center justify-center font-semibold text-white shrink-0 select-none ${className}`}
      aria-label={name || 'Startup logo'}
    >
      {text}
    </div>
  );
};

export default StartupLogo;

