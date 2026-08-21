'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { RoadmapStatus } from '@/types/roadmap';
import SidebarInbox from '@/components/layout/SidebarInbox';
import Navbar from '@/components/layout/Navbar';
import RoadmapCanvas from '@/components/layout/RoadmapCanvas';
import IdeaCard from '@/components/roadmap/IdeaCard';
import IdeaDrawer from '@/components/roadmap/IdeaDrawer';
import AnalyticsDashboard from '@/components/roadmap/AnalyticsDashboard';
import SettingsModal from '@/components/layout/SettingsModal';
import HelpModal from '@/components/layout/HelpModal';
import { ToastContainer } from '@/components/ui/Toast';

import { RoadmapProvider, useRoadmap } from '@/contexts/RoadmapContext';

import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
  DragStartEvent,
  closestCorners,
  DragOverlay
} from '@dnd-kit/core';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Sensores para DND (Mouse + Touch + Acessibilidade)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, 
      },
    })
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('codenu_theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
        if (savedTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('codenu_theme', newTheme ? 'dark' : 'light');
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <RoadmapProvider initialItems={[] /* virá do localStorage no contexto */}>
      <HomeContent 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        sensors={sensors}
        selectedItemId={selectedItemId}
        onSelectItem={setSelectedItemId}
      />
    </RoadmapProvider>
  );
}

interface HomeContentProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  sensors: ReturnType<typeof useSensors>;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
}

function HomeContent({ 
  isDarkMode, 
  toggleTheme, 
  sensors,
  selectedItemId,
  onSelectItem 
}: HomeContentProps) {
  const { items, updateItemStatus, updateItem, team, isHydrated, toasts, removeToast } = useRoadmap();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.id !== over.id) {
      const itemId = active.id as string;
      const newStatus = over.id as RoadmapStatus;
      
      updateItemStatus(itemId, newStatus);
    }
  };

  // Prevenir erros de hidratação mostrando um estado vazio ou loading até os dados estarem prontos
  if (!isHydrated) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold animate-pulse text-indigo-500">A preparar o teu Roadmap...</p>
        </div>
      </div>
    );
  }

  const activeItem = items.find(i => i.id === activeId);
  const selectedItem = items.find(i => i.id === selectedItemId) || null;

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`h-screen flex overflow-hidden font-sans ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        
        {/* Overlay para fechar sidebar mobile */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 md:hidden transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <SidebarInbox 
          isDarkMode={isDarkMode} 
          selectedItemId={selectedItemId}
          onSelectItem={onSelectItem} 
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 font-sans relative">
          <Navbar 
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenAnalytics={() => setIsAnalyticsOpen(true)}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />

          <RoadmapCanvas 
            isDarkMode={isDarkMode}
            selectedItemId={selectedItemId}
            onSelectItem={onSelectItem}
          />
        </main>
      </div>

      <IdeaDrawer 
        isOpen={!!selectedItemId}
        item={selectedItem}
        onClose={() => onSelectItem(null)}
        onUpdate={updateItem}
        isDarkMode={isDarkMode}
      />

      <AnalyticsDashboard 
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        isDarkMode={isDarkMode}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
      />

      <HelpModal 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        isDarkMode={isDarkMode}
      />

      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div className="w-[320px] pointer-events-none opacity-80 rotate-3 transition-transform">
            <IdeaCard 
              item={activeItem}
              team={team}
              isDarkMode={isDarkMode}
            />
          </div>
        ) : null}
      </DragOverlay>

      <ToastContainer toasts={toasts} onRemove={removeToast} isDarkMode={isDarkMode} />
    </DndContext>
  );
}
