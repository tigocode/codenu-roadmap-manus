'use client';

import { useMemo, useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { LayoutDashboard, Search, SlidersHorizontal } from 'lucide-react';
import type { Board, BoardList, Card } from '@/types/workspace';
import { getCardPosition } from '@/lib/kanban';
import BoardListColumn from './BoardListColumn';
import CardTile from './CardTile';

interface KanbanBoardProps {
  board: Board;
  lists: BoardList[];
  cards: Card[];
  onMoveCard?: (cardId: string, listId: string, position: number) => Promise<void> | void;
  onOpenCard?: (card: Card) => void;
  onAddCard?: (listId: string) => void;
}

export default function KanbanBoard({ board, lists, cards: initialCards, onMoveCard, onOpenCard, onAddCard }: KanbanBoardProps) {
  const [cards, setCards] = useState(initialCards);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const activeCard = useMemo(() => cards.find((card) => card.id === activeCardId) || null, [activeCardId, cards]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveCardId(String(active.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCardId(null);
    if (!over) return;

    const cardId = String(active.id);
    const draggedCard = cards.find((card) => card.id === cardId);
    if (!draggedCard) return;

    const overCard = cards.find((card) => card.id === String(over.id));
    const targetListId = overCard?.listId || String(over.id);
    if (!lists.some((list) => list.id === targetListId)) return;

    const targetCards = cards
      .filter((card) => card.listId === targetListId && card.id !== cardId)
      .sort((a, b) => a.position - b.position);
    const targetIndex = overCard ? targetCards.findIndex((card) => card.id === overCard.id) : targetCards.length;
    const nextIndex = targetIndex < 0 ? targetCards.length : targetIndex;
    const nextPosition = getCardPosition(cards, targetListId, cardId, nextIndex);
    const previousCard = { ...draggedCard, listId: targetListId, position: nextPosition, updatedAt: Date.now() };

    setCards((current) => current.map((card) => card.id === cardId ? previousCard : card));
    void onMoveCard?.(cardId, targetListId, nextPosition);
  };

  return (
    <section className="flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950">
      <header className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300"><LayoutDashboard className="h-5 w-5" aria-hidden="true" /></div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-gray-900 dark:text-white">{board.name}</h2>
            {board.description && <p className="truncate text-xs text-gray-500 dark:text-gray-400">{board.description}</p>}
          </div>
        </div>
        <label className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" aria-hidden="true" />
          <input aria-label="Pesquisar cartões" placeholder="Pesquisar cartões..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </label>
        <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-300"><SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filtros</button>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto p-5">
          {[...lists].sort((a, b) => a.position - b.position).map((list) => (
            <BoardListColumn key={list.id} list={list} cards={cards} onOpenCard={onOpenCard} onAddCard={onAddCard} />
          ))}
        </div>
        <DragOverlay>{activeCard ? <CardTile card={activeCard} isOverlay /> : null}</DragOverlay>
      </DndContext>
    </section>
  );
}
