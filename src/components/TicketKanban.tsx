import React from 'react';
import {
  Clock,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Headphones,
  Layers,
  Shield,
  Pencil,
} from 'lucide-react';
import { Ticket, TicketStatus } from '../types/workflow';
import { StatusBadge } from './StatusBadge';
import { useWorkflow } from '../context/WorkflowContext';

interface TicketKanbanProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  onEditTicket?: (ticket: Ticket) => void;
}

export const TicketKanban: React.FC<TicketKanbanProps> = ({
  tickets,
  onSelectTicket,
  onEditTicket,
}) => {
  const { currentRole } = useWorkflow();

  const columns: {
    id: string;
    title: string;
    subtitle: string;
    responsibleTeam: string;
    icon: React.ReactNode;
    color: string;
    statuses: TicketStatus[];
  }[] = [
    {
      id: 'triagem',
      title: 'Triagem Inicial',
      subtitle: 'Aguardando decisão técnica',
      responsibleTeam: 'Analista / Supervisor',
      icon: <Layers className="w-4 h-4 text-blue-600" />,
      color: 'border-t-4 border-t-blue-500 bg-slate-100/70',
      statuses: ['NOVO_AGUARDANDO_TRIAGEM'],
    },
    {
      id: 'info',
      title: 'Contestados com CSM',
      subtitle: 'Informações pendentes',
      responsibleTeam: 'CSM (Relacionamento)',
      icon: <Headphones className="w-4 h-4 text-amber-600" />,
      color: 'border-t-4 border-t-amber-500 bg-slate-100/70',
      statuses: ['INFORMACOES_FALTANDO'],
    },
    {
      id: 'qualidade',
      title: 'Análise da Qualidade',
      subtitle: 'Aprovados & Reprovados',
      responsibleTeam: 'Qualidade (QA)',
      icon: <Shield className="w-4 h-4 text-purple-600" />,
      color: 'border-t-4 border-t-purple-500 bg-slate-100/70',
      statuses: ['APROVADO_ANALISTA', 'REPROVADO_ANALISTA', 'EM_CONTESTACAO_QUALIDADE'],
    },
    {
      id: 'finalizados',
      title: 'Finalizados & Concluídos',
      subtitle: 'Parecer final encerrado',
      responsibleTeam: 'Histórico Permanente',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      color: 'border-t-4 border-t-emerald-500 bg-slate-100/70',
      statuses: ['APROVADO_QUALIDADE', 'REPROVADO_QUALIDADE'],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {columns.map((col) => {
        const columnTickets = tickets.filter((t) => col.statuses.includes(t.status));

        return (
          <div
            key={col.id}
            className={`rounded-xl border border-slate-200 ${col.color} p-3 flex flex-col min-h-[500px] shadow-2xs`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                {col.icon}
                <div>
                  <h3 className="text-xs font-bold text-slate-800 leading-tight">
                    {col.title}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {col.responsibleTeam}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                {columnTickets.length}
              </span>
            </div>

            {/* Ticket Cards */}
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {columnTickets.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-lg bg-white/60">
                  <p className="text-xs text-slate-400 font-medium">
                    Nenhum chamado nesta etapa
                  </p>
                </div>
              ) : (
                columnTickets.map((ticket) => {
                  let isCurrentRoleTurn = false;
                  if (col.id === 'triagem' && currentRole === 'ANALISTA')
                    isCurrentRoleTurn = true;
                  if (col.id === 'info' && currentRole === 'CSM')
                    isCurrentRoleTurn = true;
                  if (col.id === 'qualidade' && currentRole === 'QUALIDADE')
                    isCurrentRoleTurn = true;

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => onSelectTicket(ticket)}
                      className={`bg-white rounded-lg p-3.5 border transition-all cursor-pointer hover:shadow-md hover:border-blue-400 group relative ${
                        isCurrentRoleTurn
                          ? 'border-blue-300 ring-1 ring-blue-400/40 shadow-xs'
                          : 'border-slate-200 shadow-2xs'
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                        <span className="font-mono text-[11px] font-bold text-slate-700">
                          {ticket.code}
                        </span>
                        {ticket.analystCell && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 truncate max-w-[120px]">
                            {ticket.analystCell}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1.5 leading-snug">
                        {ticket.errorReasonDC || ticket.title}
                      </h4>

                      {/* Client & Impact */}
                      <div className="text-[11px] text-slate-500 mb-2">
                        <span className="truncate font-semibold text-slate-700 block">
                          {ticket.clientName}
                        </span>
                        {(ticket.impactedEmployeesCount !== undefined || ticket.impactedCompetenciesCount !== undefined) && (
                          <span className="text-[10px] text-slate-400 block">
                            {ticket.impactedEmployeesCount ?? 0} colab. · {ticket.impactedCompetenciesCount ?? 0} comp.
                          </span>
                        )}
                      </div>

                      {/* Missing info prompt or contestation prompt preview */}
                      {ticket.status === 'INFORMACOES_FALTANDO' && ticket.missingInfoRequest && (
                        <div className="bg-amber-50 border border-amber-200 rounded p-1.5 text-[11px] text-amber-900 mb-2 line-clamp-2">
                          <span className="font-semibold">Pedido Analista: </span>
                          {ticket.missingInfoRequest.question}
                        </div>
                      )}

                      {ticket.status === 'INFORMACOES_FALTANDO' && currentRole === 'CSM' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEditTicket) {
                              onEditTicket(ticket);
                            } else {
                              onSelectTicket(ticket);
                            }
                          }}
                          className="w-full mb-2 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Editar Chamado</span>
                        </button>
                      )}

                      {ticket.status === 'EM_CONTESTACAO_QUALIDADE' && ticket.contestJustification && (
                        <div className="bg-purple-50 border border-purple-200 rounded p-1.5 text-[11px] text-purple-900 mb-2 line-clamp-2">
                          <span className="font-semibold">Contestação: </span>
                          {ticket.contestJustification.reason}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <StatusBadge status={ticket.status} size="sm" />
                        <span className="text-slate-400 group-hover:text-blue-600 flex items-center gap-0.5 font-medium transition-colors">
                          Ver <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
