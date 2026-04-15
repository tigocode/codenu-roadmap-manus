import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SidebarInbox from '../SidebarInbox';
import { RoadmapItem } from '@/types/roadmap';
import { RoadmapProvider } from '@/contexts/RoadmapContext';

// Mock de dados
const mockItems: RoadmapItem[] = [
  {
    id: '1',
    title: 'Ideia 1',
    description: '',
    status: 'inbox',
    checklist: [],
    createdAt: Date.now(),
    createdBy: 'user1'
  },
  {
    id: '2',
    title: 'Ideia 2',
    description: '',
    status: 'inbox',
    checklist: [],
    createdAt: Date.now(),
    createdBy: 'user1'
  }
];

describe('SidebarInbox', () => {
  it('deve exibir mensagem de estado vazio quando não houver itens', () => {
    render(
      <RoadmapProvider initialItems={[]}>
        <SidebarInbox />
      </RoadmapProvider>
    );
    
    expect(screen.getByText(/a tua inbox está limpa/i)).toBeInTheDocument();
  });

  it('deve exibir a lista de títulos das ideias presentes na inbox', () => {
    render(
      <RoadmapProvider initialItems={mockItems}>
        <SidebarInbox />
      </RoadmapProvider>
    );
    
    expect(screen.getByText('Ideia 1')).toBeInTheDocument();
    expect(screen.getByText('Ideia 2')).toBeInTheDocument();
  });

  it('deve exibir o contador correto de itens na badge', () => {
    render(
      <RoadmapProvider initialItems={mockItems}>
        <SidebarInbox />
      </RoadmapProvider>
    );
    
    // O contador deve mostrar '2'
    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('rounded-lg'); // Verificando estilo básico do protótipo
  });

  it('deve renderizar o ícone de Zap conforme o protótipo', () => {
    render(
      <RoadmapProvider initialItems={[]}>
        <SidebarInbox />
      </RoadmapProvider>
    );
    
    // Como mockamos o lucide-react no jest.setup.tsx, procuramos pelo test-id ou estrutura mockada
    // Se o mock for genérico, podemos precisar ajustar o jest.setup.tsx
    expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
  });
});
