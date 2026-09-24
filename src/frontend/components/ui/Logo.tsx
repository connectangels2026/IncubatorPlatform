'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  variant?: 'dark' | 'light';
  showText?: boolean;
}

export function LogoIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6 24L16 6L26 24"
        stroke="url(#arba360Gradient)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="arba360Gradient" x1="6" y1="24" x2="26" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Logo({
  className = '',
  size = 'md',
  href = '/',
  variant = 'dark',
  showText = true,
}: LogoProps) {
  const iconClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-7 h-7';
  const textClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const textColor = variant === 'light' ? 'text-white' : 'text-slate-900';

  const content = (
    <div
      className={`inline-flex items-center ${
        showText ? 'gap-2.5' : 'justify-center'
      } hover:opacity-90 transition select-none ${className}`}
    >
      <LogoIcon className={iconClass} />
      {showText && (
        <span className={`font-bold tracking-tight ${textColor} ${textClass}`}>
          <span className="font-serif">Arba</span>
          <span className="font-sans font-extrabold text-blue-600">360</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
