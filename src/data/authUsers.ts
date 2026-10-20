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
};
