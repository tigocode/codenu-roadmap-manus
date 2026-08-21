'use client';

import KanbanBoard from '@/components/kanban/KanbanBoard';
import type { Board, BoardList, Card } from '@/types/workspace';

const demoBoard: Board = {
  id: 'demo-board',
  workspaceId: 'demo-workspace',
  name: 'Desenvolvimento do produto',
  description: 'Fluxo inicial de desenvolvimento de software',
  visibility: 'workspace',
  createdBy: 'demo-user',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const demoLists: BoardList[] = [
  { id: 'backlog', boardId: demoBoard.id, name: 'Backlog', color: 'bg-slate-400', position: 1000, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'progress', boardId: demoBoard.id, name: 'Em desenvolvimento', color: 'bg-blue-500', position: 2000, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'review', boardId: demoBoard.id, name: 'Em revisão', color: 'bg-amber-500', position: 3000, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'done', boardId: demoBoard.id, name: 'Concluído', color: 'bg-emerald-500', position: 4000, createdAt: Date.now(), updatedAt: Date.now() },
];

const demoCards: Card[] = [
  { id: 'card-1', boardId: demoBoard.id, listId: 'backlog', title: 'Definir fluxo de autenticação', description: '', position: 1000, createdBy: 'demo-user', assigneeIds: [], labelIds: ['Feature'], createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'card-2', boardId: demoBoard.id, listId: 'progress', title: 'Criar componente de cartão', description: '', position: 1000, createdBy: 'demo-user', assigneeIds: ['demo-user'], labelIds: ['Frontend'], createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'card-3', boardId: demoBoard.id, listId: 'review', title: 'Revisar regras do Firestore', description: '', position: 1000, createdBy: 'demo-user', assigneeIds: [], labelIds: ['Backend'], createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'card-4', boardId: demoBoard.id, listId: 'done', title: 'Configurar testes do Jest', description: '', position: 1000, createdBy: 'demo-user', assigneeIds: [], labelIds: ['Infra'], createdAt: Date.now(), updatedAt: Date.now() },
];

export default function KanbanPreviewPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 dark:bg-gray-900">
      <KanbanBoard
        board={demoBoard}
        lists={demoLists}
        cards={demoCards}
        onMoveCard={(cardId, listId, position) => {
          console.info('Movimento pronto para persistência:', { cardId, listId, position });
        }}
      />
    </main>
  );
}
