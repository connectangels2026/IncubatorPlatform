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

export function LogoIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7 23.5L16 6.5L25 23.5"
        stroke="url(#arbaChevronGrad)"
        strokeWidth="4.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="arbaChevronGrad" x1="7" y1="23.5" x2="25" y2="6.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0284c7" />
          <stop offset="1" stopColor="#0066cc" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Logo({
  className = '',
  size = 'md',
  href = '/',
  showText = true,
  variant = 'dark',
}: LogoProps) {
  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  const content = (
    <div
      className={`inline-flex items-center ${
        showText ? 'gap-2 sm:gap-2.5' : 'justify-center'
      } hover:opacity-90 transition select-none ${className}`}
    >
      <LogoIcon className={iconSize} />
      {showText && (
        <span className={`font-extrabold tracking-tight ${textSize}`}>
          <span className={variant === 'light' ? 'text-white' : 'text-slate-900'}>Arba</span>
          <span className="text-[#2563eb]">360</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
