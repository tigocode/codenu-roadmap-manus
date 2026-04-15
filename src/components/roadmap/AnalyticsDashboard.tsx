'use client';

import React from 'react';
import { 
  X, 
  Target, 
  Zap, 
  TrendingUp, 
  Users, 
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useRoadmap } from '@/contexts/RoadmapContext';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function AnalyticsDashboard({ isOpen, onClose, isDarkMode }: AnalyticsDashboardProps) {
  const { stats, team } = useRoadmap();

  if (!isOpen) return null;

  const kpis = [
    { 
      label: 'Total de Ideias', 
      value: stats.total, 
      icon: BarChart3, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50 dark:bg-blue-900/20' 
    },
    { 
      label: 'Taxa de Conclusão', 
      value: `${stats.completionRate}%`, 
      icon: CheckCircle2, 
      color: 'text-green-500', 
      bg: 'bg-green-50 dark:bg-green-900/20' 
    },
    { 
      label: 'Esforço Estimado', 
      value: stats.effortPoints, 
      icon: Zap, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50 dark:bg-amber-900/20' 
    },
    { 
      label: 'Por Atribuir', 
      value: stats.unassigned, 
      icon: Users, 
      color: 'text-purple-500', 
      bg: 'bg-purple-50 dark:bg-purple-900/20' 
    },
  ];

  const statusProgress = [
    { label: 'Agora', count: stats.byStatus.now, color: 'bg-green-500' },
    { label: 'A Seguir', count: stats.byStatus.next, color: 'bg-yellow-400' },
    { label: 'Lateral', count: stats.byStatus.later, color: 'bg-blue-400' },
    { label: 'Inbox', count: stats.byStatus.inbox, color: 'bg-gray-400' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border animate-in zoom-in-95 fade-in duration-300
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-50 dark:border-gray-700/50 flex items-center justify-between sticky top-0 bg-inherit z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Estatísticas do Roadmap</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Análise de progresso e esforço da equipa</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-8">
          {/* Grid de KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {kpis.map((kpi, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-50'} ${kpi.bg} flex flex-col items-center text-center transition-transform hover:scale-[1.02]`}>
                <kpi.icon className={`w-6 h-6 mb-2 ${kpi.color}`} />
                <span className="text-2xl font-black mb-0.5">{kpi.value}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</span>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Visualização de Status */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <Target className="w-4 h-4" /> Distribuição por Status
              </h3>
              <div className="space-y-6">
                {statusProgress.map((item, idx) => {
                  const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold">{item.label}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black">{item.count}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{Math.round(percentage)}%</span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 p-0.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumo da Saúde */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-center ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
              <div className="text-center mb-6">
                 <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-500 mb-4 animate-bounce">
                    <Target className="w-10 h-10" />
                 </div>
                 <h4 className="text-lg font-extrabold mb-1">Saúde do Projeto</h4>
                 <p className="text-xs text-gray-500 dark:text-gray-400">Baseado no progresso atual das tarefas</p>
              </div>
              
              <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
                 <div 
                   className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-1000 ease-out"
                   style={{ width: `${stats.completionRate}%` }}
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black pointer-events-none mix-blend-difference text-white">
                      PROCESSO GLOBAL: {stats.completionRate}%
                    </span>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Data de Lançamento Estimada: <span className="text-indigo-500">Q3 2026</span></span>
                 </div>
                 <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Itens no Backlog Crítico: <span className="text-indigo-500">{stats.byStatus.now}</span></span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30 text-center">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
             Estes dados são gerados em tempo real com base nos filtros ativos.<br />
             Para ver métricas específicas de uma tag ou desenvolvedor, usa a Toolbar de filtros principal.
           </p>
        </div>
      </div>
    </div>
  );
}
