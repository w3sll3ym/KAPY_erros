import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bell,
  BellRing,
  AlertCircle,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  ExternalLink,
  MessageSquareWarning,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { Ticket } from '../types/workflow';

const STORAGE_KEY = 'nexus_csm_read_contested_ids';

interface NotificationBellProps {
  onSelectTicket: (ticketId: string) => void;
  onNavigateContestados: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onSelectTicket,
  onNavigateContestados,
}) => {
  const { tickets, currentRole } = useWorkflow();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read ticket IDs stored in localStorage
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Filter contested tickets (INFORMACOES_FALTANDO)
  const contestedTickets = useMemo(() => {
    return tickets
      .filter((t) => t.status === 'INFORMACOES_FALTANDO')
      .sort((a, b) => {
        const timeA = new Date(a.missingInfoRequest?.requestedAt || a.updatedAt).getTime();
        const timeB = new Date(b.missingInfoRequest?.requestedAt || b.updatedAt).getTime();
        return timeB - timeA;
      });
  }, [tickets]);

  // Unread contested tickets
  const unreadCount = useMemo(() => {
    return contestedTickets.filter((t) => !readIds.includes(t.id)).length;
  }, [contestedTickets, readIds]);

  // Save readIds changes to localStorage
  const saveReadIds = (ids: string[]) => {
    setReadIds(ids);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  };

  const markAllAsRead = () => {
    const allContestedIds = contestedTickets.map((t) => t.id);
    const updated = Array.from(new Set([...readIds, ...allContestedIds]));
    saveReadIds(updated);
  };

  const handleTicketClick = (ticket: Ticket) => {
    if (!readIds.includes(ticket.id)) {
      saveReadIds([...readIds, ticket.id]);
    }
    setIsOpen(false);
    onSelectTicket(ticket.id);
  };

  const handleViewAllContestados = () => {
    setIsOpen(false);
    onNavigateContestados();
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

  // Format timestamp nicely
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

  if (currentRole !== 'CSM') {
    return null;
  }

  const hasContested = contestedTickets.length > 0;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2 rounded-xl transition-all duration-200 cursor-pointer border ${
          isOpen
            ? 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-400/30'
            : hasContested && unreadCount > 0
            ? 'bg-white hover:bg-amber-50/60 text-amber-600 border-amber-300 shadow-2xs hover:border-amber-400'
            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 shadow-2xs hover:text-slate-900'
        }`}
        title={
          hasContested
            ? `${contestedTickets.length} chamado(s) contestado(s) necessitando de complemento`
            : 'Notificações de chamados contestados'
        }
        aria-label="Notificações de chamados contestados"
        aria-expanded={isOpen}
      >
        {hasContested && unreadCount > 0 ? (
          <BellRing className="w-4 h-4 animate-bounce text-amber-600" />
        ) : (
          <Bell className="w-4 h-4" />
        )}

        {/* Badge Indicator */}
        {hasContested && (
          <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full shadow-xs ${
              unreadCount > 0
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-slate-200 text-slate-700 border border-slate-300'
            }`}
          >
            {unreadCount > 0 ? unreadCount : contestedTickets.length}
          </span>
        )}
      </button>

      {/* Popover / Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <MessageSquareWarning className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900">
                    Chamados Contestados
                  </h3>
                  {hasContested && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      {contestedTickets.length}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Aguardando complemento de informações pelo CSM
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Lidas</span>
              </button>
            )}
          </div>

          {/* List of Contested Tickets */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {contestedTickets.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  Nenhum chamado contestado
                </p>
                <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto mt-1">
                  Não há chamados com pendência de informações ou contestação no momento.
                </p>
              </div>
            ) : (
              contestedTickets.map((ticket) => {
                const isUnread = !readIds.includes(ticket.id);
                const questionText =
                  ticket.missingInfoRequest?.question ||
                  ticket.analystReview?.notes ||
                  ticket.description;
                const authorName =
                  ticket.missingInfoRequest?.requestedBy ||
                  ticket.analystReview?.analystName ||
                  'Analista';
                const timeText = formatTimeAgo(
                  ticket.missingInfoRequest?.requestedAt || ticket.updatedAt
                );

                return (
                  <button
                    key={ticket.id}
                    onClick={() => handleTicketClick(ticket)}
                    className={`w-full text-left p-3.5 hover:bg-slate-50/80 transition-colors flex items-start gap-3 cursor-pointer group ${
                      isUnread ? 'bg-amber-50/40' : 'bg-white'
                    }`}
                  >
                    {/* Status/Type icon */}
                    <div className="mt-0.5 shrink-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isUnread
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-bold text-slate-800">
                            {ticket.code}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {ticket.clientName}
                          </span>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-amber-500" title="Não lido" />
                          )}
                        </div>
                        {timeText && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {timeText}
                          </span>
                        )}
                      </div>

                      {/* Ticket Title */}
                      <p className="text-xs font-semibold text-slate-900 truncate mb-1">
                        {ticket.title}
                      </p>

                      {/* Reason / Question from Analyst */}
                      <div className="p-2 bg-amber-100/50 rounded-lg border border-amber-200/70 text-[11px] text-amber-950 mb-1.5 leading-relaxed line-clamp-2">
                        <span className="font-semibold text-amber-800">
                          {authorName}:{' '}
                        </span>
                        <span>"{questionText}"</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Clique para editar e devolver</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          {hasContested && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={handleViewAllContestados}
                className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Ver todos os Erros Contestados ({contestedTickets.length})</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
