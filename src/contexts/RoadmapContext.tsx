'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { RoadmapItem, RoadmapStatus, TeamMember } from '@/types/roadmap';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  collectionGroup
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import type { Toast, ToastType } from '@/components/ui/Toast';

interface RoadmapFilters {
  tag: string | null;
  assigneeId: string | null;
}

const DEFAULT_TEAM: TeamMember[] = [
  { id: 'usr-1', name: 'Rui Reis', role: 'Fundador & Engenheiro', color: 'bg-indigo-500', createdAt: Date.now() },
  { id: 'usr-2', name: 'Ana Silva', role: 'UX/UI Design', color: 'bg-purple-500', createdAt: Date.now() },
  { id: 'usr-3', name: 'João Costa', role: 'Backend', color: 'bg-blue-500', createdAt: Date.now() },
];

interface RoadmapStats {
  total: number;
  byStatus: { [key in RoadmapStatus]: number };
  completionRate: number;
  effortPoints: number;
  unassigned: number;
}

type SyncMode = 'local' | 'cloud';

interface RoadmapContextType {
  items: RoadmapItem[];
  filteredItems: RoadmapItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: RoadmapFilters;
  setFilter: (type: keyof RoadmapFilters, value: string | null) => void;
  clearFilters: () => void;
  addQuickIdea: (title: string, createdBy?: string) => Promise<void>;
  updateItemStatus: (id: string, newStatus: RoadmapStatus) => Promise<void>;
  updateItem: (id: string, updates: Partial<RoadmapItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  currentUser: TeamMember;
  setCurrentUser: (user: TeamMember) => void;
  team: TeamMember[];
  addMember: (member: Omit<TeamMember, 'id' | 'createdAt'>) => Promise<void>;
  updateMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  migrateLocalToCloud: () => Promise<void>;
  isHydrated: boolean;
  stats: RoadmapStats;
  syncMode: SyncMode;
  setSyncMode: (mode: SyncMode) => void;
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

const APP_ID = 'codenu-roadmap-v1'; // ID da aplicação no Firestore

interface RoadmapProviderProps {
  children: ReactNode;
  initialItems: RoadmapItem[];
}

// Utilitário para cálculo de ICE Score
const calculateIceScore = (item: Partial<RoadmapItem>): number => {
  const impactMap: Record<string, number> = { 'Nice to have': 3, 'Core': 6, 'Game Changer': 10 };
  const easeMap: Record<string, number> = { 'Dias': 10, 'Semanas': 5, 'Meses': 2 };
  
  const i = impactMap[item.impact || ''] || 5;
  const c = item.confidence || 5;
  const e = easeMap[item.effort || ''] || 5;
  
  return i * c * e;
};

export const RoadmapProvider = ({ children, initialItems }: RoadmapProviderProps) => {
  const [items, setItems] = useState<RoadmapItem[]>(initialItems);
  const [team, setTeam] = useState<TeamMember[]>(DEFAULT_TEAM);
  const [isHydrated, setIsHydrated] = useState(false);
  const [syncMode, setSyncMode] = useState<SyncMode>('local');
  const [currentUser, setCurrentUser] = useState<TeamMember>(DEFAULT_TEAM[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RoadmapFilters>({
    tag: null,
    assigneeId: null
  });

  // 1. Hidratação inicial (Modo e LocalStorage)
  useEffect(() => {
    const savedMode = localStorage.getItem('codenu_sync_mode') as SyncMode;
    if (savedMode) setSyncMode(savedMode);

    const savedItems = localStorage.getItem('codenu_items');
    const savedUser = localStorage.getItem('codenu_current_user');
    const savedTeam = localStorage.getItem('codenu_team');
    
    let loadedTeam = DEFAULT_TEAM;
    if (savedTeam) {
      try {
        loadedTeam = JSON.parse(savedTeam);
        setTeam(loadedTeam);
      } catch (e) {
        console.error("Erro ao carregar equipa do localStorage", e);
      }
    }

    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (e) {
        console.error("Erro ao carregar itens do localStorage", e);
      }
    }

    if (savedUser) {
      const user = loadedTeam.find(m => m.id === savedUser);
      if (user) setCurrentUser(user);
    }

    setIsHydrated(true);
  }, []);

  // 2. Persistência de Configurações Locais
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('codenu_sync_mode', syncMode);
      if (syncMode === 'local') {
        localStorage.setItem('codenu_items', JSON.stringify(items));
        localStorage.setItem('codenu_team', JSON.stringify(team));
      }
    }
  }, [items, team, syncMode, isHydrated]);

  useEffect(() => {
    if (isHydrated && currentUser) {
      localStorage.setItem('codenu_current_user', currentUser.id);
    }
  }, [currentUser, isHydrated]);

  // 3. Sincronização Cloud (Firebase)
  useEffect(() => {
    if (syncMode !== 'cloud') return;

    signInAnonymously(auth).catch(err => console.error("Firebase Auth Error:", err));

    const itemsCol = collection(db, 'workspaces', APP_ID, 'items');
    const teamCol = collection(db, 'workspaces', APP_ID, 'team');

    const unsubItems = onSnapshot(query(itemsCol, orderBy('createdAt', 'desc')), (snapshot) => {
      const cloudItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoadmapItem));
      if (cloudItems.length > 0) {
        setItems(cloudItems);
      }
    });

    const unsubTeam = onSnapshot(query(teamCol, orderBy('createdAt', 'asc')), (snapshot) => {
      const cloudTeam = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
      if (cloudTeam.length > 0) {
        setTeam(cloudTeam);
        const savedUserId = localStorage.getItem('codenu_current_user');
        const userFound = cloudTeam.find(m => m.id === savedUserId);
        if (userFound) setCurrentUser(userFound);
        else setCurrentUser(cloudTeam[0]);
      }
    });

    return () => {
      unsubItems();
      unsubTeam();
    };
  }, [syncMode]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !filters.tag || item.tag === filters.tag;
      const matchesAssignee = !filters.assigneeId || item.assigneeId === filters.assigneeId;
      
      return matchesSearch && matchesTag && matchesAssignee;
    });
  }, [items, searchQuery, filters]);

  // Estatísticas
  const stats = useMemo(() => {
    const initialStats: RoadmapStats = {
      total: filteredItems.length,
      byStatus: { now: 0, next: 0, later: 0, inbox: 0 },
      completionRate: 0,
      effortPoints: 0,
      unassigned: 0
    };

    if (filteredItems.length === 0) return initialStats;

    let totalChecklistTasks = 0;
    let completedChecklistTasks = 0;

    filteredItems.forEach(item => {
      initialStats.byStatus[item.status]++;
      const effortMap: Record<string, number> = { 'Dias': 1, 'Semanas': 3, 'Meses': 10 };
      initialStats.effortPoints += effortMap[item.effort || ''] || 0;
      if (!item.assigneeId) initialStats.unassigned++;
      if (item.checklist && item.checklist.length > 0) {
        totalChecklistTasks += item.checklist.length;
        completedChecklistTasks += item.checklist.filter(c => c.done).length;
      }
    });

    initialStats.completionRate = totalChecklistTasks > 0 
      ? Math.round((completedChecklistTasks / totalChecklistTasks) * 100) 
      : 0;

    return initialStats;
  }, [filteredItems]);

  const addQuickIdea = async (title: string, createdBy?: string) => {
    const newItem: RoadmapItem = {
      id: `rd-${Date.now()}`,
      title,
      status: 'inbox',
      description: '',
      checklist: [],
      createdAt: Date.now(),
      createdBy: createdBy || currentUser.id,
      iceScore: 0 // Inicial
    };

    if (syncMode === 'cloud') {
      await setDoc(doc(db, 'workspaces', APP_ID, 'items', newItem.id), newItem);
    } else {
      setItems((prev) => [newItem, ...prev]);
    }
  };

  const updateItemStatus = async (id: string, newStatus: RoadmapStatus) => {
    if (syncMode === 'cloud') {
      await setDoc(doc(db, 'workspaces', APP_ID, 'items', id), { status: newStatus }, { merge: true });
    } else {
      setItems((prev) => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    }
  };

  const updateItem = async (id: string, updates: Partial<RoadmapItem>) => {
    const itemToUpdate = items.find(i => i.id === id);
    if (!itemToUpdate) return;

    const merged = { ...itemToUpdate, ...updates };
    const newIceScore = calculateIceScore(merged);
    const finalUpdates = { ...updates, iceScore: newIceScore };

    if (syncMode === 'cloud') {
      await setDoc(doc(db, 'workspaces', APP_ID, 'items', id), finalUpdates, { merge: true });
    } else {
      setItems((prev) => prev.map(item => item.id === id ? { ...item, ...finalUpdates } : item));
    }
  };

  const deleteItem = async (id: string) => {
    if (syncMode === 'cloud') {
      await deleteDoc(doc(db, 'workspaces', APP_ID, 'items', id));
    } else {
      setItems((prev) => prev.filter(item => item.id !== id));
    }
  };

  const addMember = async (member: Omit<TeamMember, 'id' | 'createdAt'>) => {
    const newMember: TeamMember = {
      ...member,
      id: `usr-${Date.now()}`,
      createdAt: Date.now()
    };

    if (syncMode === 'cloud') {
      await setDoc(doc(db, 'workspaces', APP_ID, 'team', newMember.id), newMember);
    } else {
      setTeam(prev => [...prev, newMember]);
    }
  };

  const updateMember = async (id: string, updates: Partial<TeamMember>) => {
    if (syncMode === 'cloud') {
      await setDoc(doc(db, 'workspaces', APP_ID, 'team', id), updates, { merge: true });
    } else {
      setTeam(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      if (currentUser.id === id) setCurrentUser(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteMember = async (id: string) => {
    if (syncMode === 'cloud') {
      await deleteDoc(doc(db, 'workspaces', APP_ID, 'team', id));
    } else {
      setTeam(prev => prev.filter(m => m.id !== id));
      if (currentUser.id === id) {
        const remaining = team.filter(m => m.id !== id);
        if (remaining.length > 0) setCurrentUser(remaining[0]);
      }
    }
  };

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const migrateLocalToCloud = async () => {
    if (syncMode !== 'cloud') return;
    
    try {
      // Migrar Itens
      for (const item of items) {
        await setDoc(doc(db, 'workspaces', APP_ID, 'items', item.id), item);
      }
      
      // Migrar Equipa
      for (const member of team) {
        await setDoc(doc(db, 'workspaces', APP_ID, 'team', member.id), member);
      }
      
      addToast('Dados locais migrados com sucesso!', 'success');
    } catch (error) {
      console.error("Erro na migração:", error);
      addToast('Erro ao migrar dados para a nuvem.', 'error');
    }
  };

  const setFilter = (type: keyof RoadmapFilters, value: string | null) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ tag: null, assigneeId: null });
  };

  return (
    <RoadmapContext.Provider value={{ 
      items, 
      filteredItems,
      searchQuery,
      setSearchQuery,
      filters,
      setFilter,
      clearFilters,
      addQuickIdea, 
      updateItemStatus, 
      updateItem,
      deleteItem,
      currentUser,
      setCurrentUser,
      team,
      addMember,
      updateMember,
      deleteMember,
      migrateLocalToCloud,
      isHydrated,
      stats,
      syncMode,
      setSyncMode,
      toasts,
      addToast,
      removeToast
    }}>
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (context === undefined) {
    throw new Error('useRoadmap deve ser utilizado dentro de um RoadmapProvider');
  }
  return context;
};
