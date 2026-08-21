import '@testing-library/jest-dom';

if (!global.fetch) {
  global.fetch = jest.fn() as unknown as typeof fetch;
}

if (!global.Response) {
  global.Response = class Response {} as typeof Response;
}

if (!global.Headers) {
  global.Headers = class Headers {} as typeof Headers;
}

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
  Menu: () => <div data-testid="menu-icon" />,
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Info: () => <div data-testid="info-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Tag: () => <div data-testid="tag-icon" />,
  MessageSquare: () => <div data-testid="message-square-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Target: () => <div data-testid="target-icon" />,
  ShieldCheck: () => <div data-testid="shield-check-icon" />,
  Move: () => <div data-testid="move-icon" />,
  MousePointer2: () => <div data-testid="mouse-pointer-icon" />,
  Layout: () => <div data-testid="layout-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Edit2: () => <div data-testid="edit-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  // Adicione mais conforme necessário
}));
