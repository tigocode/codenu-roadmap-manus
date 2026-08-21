export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export type BoardVisibility = 'private' | 'workspace';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  displayName: string;
  email: string;
  role: WorkspaceRole;
  avatarUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  visibility: BoardVisibility;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface BoardList {
  id: string;
  boardId: string;
  name: string;
  color: string;
  position: number;
  createdAt: number;
  updatedAt: number;
}

export interface CardPosition {
  listId: string;
  position: number;
}

export interface Card {
  id: string;
  boardId: string;
  listId: string;
  title: string;
  description: string;
  position: number;
  createdBy: string;
  assigneeIds: string[];
  labelIds: string[];
  dueDate?: number;
  archivedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ActivityEvent {
  id: string;
  workspaceId: string;
  boardId?: string;
  cardId?: string;
  actorId: string;
  type: string;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
