import type { Card } from '@/types/workspace';

export const POSITION_STEP = 1000;

export function getPositionBetween(previous?: number, next?: number): number {
  if (previous === undefined && next === undefined) return POSITION_STEP;
  if (previous === undefined) return next! / 2;
  if (next === undefined) return previous + POSITION_STEP;
  return (previous + next) / 2;
}

export function needsReindex(previous?: number, next?: number): boolean {
  return previous !== undefined && next !== undefined && Math.abs(next - previous) < 0.01;
}

export function reindexCards(cards: Card[]): Card[] {
  return [...cards]
    .sort((a, b) => a.position - b.position)
    .map((card, index) => ({ ...card, position: (index + 1) * POSITION_STEP }));
}

export function getCardPosition(
  cards: Card[],
  listId: string,
  cardId: string,
  targetIndex: number,
): number {
  const listCards = cards
    .filter((card) => card.listId === listId && card.id !== cardId)
    .sort((a, b) => a.position - b.position);
  const previous = listCards[targetIndex - 1]?.position;
  const next = listCards[targetIndex]?.position;
  return getPositionBetween(previous, next);
}
