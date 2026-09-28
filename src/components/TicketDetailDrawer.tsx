import React, { useState } from 'react';
import {
  X,
  Clock,
  Building,
  User,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  FileText,
  Paperclip,
  Send,
  MessageSquare,
  History,
  Info,
  Calendar,
  Layers,
  Shield,
  Headphones,
  Check,
  Share2,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Ticket, UserRole } from '../types/workflow';
import { StatusBadge, WorkflowStepper } from './StatusBadge';
import { STATUS_CONFIG, USER_PROFILES } from '../data/statusConfig';
import { useWorkflow } from '../context/WorkflowContext';
import {
  RequestInfoModal,
  ContestModal,
  RejectByAnalystModal,
  ResubmitInfoModal,
  QualityVerdictModal,
} from './ActionModals';

interface TicketDetailDrawerProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({
  ticket,
  onClose,
}) => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    approveByAnalyst,
    addComment,
    deleteTicket,
    getTicketById,
  } = useWorkflow();

  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'notes'>('details');
  const [commentText, setCommentText] = useState('');
  const [showDirectApprovePrompt, setShowDirectApprovePrompt] = useState(false);
  const [directApproveNotes, setDirectApproveNotes] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Modals state
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [isContestOpen, setIsContestOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isResubmitOpen, setIsResubmitOpen] = useState(false);
  const [qualityVerdictType, setQualityVerdictType] = useState<
    'APROVAR' | 'REPROVAR' | null
  >(null);

  if (!ticket) return null;

  // Retrieve freshest instance of the ticket from context
  const currentTicket = getTicketById(ticket.id) || ticket;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isActionLoading) return;
    try {
      setIsActionLoading(true);
      await addComment(currentTicket.id, commentText.trim());
      setCommentText('');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDirectApprove = async () => {
    try {
      setIsActionLoading(true);
      await approveByAnalyst(
        currentTicket.id,
        directApproveNotes.trim() ||
          'Validado e aprovado tecnicamente pelo Analista. Encaminhado para análise e homologação da equipe de Qualidade.'
      );
      setShowDirectApprovePrompt(false);
      setDirectApproveNotes('');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsActionLoading(true);
      await deleteTicket(currentTicket.id);
      onClose();
    } finally {
      setIsActionLoading(false);
    }
  };

  // Determine who has the action turn
  let responsibleRole: UserRole | 'CONCLUIDO' = 'CONCLUIDO';
  if (currentTicket.status === 'NOVO_AGUARDANDO_TRIAGEM') responsibleRole = 'ANALISTA';
  if (currentTicket.status === 'INFORMACOES_FALTANDO') responsibleRole = 'CSM';
  if (
    currentTicket.status === 'APROVADO_ANALISTA' ||
    currentTicket.status === 'REPROVADO_ANALISTA' ||
    currentTicket.status === 'EM_CONTESTACAO_QUALIDADE'
  ) {
    responsibleRole = 'QUALIDADE';
  }

  const isMyTurn = responsibleRole === currentRole;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden transform transition-transform"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {currentTicket.code}
              </span>
              <StatusBadge status={currentTicket.status} size="sm" />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowConfirmDelete(!showConfirmDelete)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Excluir do Firebase"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showConfirmDelete && (
            <div className="p-3 mb-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-900">
              <span>Deseja remover este chamado permanentemente do Firestore?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2 py-1 text-slate-600 bg-white rounded border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isActionLoading}
                  className="px-2.5 py-1 text-white bg-rose-600 hover:bg-rose-700 rounded font-semibold flex items-center gap-1"
                >
                  {isActionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          )}

          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentTicket.title}
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span className="font-medium text-slate-700">{currentTicket.clientName}</span>
          </div>
        </div>

        {/* Stepper Header */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          <WorkflowStepper status={currentTicket.status} />
        </div>

        {/* Status Callout / Active Prompt Banners */}
        {currentTicket.status === 'INFORMACOES_FALTANDO' && currentTicket.missingInfoRequest && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Solicitação de Informações pelo Analista ({currentTicket.missingInfoRequest.requestedBy}):</span>
            </div>
            <p className="italic text-slate-800 leading-relaxed pl-6">
              "{currentTicket.missingInfoRequest.question}"
            </p>
            <span className="block text-[10px] text-amber-700 pl-6 mt-1 font-mono">
              Solicitado em: {formatDate(currentTicket.missingInfoRequest.requestedAt)}
            </span>
          </div>
        )}

        {currentTicket.status === 'EM_CONTESTACAO_QUALIDADE' && currentTicket.contestJustification && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 bg-purple-50 border border-purple-300 rounded-lg text-xs text-purple-900 shadow-2xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Justificativa da Contestação ({currentTicket.contestJustification.contestedBy}):</span>
            </div>
            <p className="italic text-slate-800 leading-relaxed pl-6">
              "{currentTicket.contestJustification.reason}"
            </p>
            <span className="block text-[10px] text-purple-700 pl-6 mt-1 font-mono">
              Enviado à Qualidade em: {formatDate(currentTicket.contestJustification.contestedAt)}
            </span>
          </div>
        )}

        {currentTicket.status === 'APROVADO_ANALISTA' && currentTicket.analystReview && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 bg-blue-50 border border-blue-300 rounded-lg text-xs text-blue-900 shadow-2xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Aprovado pelo Analista ({currentTicket.analystReview.analystName}):</span>
            </div>
            <p className="text-slate-800 leading-relaxed pl-6">
              {currentTicket.analystReview.notes}
            </p>
            <span className="block text-[10px] text-blue-700 pl-6 mt-1 font-mono">
              Aguardando análise e homologação da equipe de Qualidade.
            </span>
          </div>
        )}

        {currentTicket.status === 'REPROVADO_ANALISTA' && currentTicket.analystReview && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 bg-orange-50 border border-orange-300 rounded-lg text-xs text-orange-900 shadow-2xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Reprovado pelo Analista ({currentTicket.analystReview.analystName}):</span>
            </div>
            <p className="italic text-slate-800 leading-relaxed pl-6">
              "{currentTicket.analystReview.notes}"
            </p>
            <span className="block text-[10px] text-orange-700 pl-6 mt-1 font-mono">
              Aguardando parecer final da equipe de Qualidade (se aprova o chamado ou se confirma a reprovação).
            </span>
          </div>
        )}

        {currentTicket.status === 'APROVADO_QUALIDADE' && currentTicket.qualityReview && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 bg-teal-50 border border-teal-300 rounded-lg text-xs text-teal-900 shadow-2xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Laudo Conclusivo da Qualidade ({currentTicket.qualityReview.qualitySpecialistName}):</span>
            </div>
            <p className="text-slate-800 leading-relaxed pl-6">
              {currentTicket.qualityReview.technicalReport}
            </p>
          </div>
        )}

        {currentTicket.status === 'REPROVADO_QUALIDADE' && currentTicket.qualityReview && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 shadow-2xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Laudo de Reprovação da Qualidade ({currentTicket.qualityReview.qualitySpecialistName}):</span>
            </div>
            <p className="text-slate-800 leading-relaxed pl-6">
              {currentTicket.qualityReview.technicalReport}
            </p>
          </div>
        )}

        {/* CONTEXTUAL ACTION BAR (Based on active role & ticket status) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Painel de Decisões e Ações (RBAC)
            </span>
            <span className="text-xs text-slate-500">
              Você está agindo como:{' '}
              <strong className="text-slate-800">{currentUser.title} ({currentRole})</strong>
            </span>
          </div>

          {/* Action Set 1: ANALISTA on NOVO_AGUARDANDO_TRIAGEM */}
          {currentRole === 'ANALISTA' && currentTicket.status === 'NOVO_AGUARDANDO_TRIAGEM' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Selecione a decisão de triagem técnica para este chamado reportado:
              </p>
              
              {!showDirectApprovePrompt ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setShowDirectApprovePrompt(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprovar Erro</span>
                  </button>

                  <button
                    onClick={() => setIsContestOpen(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Contestar (Faltam Info)</span>
                  </button>

                  <button
                    onClick={() => setIsRejectOpen(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reprovar Erro</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-white border border-blue-300 rounded-lg space-y-2">
                  <span className="text-xs font-bold text-blue-900 block">
                    Confirmar Aprovação Técnica (Encaminhar à Qualidade)
                  </span>
                  <input
                    type="text"
                    placeholder="Observação técnica (opcional: 'Bug reproduzido com sucesso na versão de homologação')..."
                    value={directApproveNotes}
                    onChange={(e) => setDirectApproveNotes(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowDirectApprovePrompt(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleDirectApprove}
                      disabled={isActionLoading}
                      className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      {isActionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Confirmar e Enviar à Qualidade</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Set 2: CSM on INFORMACOES_FALTANDO */}
          {currentRole === 'CSM' && currentTicket.status === 'INFORMACOES_FALTANDO' && (
            <div>
              <p className="text-xs text-slate-600 mb-2">
                O Analista/Supervisor contestou o chamado informando que faltam informações ou esclarecimentos.
              </p>
              <button
                onClick={() => setIsResubmitOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Complementar Informações e Devolver ao Analista</span>
              </button>
            </div>
          )}

          {/* Action Set 3: QUALIDADE on APROVADO_ANALISTA */}
          {currentRole === 'QUALIDADE' && currentTicket.status === 'APROVADO_ANALISTA' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-600">
                Como especialista de Qualidade, analise o erro aprovado pelo Analista e valide a decisão final:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setQualityVerdictType('APROVAR')}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Homologar Aprovação (Final)</span>
                </button>

                <button
                  onClick={() => setQualityVerdictType('REPROVAR')}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reprovar Erro (Final)</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Set 4: QUALIDADE on REPROVADO_ANALISTA or EM_CONTESTACAO_QUALIDADE */}
          {currentRole === 'QUALIDADE' &&
            (currentTicket.status === 'REPROVADO_ANALISTA' ||
              currentTicket.status === 'EM_CONTESTACAO_QUALIDADE') && (
              <div className="space-y-2">
                <p className="text-xs text-slate-600">
                  Como especialista de Qualidade, emita o parecer final deliberando se aprova o chamado ou se confirma a reprovação:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setQualityVerdictType('APROVAR')}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprovar Chamado (Parecer Final)</span>
                  </button>

                  <button
                    onClick={() => setQualityVerdictType('REPROVAR')}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Confirmar Reprovação (Parecer Final)</span>
                  </button>
                </div>
              </div>
            )}

          {/* If the current role does NOT have actions on this status */}
          {!isMyTurn && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {responsibleRole === 'CONCLUIDO'
                    ? 'Chamado Concluído (Estado Final)'
                    : `Aguardando ação da equipe: ${STATUS_CONFIG[currentTicket.status].responsibleLabel}`}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {responsibleRole === 'CONCLUIDO'
                    ? 'Este chamado foi homologado no Firebase e não permite novas transições de fluxo.'
                    : `Para simular a decisão técnica necessária, você pode alternar seu papel.`}
                </p>
              </div>

              {responsibleRole !== 'CONCLUIDO' && (
                <button
                  onClick={() => setCurrentRole(responsibleRole as UserRole)}
                  className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                >
                  <span>Alternar para {responsibleRole}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-5 bg-white text-xs">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Detalhes do Problema</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Auditoria & Linha do Tempo ({currentTicket.timeline.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Notas Internas</span>
          </button>
        </div>

        {/* Body content based on tab */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Aberto por
                  </span>
                  <span className="font-semibold text-slate-800">
                    {currentTicket.createdByName}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {currentTicket.createdByRole}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Data de Abertura
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(currentTicket.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Última Atualização
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(currentTicket.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Dados do Reporte de Erro (DC) - 8 Campos Solicitados */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                  <span className="font-bold text-blue-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Dados do Chamado de Erro (DC)
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                    Campos Obrigatórios
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Célula do Analista
                    </span>
                    <span className="font-semibold text-slate-900 block mt-0.5">
                      {currentTicket.analystCell || currentTicket.category || 'Não informada'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Nome do Analista
                    </span>
                    <span className="font-semibold text-slate-900 block mt-0.5">
                      {currentTicket.analystName || 'Não informado'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Cliente
                    </span>
                    <span className="font-semibold text-slate-900 block mt-0.5">
                      {currentTicket.clientName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Data da Análise
                    </span>
                    <span className="font-semibold text-slate-900 block mt-0.5">
                      {currentTicket.analysisDate
                        ? new Date(currentTicket.analysisDate + 'T00:00:00').toLocaleDateString('pt-BR')
                        : formatDate(currentTicket.createdAt)}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Motivo do Erro - DC
                    </span>
                    <span className="font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md inline-block mt-0.5 text-xs">
                      {currentTicket.errorReasonDC || currentTicket.title}
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-blue-200/60">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Colaboradores Impactados
                    </span>
                    <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                      {currentTicket.impactedEmployeesCount ?? 0}
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-blue-200/60">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Competências Impactadas
                    </span>
                    <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                      {currentTicket.impactedCompetenciesCount ?? 0}
                    </span>
                  </div>

                  {currentTicket.documentList && (
                    <div className="sm:col-span-2 bg-white/80 p-2.5 rounded-lg border border-blue-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Listagem de Documentos
                      </span>
                      <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-mono">
                        {currentTicket.documentList}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Descrição do Erro & Impacto
                </h4>
                <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {currentTicket.description}
                </div>
              </div>

              {/* Steps to Reproduce */}
              {currentTicket.reproductionSteps && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Passo a Passo de Reprodução
                  </h4>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs leading-relaxed font-mono whitespace-pre-wrap">
                    {currentTicket.reproductionSteps}
                  </pre>
                </div>
              )}

              {/* Attachments */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Anexos & Evidências ({currentTicket.attachments.length})
                </h4>
                {currentTicket.attachments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Nenhum anexo registrado neste chamado.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentTicket.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-slate-800 block truncate">
                              {att.name}
                            </span>
                            {att.size && (
                              <span className="text-[10px] text-slate-400">
                                {att.size}
                              </span>
                            )}
                          </div>
                        </div>
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 bg-white border border-slate-200 rounded shrink-0 ml-2"
                        >
                          Visualizar
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Trilha de Auditoria Cronológica</span>
                <span className="font-mono text-[11px]">
                  {currentTicket.timeline.length} registro(s)
                </span>
              </div>

              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {currentTicket.timeline.map((evt) => {
                  let dotColor = 'bg-blue-500';
                  if (evt.actionType === 'APROVACAO_ANALISTA' || evt.actionType === 'APROVACAO_QUALIDADE') {
                    dotColor = 'bg-emerald-500';
                  } else if (evt.actionType === 'REPROVACAO_QUALIDADE') {
                    dotColor = 'bg-rose-500';
                  } else if (evt.actionType === 'CONTESTACAO_ANALISTA') {
                    dotColor = 'bg-purple-500';
                  } else if (evt.actionType === 'SOLICITACAO_INFO') {
                    dotColor = 'bg-amber-500';
                  }

                  return (
                    <div key={evt.id} className="relative">
                      <div
                        className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${dotColor}`}
                      />

                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-slate-800">
                            {evt.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(evt.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
                          <span>{evt.authorName}</span>
                          <span className="px-1.5 py-0.2 bg-slate-200/70 text-slate-700 rounded text-[10px] font-semibold">
                            {evt.authorRole}
                          </span>
                        </div>

                        <p className="text-slate-600 leading-relaxed">
                          {evt.description}
                        </p>

                        {evt.notes && (
                          <div className="mt-2 p-2 bg-white rounded border border-slate-200 text-slate-800 italic">
                            "{evt.notes}"
                          </div>
                        )}

                        {evt.newStatus && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span>Status alterado para:</span>
                            <StatusBadge status={evt.newStatus} size="sm" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Registre anotações internas ou observações que ficarão gravadas no histórico permanente do chamado no Firebase Firestore.
              </p>

              <form onSubmit={handleSendComment} className="space-y-2">
                <textarea
                  rows={3}
                  placeholder={`Registrar nota como ${currentUser.name} (${currentRole})...`}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isActionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg shadow-xs transition-colors"
                  >
                    {isActionLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    <span>Salvar Comentário</span>
                  </button>
                </div>
              </form>

              {/* List comments from timeline */}
              <div className="space-y-2 pt-2">
                {currentTicket.timeline
                  .filter((e) => e.actionType === 'COMENTARIO')
                  .map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
                        <span className="font-semibold text-slate-700">
                          {c.authorName} ({c.authorRole})
                        </span>
                        <span className="font-mono">{formatDate(c.timestamp)}</span>
                      </div>
                      <p className="text-slate-800">{c.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Modals */}
      <RequestInfoModal
        isOpen={isRequestInfoOpen}
        ticket={currentTicket}
        onClose={() => setIsRequestInfoOpen(false)}
        onSuccess={() => {}}
      />

      <ContestModal
        isOpen={isContestOpen}
        ticket={currentTicket}
        onClose={() => setIsContestOpen(false)}
        onSuccess={() => {}}
      />

      <RejectByAnalystModal
        isOpen={isRejectOpen}
        ticket={currentTicket}
        onClose={() => setIsRejectOpen(false)}
        onSuccess={() => {}}
      />

      <ResubmitInfoModal
        isOpen={isResubmitOpen}
        ticket={currentTicket}
        onClose={() => setIsResubmitOpen(false)}
        onSuccess={() => {}}
      />

      {qualityVerdictType && (
        <QualityVerdictModal
          isOpen={true}
          ticket={currentTicket}
          verdictType={qualityVerdictType}
          onClose={() => setQualityVerdictType(null)}
          onSuccess={() => setQualityVerdictType(null)}
        />
      )}
    </>
  );
};
