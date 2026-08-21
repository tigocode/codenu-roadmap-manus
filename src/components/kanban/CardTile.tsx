'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, CheckSquare, GripVertical, UserRound } from 'lucide-react';
import type { Card } from '@/types/workspace';

interface CardTileProps {
  card: Card;
  isOverlay?: boolean;
  onOpen?: (card: Card) => void;
}

export default function CardTile({ card, isOverlay = false, onOpen }: CardTileProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border bg-white p-3 shadow-sm transition-shadow dark:border-gray-700 dark:bg-gray-800 ${
        isDragging && !isOverlay ? 'opacity-40' : 'opacity-100'
      } ${isOverlay ? 'rotate-2 cursor-grabbing shadow-2xl' : 'hover:shadow-md'}`}
      onDoubleClick={() => onOpen?.(card)}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={`Mover cartão ${card.title}`}
          className="mt-0.5 cursor-grab touch-none rounded p-1 text-gray-300 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => onOpen?.(card)}
        >
          <h4 className="text-sm font-semibold leading-5 text-gray-800 dark:text-gray-100">{card.title}</h4>
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
        {card.labelIds.slice(0, 3).map((label) => (
          <span key={label} className="rounded-full bg-indigo-50 px-2 py-1 font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
            {label}
          </span>
        ))}
        {card.dueDate && (
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" aria-hidden="true" /> Prazo</span>
        )}
        {card.assigneeIds.length > 0 && (
          <span className="inline-flex items-center gap-1"><UserRound className="h-3 w-3" aria-hidden="true" /> {card.assigneeIds.length}</span>
        )}
        <span className="ml-auto inline-flex items-center gap-1"><CheckSquare className="h-3 w-3" aria-hidden="true" /> 0/0</span>
      </div>
    </article>
  );
}
