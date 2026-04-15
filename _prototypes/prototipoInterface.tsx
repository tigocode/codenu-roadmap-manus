import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Menu, Settings, User, Tag, AlignLeft, BarChart2, GripVertical, CheckSquare, Target, Zap, Users, UserPlus, Edit2, Trash2, Shield, HelpCircle, Info, BookOpen, Moon, Sun, Briefcase } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

// --- INICIALIZAÇÃO FIREBASE (Regra 1 e 3) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'codenu-roadmap-v1';

// Cores disponíveis para avatares
const AVATAR_COLORS = ['bg-indigo-500', 'bg-blue-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'];

export default function CodenuRoadmap() {
  // --- ESTADOS ---
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [quickIdea, setQuickIdea] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [newSubtask, setNewSubtask] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Estados para Gestão de Equipa
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', role: 'Membro', responsibility: '', color: AVATAR_COLORS[0] });

  // --- EFEITO 1: AUTENTICAÇÃO ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Erro de Autenticação:', error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- EFEITO 2: SINCRONIZAÇÃO DE DADOS ---
  useEffect(() => {
    if (!user) return;

    const itemsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'items');
    const teamCollection = collection(db, 'artifacts', appId, 'public', 'data', 'team');
    
    const unsubscribeItems = onSnapshot(
      itemsCollection, 
      (snapshot) => {
        const fetchedItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        fetchedItems.sort((a, b) => b.createdAt - a.createdAt);
        setItems(fetchedItems);
        setLoading(false);
      },
      (error) => {
        console.error("Erro a obter itens do Firestore:", error);
        setLoading(false);
      }
    );

    const unsubscribeTeam = onSnapshot(
      teamCollection,
      (snapshot) => {
        const fetchedTeam = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        fetchedTeam.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        setTeamMembers(fetchedTeam);
      },
      (error) => console.error("Erro a obter equipa do Firestore:", error)
    );

    return () => {
      unsubscribeItems();
      unsubscribeTeam();
    };
  }, [user]);

  // --- LÓGICA DE FIREBASE CRUD ---
  const handleQuickCapture = async (e) => {
    e.preventDefault();
    if (!quickIdea.trim() || !user) return;

    const newItemId = Date.now().toString();
    const newItem = {
      id: newItemId,
      title: quickIdea,
      description: '',
      status: 'inbox',
      tag: '',
      effort: '',
      impact: '',
      assigneeId: '',
      project: '', // Novo campo para o projeto
      checklist: [],
      createdAt: Date.now(),
      createdBy: user.uid
    };

    setQuickIdea(''); 
    
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'items', newItemId), newItem);
    } catch (error) {
      console.error("Erro ao guardar ideia:", error);
    }
  };

  const updateItem = async (id, updates) => {
    if (!user) return;
    try {
      const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'items', id);
      await setDoc(itemRef, updates, { merge: true });
    } catch (error) {
      console.error("Erro ao atualizar ideia:", error);
    }
  };

  const deleteItem = async (id) => {
    if (!user) return;
    try {
      if (selectedItemId === id) setSelectedItemId(null);
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'items', id));
    } catch (error) {
      console.error("Erro ao eliminar ideia:", error);
    }
  };

  // --- LÓGICA DE CHECKLIST ---
  const addSubtask = async (itemId, text) => {
    if (!text.trim() || !user) return;
    const item = items.find(i => i.id === itemId);
    const newChecklist = [...(item.checklist || []), { id: Date.now().toString(), text, done: false }];
    await updateItem(itemId, { checklist: newChecklist });
    setNewSubtask('');
  };

  const toggleSubtask = async (itemId, subtaskId) => {
    const item = items.find(i => i.id === itemId);
    const newChecklist = item.checklist.map(c => c.id === subtaskId ? { ...c, done: !c.done } : c);
    await updateItem(itemId, { checklist: newChecklist });
  };

  const deleteSubtask = async (itemId, subtaskId) => {
    const item = items.find(i => i.id === itemId);
    const newChecklist = item.checklist.filter(c => c.id !== subtaskId);
    await updateItem(itemId, { checklist: newChecklist });
  };

  // --- LÓGICA DE EQUIPA (TEAM CRUD) ---
  const handleSaveTeamMember = async (e) => {
    e.preventDefault();
    if (!user || !memberForm.name.trim()) return;

    try {
      if (editingMemberId) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team', editingMemberId), memberForm, { merge: true });
      } else {
        const newId = Date.now().toString();
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team', newId), { 
          ...memberForm, 
          createdAt: Date.now() 
        });
      }
      setShowMemberForm(false);
      setEditingMemberId(null);
      setMemberForm({ name: '', role: 'Membro', responsibility: '', color: AVATAR_COLORS[0] });
    } catch (error) {
      console.error("Erro ao guardar membro da equipa:", error);
    }
  };

  const handleDeleteTeamMember = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team', id));
    } catch (error) {
      console.error("Erro ao eliminar membro:", error);
    }
  };

  const openEditMemberForm = (member) => {
    setMemberForm({ 
      name: member.name, 
      role: member.role || 'Membro', 
      responsibility: member.responsibility || '', 
      color: member.color || AVATAR_COLORS[0] 
    });
    setEditingMemberId(member.id);
    setShowMemberForm(true);
  };

  // --- LÓGICA DRAG & DROP ---
  const handleDragStart = (e, id) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    setDragOverCol(columnStatus);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedItemId) {
      await updateItem(draggedItemId, { status: newStatus });
      setDraggedItemId(null);
    }
  };

  // --- COMPONENTES AUXILIARES ---
  const selectedItem = items.find(i => i.id === selectedItemId);
  const getAssignee = (assigneeId) => teamMembers.find(m => m.id === assigneeId);

  // Extrair lista de projetos únicos para o Autocomplete (Datalist)
  const existingProjects = [...new Set(items.map(i => i.project).filter(Boolean))];

  // Componente do Cartão (Card)
  const IdeaCard = ({ item }) => {
    const isSelected = selectedItemId === item.id;
    const isInbox = item.status === 'inbox';
    const assignee = getAssignee(item.assigneeId);
    
    const getTagColor = (tag) => {
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
        draggable
        onDragStart={(e) => handleDragStart(e, item.id)}
        onClick={() => setSelectedItemId(item.id)}
        className={`${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-500 shadow-sm hover:shadow-md' : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300 shadow-sm'} rounded-xl border ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : ''} 
          cursor-pointer transition-all duration-200 group relative flex flex-col gap-2 
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
          <GripVertical className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-grab mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`} />
        </div>
        
        {/* OPÇÃO 3: Detalhes do Workflow com Avatar (Multiplayer) */}
        {!isInbox && (item.tag || item.effort || hasTasks || assignee) && (
          <div className={`flex flex-col gap-2 mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-50'}`}>
            {hasTasks && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <CheckSquare className="w-3.5 h-3.5" />
                <div className={`w-full rounded-full h-1.5 flex-1 mx-1 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div 
                    className="bg-indigo-500 h-1.5 rounded-full transition-all" 
                    style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
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
  };

  if (loading) {
    return <div className={`h-screen w-full flex items-center justify-center font-medium ${isDarkMode ? 'bg-gray-900 text-indigo-400' : 'bg-gray-50 text-indigo-500'}`}>A carregar Roadmap de Equipa...</div>;
  }

  return (
    <div className={`h-screen w-full flex flex-col font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F9FAFB] text-gray-900'}`}>
      
      {/* 1. HEADER */}
      <header className={`h-16 border-b flex items-center justify-between px-6 z-20 flex-shrink-0 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-4 w-1/4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            C
          </div>
          <span className={`font-bold text-lg tracking-tight hidden sm:block ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Codenu</span>
        </div>

        {/* Barra de Captura Rápida */}
        <form onSubmit={handleQuickCapture} className="flex-1 max-w-2xl mx-4 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Plus className={`h-5 w-5 transition-colors ${isDarkMode ? 'text-gray-400 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-600'}`} />
          </div>
          <input
            type="text"
            value={quickIdea}
            onChange={(e) => setQuickIdea(e.target.value)}
            className={`block w-full pl-12 pr-4 py-2.5 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white hover:bg-white'}`}
            placeholder="Nova ideia para a equipa... (Escreve e prime Enter)"
          />
        </form>

        <div className="flex items-center justify-end gap-4 w-1/4">
          
          {/* Indicador de Equipa Online */}
          <div className="hidden lg:flex items-center -space-x-2 mr-2">
            {teamMembers.slice(0, 4).map((m, i) => (
              <div key={m.id} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-[${10-i}] ${m.color} ${isDarkMode ? 'border-gray-800' : 'border-white'}`} title={`${m.name} (${m.role})`}>
                {m.name.charAt(0)}
              </div>
            ))}
            {teamMembers.length > 4 && (
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-sm z-0 ${isDarkMode ? 'border-gray-800 bg-gray-700 text-gray-300' : 'border-white bg-gray-100 text-gray-600'}`}>
                +{teamMembers.length - 4}
              </div>
            )}
          </div>

          <div className={`h-6 w-px hidden sm:block ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-colors relative ${isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            title="Alternar Tema"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => setShowHelp(true)}
            className={`p-2 rounded-full transition-colors relative ${isDarkMode ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-700' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            title="Como Usar & Legendas"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-full transition-colors relative ${isDarkMode ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-700' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            title="Configurações & Equipa"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* NOVO: Avatar do Utilizador Logado baseado na imagem de referência */}
          {user && (
            <div className="relative group cursor-pointer ml-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-extrabold text-white shadow-md ring-2 transition-all bg-[#8b5cf6] ${isDarkMode ? 'ring-gray-800 group-hover:ring-purple-400' : 'ring-white group-hover:ring-purple-300'}`}>
                A
              </div>
              <div className={`absolute right-0 top-12 opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap pointer-events-none z-50 flex items-center gap-1.5 shadow-lg ${isDarkMode ? 'bg-gray-800 text-green-400 border border-gray-700' : 'bg-white text-green-600 border border-gray-200'}`}>
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 Tu (Ativo)
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 2. INBOX */}
        <div 
          className={`w-80 border-r flex flex-col flex-shrink-0 z-10 transition-colors ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}
          onDragOver={(e) => handleDragOver(e, 'inbox')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'inbox')}
        >
          <div className="p-5 flex items-center justify-between">
            <div>
              <h2 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Inbox <Zap className="w-4 h-4 text-indigo-500" />
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ideias não planeadas</p>
            </div>
            <span className={`text-xs py-1 px-2.5 rounded-lg font-bold shadow-sm border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>
              {items.filter(i => i.status === 'inbox').length}
            </span>
          </div>
          
          <div className={`flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3 transition-colors ${dragOverCol === 'inbox' ? (isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-50/50') : ''}`}>
            {items.filter(i => i.status === 'inbox').length === 0 ? (
              <div className={`text-center text-sm mt-10 border-2 border-dashed rounded-xl p-6 ${isDarkMode ? 'text-gray-500 border-gray-700 bg-gray-800/50' : 'text-gray-400 border-gray-200 bg-gray-50'}`}>
                A tua Inbox está limpa.
              </div>
            ) : (
              items.filter(i => i.status === 'inbox').map(item => (
                <IdeaCard key={item.id} item={item} />
              ))
            )}
            {dragOverCol === 'inbox' && <div className={`h-16 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-indigo-500 bg-indigo-900/30' : 'border-indigo-300 bg-indigo-50/50'}`}></div>}
          </div>
        </div>

        {/* 3. CANVAS INFINITO */}
        <div className={`flex-1 overflow-x-auto overflow-y-hidden relative transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-[#FAFAFA]'}`}
             style={{ backgroundImage: `radial-gradient(${isDarkMode ? '#374151' : '#E5E7EB'} 1.5px, transparent 1.5px)`, backgroundSize: '24px 24px' }}>
          
          <div className="h-full flex min-w-max p-8 gap-8">
            {/* Colunas do Roadmap */}
            {[
              { id: 'now', title: 'Agora', color: 'bg-green-500', desc: 'Em desenvolvimento' },
              { id: 'next', title: 'A Seguir', color: 'bg-yellow-400', desc: 'Próximo sprint' },
              { id: 'later', title: 'Mais Tarde', color: 'bg-blue-400', desc: 'Backlog validado' }
            ].map(col => (
              <div 
                key={col.id}
                className={`w-[340px] flex flex-col rounded-2xl transition-all duration-300 ${dragOverCol === col.id ? (isDarkMode ? 'bg-indigo-900/20 ring-2 ring-indigo-500 shadow-inner' : 'bg-indigo-50/80 ring-2 ring-indigo-300 shadow-inner') : 'bg-transparent'}`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="mb-4 px-2 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${col.color}`}></div>
                      <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{col.title}</h3>
                    </div>
                    <p className={`text-xs mt-1 ml-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{col.desc}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${isDarkMode ? 'text-gray-300 bg-gray-800' : 'text-gray-400 bg-gray-100'}`}>
                    {items.filter(i => i.status === col.id).length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto pb-8 flex flex-col gap-4">
                  {items.filter(i => i.status === col.id).map(item => (
                    <IdeaCard key={item.id} item={item} />
                  ))}
                  {dragOverCol === col.id && <div className={`h-32 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-indigo-500 bg-indigo-900/30' : 'border-indigo-300 bg-indigo-50/50'}`}></div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. PAINEL DIREITO (Drawer) */}
        <div 
          className={`absolute top-0 right-0 h-full w-[420px] border-l shadow-2xl transform transition-transform duration-300 ease-in-out z-30 flex flex-col ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } ${selectedItemId ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {selectedItem && (
            <>
              {/* Header do Drawer */}
              <div className={`p-5 border-b flex items-center justify-between sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${isDarkMode ? 'text-indigo-400 bg-indigo-900/30' : 'text-indigo-600 bg-indigo-50'}`}>
                    {selectedItem.status === 'inbox' ? 'Na Inbox' : 'No Roadmap'}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedItemId(null)}
                  className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo do Drawer */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                
                {/* Título */}
                <div>
                  <textarea
                    value={selectedItem.title}
                    onChange={(e) => updateItem(selectedItem.id, { title: e.target.value })}
                    rows={2}
                    className={`w-full text-2xl font-bold border-none p-0 focus:ring-0 bg-transparent resize-none leading-tight ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-300'}`}
                    placeholder="Título da ideia"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  {/* Atribuição de Utilizador */}
                  <div className={`flex items-center gap-3 p-3 border rounded-xl ${isDarkMode ? 'bg-indigo-900/20 border-indigo-800/50' : 'bg-indigo-50/50 border-indigo-100'}`}>
                    <UserPlus className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
                    <div className="flex-1">
                      <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-400'}`}>Responsável</label>
                      <select 
                        value={selectedItem.assigneeId || ''}
                        onChange={(e) => updateItem(selectedItem.id, { assigneeId: e.target.value })}
                        className={`w-full text-sm border-none bg-transparent font-semibold focus:ring-0 p-0 cursor-pointer ${isDarkMode ? 'text-gray-200 [&>option]:bg-gray-800' : 'text-gray-800'}`}
                      >
                        <option value="">Não atribuído</option>
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.responsibility || m.role})</option>
                        ))}
                      </select>
                    </div>
                    {selectedItem.assigneeId && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${getAssignee(selectedItem.assigneeId)?.color}`}>
                        {getAssignee(selectedItem.assigneeId)?.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* NOVO: Vincular a Projeto (Existente ou Novo) */}
                  <div className={`flex items-center gap-3 p-3 border rounded-xl ${isDarkMode ? 'bg-purple-900/20 border-purple-800/50' : 'bg-purple-50/50 border-purple-100'}`}>
                    <Briefcase className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                    <div className="flex-1 relative">
                      <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}>Projeto Associado</label>
                      <input 
                        list="projects-list"
                        value={selectedItem.project || ''}
                        onChange={(e) => updateItem(selectedItem.id, { project: e.target.value })}
                        placeholder="Novo ou Existente (Ex: App Mobile)"
                        className={`w-full text-sm border-none bg-transparent font-semibold focus:ring-0 p-0 ${isDarkMode ? 'text-gray-200 placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'}`}
                      />
                      {/* Datalist preenchido automaticamente com todos os projetos criados */}
                      <datalist id="projects-list">
                        {existingProjects.map(proj => (
                          <option key={proj} value={proj} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Grelha de Meta-dados */}
                <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> Estado
                    </label>
                    <select 
                      value={selectedItem.status}
                      onChange={(e) => updateItem(selectedItem.id, { status: e.target.value })}
                      className={`text-sm rounded-md font-medium focus:ring-indigo-500 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}
                    >
                      <option value="inbox">📥 Inbox</option>
                      <option value="now">🟢 Agora</option>
                      <option value="next">🟡 A Seguir</option>
                      <option value="later">🔵 Mais Tarde</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Área
                    </label>
                    <select 
                      value={selectedItem.tag || ''}
                      onChange={(e) => updateItem(selectedItem.id, { tag: e.target.value })}
                      className={`text-sm rounded-md font-medium focus:ring-indigo-500 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}
                    >
                      <option value="">Geral</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Esforço
                    </label>
                    <select 
                      value={selectedItem.effort || ''}
                      onChange={(e) => updateItem(selectedItem.id, { effort: e.target.value })}
                      className={`text-sm rounded-md font-medium focus:ring-indigo-500 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}
                    >
                      <option value="">Não medido</option>
                      <option value="Baixo">Dias</option>
                      <option value="Médio">Semanas</option>
                      <option value="Alto">Meses</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <BarChart2 className="w-3.5 h-3.5" /> Impacto
                    </label>
                    <select 
                      value={selectedItem.impact || ''}
                      onChange={(e) => updateItem(selectedItem.id, { impact: e.target.value })}
                      className={`text-sm rounded-md font-medium focus:ring-indigo-500 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}
                    >
                      <option value="">Não medido</option>
                      <option value="Baixo">Nice to have</option>
                      <option value="Médio">Core</option>
                      <option value="Alto">Game Changer</option>
                    </select>
                  </div>
                </div>

                {/* Sub-tarefas */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      <CheckSquare className="w-4 h-4 text-indigo-500" /> Plano de Ação
                    </h3>
                    <span className="text-xs font-medium text-gray-500">
                      {selectedItem.checklist?.filter(c => c.done).length || 0} / {selectedItem.checklist?.length || 0}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {selectedItem.checklist?.map(task => (
                      <div key={task.id} className="flex items-center gap-3 group">
                        <input 
                          type="checkbox" 
                          checked={task.done}
                          onChange={() => toggleSubtask(selectedItem.id, task.id)}
                          className={`w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'}`}
                        />
                        <span className={`flex-1 text-sm ${task.done ? (isDarkMode ? 'text-gray-500 line-through' : 'text-gray-400 line-through') : (isDarkMode ? 'text-gray-200' : 'text-gray-700')}`}>
                          {task.text}
                        </span>
                        <button 
                          onClick={() => deleteSubtask(selectedItem.id, task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Plus className="w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSubtask(selectedItem.id, newSubtask)}
                        placeholder="Adicionar tarefa... (Enter para guardar)"
                        className={`flex-1 text-sm border-none bg-transparent p-0 focus:ring-0 ${isDarkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div className="flex flex-col gap-2">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    <AlignLeft className="w-4 h-4 text-indigo-500" /> Contexto & Anotações
                  </h3>
                  <textarea
                    value={selectedItem.description || ''}
                    onChange={(e) => updateItem(selectedItem.id, { description: e.target.value })}
                    rows={6}
                    className={`w-full text-sm border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-500 focus:bg-gray-800' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white'}`}
                    placeholder="Escreve o porquê desta ideia ser importante, referências..."
                  />
                </div>
              </div>
              
              <div className={`p-5 border-t mt-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                <button 
                  onClick={() => deleteItem(selectedItem.id)}
                  className={`w-full py-2.5 px-4 border rounded-lg text-sm font-bold transition-colors shadow-sm ${isDarkMode ? 'bg-gray-800 border-red-900/50 text-red-400 hover:bg-red-900/20 hover:border-red-800' : 'bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'}`}
                >
                  Eliminar Ideia
                </button>
              </div>
            </>
          )}
        </div>

        {/* 5. MODAL DE CONFIGURAÇÕES & EQUIPA */}
        {showSettings && (
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`p-5 border-b flex items-center justify-between flex-shrink-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                <h2 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Settings className="w-5 h-5 text-indigo-500" /> Configurações do Workspace
                </h2>
                <button onClick={() => setShowSettings(false)} className={`p-1.5 rounded-md ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                {/* GESTÃO DE EQUIPA (CRUD) */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <Users className="w-4 h-4 text-gray-500" /> Membros da Equipa
                    </h3>
                    {!showMemberForm && (
                      <button 
                        onClick={() => {
                          setMemberForm({ name: '', role: 'Admin', responsibility: '', color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] });
                          setEditingMemberId(null);
                          setShowMemberForm(true);
                        }} 
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${isDarkMode ? 'text-indigo-400 bg-indigo-900/30 hover:bg-indigo-900/50' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar
                      </button>
                    )}
                  </div>

                  {/* FORMULÁRIO DE MEMBRO */}
                  {showMemberForm ? (
                    <form onSubmit={handleSaveTeamMember} className={`p-4 rounded-xl border shadow-sm flex flex-col gap-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <div className={`flex justify-between items-center pb-2 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                        <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{editingMemberId ? 'Editar Membro' : 'Novo Membro'}</h4>
                        <button type="button" onClick={() => setShowMemberForm(false)} className="text-gray-400 hover:text-gray-500"><X className="w-4 h-4"/></button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Nome Completo</label>
                          <input required type="text" value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} className={`w-full text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-200'}`} placeholder="Ex: Maria Silva" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Nível de Acesso</label>
                          <select value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} className={`w-full text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'border-gray-200'}`}>
                            <option value="Admin">Admin</option>
                            <option value="Editor">Editor</option>
                            <option value="Visualizador">Visualizador</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Responsabilidade / Área</label>
                          <input type="text" value={memberForm.responsibility} onChange={e => setMemberForm({...memberForm, responsibility: e.target.value})} className={`w-full text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-200'}`} placeholder="Ex: UX/UI Design" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-2">Cor de Destaque</label>
                        <div className="flex gap-2.5">
                          {AVATAR_COLORS.map(color => (
                            <button key={color} type="button" onClick={() => setMemberForm({...memberForm, color})} className={`w-7 h-7 rounded-full transition-all ${color} ${memberForm.color === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'} ${isDarkMode ? 'ring-offset-gray-900' : ''}`} />
                          ))}
                        </div>
                      </div>

                      <div className={`flex justify-end gap-2 mt-2 pt-3 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                        <button type="button" onClick={() => setShowMemberForm(false)} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors">Guardar Membro</button>
                      </div>
                    </form>
                  ) : (
                    /* LISTA DE MEMBROS */
                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {teamMembers.length === 0 ? (
                         <div className={`text-center p-6 rounded-xl border-2 border-dashed text-sm ${isDarkMode ? 'bg-gray-900/50 border-gray-700 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>A tua equipa ainda não tem membros.</div>
                      ) : (
                        teamMembers.map(member => (
                          <div key={member.id} className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm transition-all group ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-100 hover:border-indigo-100 hover:shadow-md'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0 ${member.color}`}>
                              {member.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{member.name}</span>
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-1 ${member.role === 'Admin' ? (isDarkMode ? 'text-indigo-300 bg-indigo-900/40' : 'text-indigo-600 bg-indigo-50') : (isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-100')}`}>
                                  {member.role === 'Admin' && <Shield className="w-2.5 h-2.5" />} {member.role}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 truncate mt-0.5">{member.responsibility || 'Sem responsabilidade definida'}</div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditMemberForm(member)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-700' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`} title="Editar"><Edit2 className="w-4 h-4"/></button>
                              <button onClick={() => handleDeleteTeamMember(member.id)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`} title="Remover"><Trash2 className="w-4 h-4"/></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className={`border-t pt-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    <Target className="w-4 h-4 text-gray-500" /> Status da Sincronização
                  </h3>
                  <div className={`p-3 rounded-lg border flex items-start gap-3 ${isDarkMode ? 'bg-green-900/20 border-green-800/50' : 'bg-green-50 border-green-100'}`}>
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 animate-pulse"></div>
                    <div>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>Online & Sincronizado</p>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-green-500/80' : 'text-green-600'}`}>As alterações da equipa são guardadas em tempo real na nuvem via Firestore Database.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="py-2 px-6 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  Concluído
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. MODAL DE AJUDA & LEGENDAS (Onboarding) */}
        {showHelp && (
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`p-5 border-b flex items-center justify-between flex-shrink-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                <h2 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <BookOpen className="w-5 h-5 text-indigo-500" /> Guia de Uso & Legendas
                </h2>
                <button onClick={() => setShowHelp(false)} className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
                
                {/* Seção 1: Fluxo de Trabalho */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-indigo-500" /> Fluxo de Trabalho Recomendado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border shadow-sm relative overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                      <div className={`absolute -right-4 -top-4 opacity-50 ${isDarkMode ? 'text-gray-800' : 'text-gray-50'}`}><Plus className="w-24 h-24" /></div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-3 relative z-10 ${isDarkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>1</div>
                      <h4 className={`text-sm font-bold mb-1 relative z-10 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Captura Rápida</h4>
                      <p className={`text-xs relative z-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Teve uma ideia? Digite na barra superior e aperte Enter. Ela vai direto para a sua <b className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Inbox</b> de forma crua, para não interromper o seu foco.</p>
                    </div>
                    <div className={`p-4 rounded-xl border shadow-sm relative overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                      <div className={`absolute -right-4 -top-4 opacity-50 ${isDarkMode ? 'text-gray-800' : 'text-gray-50'}`}><GripVertical className="w-24 h-24" /></div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-3 relative z-10 ${isDarkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>2</div>
                      <h4 className={`text-sm font-bold mb-1 relative z-10 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Planeamento</h4>
                      <p className={`text-xs relative z-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quando tiver tempo, arraste as ideias da Inbox para o <b className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Roadmap</b> (Agora, A Seguir, Mais Tarde) para criar a sua linha do tempo visual.</p>
                    </div>
                    <div className={`p-4 rounded-xl border shadow-sm relative overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                      <div className={`absolute -right-4 -top-4 opacity-50 ${isDarkMode ? 'text-gray-800' : 'text-gray-50'}`}><CheckSquare className="w-24 h-24" /></div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-3 relative z-10 ${isDarkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>3</div>
                      <h4 className={`text-sm font-bold mb-1 relative z-10 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Aprofundamento</h4>
                      <p className={`text-xs relative z-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Clique num cartão no Roadmap para abrir o painel lateral. Adicione <b className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>sub-tarefas</b>, etiquetas, impacto e atribua à equipa.</p>
                    </div>
                  </div>
                </div>

                <hr className={isDarkMode ? 'border-gray-700' : 'border-gray-100'} />

                {/* Seção 2: Legendas */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Info className="w-4 h-4 text-indigo-500" /> Dicionário de Cartões
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    
                    {/* Status */}
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                      <h4 className={`text-xs font-bold mb-3 uppercase flex items-center gap-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}><Target className="w-3.5 h-3.5 text-gray-500" /> Colunas / Estados</h4>
                      <ul className="space-y-3">
                        <li className={`flex items-start gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><span className="w-2.5 h-2.5 rounded-full bg-gray-400 mt-1 flex-shrink-0"></span> <div><b className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>Inbox:</b> Caixa de entrada. Ideias por refinar.</div></li>
                        <li className={`flex items-start gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1 flex-shrink-0"></span> <div><b className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>Agora:</b> Em desenvolvimento ativo (Sprint atual).</div></li>
                        <li className={`flex items-start gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 mt-1 flex-shrink-0"></span> <div><b className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>A Seguir:</b> Próximo na fila de prioridades.</div></li>
                        <li className={`flex items-start gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><span className="w-2.5 h-2.5 rounded-full bg-blue-400 mt-1 flex-shrink-0"></span> <div><b className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>Mais Tarde:</b> Validado, mas ainda sem previsão.</div></li>
                      </ul>
                    </div>

                    {/* Matriz Esforço/Impacto */}
                    <div className="space-y-6">
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                        <h4 className={`text-xs font-bold mb-3 uppercase flex items-center gap-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}><Zap className="w-3.5 h-3.5 text-gray-500" /> Níveis de Esforço</h4>
                        <ul className="space-y-2">
                          <li className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><b className={`w-14 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Baixo:</b> Tarefas de resolução rápida (Dias).</li>
                          <li className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><b className={`w-14 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Médio:</b> Requer planeamento (Semanas).</li>
                          <li className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><b className={`w-14 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Alto:</b> Projetos densos ou épicos (Meses).</li>
                        </ul>
                      </div>

                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                        <h4 className={`text-xs font-bold mb-3 uppercase flex items-center gap-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}><BarChart2 className="w-3.5 h-3.5 text-gray-500" /> Níveis de Impacto</h4>
                        <ul className="space-y-2">
                          <li className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><b className={`w-14 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Baixo:</b> "Nice to have". Melhoria de qualidade.</li>
                          <li className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><b className={`w-14 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Médio:</b> Funcionalidade Core necessária.</li>
                          <li className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><b className={`w-14 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Alto:</b> Game Changer (Aumenta vendas).</li>
                        </ul>
                      </div>
                    </div>

                    {/* Áreas (Tags) */}
                    <div className={`col-span-1 md:col-span-2 p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                      <h4 className={`text-xs font-bold mb-3 uppercase flex items-center gap-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}><Tag className="w-3.5 h-3.5 text-gray-500" /> Identificação Visual de Áreas</h4>
                      <div className="flex flex-wrap gap-4">
                        <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className={`text-xs px-2 py-1 rounded-md border font-medium ${isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-100 text-green-700 border-green-200'}`}>Frontend</span> (Interface e UI)
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className={`text-xs px-2 py-1 rounded-md border font-medium ${isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>Backend</span> (Dados e Lógica)
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className={`text-xs px-2 py-1 rounded-md border font-medium ${isDarkMode ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>Design</span> (Pesquisa e Telas)
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className={`text-xs px-2 py-1 rounded-md border font-medium ${isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>Geral</span> (Regras de negócio)
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
              
              <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="py-2 px-8 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  Entendi!
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}