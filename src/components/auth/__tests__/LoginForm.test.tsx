import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LoginForm from '../LoginForm';

// Mock da função de submissão
const mockOnSubmit = jest.fn();

describe('LoginForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
    // Silencia erros de console esperados durante validações
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve exibir mensagens de erro ao submeter com campos vazios', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    // Dispara submit no formulário
    fireEvent.submit(submitButton.closest('form')!);

    expect(await screen.findByText(/email é obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/senha é obrigatória/i)).toBeInTheDocument();
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('deve exibir erro para formato de e-mail inválido', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const form = screen.getByRole('button', { name: /entrar/i }).closest('form')!;

    fireEvent.change(emailInput, { target: { value: 'invalido' } });
    fireEvent.submit(form);

    expect(await screen.findByText(/e-mail inválido/i)).toBeInTheDocument();
  });

  it('deve chamar onSubmit com os dados corretos em caso de submissão válida', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/palavra-passe/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    // Preenche os campos
    fireEvent.change(emailInput, { target: { value: 'dev@codenu.com' } });
    fireEvent.change(passwordInput, { target: { value: 'senha123' } });
    
    // Submete o formulário
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'dev@codenu.com',
          password: 'senha123',
        })
      );
    });
  });
});
