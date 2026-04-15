'use client';

import React, { useState } from 'react';
import { Plus, Moon, Sun, HelpCircle, Settings, Menu, Search, X, BarChart3 } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { TeamMember } from '@/types/roadmap';
import { useRoadmap } from '@/contexts/RoadmapContext';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenAnalytics: () => void;
  onMenuClick: () => void;
}

export default function Navbar({ 
  isDarkMode, 
  onToggleTheme, 
  onOpenSettings,
  onOpenHelp,
  onOpenAnalytics,
  onMenuClick,
}: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [quickIdea, setQuickIdea] = useState('');
  const { 
    currentUser,
    team: contextTeam,
    setCurrentUser,
    searchQuery,
    setSearchQuery,
    addQuickIdea,
    syncMode
  } = useRoadmap();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickIdea.trim()) {
      addQuickIdea(quickIdea.trim(), currentUser.id);
      setQuickIdea('');
    }
  };

  return (
    <header className="h-16 border-b flex items-center justify-between px-4 sm:px-6 z-20 flex-shrink-0 transition-colors bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      
      {/* 1. Logo & Mobile Menu */}
      <div className="flex items-center gap-2 sm:gap-4 w-auto sm:w-1/4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg md:hidden hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
          title="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Logo size="sm" showText={true} className="hidden lg:flex" />
        <Logo size="sm" showText={false} className="flex lg:hidden" />
        
        {/* Sync Mode Badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black tracking-widest transition-all duration-500 ${
          syncMode === 'cloud' 
            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' 
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
        }`}>
          {syncMode === 'cloud' && (
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          )}
          {syncMode.toUpperCase()}
        </div>
      </div>

      {/* 2. Barra de Captura & Pesquisa Rápida */}
      <div className="flex-1 max-w-2xl px-2 sm:mx-4 flex gap-2">
        <form onSubmit={handleSubmit} className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Plus className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            className={`block w-full pl-11 pr-4 py-2 borders-none rounded-xl text-sm transition-all outline-none 
              ${isDarkMode 
                ? 'bg-gray-700/50 text-white placeholder-gray-500 focus:bg-gray-700/80' 
                : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-200'
              }`}
            placeholder="Capturar ideia rápida..."
            value={quickIdea}
            onChange={(e) => setQuickIdea(e.target.value)}
          />
        </form>

        <div className="hidden sm:flex relative group w-48 lg:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className={`block w-full pl-9 pr-8 py-2 rounded-xl text-xs transition-all outline-none 
              ${isDarkMode 
                ? 'bg-gray-800/50 text-white border border-gray-700 focus:border-indigo-500' 
                : 'bg-white text-gray-900 border border-gray-200 focus:border-indigo-400'
              }`}
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Ações e Perfil */}
      <div className="flex items-center justify-end gap-1 sm:gap-4 flex-shrink-0">
        
        {/* Avaliares da Equipa */}
        <div className="hidden lg:flex items-center -space-x-2 mr-2">
          {contextTeam.slice(0, 4).map((m, i) => (
            <div 
              key={m.id} 
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white shadow-sm border-white dark:border-gray-800 ${m.color}`} 
              style={{ zIndex: 10 - i }}
              title={`${m.name} (${m.role})`}
            >
              {m.name.charAt(0)}
            </div>
          ))}
        </div>

        <div className="h-6 w-px hidden sm:block bg-gray-200 dark:bg-gray-700"></div>

        <button 
          onClick={onToggleTheme}
          className={`p-2 rounded-full transition-colors relative ${isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
          title="Alternar Tema"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button 
          onClick={onOpenHelp}
          className={`hidden sm:flex p-2 rounded-full transition-colors relative text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700`}
          title="Ajuda & Como usar"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <button 
          onClick={onOpenAnalytics}
          className={`hidden sm:flex p-2 rounded-full transition-colors relative text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700`}
          title="Ver Estatísticas & Analíticos"
        >
          <BarChart3 className="w-5 h-5" />
        </button>

        <button 
          onClick={onOpenSettings}
          className={`p-2 rounded-full transition-colors relative text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700`}
          title="Configurações & Equipa"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Current User Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-extrabold text-white shadow-md ring-2 transition-all hover:scale-105 active:scale-95 bg-indigo-600 ring-white dark:ring-gray-800 ring-offset-2 ring-offset-transparent"
          >
            {currentUser.name.charAt(0)}
          </button>

          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsProfileOpen(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl border z-40 overflow-hidden animate-in fade-in zoom-in duration-200 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                <div className="p-4 border-b border-gray-50 dark:border-gray-700/50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Conta Ativa</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{currentUser.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                </div>
                <div className="p-2">
                  <p className="px-2 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trocar Perfil</p>
                  {contextTeam.map(member => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setCurrentUser(member);
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors
                        ${currentUser.id === member.id 
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${member.color}`}>
                        {member.name.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold">{member.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
