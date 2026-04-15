export type RoadmapStatus = 'inbox' | 'now' | 'next' | 'later';

export type EffortLevel = 'Dias' | 'Semanas' | 'Meses';
export type ImpactLevel = 'Nice to have' | 'Core' | 'Game Changer';

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  tag?: string; 
  effort?: EffortLevel;
  impact?: ImpactLevel;
  confidence?: number; // 1-10
  iceScore?: number; // Calculado: (Impacto * Confiança * Facilidade)
  assigneeId?: string;
  project?: string;
  checklist: Subtask[];
  createdAt: number;
  createdBy: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string; // Admin, Editor, Visualizador
  responsibility?: string; // Ex: UX/UI Design
  color: string; // Tailwind class like 'bg-blue-500'
  createdAt: number;
}
