'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { box: 'w-8 h-8 text-xl rounded-lg', text: 'text-lg' },
    md: { box: 'w-10 h-10 text-2xl rounded-xl', text: 'text-2xl' },
    lg: { box: 'w-12 h-12 text-3xl rounded-2xl', text: 'text-3xl' },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${currentSize.box} bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
        C
      </div>
      {showText && (
        <span className={`${currentSize.text} font-bold tracking-tight text-gray-900 dark:text-white transition-colors`}>
          Codenu
        </span>
      )}
    </div>
  );
}
