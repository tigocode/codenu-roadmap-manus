import '@testing-library/jest-dom';

jest.mock('lucide-react', () => ({
  Mail: () => <div data-testid="mail-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Search: () => <div data-testid="search-icon" />,
  X: () => <div data-testid="x-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  User: () => <div data-testid="user-icon" />,
  Briefcase: () => <div data-testid="briefcase-icon" />,
  Sun: () => <div data-testid="sun-icon" />,
  Moon: () => <div data-testid="moon-icon" />,
  HelpCircle: () => <div data-testid="help-icon" />,
  GripVertical: () => <div data-testid="grip-vertical-icon" />,
  CheckSquare: () => <div data-testid="check-square-icon" />,
  // Adicione mais conforme necessário
}));
