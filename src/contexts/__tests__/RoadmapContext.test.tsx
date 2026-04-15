import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoadmapProvider, useRoadmap } from '../RoadmapContext';
import { RoadmapItem } from '@/types/roadmap';

// Componente simples para testar o contexto de consumo
const TestConsumer = () => {
  const { items, updateItemStatus, addQuickIdea } = useRoadmap();
  
  return (
    <div>
      <div data-testid="items-count">{items.length}</div>
      <button 
        data-testid="add-btn" 
        onClick={() => addQuickIdea('Teste Rápido')}
      >
        Add Item
      </button>
      <button 
        data-testid="move-btn"
        onClick={() => {
          if (items.length > 0) {
            updateItemStatus(items[0].id, 'next');
          }
        }}
      >
        Move Item
      </button>
      <div data-testid="first-item-status">
        {items.length > 0 ? items[0].status : 'empty'}
      </div>
      <div data-testid="first-item-title">
        {items.length > 0 ? items[0].title : 'empty'}
      </div>
    </div>
  );
};

describe('RoadmapContext', () => {
  it('lança erro se useRoadmap for usado fora do provider', () => {
    // Retemos o console.error temporariamente de imprimir um grande call stack de React error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestConsumer />)).toThrow('useRoadmap deve ser utilizado dentro de um RoadmapProvider');
    
    consoleSpy.mockRestore();
  });

  it('permite a adição de ideias via addQuickIdea', () => {
    // Iniciamos com lista vazia para testar
    render(
      <RoadmapProvider initialItems={[]}>
        <TestConsumer />
      </RoadmapProvider>
    );

    const addBtn = screen.getByTestId('add-btn');
    
    expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    
    act(() => {
      fireEvent.click(addBtn);
    });

    expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    expect(screen.getByTestId('first-item-status')).toHaveTextContent('inbox');
    expect(screen.getByTestId('first-item-title')).toHaveTextContent('Teste Rápido');
  });

  it('permite a alteração do status de um item via updateItemStatus', () => {
    const mockItems: RoadmapItem[] = [
      {
        id: 'rd-1',
        title: 'Recurso A',
        status: 'inbox',
        description: '',
        checklist: [],
        createdAt: Date.now(),
        createdBy: 'usr-1'
      }
    ];

    render(
      <RoadmapProvider initialItems={mockItems}>
        <TestConsumer />
      </RoadmapProvider>
    );

    expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    expect(screen.getByTestId('first-item-status')).toHaveTextContent('inbox');

    // Ao invocar Move Item
    const moveBtn = screen.getByTestId('move-btn');
    
    act(() => {
      fireEvent.click(moveBtn);
    });

    expect(screen.getByTestId('first-item-status')).toHaveTextContent('next');
  });
});
