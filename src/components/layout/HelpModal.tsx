'use client';

import React from 'react';
import { X, HelpCircle, Move, MousePointer2, Layout, Zap, Target, Users } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function HelpModal({ isOpen, onClose, isDarkMode }: HelpModalProps) {
  if (!isOpen) return null;

  const sections = [
    {
      icon: <Move className="w-5 h-5 text-blue-500" />,
      title: "Fluxo de Trabalho",
      content: "Arraste as ideias da 'Inbox' (esquerda) para as colunas do Roadmap. Use 'Agora' para o que está em foco, 'A Seguir' para a próxima sprint e 'Mais Tarde' para o backlog estratégico."
    },
    {
      icon: <Target className="w-5 h-5 text-rose-500" />,
      title: "Impacto vs Esforço",
      content: "Priorize as ideias com 'Alto Impacto' e 'Baixo Esforço' (Quick Wins). Use o Dashboard de Analíticos para visualizar se a equipa está focada no que é 'Core' ou 'Game Changer'."
    },
    {
      icon: <Layout className="w-5 h-5 text-indigo-500" />,
      title: "Gestão de Projetos",
      content: "Atribua ideias a projetos específicos para manter a organização. O sistema aprende os nomes dos seus projetos e sugere-os automaticamente no painel de edição."
    },
    {
      icon: <Users className="w-5 h-5 text-emerald-500" />,
      title: "Equipa & Colaboração",
      content: "Adicione membros da equipa nas Definições. Pode trocar de utilizador no menu superior para simular o trabalho de diferentes departamentos."
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border animate-in zoom-in-95 fade-in duration-300 flex flex-col
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Como utilizar o Codenu?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Guia rápido de produtividade</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-3xl border transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-gray-900/40 border-gray-700 hover:border-indigo-500/30' : 'bg-gray-50/50 border-gray-100 hover:border-indigo-200'}`}
            >
              <div className="mb-4">{section.icon}</div>
              <h3 className="text-lg font-black mb-2 leading-tight">{section.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`p-8 pt-0 mt-auto`}>
          <div className={`p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 ${isDarkMode ? 'bg-indigo-900/10 border border-indigo-900/20' : 'bg-indigo-50 border border-indigo-100'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500 text-white">
                <MousePointer2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Dica: Use Drag & Drop para tudo!</span>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
            >
              Entendido, vamos a isso!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
