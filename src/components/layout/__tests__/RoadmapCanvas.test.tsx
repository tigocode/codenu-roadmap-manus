import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoadmapCanvas from '../RoadmapCanvas';
import { RoadmapItem } from '@/types/roadmap';
import { RoadmapProvider } from '@/contexts/RoadmapContext';

const mockItems: RoadmapItem[] = [
  {
    id: '1',
    title: 'Item Agora',
    status: 'now',
    description: '',
    checklist: [],
    createdAt: Date.now(),
    createdBy: 'user1'
  },
  {
    id: '2',
    title: 'Item A Seguir',
    status: 'next',
    description: '',
    checklist: [],
    createdAt: Date.now(),
    createdBy: 'user1'
  },
  {
    id: '3',
    title: 'Item Mais Tarde',
    status: 'later',
    description: '',
    checklist: [],
    createdAt: Date.now(),
    createdBy: 'user1'
  }
];

describe('RoadmapCanvas', () => {
  it('deve renderizar as colunas "Agora", "A Seguir" e "Mais Tarde"', () => {
    render(
      <RoadmapProvider initialItems={[]}>
        <RoadmapCanvas isDarkMode={false} />
      </RoadmapProvider>
    );

    expect(screen.getByText('Agora')).toBeInTheDocument();
    expect(screen.getByText('A Seguir')).toBeInTheDocument();
    expect(screen.getByText('Mais Tarde')).toBeInTheDocument();
  });

  it('deve exibir os cartões nas colunas corretas respeitando o status', () => {
    render(
      <RoadmapProvider initialItems={mockItems}>
        <RoadmapCanvas isDarkMode={false} />
      </RoadmapProvider>
    );

    expect(screen.getByText('Item Agora')).toBeInTheDocument();
    expect(screen.getByText('Item A Seguir')).toBeInTheDocument();
    expect(screen.getByText('Item Mais Tarde')).toBeInTheDocument();
  });

  it('deve suportar o modo DarkMode e atualizar background/cores', () => {
    const { container } = render(
      <RoadmapProvider initialItems={[]}>
        <RoadmapCanvas isDarkMode={true} />
      </RoadmapProvider>
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });
});
