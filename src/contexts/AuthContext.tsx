'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { AuthenticatedUser } from '@/types/workspace';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const toAuthenticatedUser = (user: FirebaseUser | null): AuthenticatedUser | null => {
  if (!user) return null;
  return {
    id: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
};

const getAuthErrorMessage = (error: unknown): string => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return 'Não foi possível concluir a operação de autenticação.';
  }

  const code = String(error.code);
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Email ou palavra-passe inválidos.',
    'auth/user-not-found': 'Não existe uma conta com este email.',
    'auth/wrong-password': 'Email ou palavra-passe inválidos.',
    'auth/email-already-in-use': 'Este email já está em uso.',
    'auth/weak-password': 'A palavra-passe deve ter pelo menos seis caracteres.',
    'auth/invalid-email': 'O email informado é inválido.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  };

  return messages[code] || 'Não foi possível concluir a operação de autenticação.';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(toAuthenticatedUser(firebaseUser));
      setIsLoading(false);
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (authError) {
      const message = getAuthErrorMessage(authError);
      setError(message);
      throw new Error(message);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setError(null);
    try {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credentials.user, { displayName });
      setUser(toAuthenticatedUser({ ...credentials.user, displayName }));
    } catch (authError) {
      const message = getAuthErrorMessage(authError);
      setError(message);
      throw new Error(message);
    }
  };

  const signOutUser = async () => {
    setError(null);
    await signOut(auth);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOutUser,
    clearError: () => setError(null),
  }), [user, isLoading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  return context;
}
