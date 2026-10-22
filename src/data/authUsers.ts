import { UserRole } from '../types/workflow';

export interface SimulatedUserAccount {
  role: UserRole;
  name: string;
  email: string;
  secondaryEmail: string;
  passwordHint: string;
  title: string;
  team: string;
  avatar: string;
  badgeLabel: string;
  badgeColor: string;
  accentBorder: string;
  accentBg: string;
  buttonBg: string;
  description: string;
  permissions: string[];
}

export const SIMULATED_ACCOUNTS: Record<UserRole, SimulatedUserAccount> = {
  CSM: {
    role: 'CSM',
    name: 'Mariana Silva',
    email: 'csm@kapy.com',
    secondaryEmail: 'mariana.silva@empresa.com',
    passwordHint: '123',
    title: 'Customer Success Manager',
    team: 'Relacionamento & Contas Estratégicas',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    badgeLabel: 'Relacionamento & CSM',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    accentBorder: 'border-blue-200 hover:border-blue-500',
    accentBg: 'bg-blue-50/50 hover:bg-blue-50',
    buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    description:
      'Responsável pela abertura de chamados, acompanhamento de todos os erros reportados e resposta a chamados contestados.',
    permissions: [
      'Abertura de novos reportes de erro no sistema',
      'Visualização completa de todos os erros (abertos e finalizados)',
      'Edição e reenvio de chamados contestados por falta de informações',
      'Sino de notificações em tempo real para erros contestados',
    ],
  },
  ANALISTA: {
    role: 'ANALISTA',
    name: 'Carlos Mendes',
    email: 'analista@kapy.com',
    secondaryEmail: 'carlos.mendes@empresa.com',
    passwordHint: '123',
    title: 'Analista de Operações / Supervisor',
    team: 'Triagem & Suporte Técnico N2',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    badgeLabel: 'Operações & Triagem',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    accentBorder: 'border-indigo-200 hover:border-indigo-500',
    accentBg: 'bg-indigo-50/50 hover:bg-indigo-50',
    buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    description:
      'Responsável pela triagem técnica, solicitação de dados/contestação ao CSM, aprovação direta conclusiva ou reprovação.',
    permissions: [
      'Triagem técnica operacional de chamados recém-abertos',
      'Contestação com solicitação formal de dados faltantes ao CSM',
      'Aprovação direta e conclusiva de erros procedentes (sem necessidade de Qualidade)',
      'Reprovação técnica com encaminhamento obrigatório ao parecer da Qualidade',
    ],
  },
  QUALIDADE: {
    role: 'QUALIDADE',
    name: 'Beatriz Lima',
    email: 'qualidade@kapy.com',
    secondaryEmail: 'beatriz.lima@empresa.com',
    passwordHint: '123',
    title: 'Especialista em Garantia da Qualidade (QA)',
    team: 'Auditoria & Qualidade Técnica',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    badgeLabel: 'Auditoria & Qualidade QA',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    accentBorder: 'border-orange-200 hover:border-orange-500',
    accentBg: 'bg-orange-50/50 hover:bg-orange-50',
    buttonBg: 'bg-orange-600 hover:bg-orange-700 text-white',
    description:
      'Atua com veredito final exclusivo quando um analista reprova um erro aberto pelo CSM (deliberando pela aprovação ou reprovação).',
    permissions: [
      'Fila de deliberação exclusiva de chamados reprovados pelo Analista',
      'Emissão de veredito final conclusivo (Aprovar chamado ou Confirmar reprovação)',
      'Acompanhamento do consolidado de chamados finalizados e taxa de aprovação geral',
    ],
  },
  ADMIN: {
    role: 'ADMIN',
    name: 'Henrique Alcântara',
    email: 'admin@kapy.com',
    secondaryEmail: 'admin@empresa.com',
    passwordHint: '123',
    title: 'Administrador do Sistema & Gestor OPs',
    team: 'Governança & Administração',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badgeLabel: 'Governança & Gestão',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    accentBorder: 'border-purple-200 hover:border-purple-500',
    accentBg: 'bg-purple-50/50 hover:bg-purple-50',
    buttonBg: 'bg-purple-600 hover:bg-purple-700 text-white',
    description:
      'Gerencia a plataforma: configura e atribui quais papéis os usuários irão desempenhar, cadastra clientes, categorias e audita o sistema.',
    permissions: [
      'Gestão de usuários e configuração de papéis (CSM, Analista, Qualidade, Administrador, Gestor)',
      'Cadastro, edição e controle de clientes e segmentos',
      'Cadastro e parametrização de categorias e tipos de erros',
      'Visão global de todos os chamados e relatórios consolidados',
    ],
  },
  GESTOR_ANALISTA: {
    role: 'GESTOR_ANALISTA',
    name: 'Roberto Mendes',
    email: 'gestor.analista@kapy.com',
    secondaryEmail: 'roberto.mendes@empresa.com',
    passwordHint: '123',
    title: 'Gestor de Triagem & Operações N1/N2',
    team: 'Gestão de Operações & Triagem',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    badgeLabel: 'Gestão de Analistas',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    accentBorder: 'border-indigo-300 hover:border-indigo-600',
    accentBg: 'bg-indigo-50/60 hover:bg-indigo-50',
    buttonBg: 'bg-indigo-700 hover:bg-indigo-800 text-white',
    description:
      'Supervisiona a equipe de triagem operacional e recebe centralizadamente todas as notificações dos analistas sob sua hierarquia.',
    permissions: [
      'Recebimento de notificações de todos os analistas atrelados à sua hierarquia',
      'Visão centralizada de pendências e prazos de atendimento da equipe de triagem',
      'Acompanhamento de chamados abertos, contestados e finalizados dos analistas supervisionados',
      'Supervisão técnica das aprovações e reprovações efetuadas pelos analistas',
    ],
  },
};

export const DEFAULT_SYSTEM_USERS = [
  {
    id: 'user-001',
    name: 'Mariana Silva',
    email: 'csm@kapy.com',
    role: 'CSM' as const,
    title: 'Customer Success Manager',
    team: 'Relacionamento & Contas Estratégicas',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'ATIVO' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-002',
    name: 'Carlos Mendes',
    email: 'analista@kapy.com',
    role: 'ANALISTA' as const,
    title: 'Analista de Operações / Supervisor N2',
    team: 'Triagem & Suporte N2',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'ATIVO' as const,
    managerId: 'user-007',
    managerName: 'Roberto Mendes',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-003',
    name: 'Beatriz Lima',
    email: 'qualidade@kapy.com',
    role: 'QUALIDADE' as const,
    title: 'Especialista em Garantia da Qualidade (QA)',
    team: 'Auditoria & Qualidade Técnica',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'ATIVO' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-004',
    name: 'Henrique Alcântara',
    email: 'admin@kapy.com',
    role: 'ADMIN' as const,
    title: 'Administrador do Sistema & Gestor OPs',
    team: 'Governança & Administração',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ATIVO' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-005',
    name: 'Gabriel Siqueira',
    email: 'gabriel.csm@kapy.com',
    role: 'CSM' as const,
    title: 'Customer Success Specialist',
    team: 'Relacionamento & Contas Estratégicas',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'ATIVO' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-006',
    name: 'Juliana Costa',
    email: 'juliana.ops@kapy.com',
    role: 'ANALISTA' as const,
    title: 'Analista de Operações N1',
    team: 'Triagem & Suporte N1/N2',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ATIVO' as const,
    managerId: 'user-007',
    managerName: 'Roberto Mendes',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-007',
    name: 'Roberto Mendes',
    email: 'gestor.analista@kapy.com',
    role: 'GESTOR_ANALISTA' as const,
    title: 'Gestor de Triagem & Operações N1/N2',
    team: 'Gestão de Operações & Triagem',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'ATIVO' as const,
    supervisedAnalysts: ['Carlos Mendes', 'Juliana Costa'],
    createdAt: new Date().toISOString(),
  },
];
