'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, Zap, CheckSquare, MessageSquare, Trash2, Plus, Target, ShieldCheck } from 'lucide-react';
import { RoadmapItem } from '@/types/roadmap';
import Button from '@/components/ui/Button';
import { useRoadmap } from '@/contexts/RoadmapContext';

interface IdeaDrawerProps {
  isOpen: boolean;
  item: RoadmapItem | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<RoadmapItem>) => void;
  isDarkMode: boolean;
}

export default function IdeaDrawer({ 
  isOpen, 
  item, 
  onClose, 
  onUpdate,
  isDarkMode 
}: IdeaDrawerProps) {
  const { items, team, deleteItem } = useRoadmap();
  const [localTitle, setLocalTitle] = useState('');
  const [localDesc, setLocalDesc] = useState('');
  const [localProject, setLocalProject] = useState('');
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    if (item) {
      setLocalTitle(item.title);
      setLocalDesc(item.description || '');
      setLocalProject(item.project || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleTitleBlur = () => {
    if (localTitle !== item.title) {
      onUpdate(item.id, { title: localTitle });
    }
  };

  const handleDescBlur = () => {
    if (localDesc !== item.description) {
      onUpdate(item.id, { description: localDesc });
    }
  };

  const handleProjectBlur = () => {
    if (localProject !== (item.project || '')) {
      onUpdate(item.id, { project: localProject });
    }
  };

  // Funções de Checklist
  const toggleTask = (taskId: string) => {
    const newChecklist = (item.checklist || []).map(task => 
      task.id === taskId ? { ...task, done: !task.done } : task
    );
    onUpdate(item.id, { checklist: newChecklist });
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask = {
      id: `chk-${Date.now()}`,
      text: newTaskText.trim(),
      done: false
    };

    onUpdate(item.id, { checklist: [...(item.checklist || []), newTask] });
    setNewTaskText('');
  };

  const removeTask = (taskId: string) => {
    const newChecklist = (item.checklist || []).filter(task => task.id !== taskId);
    onUpdate(item.id, { checklist: newChecklist });
  };

  const assignee = team.find(m => m.id === item.assigneeId);
  const existingProjects = Array.from(new Set(items.map(i => i.project).filter(Boolean)));

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      
      <div className={`fixed right-0 top-0 h-screen w-full md:w-[520px] z-50 shadow-2xl flex flex-col transition-transform duration-300 transform translate-x-0 animate-in slide-in-from-right ${isDarkMode ? 'bg-gray-800 text-white border-l border-gray-700' : 'bg-white text-gray-900 border-l border-gray-100'}`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b flex items-center justify-between sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-50'}`}>
          <div className="flex items-center gap-2">
             <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              {item.status === 'inbox' ? '📥 IDEIA NA INBOX' : `🏁 NO ROADMAP (${item.status})`}
             </span>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 sm:space-y-10 custom-scrollbar pb-24">
          
          {/* Título Principal */}
          <div className="space-y-4">
            <textarea 
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleTitleBlur}
              rows={2}
              className={`w-full text-3xl font-black bg-transparent border-none outline-none focus:ring-0 p-0 resize-none leading-tight ${isDarkMode ? 'text-white placeholder-gray-700' : 'text-gray-900 placeholder-gray-200'}`}
              placeholder="Título da ideia..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Responsável */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-indigo-900/10 border-indigo-900/40' : 'bg-indigo-50/50 border-indigo-100/50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${assignee ? assignee.color + ' text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                {assignee ? assignee.name.charAt(0) : <User className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block mb-0.5">Responsável</label>
                <select 
                  value={item.assigneeId || ''}
                  onChange={(e) => onUpdate(item.id, { assigneeId: e.target.value || undefined })}
                  className={`w-full text-sm font-bold bg-transparent border-none p-0 focus:ring-0 cursor-pointer ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                >
                  <option value="">Não atribuído</option>
                  {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            {/* Projeto */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-purple-900/10 border-purple-900/40' : 'bg-purple-50/50 border-purple-100/50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-purple-500 bg-purple-500/10`}>
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-purple-500 block mb-0.5">Projeto Associado</label>
                <input 
                  list="projects-list-drawer"
                  value={localProject}
                  onChange={(e) => setLocalProject(e.target.value)}
                  onBlur={handleProjectBlur}
                  className={`w-full text-sm font-bold bg-transparent border-none p-0 focus:ring-0 ${isDarkMode ? 'text-gray-200 placeholder-gray-700' : 'text-gray-800 placeholder-gray-400'}`}
                  placeholder="Nome do projeto..."
                />
                <datalist id="projects-list-drawer">
                  {existingProjects.map(proj => <option key={proj} value={proj} />)}
                </datalist>
              </div>
            </div>
          </div>

          {/* Grelha de Metadados Escalares */}
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Análise de Prioridade (ICE)</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-black tracking-widest border ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
                SCORE: {item.iceScore || 0}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Estado
                </label>
                <select 
                  value={item.status}
                  onChange={(e) => onUpdate(item.id, { status: e.target.value as any })}
                  className={`w-full text-xs font-bold rounded-xl border p-2 transition-all outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                >
                  <option value="inbox">In-box</option>
                  <option value="now">Agora</option>
                  <option value="next">A Seguir</option>
                  <option value="later">Mais Tarde</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Tag className="w-3 h-3" /> Área / Tag
                </label>
                <select 
                  value={item.tag || ''}
                  onChange={(e) => onUpdate(item.id, { tag: e.target.value || undefined })}
                  className={`w-full text-xs font-bold rounded-xl border p-2 transition-all outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                >
                   <option value="">Geral</option>
                   <option value="Feature">Feature</option>
                   <option value="Bug">Bug</option>
                   <option value="Frontend">Frontend</option>
                   <option value="Backend">Backend</option>
                   <option value="Design">Design</option>
                   <option value="Mobile">Mobile</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Esforço
                </label>
                <select 
                  value={item.effort || ''}
                  onChange={(e) => onUpdate(item.id, { effort: e.target.value as any })}
                  className={`w-full text-xs font-bold rounded-xl border p-2 transition-all outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                >
                  <option value="">Não medido</option>
                  <option value="Dias">Dias</option>
                  <option value="Semanas">Semanas</option>
                  <option value="Meses">Meses</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Target className="w-3 h-3" /> Impacto
                </label>
                <select 
                  value={item.impact || ''}
                  onChange={(e) => onUpdate(item.id, { impact: e.target.value as any })}
                  className={`w-full text-xs font-bold rounded-xl border p-2 transition-all outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                >
                  <option value="">Não medido</option>
                  <option value="Nice to have">Nice to have</option>
                  <option value="Core">Core</option>
                  <option value="Game Changer">Game Changer</option>
                </select>
              </div>

              <div className={`col-span-2 space-y-3 p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-indigo-500" /> Confiança (1-10)
                  </label>
                  <span className="text-xs font-black text-indigo-500">{item.confidence || 5}</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={item.confidence || 5}
                  onChange={(e) => onUpdate(item.id, { confidence: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between px-0.5">
                  <p className="text-[8px] font-bold text-gray-500 uppercase">Dúvida</p>
                  <p className="text-[8px] font-bold text-gray-500 uppercase">Certeza Absoluta</p>
                </div>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Notas e Contexto
            </h3>
            <textarea 
              value={localDesc}
              onChange={(e) => setLocalDesc(e.target.value)}
              onBlur={handleDescBlur}
              rows={5}
              className={`w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-md leading-relaxed ${isDarkMode ? 'text-gray-300 placeholder-gray-700' : 'text-gray-600 placeholder-gray-300'}`}
              placeholder="Descreve detalhadamente o valor desta funcionalidade..."
            />
          </div>

          {/* Checklist */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" /> Plano de Implementação
              </h3>
              <div className="flex items-center gap-2">
                <div className="h-1 w-24 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                   <div 
                     className="bg-indigo-500 h-full transition-all duration-500"
                     style={{ width: `${(item.checklist?.filter(t => t.done).length || 0) / (item.checklist?.length || 1) * 100}%` }}
                   ></div>
                </div>
                <span className="text-[10px] font-black text-gray-500">
                  {Math.round(((item.checklist?.filter(t => t.done).length || 0) / (item.checklist?.length || 1)) * 100)}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {(item.checklist || []).map(task => (
                <div key={task.id} className="flex items-center gap-4 group">
                  <input 
                    type="checkbox" 
                    checked={task.done} 
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all" 
                  />
                  <span className={`flex-1 text-sm font-medium transition-all ${task.done ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                    {task.text}
                  </span>
                  <button 
                    onClick={() => removeTask(task.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all focus:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <form onSubmit={addTask} className="flex items-center gap-3 pt-2">
                <Plus className="w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Premir Enter para adicionar tarefa..."
                  className={`flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 text-sm font-medium ${isDarkMode ? 'text-white placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'}`}
                />
              </form>
            </div>
          </div>
        </div>

        {/* Action Bar (Footer) */}
        <div className={`p-3 sm:p-6 border-t flex items-center justify-between sticky bottom-0 z-10 ${isDarkMode ? 'bg-gray-800/80 border-gray-700 backdrop-blur-md' : 'bg-white/80 border-gray-100 backdrop-blur-md'}`}>
          <button 
            onClick={() => {
              if (confirm('Deseja eliminar definitivamente esta ideia?')) {
                deleteItem(item.id);
                onClose();
              }
            }}
            className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Eliminar Ideia</span>
          </button>
          <div className="flex gap-3">
             <button 
               onClick={onClose}
               className="px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
             >
               Guardar & Fechar
             </button>
          </div>
        </div>

      </div>
    </>
  );
}
