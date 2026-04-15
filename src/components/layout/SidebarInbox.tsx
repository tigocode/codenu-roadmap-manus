'use client';

import React from 'react';
import { Zap, X } from 'lucide-react';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { useDroppable } from '@dnd-kit/core';
import IdeaCard from '../roadmap/IdeaCard';
import { TeamMember } from '@/types/roadmap';

interface SidebarInboxProps {
  onSelectItem?: (id: string) => void;
  selectedItemId?: string | null;
  isDarkMode?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarInbox({ 
  onSelectItem, 
  selectedItemId, 
  isDarkMode = false,
  isOpen = false,
  onClose
}: SidebarInboxProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'inbox',
  });
  
  const { filteredItems, team } = useRoadmap();
  const inboxItems = filteredItems.filter(item => item.status === 'inbox' || !item.status);

  return (
    <div 
      ref={setNodeRef}
      className={`
        fixed md:static inset-y-0 left-0 w-80 border-r flex flex-col flex-shrink-0 z-[60] md:z-10 transition-transform duration-300 ease-in-out
        bg-white dark:bg-gray-800 md:bg-gray-50/50 md:dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 h-full
        ${isOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full md:translate-x-0'}
        ${isOver ? 'bg-indigo-50/50 dark:bg-indigo-900/20 ring-2 ring-inset ring-indigo-500/30' : ''}
      `}
    >
      {/* Header da Inbox */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-1 rounded-md md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              Inbox <Zap data-testid="zap-icon" className="w-4 h-4 text-indigo-500" />
            </h2>
            <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">Ideias não planeadas</p>
          </div>
        </div>
        <span className="text-xs py-1 px-2.5 rounded-lg font-bold shadow-sm border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">
          {inboxItems.length}
        </span>
      </div>
      
      {/* Lista de Itens */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
        {inboxItems.length === 0 ? (
          <div className="text-center text-sm mt-10 border-2 border-dashed rounded-xl p-6 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            A tua Inbox está limpa.
          </div>
        ) : (
          inboxItems.map(item => (
            <IdeaCard 
              key={item.id} 
              item={item}
              team={team}
              isDarkMode={isDarkMode}
              selectedItemId={selectedItemId}
              onSelect={onSelectItem}
            />
          ))
        )}
      </div>
    </div>
  );
}
