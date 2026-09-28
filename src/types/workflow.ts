/**
 * Definições de Tipos para o Sistema de Tratamento de Erros Reportados
 */

export type UserRole = 'CSM' | 'ANALISTA' | 'QUALIDADE';

export interface UserProfile {
  role: UserRole;
  name: string;
  title: string;
  team: string;
  avatar: string;
  email: string;
}

export type TicketStatus =
  | 'NOVO_AGUARDANDO_TRIAGEM'
  | 'INFORMACOES_FALTANDO'
  | 'APROVADO_ANALISTA'
  | 'REPROVADO_ANALISTA'
  | 'EM_CONTESTACAO_QUALIDADE'
  | 'APROVADO_QUALIDADE'
  | 'REPROVADO_QUALIDADE';

export type TicketSeverity = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: string;
}

export type TimelineActionType =
  | 'CRIACAO'
  | 'SOLICITACAO_INFO'
  | 'RETORNO_INFO'
  | 'APROVACAO_ANALISTA'
  | 'REPROVACAO_ANALISTA'
  | 'CONTESTACAO_ANALISTA'
  | 'APROVACAO_QUALIDADE'
  | 'REPROVACAO_QUALIDADE'
  | 'COMENTARIO';

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO string
  authorRole: UserRole;
  authorName: string;
  actionType: TimelineActionType;
  title: string;
  description: string;
  previousStatus?: TicketStatus;
  newStatus?: TicketStatus;
  notes?: string;
  attachments?: Attachment[];
}

export interface Ticket {
  id: string;
  code: string; // ex: ERR-2026-0042
  title: string;
  clientName: string;
  clientSegment: string;
  description: string;
  reproductionSteps?: string;
  severity: TicketSeverity;
  status: TicketStatus;
  category: string;
  attachments: Attachment[];
  
  // Campos obrigatórios de abertura de chamados de novos erros
  analystCell?: string; // Célula do Analista
  analysisDate?: string; // Data da Análise
  documentList?: string; // Listagem de documentos
  errorReasonDC?: string; // Motivo do Erro - DC
  analystName?: string; // Nome do Analista
  impactedEmployeesCount?: number; // Quantidade de colaboradores impactados
  impactedCompetenciesCount?: number; // Quantidade de competências impactadas

  // Metadados de criação
  createdAt: string;
  updatedAt: string;
  createdByName: string;
  createdByRole: UserRole;

  // Detalhes da triagem do Analista
  analystReview?: {
    reviewedAt: string;
    analystName: string;
    decision: 'APROVADO' | 'REPROVADO' | 'CONTESTADO' | 'INFO_SOLICITADA';
    notes: string;
  };

  // Solicitação atual de informação (quando INFORMACOES_FALTANDO)
  missingInfoRequest?: {
    requestedAt: string;
    requestedBy: string;
    question: string;
  };

  // Contestação ativa (quando EM_CONTESTACAO_QUALIDADE)
  contestJustification?: {
    contestedAt: string;
    contestedBy: string;
    reason: string;
  };

  // Decisão final da Qualidade (quando APROVADO_QUALIDADE ou REPROVADO_QUALIDADE)
  qualityReview?: {
    reviewedAt: string;
    qualitySpecialistName: string;
    verdict: 'APROVADO' | 'REPROVADO';
    technicalReport: string;
  };

  // Histórico de auditoria / linha do tempo
  timeline: TimelineEvent[];
}

export interface StatusConfig {
  label: string;
  shortLabel: string;
  description: string;
  color: {
    bg: string;
    text: string;
    border: string;
    indicator: string;
  };
  responsibleRole: UserRole | 'FINALIZADO';
  responsibleLabel: string;
  isFinal: boolean;
}
