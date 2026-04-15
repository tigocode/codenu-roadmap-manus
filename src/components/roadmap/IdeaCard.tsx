'use client';

import React from 'react';
import { GripVertical, Zap, CheckSquare, Briefcase } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { RoadmapItem, TeamMember } from '@/types/roadmap';

interface IdeaCardProps {
  item: RoadmapItem;
  team: TeamMember[];
  isDarkMode: boolean;
  selectedItemId?: string | null;
  onSelect?: (id: string) => void;
}

export default function IdeaCard({ 
  item, 
  team, 
  isDarkMode, 
  selectedItemId, 
  onSelect 
}: IdeaCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const isSelected = selectedItemId === item.id;
  const isInbox = item.status === 'inbox';
  const assignee = team.find(m => m.id === item.assigneeId);
  
  const getTagColor = (tag: string) => {
    switch(tag) {
      case 'Backend': return isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Frontend': return isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-100 text-green-700 border-green-200';
      case 'Design': return isDarkMode ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-purple-100 text-purple-700 border-purple-200';
      default: return isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const completedTasks = item.checklist?.filter(c => c.done).length || 0;
  const totalTasks = item.checklist?.length || 0;
  const hasTasks = totalTasks > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onSelect?.(item.id)}
      className={`${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-500 shadow-sm hover:shadow-md' : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300 shadow-sm'} rounded-xl border ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : ''} 
        cursor-pointer transition-all duration-200 group relative flex flex-col gap-2 
        ${isDragging ? 'shadow-2xl scale-[1.02]' : ''}
        ${isInbox ? 'p-3' : 'p-4'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          {/* Visualização da Tag de Projeto no Cartão */}
          {!isInbox && item.project && (
            <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              <Briefcase className="w-2.5 h-2.5" /> {item.project}
            </span>
          )}
          <h4 className={`font-semibold leading-snug ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} ${isInbox ? 'text-sm' : 'text-base'}`}>
            {item.title}
          </h4>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          {item.iceScore !== undefined && item.iceScore > 0 && (
            <div 
              className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border tracking-tighter shadow-sm
                ${item.iceScore >= 300 
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
                  : (item.iceScore >= 150 
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' 
                      : 'bg-gray-500/10 text-gray-500 border-gray-500/30')}`}
              title={`ICE Score: ${item.iceScore}`}
            >
              {item.iceScore}
            </div>
          )}
          <GripVertical className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`} />
        </div>
      </div>
      
      {/* Detalhes do Workflow com Avatar (Multiplayer) */}
      {!isInbox && (item.tag || item.effort || hasTasks || assignee) && (
        <div className={`flex flex-col gap-2 mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-50'}`}>
          {hasTasks && (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <CheckSquare className="w-3.5 h-3.5" />
              <div className={`w-full rounded-full h-1.5 flex-1 mx-1 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div 
                  className="bg-indigo-500 h-1.5 rounded-full transition-all" 
                  style={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
                ></div>
              </div>
              <span>{completedTasks}/{totalTasks}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {item.tag && (
                <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${getTagColor(item.tag)}`}>
                  {item.tag}
                </span>
              )}
              {item.effort && (
                <span className={`text-[11px] flex items-center gap-1 font-medium border px-1.5 py-0.5 rounded-md ${isDarkMode ? 'text-gray-300 bg-gray-700 border-gray-600' : 'text-gray-500 bg-gray-50 border-gray-100'}`}>
                  <Zap className="w-3 h-3 text-orange-400" />
                  {item.effort}
                </span>
              )}
            </div>

            {/* Avatar do Responsável */}
            {assignee && (
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ${isDarkMode ? 'ring-gray-800' : 'ring-white'} ${assignee.color}`}
                title={`Atribuído a: ${assignee.name}`}
              >
                {assignee.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
