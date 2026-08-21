'use client';

import React, { useState, type ComponentProps } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn, error } = useAuth();

  const handleLogin: ComponentProps<typeof LoginForm>['onSubmit'] = async (data) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] dark:bg-gray-900 transition-colors duration-500 px-4 relative overflow-hidden">
      {/* Background Decorativo - Radial Gradient do Protótipo */}
      <div 
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2] pointer-events-none transition-opacity duration-1000" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)', 
          backgroundSize: '32px 32px' 
        }}
      ></div>
      
      {/* Círculos de luz decorativos */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>

      <div className="flex flex-col items-center gap-10 w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo Centralizado */}
        <Logo size="lg" className="scale-110 drop-shadow-xl" />

        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        {error && (
          <p role="alert" className="-mt-6 w-full max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}
        
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-tight">
          Ainda não tem conta? <a href="#" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 underline-offset-4 hover:underline transition-all">Comece agora gratuitamente</a>
        </div>
      </div>
    </div>
  );
}
