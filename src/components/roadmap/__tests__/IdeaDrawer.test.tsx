import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IdeaDrawer from '../IdeaDrawer';
import { RoadmapItem } from '@/types/roadmap';

jest.mock('lucide-react', () => ({
  X: () => <div data-testid="icon-x" />,
  Calendar: () => <div data-testid="icon-calendar" />,
  User: () => <div data-testid="icon-user" />,
  Tag: () => <div data-testid="icon-tag" />,
  Zap: () => <div data-testid="icon-zap" />,
  CheckSquare: () => <div data-testid="icon-checksquare" />,
  MessageSquare: () => <div data-testid="icon-messagesquare" />,
  Trash2: () => <div data-testid="icon-trash" />,
  Plus: () => <div data-testid="icon-plus" />,
}));

const mockItem: RoadmapItem = {
  id: 'rd-1',
  title: 'Ideia de Teste',
  description: 'Descrição longa da ideia',
  status: 'now',
  project: 'Projeto Alpha',
  tag: 'Frontend',
  effort: 'Semanas',
  checklist: [{ id: '1', text: 'Task 1', done: false }],
  createdAt: Date.now(),
  createdBy: 'user-1'
};

describe('IdeaDrawer', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();

  it('não deve renderizar nada quando isOpen é false', () => {
    const { container } = render(
      <IdeaDrawer 
        isOpen={false} 
        item={null} 
        onClose={mockOnClose} 
        onUpdate={mockOnUpdate}
        isDarkMode={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar os detalhes do item quando isOpen é true e item está presente', () => {
    render(
      <IdeaDrawer 
        isOpen={true} 
        item={mockItem} 
        onClose={mockOnClose} 
        onUpdate={mockOnUpdate}
        isDarkMode={false}
      />
    );

    expect(screen.getByDisplayValue('Ideia de Teste')).toBeInTheDocument();
    expect(screen.getByText('Projeto Alpha')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/adicionar uma descrição/i)).toHaveValue('Descrição longa da ideia');
  });

  it('deve chamar onClose ao clicar no botão de fechar', () => {
    render(
      <IdeaDrawer 
        isOpen={true} 
        item={mockItem} 
        onClose={mockOnClose} 
        onUpdate={mockOnUpdate}
        isDarkMode={false}
      />
    );

    const closeBtn = screen.getByLabelText(/fechar painel/i);
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onUpdate quando o status da tarefa é alterado', () => {
    render(
      <IdeaDrawer 
        isOpen={true} 
        item={mockItem} 
        onClose={mockOnClose} 
        onUpdate={mockOnUpdate}
        isDarkMode={false}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnUpdate).toHaveBeenCalledWith(mockItem.id, {
      checklist: [{ id: '1', text: 'Task 1', done: true }]
    });
  });

  it('deve adicionar uma nova tarefa ao submeter o formulário', () => {
    render(
      <IdeaDrawer 
        isOpen={true} 
        item={mockItem} 
        onClose={mockOnClose} 
        onUpdate={mockOnUpdate}
        isDarkMode={false}
      />
    );

    const input = screen.getByPlaceholderText(/adicionar nova tarefa/i);
    fireEvent.change(input, { target: { value: 'Nova Subtarefa' } });
    fireEvent.submit(input);

    expect(mockOnUpdate).toHaveBeenCalledWith(mockItem.id, {
      checklist: [
        ...mockItem.checklist!,
        expect.objectContaining({ text: 'Nova Subtarefa', done: false })
      ]
    });
  });

  it('deve remover uma tarefa ao clicar no botão de apagar', () => {
    render(
      <IdeaDrawer 
        isOpen={true} 
        item={mockItem} 
        onClose={mockOnClose} 
        onUpdate={mockOnUpdate}
        isDarkMode={false}
      />
    );

    const removeBtn = screen.getByTitle(/remover tarefa/i);
    fireEvent.click(removeBtn);

    expect(mockOnUpdate).toHaveBeenCalledWith(mockItem.id, {
      checklist: []
    });
  });
});
