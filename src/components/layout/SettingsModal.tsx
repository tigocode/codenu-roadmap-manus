'use client';

import React, { useState } from 'react';
import { X, Settings, Users, Plus, Edit2, Trash2, Shield, User } from 'lucide-react';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { TeamMember } from '@/types/roadmap';

const AVATAR_COLORS = [
  'bg-indigo-500', 
  'bg-blue-500', 
  'bg-pink-500', 
  'bg-amber-500', 
  'bg-emerald-500', 
  'bg-purple-500', 
  'bg-rose-500'
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function SettingsModal({ isOpen, onClose, isDarkMode }: SettingsModalProps) {
  const { team, addMember, updateMember, deleteMember, currentUser, syncMode, setSyncMode, migrateLocalToCloud } = useRoadmap();
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    role: 'Membro',
    responsibility: '',
    color: AVATAR_COLORS[0]
  });

  if (!isOpen) return null;

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim()) return;

    if (editingMemberId) {
      updateMember(editingMemberId, memberForm);
    } else {
      addMember(memberForm);
    }

    setShowMemberForm(false);
    setEditingMemberId(null);
    setMemberForm({ name: '', role: 'Membro', responsibility: '', color: AVATAR_COLORS[0] });
  };

  const openEditForm = (member: TeamMember) => {
    setMemberForm({
      name: member.name,
      role: member.role || 'Membro',
      responsibility: member.responsibility || '',
      color: member.color
    });
    setEditingMemberId(member.id);
    setShowMemberForm(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border animate-in zoom-in-95 fade-in duration-300 flex flex-col
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Definições</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Gestão de workspace e equipa</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-8">
          {/* Gestão de Equipa */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4" /> Membros da Equipa
              </h3>
              {!showMemberForm && (
                <button 
                  onClick={() => {
                    setEditingMemberId(null);
                    setMemberForm({ name: '', role: 'Membro', responsibility: '', color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] });
                    setShowMemberForm(true);
                  }}
                  className="p-1 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              )}
            </div>

            {/* Formulário de Membro */}
            {showMemberForm && (
              <form onSubmit={handleSaveMember} className={`p-5 rounded-2xl border mb-6 animate-in slide-in-from-top-4 duration-300 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1.5 ml-1">Nome Completo</label>
                    <input 
                      required
                      autoFocus
                      type="text"
                      value={memberForm.name}
                      onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                      className={`w-full px-4 py-2 text-sm rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      placeholder="Ex: Maria Santos"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1.5 ml-1">Função / Nível</label>
                    <select 
                      value={memberForm.role}
                      onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}
                      className={`w-full px-3 py-2 text-sm rounded-xl border shadow-sm outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Membro">Membro</option>
                      <option value="Visualizador">Visualizador</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1.5 ml-1">Responsabilidade</label>
                    <input 
                      type="text"
                      value={memberForm.responsibility}
                      onChange={e => setMemberForm({ ...memberForm, responsibility: e.target.value })}
                      className={`w-full px-4 py-2 text-sm rounded-xl border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      placeholder="Ex: Backend Dev"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-3 ml-1">Cor do Avatar</label>
                  <div className="flex gap-3">
                    {AVATAR_COLORS.map(color => (
                      <button 
                        key={color}
                        type="button"
                        onClick={() => setMemberForm({ ...memberForm, color })}
                        className={`w-7 h-7 rounded-full transition-all ring-offset-2 ${color} ${memberForm.color === color ? 'ring-2 ring-indigo-500 scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'} ${isDarkMode ? 'ring-offset-gray-900' : 'ring-offset-white'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button 
                    type="button"
                    onClick={() => setShowMemberForm(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                  >
                    {editingMemberId ? 'Guardar Alterações' : 'Criar Membro'}
                  </button>
                </div>
              </form>
            )}

            {/* Lista de Membros */}
            <div className="space-y-3">
              {team.map(member => (
                <div 
                  key={member.id} 
                  className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white ${member.color}`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{member.name}</span>
                        {member.role === 'Admin' && <Shield className="w-3 h-3 text-indigo-500" />}
                        {member.id === currentUser.id && (
                          <span className="text-[9px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-md font-black uppercase">Tu</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {member.responsibility || member.role}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditForm(member)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-500 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {member.id !== currentUser.id && (
                      <button 
                        onClick={() => {
                          if (confirm(`Tem a certeza que deseja remover ${member.name}?`)) deleteMember(member.id);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sincronização & Multiplayer */}
          <section className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-indigo-900/10 border-indigo-900/40' : 'bg-indigo-50/50 border-indigo-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest leading-none mb-1">Multiplayer Real</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Sincronização em Nuvem</p>
                </div>
              </div>
              <button 
                onClick={() => setSyncMode(syncMode === 'local' ? 'cloud' : 'local')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${syncMode === 'cloud' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${syncMode === 'cloud' ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="space-y-3">
              <div className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {syncMode === 'local' 
                  ? 'Atualmente está a usar o armazenamento local. Os dados são guardados apenas neste browser.' 
                  : 'Modo Nuvem ativo. Os dados estão a ser sincronizados em tempo real com toda a equipa.'}
              </div>

              {syncMode === 'cloud' && (
                <div className="space-y-3">
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDarkMode ? 'bg-gray-900/60 border-indigo-500/30' : 'bg-white border-indigo-200'}`}>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Ligado ao Firebase</span>
                  </div>
                  
                  <button 
                    onClick={migrateLocalToCloud}
                    className={`w-full py-2.5 rounded-xl border-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all
                      ${isDarkMode 
                        ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' 
                        : 'border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                  >
                    🚀 Migrar Dados Locais para Nuvem
                  </button>
                </div>
              )}

              {syncMode === 'local' && (
                <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/40">
                   <p className="text-[10px] font-bold text-indigo-400 mb-2 uppercase tracking-widest">Dica de Produtividade</p>
                   <p className="text-[11px] text-gray-500 italic leading-snug">
                     Ao ativar o modo nuvem, precisará de configurar o Firebase nas variáveis de ambiente (.env) para colaborar com outros membros.
                   </p>
                </div>
              )}
            </div>
          </section>

          {/* Versão e Sobre */}
          <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-gray-900/20 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Codenu Roadmap Cloud v1.2</p>
            <p className="text-[9px] text-gray-500 dark:text-gray-500">Desenvolvido para equipas que valorizam a transparência e agilidade.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
