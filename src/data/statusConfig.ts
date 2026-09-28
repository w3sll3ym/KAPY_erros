import { TicketStatus, StatusConfig, UserRole, UserProfile } from '../types/workflow';

export const USER_PROFILES: Record<UserRole, UserProfile> = {
  CSM: {
    role: 'CSM',
    name: 'Mariana Silva',
    title: 'Customer Success Manager',
    team: 'Relacionamento & Contas Estratégicas',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    email: 'mariana.silva@empresa.com',
  },
  ANALISTA: {
    role: 'ANALISTA',
    name: 'Carlos Mendes',
    title: 'Analista de Operações / Supervisor',
    team: 'Triagem & Suporte N2',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'carlos.mendes@empresa.com',
  },
  QUALIDADE: {
    role: 'QUALIDADE',
    name: 'Beatriz Lima',
    title: 'Especialista em Garantia da Qualidade (QA)',
    team: 'Auditoria & Qualidade Técnica',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'beatriz.lima@empresa.com',
  },
};

export const STATUS_CONFIG: Record<TicketStatus, StatusConfig> = {
  NOVO_AGUARDANDO_TRIAGEM: {
    label: 'Novo - Aguardando Triagem',
    shortLabel: 'Aguardando Triagem',
    description: 'Criado pelo CSM e aguarda análise inicial do Analista/Supervisor.',
    color: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      indicator: 'bg-blue-500',
    },
    responsibleRole: 'ANALISTA',
    responsibleLabel: 'Analista / Supervisor',
    isFinal: false,
  },
  INFORMACOES_FALTANDO: {
    label: 'Contestado pelo Analista (Esperando Correção do CSM)',
    shortLabel: 'Contestado (Esperando CSM)',
    description: 'Contestado pelo Analista/Supervisor por falta de dados. Retornado ao CSM para correção e complemento.',
    color: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      indicator: 'bg-amber-500',
    },
    responsibleRole: 'CSM',
    responsibleLabel: 'CSM (Relacionamento)',
    isFinal: false,
  },
  APROVADO_ANALISTA: {
    label: 'Aprovado pelo Analista (Aguardando Qualidade)',
    shortLabel: 'Aprovado pelo Analista',
    description: 'Aprovado pelo Analista/Supervisor e encaminhado para análise técnica e homologação da Qualidade.',
    color: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      indicator: 'bg-blue-600',
    },
    responsibleRole: 'QUALIDADE',
    responsibleLabel: 'Qualidade (QA)',
    isFinal: false,
  },
  REPROVADO_ANALISTA: {
    label: 'Reprovado pelo Analista (Esperando Parecer da Qualidade)',
    shortLabel: 'Reprovado (Esperando Qualidade)',
    description: 'Reprovado pelo Analista/Supervisor aguardando parecer final da Qualidade (aprovação ou reprovação).',
    color: {
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
      indicator: 'bg-orange-500',
    },
    responsibleRole: 'QUALIDADE',
    responsibleLabel: 'Qualidade (QA)',
    isFinal: false,
  },
  EM_CONTESTACAO_QUALIDADE: {
    label: 'Em Contestação (Qualidade)',
    shortLabel: 'Em Contestação',
    description: 'Contestado pelo Analista/Supervisor e encaminhado para deliberação da Qualidade.',
    color: {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      indicator: 'bg-purple-500',
    },
    responsibleRole: 'QUALIDADE',
    responsibleLabel: 'Qualidade (QA)',
    isFinal: false,
  },
  APROVADO_QUALIDADE: {
    label: 'Aprovado pela Qualidade',
    shortLabel: 'Aprovado (Qualidade)',
    description: 'Revisado e aprovado em definitivo pela equipa de Qualidade após contestação.',
    color: {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      indicator: 'bg-teal-600',
    },
    responsibleRole: 'FINALIZADO',
    responsibleLabel: 'Concluído',
    isFinal: true,
  },
  REPROVADO_QUALIDADE: {
    label: 'Reprovado pela Qualidade',
    shortLabel: 'Reprovado Definitivo',
    description: 'Reprovado conclusivamente pela Qualidade (comportamento esperado ou erro de operação).',
    color: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      indicator: 'bg-rose-500',
    },
    responsibleRole: 'FINALIZADO',
    responsibleLabel: 'Concluído',
    isFinal: true,
  },
};

export const SEVERITY_CONFIG: Record<string, { label: string; color: string; badge: string }> = {
  BAIXA: {
    label: 'Baixa',
    color: 'text-slate-600 bg-slate-100',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  MEDIA: {
    label: 'Média',
    color: 'text-sky-700 bg-sky-50',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  ALTA: {
    label: 'Alta',
    color: 'text-orange-700 bg-orange-50',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  CRITICA: {
    label: 'Crítica',
    color: 'text-rose-700 bg-rose-50',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
  },
};

export const CATEGORIES = [
  'Faturamento & Cobrança',
  'Autenticação & SSO',
  'Integração API / Webhooks',
  'Relatórios & Dashboards',
  'Gestão de Usuários & Permissões',
  'Exportação de Dados',
  'Performance & Timeout',
  'Outros',
];
