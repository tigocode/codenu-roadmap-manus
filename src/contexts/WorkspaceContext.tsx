'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Board, BoardList, Workspace, WorkspaceMember } from '@/types/workspace';

interface WorkspaceContextValue {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  boards: Board[];
  currentBoard: Board | null;
  lists: BoardList[];
  membership: WorkspaceMember | null;
  isLoading: boolean;
  selectWorkspace: (workspaceId: string) => void;
  selectBoard: (boardId: string) => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  createBoard: (name: string, description?: string) => Promise<Board>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);
const WORKSPACE_STORAGE_KEY = 'codenu_current_workspace';
const BOARD_STORAGE_KEY = 'codenu_current_board';

const slugify = (value: string): string => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const defaultLists = (boardId: string, timestamp: number): BoardList[] => [
  { id: `${boardId}-backlog`, boardId, name: 'Backlog', color: 'slate', position: 1000, createdAt: timestamp, updatedAt: timestamp },
  { id: `${boardId}-development`, boardId, name: 'Em desenvolvimento', color: 'indigo', position: 2000, createdAt: timestamp, updatedAt: timestamp },
  { id: `${boardId}-review`, boardId, name: 'Em revisão', color: 'amber', position: 3000, createdAt: timestamp, updatedAt: timestamp },
  { id: `${boardId}-done`, boardId, name: 'Concluído', color: 'emerald', position: 4000, createdAt: timestamp, updatedAt: timestamp },
];

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [lists, setLists] = useState<BoardList[]>([]);
  const [membership, setMembership] = useState<WorkspaceMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sincroniza a sessão autenticada com os workspaces externos.
  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspaceId(null);
      setBoards([]);
      setCurrentBoardId(null);
      setLists([]);
      setMembership(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const membershipQuery = query(
      collection(db, 'users', user.id, 'workspaces'),
      orderBy('createdAt', 'asc'),
    );

    return onSnapshot(membershipQuery, (snapshot) => {
      const nextWorkspaces = snapshot.docs.map((item) => item.data() as Workspace);
      setWorkspaces(nextWorkspaces);
      const savedWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem(WORKSPACE_STORAGE_KEY) : null;
      const selectedId = nextWorkspaces.some((workspace) => workspace.id === savedWorkspaceId)
        ? savedWorkspaceId
        : nextWorkspaces[0]?.id || null;
      setCurrentWorkspaceId(selectedId);
      setIsLoading(false);
    }, () => setIsLoading(false));
  }, [user]);

  const currentWorkspace = workspaces.find((workspace) => workspace.id === currentWorkspaceId) || null;

  // Limpa o cache local antes de assinar o workspace selecionado.
  useEffect(() => {
    if (!currentWorkspaceId) {
      setBoards([]);
      setCurrentBoardId(null);
      setMembership(null);
      return;
    }

    const boardQuery = query(
      collection(db, 'workspaces', currentWorkspaceId, 'boards'),
      orderBy('createdAt', 'asc'),
    );
    const memberRef = doc(db, 'workspaces', currentWorkspaceId, 'members', user?.id || 'unknown');
    const unsubscribeBoards = onSnapshot(boardQuery, (snapshot) => {
      const nextBoards = snapshot.docs.map((item) => item.data() as Board);
      setBoards(nextBoards);
      const savedBoardId = typeof window !== 'undefined' ? localStorage.getItem(BOARD_STORAGE_KEY) : null;
      const selectedId = nextBoards.some((board) => board.id === savedBoardId)
        ? savedBoardId
        : nextBoards[0]?.id || null;
      setCurrentBoardId(selectedId);
    });
    const unsubscribeMember = onSnapshot(memberRef, (snapshot) => {
      setMembership(snapshot.exists() ? snapshot.data() as WorkspaceMember : null);
    });

    return () => {
      unsubscribeBoards();
      unsubscribeMember();
    };
  }, [currentWorkspaceId, user?.id]);

  const currentBoard = boards.find((board) => board.id === currentBoardId) || null;

  // Limpa a lista quando o board deixa de estar selecionado.
  useEffect(() => {
    if (!currentBoardId) {
      setLists([]);
      return;
    }
    return onSnapshot(
      query(collection(db, 'workspaces', currentWorkspaceId || 'unknown', 'boards', currentBoardId, 'lists'), orderBy('position', 'asc')),
      (snapshot) => setLists(snapshot.docs.map((item) => item.data() as BoardList)),
    );
  }, [currentBoardId, currentWorkspaceId]);

  const selectWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    if (typeof window !== 'undefined') localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
  };

  const selectBoard = (boardId: string) => {
    setCurrentBoardId(boardId);
    if (typeof window !== 'undefined') localStorage.setItem(BOARD_STORAGE_KEY, boardId);
  };

  const createWorkspace = async (name: string): Promise<Workspace> => {
    if (!user) throw new Error('É necessário estar autenticado para criar um workspace.');
    const timestamp = Date.now();
    const workspaceId = `ws-${user.id}-${timestamp}`;
    const workspace: Workspace = {
      id: workspaceId,
      name: name.trim(),
      slug: `${slugify(name)}-${timestamp}`,
      ownerId: user.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const membership: WorkspaceMember = {
      id: user.id,
      workspaceId,
      userId: user.id,
      displayName: user.displayName || user.email || 'Usuário',
      email: user.email || '',
      role: 'owner',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const batch = writeBatch(db);
    batch.set(doc(db, 'workspaces', workspaceId), workspace);
    batch.set(doc(db, 'workspaces', workspaceId, 'members', user.id), membership);
    batch.set(doc(db, 'users', user.id, 'workspaces', workspaceId), workspace);
    await batch.commit();
    selectWorkspace(workspaceId);
    return workspace;
  };

  const createBoard = async (name: string, description = ''): Promise<Board> => {
    if (!user || !currentWorkspace) throw new Error('Selecione um workspace antes de criar um board.');
    const timestamp = Date.now();
    const boardId = `board-${currentWorkspace.id}-${timestamp}`;
    const board: Board = {
      id: boardId,
      workspaceId: currentWorkspace.id,
      name: name.trim(),
      description,
      visibility: 'workspace',
      createdBy: user.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const batch = writeBatch(db);
    batch.set(doc(db, 'workspaces', currentWorkspace.id, 'boards', boardId), board);
    for (const list of defaultLists(boardId, timestamp)) {
      batch.set(doc(db, 'workspaces', currentWorkspace.id, 'boards', boardId, 'lists', list.id), list);
    }
    await batch.commit();
    selectBoard(boardId);
    return board;
  };

  const value: WorkspaceContextValue = {
    workspaces,
    currentWorkspace,
    boards,
    currentBoard,
    lists,
    membership,
    isLoading: isAuthLoading || isLoading,
    selectWorkspace,
    selectBoard,
    createWorkspace,
    createBoard,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace deve ser utilizado dentro de um WorkspaceProvider');
  return context;
}
