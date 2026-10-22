import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bell,
  AlertCircle,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  ExternalLink,
  MessageSquareWarning,
  UserCheck,
  Users,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Inbox,
  Filter,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { Ticket } from '../types/workflow';

interface NotificationItem {
  id: string;
  ticketId: string;
  ticket: Ticket;
  type: 'NOVO_CHAMADO' | 'INFO_REENVIADA' | 'CONTESTADO' | 'VEREDITO_QUALIDADE';
  title: string;
  description: string;
  analystName?: string;
  timestamp: string;
  clientName: string;
  code: string;
}

interface NotificationBellProps {
  onSelectTicket: (ticketId: string) => void;
  onNavigateContestados?: () => void;
  onNavigateQueue?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onSelectTicket,
  onNavigateContestados,
  onNavigateQueue,
}) => {
  const { tickets, currentRole, currentUser, getSupervisedAnalysts } = useWorkflow();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Storage key is scoped to the user/role so each profile has its own read history
  const storageKey = `kapy_notifications_read_${currentRole}_${currentUser.email || currentUser.name}`;

  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Filter for Gestor de Analista to isolate a specific analyst from their team
  const [selectedAnalystFilter, setSelectedAnalystFilter] = useState<string>('ALL');

  // Supervised analysts list for GESTOR_ANALISTA
  const supervisedAnalysts = useMemo(() => {
    if (currentRole !== 'GESTOR_ANALISTA') return [];
    return getSupervisedAnalysts(currentUser.name);
  }, [currentRole, currentUser, getSupervisedAnalysts]);

  // Construct notifications list based on active role
  const notifications = useMemo<NotificationItem[]>(() => {
    const list: NotificationItem[] = [];

    // 1. CSM: Contested tickets waiting for CSM complement
    if (currentRole === 'CSM') {
      tickets
        .filter((t) => t.status === 'INFORMACOES_FALTANDO')
        .forEach((ticket) => {
          const reqTime = ticket.missingInfoRequest?.requestedAt || ticket.updatedAt;
          const author = ticket.missingInfoRequest?.requestedBy || ticket.analystName || 'Analista';
          const reason =
            ticket.missingInfoRequest?.question ||
            ticket.analystReview?.notes ||
            'Informações adicionais solicitadas na triagem.';

          list.push({
            id: `csm_contested_${ticket.id}_${reqTime}`,
            ticketId: ticket.id,
            ticket,
            type: 'CONTESTADO',
            title: 'Chamado Contestado · Dados Pendentes',
            description: `${author}: "${reason}"`,
            analystName: ticket.analystName,
            timestamp: reqTime,
            clientName: ticket.clientName,
            code: ticket.code,
          });
        });
    }

    // 2. ANALISTA: Notifications tied strictly to the Analyst's name
    else if (currentRole === 'ANALISTA') {
      const analystNameLower = currentUser.name.toLowerCase();

      tickets.forEach((ticket) => {
        const ticketAnalyst = ticket.analystName?.toLowerCase() || '';
        const isAssignedToMe =
          ticketAnalyst === analystNameLower ||
          ticketAnalyst.includes(currentUser.name.split(' ')[0].toLowerCase());

        // Skip if not assigned to this analyst
        if (!isAssignedToMe) return;

        // Check for newly returned information from CSM
        const hasResubmit = ticket.timeline?.some((e) => e.actionType === 'RETORNO_INFO');
        const latestEvent = ticket.timeline?.[0];

        if (ticket.status === 'NOVO_AGUARDANDO_TRIAGEM') {
          if (hasResubmit) {
            list.push({
              id: `analyst_resubmit_${ticket.id}_${ticket.updatedAt}`,
              ticketId: ticket.id,
              ticket,
              type: 'INFO_REENVIADA',
              title: 'CSM Reenviou Informações',
              description: `O CSM respondeu à contestação e devolveu o chamado para sua triagem.`,
              analystName: ticket.analystName || currentUser.name,
              timestamp: ticket.updatedAt,
              clientName: ticket.clientName,
              code: ticket.code,
            });
          } else {
            list.push({
              id: `analyst_novo_${ticket.id}_${ticket.createdAt}`,
              ticketId: ticket.id,
              ticket,
              type: 'NOVO_CHAMADO',
              title: 'Novo Erro Aguardando Triagem',
              description: `Reportado por ${ticket.createdByName} (${ticket.category}). Triagem técnica pendente.`,
              analystName: ticket.analystName || currentUser.name,
              timestamp: ticket.createdAt,
              clientName: ticket.clientName,
              code: ticket.code,
            });
          }
        } else if (ticket.status === 'INFORMACOES_FALTANDO') {
          list.push({
            id: `analyst_info_${ticket.id}_${ticket.updatedAt}`,
            ticketId: ticket.id,
            ticket,
            type: 'CONTESTADO',
            title: 'Aguardando Resposta do CSM',
            description: `Contestado por você. Aguardando complemento do cliente/CSM.`,
            analystName: ticket.analystName || currentUser.name,
            timestamp: ticket.updatedAt,
            clientName: ticket.clientName,
            code: ticket.code,
          });
        } else if (
          ticket.status === 'APROVADO_QUALIDADE' ||
          ticket.status === 'REPROVADO_QUALIDADE'
        ) {
          const isApproved = ticket.status === 'APROVADO_QUALIDADE';
          list.push({
            id: `analyst_verdict_${ticket.id}_${ticket.updatedAt}`,
            ticketId: ticket.id,
            ticket,
            type: 'VEREDITO_QUALIDADE',
            title: isApproved ? 'Qualidade Aprovou Erro' : 'Qualidade Reprovou Definitivamente',
            description: `Veredito final emitido por ${ticket.qualityReview?.qualitySpecialistName || 'Qualidade'}.`,
            analystName: ticket.analystName || currentUser.name,
            timestamp: ticket.updatedAt,
            clientName: ticket.clientName,
            code: ticket.code,
          });
        }
      });
    }

    // 3. GESTOR_ANALISTA: Receives notifications for ALL analysts tied to their hierarchy!
    else if (currentRole === 'GESTOR_ANALISTA') {
      const hierarchyAnalystsLower = supervisedAnalysts.map((a) => a.toLowerCase());

      tickets.forEach((ticket) => {
        const ticketAnalyst = ticket.analystName || '';
        const ticketAnalystLower = ticketAnalyst.toLowerCase();

        // Check if ticket's analyst is in the manager's hierarchy
        // If the hierarchy list is empty or analyst name matches any supervised analyst
        const isUnderHierarchy =
          hierarchyAnalystsLower.length === 0 ||
          hierarchyAnalystsLower.some(
            (sup) =>
              ticketAnalystLower.includes(sup) ||
              sup.includes(ticketAnalystLower) ||
              ticketAnalyst === ''
          );

        if (!isUnderHierarchy) return;

        const analystLabel = ticket.analystName || 'Analista da Célula';
        const hasResubmit = ticket.timeline?.some((e) => e.actionType === 'RETORNO_INFO');

        if (ticket.status === 'NOVO_AGUARDANDO_TRIAGEM') {
          if (hasResubmit) {
            list.push({
              id: `gestor_resubmit_${ticket.id}_${ticket.updatedAt}`,
              ticketId: ticket.id,
              ticket,
              type: 'INFO_REENVIADA',
              title: `CSM Reenviou Dados · ${analystLabel}`,
              description: `CSM respondeu à pendência técnica sob responsabilidade de ${analystLabel}.`,
              analystName: analystLabel,
              timestamp: ticket.updatedAt,
              clientName: ticket.clientName,
              code: ticket.code,
            });
          } else {
            list.push({
              id: `gestor_novo_${ticket.id}_${ticket.createdAt}`,
              ticketId: ticket.id,
              ticket,
              type: 'NOVO_CHAMADO',
              title: `Novo Erro na Fila · ${analystLabel}`,
              description: `Novo erro aberto por ${ticket.createdByName} na célula de ${analystLabel}.`,
              analystName: analystLabel,
              timestamp: ticket.createdAt,
              clientName: ticket.clientName,
              code: ticket.code,
            });
          }
        } else if (ticket.status === 'INFORMACOES_FALTANDO') {
          list.push({
            id: `gestor_contestado_${ticket.id}_${ticket.updatedAt}`,
            ticketId: ticket.id,
            ticket,
            type: 'CONTESTADO',
            title: `Contestado por ${analystLabel}`,
            description: `Analista solicitou dados adicionais ao CSM antes de prosseguir com a triagem.`,
            analystName: analystLabel,
            timestamp: ticket.updatedAt,
            clientName: ticket.clientName,
            code: ticket.code,
          });
        } else if (
          ticket.status === 'APROVADO_QUALIDADE' ||
          ticket.status === 'REPROVADO_QUALIDADE'
        ) {
          const isApproved = ticket.status === 'APROVADO_QUALIDADE';
          list.push({
            id: `gestor_veredicto_${ticket.id}_${ticket.updatedAt}`,
            ticketId: ticket.id,
            ticket,
            type: 'VEREDITO_QUALIDADE',
            title: `Parecer Qualidade · ${analystLabel}`,
            description: `${
              isApproved ? 'Aprovado' : 'Reprovado definitivamente'
            } para o caso acompanhado por ${analystLabel}.`,
            analystName: analystLabel,
            timestamp: ticket.updatedAt,
            clientName: ticket.clientName,
            code: ticket.code,
          });
        }
      });
    }

    // Sort by timestamp desc (newest first)
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [tickets, currentRole, currentUser, supervisedAnalysts]);

  // Filtered notifications when Gestor selects a specific analyst tab
  const displayedNotifications = useMemo(() => {
    if (currentRole !== 'GESTOR_ANALISTA' || selectedAnalystFilter === 'ALL') {
      return notifications;
    }
    return notifications.filter(
      (n) => n.analystName?.toLowerCase() === selectedAnalystFilter.toLowerCase()
    );
  }, [notifications, currentRole, selectedAnalystFilter]);

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readIds.includes(n.id)).length;
  }, [notifications, readIds]);

  const saveReadIds = (ids: string[]) => {
    setReadIds(ids);
    try {
      localStorage.setItem(storageKey, JSON.stringify(ids));
    } catch {
      // ignore
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    saveReadIds(updated);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!readIds.includes(item.id)) {
      saveReadIds([...readIds, item.id]);
    }
    setIsOpen(false);
    onSelectTicket(item.ticketId);
  };

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Agora mesmo';
      if (diffMins < 60) return `Há ${diffMins} min`;
      if (diffHours < 24) return `Há ${diffHours}h`;
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `Há ${diffDays} dias`;
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  // Only render for CSM, ANALISTA, and GESTOR_ANALISTA
  if (
    currentRole !== 'CSM' &&
    currentRole !== 'ANALISTA' &&
    currentRole !== 'GESTOR_ANALISTA'
  ) {
    return null;
  }

  const hasNotifications = notifications.length > 0;

  // Title configuration by role
  let roleTitle = 'Notificações de Chamados';
  let roleSubtitle = 'Avisos e atualizações do fluxo operacional';
  let badgeTheme = 'bg-amber-100 text-amber-800 border-amber-300';

  if (currentRole === 'GESTOR_ANALISTA') {
    roleTitle = 'Notificações da Equipe de Analistas';
    roleSubtitle = `Centralizando ${supervisedAnalysts.length} analistas sob sua hierarquia`;
    badgeTheme = 'bg-indigo-100 text-indigo-900 border-indigo-300';
  } else if (currentRole === 'ANALISTA') {
    roleTitle = 'Notificações da Minha Fila';
    roleSubtitle = `Chamados atrelados ao analista ${currentUser.name}`;
    badgeTheme = 'bg-blue-100 text-blue-800 border-blue-300';
  } else if (currentRole === 'CSM') {
    roleTitle = 'Chamados Contestados';
    roleSubtitle = 'Aguardando complemento de dados pelo CSM';
    badgeTheme = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-slate-200 text-slate-900'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title={
          currentRole === 'GESTOR_ANALISTA'
            ? `${notifications.length} notificação(ões) dos analistas sob sua supervisão`
            : currentRole === 'ANALISTA'
            ? `${notifications.length} notificação(ões) da sua fila de análise`
            : `${notifications.length} chamado(s) contestado(s)`
        }
        aria-label="Notificações"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4 text-slate-600" />

        {hasNotifications && (
          <span
            className={`absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold rounded-full border leading-none shadow-2xs ${badgeTheme}`}
          >
            {unreadCount > 0 ? unreadCount : notifications.length}
          </span>
        )}
      </button>

      {/* Popover / Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  currentRole === 'GESTOR_ANALISTA'
                    ? 'bg-indigo-100 text-indigo-700'
                    : currentRole === 'ANALISTA'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {currentRole === 'GESTOR_ANALISTA' ? (
                  <Users className="w-4 h-4" />
                ) : currentRole === 'ANALISTA' ? (
                  <UserCheck className="w-4 h-4" />
                ) : (
                  <MessageSquareWarning className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{roleTitle}</h3>
                  {hasNotifications && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${badgeTheme}`}
                    >
                      {notifications.length}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{roleSubtitle}</p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Lidas</span>
              </button>
            )}
          </div>

          {/* Gestor Hierarchy Filter Tabs (when in GESTOR_ANALISTA role) */}
          {currentRole === 'GESTOR_ANALISTA' && supervisedAnalysts.length > 0 && (
            <div className="p-2 bg-indigo-50/40 border-b border-indigo-100 flex items-center gap-1 overflow-x-auto">
              <span className="text-[10px] font-semibold text-indigo-900 px-1 shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Filtrar:</span>
              </span>
              <button
                onClick={() => setSelectedAnalystFilter('ALL')}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                  selectedAnalystFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Todos ({notifications.length})
              </button>
              {supervisedAnalysts.map((analyst) => {
                const countForAnalyst = notifications.filter(
                  (n) => n.analystName?.toLowerCase() === analyst.toLowerCase()
                ).length;
                return (
                  <button
                    key={analyst}
                    onClick={() => setSelectedAnalystFilter(analyst)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
                      selectedAnalystFilter === analyst
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{analyst.split(' ')[0]}</span>
                    {countForAnalyst > 0 && (
                      <span className="opacity-80">({countForAnalyst})</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* List of Notifications */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {displayedNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  Nenhuma notificação pendente
                </p>
                <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto mt-1">
                  {currentRole === 'GESTOR_ANALISTA'
                    ? 'Todos os analistas sob sua hierarquia estão em dia com seus chamados.'
                    : currentRole === 'ANALISTA'
                    ? 'Não há novos erros ou contestações aguardando ação no seu nome.'
                    : 'Não há chamados com pendência de informações ou contestação.'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((item) => {
                const isUnread = !readIds.includes(item.id);
                const timeText = formatTimeAgo(item.timestamp);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`w-full text-left p-3.5 hover:bg-slate-50/90 transition-colors flex items-start gap-3 cursor-pointer group ${
                      isUnread
                        ? currentRole === 'GESTOR_ANALISTA'
                          ? 'bg-indigo-50/30'
                          : 'bg-amber-50/40'
                        : 'bg-white'
                    }`}
                  >
                    {/* Status / Role Icon */}
                    <div className="mt-0.5 shrink-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          item.type === 'INFO_REENVIADA'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : item.type === 'CONTESTADO'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : item.type === 'VEREDITO_QUALIDADE'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {item.type === 'INFO_REENVIADA' ? (
                          <RotateCcw className="w-3.5 h-3.5" />
                        ) : item.type === 'CONTESTADO' ? (
                          <AlertCircle className="w-3.5 h-3.5" />
                        ) : item.type === 'VEREDITO_QUALIDADE' ? (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Inbox className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-bold text-slate-800">
                            {item.code}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[120px]">
                            {item.clientName}
                          </span>
                          {/* Supervised Analyst Tag */}
                          {currentRole === 'GESTOR_ANALISTA' && item.analystName && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 border border-indigo-200 font-semibold flex items-center gap-0.5">
                              <UserCheck className="w-2.5 h-2.5" />
                              <span>{item.analystName}</span>
                            </span>
                          )}
                          {isUnread && (
                            <span
                              className={`w-2 h-2 rounded-full ${
                                currentRole === 'GESTOR_ANALISTA'
                                  ? 'bg-indigo-600'
                                  : 'bg-amber-500'
                              }`}
                              title="Não lida"
                            />
                          )}
                        </div>
                        {timeText && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {timeText}
                          </span>
                        )}
                      </div>

                      {/* Notification Title */}
                      <p className="text-xs font-semibold text-slate-900 truncate mb-1">
                        {item.title}
                      </p>

                      {/* Description / Summary */}
                      <div
                        className={`p-2 rounded-lg text-[11px] mb-1.5 leading-relaxed line-clamp-2 ${
                          currentRole === 'GESTOR_ANALISTA'
                            ? 'bg-indigo-50/60 text-slate-700 border border-indigo-100'
                            : 'bg-slate-50 text-slate-700 border border-slate-200/70'
                        }`}
                      >
                        {item.description}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Clique para abrir chamado</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          {hasNotifications && currentRole === 'CSM' && onNavigateContestados && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateContestados();
                }}
                className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Ver todos os Erros Contestados ({notifications.length})</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          )}

          {hasNotifications && currentRole === 'GESTOR_ANALISTA' && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
              <span className="text-[11px] text-indigo-900 font-medium">
                Notificações centralizadas da hierarquia operacional
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
