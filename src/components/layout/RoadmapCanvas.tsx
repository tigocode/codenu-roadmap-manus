'use client';

import React from 'react';
import { RoadmapItem, TeamMember } from '@/types/roadmap';
import IdeaCard from '../roadmap/IdeaCard';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { useDroppable } from '@dnd-kit/core';
import { Filter, ChevronDown, X } from 'lucide-react';

interface RoadmapColumnProps {
  id: string;
  title: string;
  color: string;
  desc: string;
  items: RoadmapItem[];
  team: TeamMember[];
  isDarkMode: boolean;
  selectedItemId?: string | null;
  onSelectItem?: (id: string) => void;
}

function RoadmapColumn({
  id,
  title,
  color,
  desc,
  items,
  team,
  isDarkMode,
  selectedItemId,
  onSelectItem
}: RoadmapColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`w-[85vw] md:w-[340px] flex-shrink-0 flex flex-col rounded-2xl transition-all duration-300 snap-center ${
        isOver 
          ? 'bg-indigo-50/30 dark:bg-indigo-900/10 ring-2 ring-inset ring-indigo-500/20' 
          : 'bg-transparent'
      }`}
    >
      <div className="mb-4 px-2 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${color}`}></div>
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
          </div>
          <p className={`text-xs mt-1 ml-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${isDarkMode ? 'text-gray-300 bg-gray-800' : 'text-gray-400 bg-gray-100'}`}>
          {items.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-8 flex flex-col gap-4">
        {items.map(item => (
          <IdeaCard 
            key={item.id} 
            item={item} 
            team={team} 
            isDarkMode={isDarkMode}
            selectedItemId={selectedItemId}
            onSelect={onSelectItem}
          />
        ))}
      </div>
    </div>
  );
}

interface RoadmapCanvasProps {
  isDarkMode: boolean;
  selectedItemId?: string | null;
  onSelectItem?: (id: string) => void;
}

export default function RoadmapCanvas({ 
  isDarkMode,
  selectedItemId,
  onSelectItem
}: RoadmapCanvasProps) {
  const { filteredItems, filters, setFilter, clearFilters, team } = useRoadmap();
  
  const columns = [
    { id: 'now', title: 'Agora', color: 'bg-green-500', desc: 'Em desenvolvimento' },
    { id: 'next', title: 'A Seguir', color: 'bg-yellow-400', desc: 'Próximo sprint' },
    { id: 'later', title: 'Mais Tarde', color: 'bg-blue-400', desc: 'Backlog validado' }
  ];

  const tags = ['Feature', 'Bug', 'Backend', 'Frontend', 'Design', 'Mobile'];
  const hasActiveFilters = filters.tag || filters.assigneeId;

  return (
    <div className={`flex-1 overflow-y-hidden flex flex-col transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-[#FAFAFA]'}`}
         style={{ backgroundImage: `radial-gradient(${isDarkMode ? '#374151' : '#E5E7EB'} 1.5px, transparent 1.5px)`, backgroundSize: '24px 24px' }}>
      
      {/* Toolbar de Filtros */}
      <div className={`h-12 sm:h-14 border-b flex items-center justify-between px-3 sm:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md sticky top-0 z-10 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto">
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest flex-shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filtrar por:
          </div>
          <div className="flex sm:hidden items-center text-gray-400 flex-shrink-0">
            <Filter className="w-4 h-4" />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Filtro de Tags */}
            <div className="relative group">
              <select 
                value={filters.tag || ''} 
                onChange={(e) => setFilter('tag', e.target.value || null)}
                className={`appearance-none pl-2 sm:pl-3 pr-6 sm:pr-8 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg border transition-all outline-none cursor-pointer
                  ${isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <option value="">Tags</option>
                {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
              <ChevronDown className="absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Filtro de Equipa */}
            <div className="relative group hidden sm:block">
              <select 
                value={filters.assigneeId || ''} 
                onChange={(e) => setFilter('assigneeId', e.target.value || null)}
                className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg border transition-all outline-none cursor-pointer
                  ${isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <option value="">Toda a Equipa</option>
                {team.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors pl-1 sm:pl-2 flex-shrink-0"
              >
              <X className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> Limpar
              </button>
            )}
          </div>
        </div>

        <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0 ml-2">
          {filteredItems.length}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="h-full flex min-w-max p-4 sm:p-8 gap-4 sm:gap-8 snap-x snap-mandatory md:snap-none">
          {columns.map(col => (
            <RoadmapColumn 
              key={col.id}
              {...col}
              items={filteredItems.filter(i => i.status === col.id)}
              team={team}
              isDarkMode={isDarkMode}
              selectedItemId={selectedItemId}
              onSelectItem={onSelectItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
