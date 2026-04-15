import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';
import { TeamMember } from '@/types/roadmap';
import { useRoadmap } from '@/contexts/RoadmapContext';

jest.mock('@/contexts/RoadmapContext', () => ({
  useRoadmap: jest.fn()
}));

// Mock de dados para a equipa
const mockTeam: TeamMember[] = [
  { id: '1', name: 'Alice', role: 'Admin', color: 'bg-indigo-500', createdAt: Date.now() },
  { id: '2', name: 'Bob', role: 'Editor', color: 'bg-blue-500', createdAt: Date.now() },
];

describe('Navbar', () => {
  const mockOnQuickCapture = jest.fn();
  const mockOnToggleTheme = jest.fn();
  const mockOnOpenSettings = jest.fn();
  const mockOnOpenHelp = jest.fn();
  const mockOnOpenAnalytics = jest.fn();
  const mockOnMenuClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRoadmap as jest.Mock).mockReturnValue({
      addQuickIdea: mockOnQuickCapture,
      currentUser: mockTeam[0],
      team: mockTeam,
      setCurrentUser: jest.fn(),
      searchQuery: '',
      setSearchQuery: jest.fn(),
      syncMode: 'local',
      toasts: [],
      addToast: jest.fn(),
      removeToast: jest.fn()
    });
  });

  it('deve renderizar o logo e o campo de captura rápida', () => {
    render(
      <Navbar 
        isDarkMode={false}
        onToggleTheme={mockOnToggleTheme}
        onOpenSettings={mockOnOpenSettings}
        onOpenHelp={mockOnOpenHelp}
        onOpenAnalytics={mockOnOpenAnalytics}
        onMenuClick={mockOnMenuClick}
      />
    );

    expect(screen.getByText('Codenu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nova ideia para a equipa/i)).toBeInTheDocument();
  });

  it('deve chamar onQuickCapture ao submeter uma nova ideia', () => {
    render(
      <Navbar 
        isDarkMode={false}
        onToggleTheme={mockOnToggleTheme}
        onOpenSettings={mockOnOpenSettings}
        onOpenHelp={mockOnOpenHelp}
        onOpenAnalytics={mockOnOpenAnalytics}
        onMenuClick={mockOnMenuClick}
      />
    );

    const input = screen.getByPlaceholderText(/nova ideia para a equipa/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'Nova feature XYZ' } });
    
    if (form) {
      fireEvent.submit(form);
    }

    expect(mockOnQuickCapture).toHaveBeenCalledWith('Nova feature XYZ', undefined);
    expect(input).toHaveValue('');
  });

  it('deve chamar onToggleTheme ao clicar no botão de tema', () => {
    render(
      <Navbar 
        isDarkMode={false}
        onToggleTheme={mockOnToggleTheme}
        onOpenSettings={mockOnOpenSettings}
        onOpenHelp={mockOnOpenHelp}
        onOpenAnalytics={mockOnOpenAnalytics}
        onMenuClick={mockOnMenuClick}
      />
    );

    const themeBtn = screen.getByTitle(/alternar tema/i);
    fireEvent.click(themeBtn);

    expect(mockOnToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar os avatares da equipa', () => {
    render(
      <Navbar 
        isDarkMode={false}
        onToggleTheme={mockOnToggleTheme}
        onOpenSettings={mockOnOpenSettings}
        onOpenHelp={mockOnOpenHelp}
        onOpenAnalytics={mockOnOpenAnalytics}
        onMenuClick={mockOnMenuClick}
      />
    );

    expect(screen.getByTitle(/Alice/)).toBeInTheDocument();
    expect(screen.getByTitle(/Bob/)).toBeInTheDocument();
  });
});
