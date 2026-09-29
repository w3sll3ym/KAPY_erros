import React from 'react';
import {
  Layers,
  Plus,
  Pencil,
  Shield,
} from 'lucide-react';
import { Ticket, UserRole } from '../types/workflow';
import { StatusBadge } from './StatusBadge';
import { useWorkflow } from '../context/WorkflowContext';

interface TicketTableProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  onOpenNewTicket?: () => void;
  onEditTicket?: (ticket: Ticket) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  onSelectTicket,
  onOpenNewTicket,
  onEditTicket,
}) => {
  const { currentRole, loading } = useWorkflow();

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getActionTargetRole = (status: string): UserRole | 'CONCLUIDO' => {
    if (status === 'NOVO_AGUARDANDO_TRIAGEM') return 'ANALISTA';
    if (status === 'INFORMACOES_FALTANDO') return 'CSM';
    if (
      status === 'APROVADO_ANALISTA' ||
      status === 'REPROVADO_ANALISTA' ||
      status === 'EM_CONTESTACAO_QUALIDADE'
    ) {
      return 'QUALIDADE';
    }
    return 'CONCLUIDO';
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-2xs">
        <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">
          Carregando chamados...
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Buscando registros atualizados.
        </p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
          <Layers className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">
          Nenhum chamado encontrado
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
          {onOpenNewTicket
            ? 'Nenhum chamado registrado nesta fila. Comece criando o primeiro chamado.'
            : 'Nenhum chamado registrado nesta fila.'}
        </p>
        {onOpenNewTicket ? (
          <button
            onClick={onOpenNewTicket}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Chamado</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Abertura restrita ao perfil CSM
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Código</th>
              <th className="py-3 px-4 min-w-[280px]">Título & Descrição</th>
              <th className="py-3 px-4">Cliente</th>
              <th className="py-3 px-4">Estado Atual</th>
              <th className="py-3 px-4">Responsável Atual</th>
              <th className="py-3 px-4">Atualizado</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {tickets.map((ticket) => {
              const targetRole = getActionTargetRole(ticket.status);
              const isActionableForMe = targetRole === currentRole;

              return (
                <tr
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket)}
                  className={`hover:bg-slate-50/90 transition-colors cursor-pointer group ${
                    isActionableForMe ? 'bg-blue-50/20' : ''
                  }`}
                >
                  {/* Code */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {isActionableForMe && (
                        <span
                          className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"
                          title="Ação necessária no seu perfil ativo"
                        />
                      )}
                      <span>{ticket.code}</span>
                    </div>
                  </td>

                  {/* Title & Description */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {ticket.analystCell && (
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                            Célula: {ticket.analystCell}
                          </span>
                        )}
                        {ticket.analystName && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            Analista: {ticket.analystName}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {ticket.errorReasonDC || ticket.title}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[280px]">
                        {ticket.documentList ? `Docs: ${ticket.documentList}` : ticket.description}
                      </p>
                    </div>
                  </td>

                  {/* Client */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800 truncate max-w-[180px] block">
                      {ticket.clientName}
                    </span>
                    {(ticket.impactedEmployeesCount !== undefined || ticket.impactedCompetenciesCount !== undefined) && (
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {ticket.impactedEmployeesCount ?? 0} colab. · {ticket.impactedCompetenciesCount ?? 0} comp.
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={ticket.status} size="sm" />
                  </td>

                  {/* Responsible / Next Turn */}
                  <td className="py-3.5 px-4">
                    {targetRole === 'CONCLUIDO' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                        Finalizado
                      </span>
                    ) : (
                      <span className="text-slate-700 font-medium text-[11px]">
                        {targetRole}
                      </span>
                    )}
                  </td>

                  {/* Updated At */}
                  <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                    {formatDate(ticket.updatedAt)}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    {currentRole === 'CSM' && ticket.status === 'INFORMACOES_FALTANDO' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEditTicket) {
                            onEditTicket(ticket);
                          } else {
                            onSelectTicket(ticket);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all cursor-pointer"
                        title="Editar campos do chamado contestado"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar Chamado</span>
                      </button>
                    ) : currentRole === 'QUALIDADE' && isActionableForMe ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(ticket);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all cursor-pointer"
                        title="Emitir veredito final da Qualidade"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Dar Veredito</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(ticket);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isActionableForMe
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{isActionableForMe ? 'Agir' : 'Detalhes'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
