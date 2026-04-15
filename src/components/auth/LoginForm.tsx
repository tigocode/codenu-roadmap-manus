'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const loginSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
}

export default function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  console.log('RHF Errors:', errors);

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300">
      <div className="flex flex-col gap-2 mb-8 text-center sm:text-left">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bem-vindo de volta</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Entre na sua conta para gerir o seu roadmap</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          {...register('email')}
          id="email"
          label="Email Profissional"
          type="email"
          placeholder="exemplo@equipa.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          autoComplete="email"
        />

        <Input
          {...register('password')}
          id="password"
          label="Palavra-passe"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-end">
          <a href="#" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4">
            Esqueceu-se da palavra-passe?
          </a>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          isLoading={isLoading}
        >
          Entrar na Plataforma
        </Button>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-2">
          Ao entrar, concorda com os nossos <a href="#" className="underline">Termos de Serviço</a>.
        </p>
      </form>
    </div>
  );
}
