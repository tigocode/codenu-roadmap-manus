'use client';

import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
  isDarkMode: boolean;
}

export default function ToastItem({ toast, onRemove, isDarkMode }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-indigo-500" />
  };

  const colors = {
    success: isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-100',
    error: isDarkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100',
    info: isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'
  };

  return (
    <div className={`flex items-center gap-4 p-4 pr-12 rounded-2xl border shadow-xl animate-in slide-in-from-right-10 fade-in duration-300 relative min-w-[300px] max-w-md ${colors[toast.type]} ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <p className="text-xs font-black uppercase tracking-widest leading-relaxed">
        {toast.message}
      </p>
      <button 
        onClick={() => onRemove(toast.id)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove, isDarkMode }: { toasts: Toast[], onRemove: (id: string) => void, isDarkMode: boolean }) {
  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} isDarkMode={isDarkMode} />
      ))}
    </div>
  );
}
