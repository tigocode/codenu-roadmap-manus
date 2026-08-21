'use client';

import { useDroppable } from '@dnd-kit/core';
import { MoreHorizontal, Plus } from 'lucide-react';
import type { BoardList, Card } from '@/types/workspace';
import CardTile from './CardTile';

interface BoardListColumnProps {
  list: BoardList;
  cards: Card[];
  onOpenCard?: (card: Card) => void;
  onAddCard?: (listId: string) => void;
}

export default function BoardListColumn({ list, cards, onOpenCard, onAddCard }: BoardListColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: list.id,
    data: { type: 'list', list },
  });

  const sortedCards = [...cards]
    .filter((card) => card.listId === list.id && !card.archivedAt)
    .sort((a, b) => a.position - b.position);

  return (
    <section
      ref={setNodeRef}
      aria-label={`Lista ${list.name}`}
      className={`flex h-full min-h-[460px] w-[300px] shrink-0 flex-col rounded-2xl border p-3 transition-colors ${
        isOver
          ? 'border-indigo-400 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/30'
          : 'border-gray-200 bg-gray-100/80 dark:border-gray-700 dark:bg-gray-900/70'
      }`}
    >
      <header className="flex items-center gap-2 px-1 pb-3">
        <span className={`h-2.5 w-2.5 rounded-full ${list.color || 'bg-indigo-500'}`} aria-hidden="true" />
        <h3 className="flex-1 truncate text-sm font-bold text-gray-800 dark:text-gray-100">{list.name}</h3>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">{sortedCards.length}</span>
        <button type="button" aria-label={`Opções da lista ${list.name}`} className="rounded p-1 text-gray-400 hover:bg-white hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200">
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {sortedCards.map((card) => <CardTile key={card.id} card={card} onOpen={onOpenCard} />)}
        {sortedCards.length === 0 && (
          <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs text-gray-400 dark:border-gray-700">
            Solte cartões aqui
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onAddCard?.(list.id)}
        className="mt-3 flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-white hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-300"
      >
        <Plus className="h-4 w-4" aria-hidden="true" /> Adicionar cartão
      </button>
    </section>
  );
}
