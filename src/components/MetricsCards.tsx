import React from 'react';
import {
  Inbox,
  Clock,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { TicketStatus } from '../types/workflow';

interface MetricsCardsProps {
  selectedStatusFilter: TicketStatus | 'ALL';
  onSelectStatusFilter: (status: TicketStatus | 'ALL') => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  selectedStatusFilter,
  onSelectStatusFilter,
}) => {
  const { metrics, currentRole } = useWorkflow();

  const cards = React.useMemo(() => {
    if (currentRole === 'CSM') {
      return [
        {
          id: 'csm_reportados',
          status: 'NOVO_AGUARDANDO_TRIAGEM' as TicketStatus,
          label: 'Erros Reportados',
          value: metrics.novoAguardandoTriagem,
          sublabel: 'Aguardando triagem técnica',
          icon: <Clock className="w-5 h-5 text-blue-600" />,
          accentColor: 'border-blue-200 hover:border-blue-400',
          activeColor: 'ring-2 ring-blue-600 bg-blue-50/50',
        },
        {
          id: 'csm_contestados',
          status: 'INFORMACOES_FALTANDO' as TicketStatus,
          label: 'Erros Contestados',
          value: metrics.informacoesFaltando,
          sublabel: 'Faltam informações pendentes',
          icon: <HelpCircle className="w-5 h-5 text-amber-600" />,
          accentColor: 'border-amber-200 hover:border-amber-400',
          activeColor: 'ring-2 ring-amber-600 bg-amber-50/50',
        },
        {
          id: 'csm_finalizados',
          status: 'ALL' as const,
          label: 'Erros Finalizados',
          value: metrics.finalizadosTotal,
          sublabel: `${metrics.aprovadosQualidade} aprovados / ${metrics.reprovadosQualidade} reprovados`,
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          accentColor: 'border-emerald-200 hover:border-emerald-400',
          activeColor: 'ring-2 ring-emerald-600 bg-emerald-50/50',
        },
      ];
    }

    if (currentRole === 'ANALISTA') {
      return [
        {
          id: 'analista_triagem',
          status: 'NOVO_AGUARDANDO_TRIAGEM' as TicketStatus,
          label: 'Fila de Triagem',
          value: metrics.novoAguardandoTriagem,
          sublabel: 'Erros abertos pelo CSM',
          icon: <Clock className="w-5 h-5 text-blue-600" />,
          accentColor: 'border-blue-200 hover:border-blue-400',
          activeColor: 'ring-2 ring-blue-600 bg-blue-50/50',
        },
        {
          id: 'analista_contestados',
          status: 'INFORMACOES_FALTANDO' as TicketStatus,
          label: 'Contestados com CSM',
          value: metrics.informacoesFaltando,
          sublabel: 'Aguardando resposta do CSM',
          icon: <HelpCircle className="w-5 h-5 text-amber-600" />,
          accentColor: 'border-amber-200 hover:border-amber-400',
          activeColor: 'ring-2 ring-amber-600 bg-amber-50/50',
        },
        {
          id: 'analista_aprovados',
          status: 'APROVADO_ANALISTA' as TicketStatus,
          label: 'Aprovados p/ Qualidade',
          value: metrics.aprovadosAnalista,
          sublabel: 'Encaminhados para análise',
          icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
          accentColor: 'border-blue-200 hover:border-blue-400',
          activeColor: 'ring-2 ring-blue-600 bg-blue-50/50',
        },
        {
          id: 'analista_reprovados',
          status: 'REPROVADO_ANALISTA' as TicketStatus,
          label: 'Reprovados p/ Qualidade',
          value: metrics.reprovadosAnalista,
          sublabel: 'Encaminhados para parecer final',
          icon: <ShieldAlert className="w-5 h-5 text-orange-600" />,
          accentColor: 'border-orange-200 hover:border-orange-400',
          activeColor: 'ring-2 ring-orange-600 bg-orange-50/50',
        },
      ];
    }

    // QUALIDADE
    return [
      {
        id: 'qualidade_aprovados',
        status: 'APROVADO_ANALISTA' as TicketStatus,
        label: 'Erros Aprovados',
        value: metrics.aprovadosAnalista,
        sublabel: 'Aguardando validação da Qualidade',
        icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
        accentColor: 'border-blue-200 hover:border-blue-400',
        activeColor: 'ring-2 ring-blue-600 bg-blue-50/50',
      },
      {
        id: 'qualidade_reprovados',
        status: 'REPROVADO_ANALISTA' as TicketStatus,
        label: 'Erros Reprovados',
        value: metrics.reprovadosAnalista,
        sublabel: 'Aguardando parecer final',
        icon: <ShieldAlert className="w-5 h-5 text-orange-600" />,
        accentColor: 'border-orange-200 hover:border-orange-400',
        activeColor: 'ring-2 ring-orange-600 bg-orange-50/50',
      },
      {
        id: 'qualidade_finalizados',
        status: 'ALL' as const,
        label: 'Erros Finalizados',
        value: metrics.finalizadosTotal,
        sublabel: `${metrics.aprovadosQualidade} aprovados / ${metrics.reprovadosQualidade} reprovados`,
        icon: <Inbox className="w-5 h-5 text-emerald-600" />,
        accentColor: 'border-emerald-200 hover:border-emerald-400',
        activeColor: 'ring-2 ring-emerald-600 bg-emerald-50/50',
      },
      {
        id: 'qualidade_taxa',
        status: 'APROVADO_QUALIDADE' as TicketStatus,
        label: 'Taxa de Aprovação',
        value: `${metrics.taxaAprovacao}%`,
        sublabel: 'Procedência conclusiva',
        icon: <TrendingUp className="w-5 h-5 text-teal-600" />,
        accentColor: 'border-teal-200 hover:border-teal-400',
        activeColor: 'ring-2 ring-teal-600 bg-teal-50/50',
      },
    ];
  }, [currentRole, metrics]);

  return (
    <div
      className={`grid gap-3 ${
        cards.length === 2
          ? 'grid-cols-2'
          : cards.length === 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : 'grid-cols-2 sm:grid-cols-4'
      }`}
    >
      {cards.map((card) => {
        const isSelected = selectedStatusFilter === card.status;
        return (
          <button
            key={card.id}
            onClick={() => onSelectStatusFilter(card.status)}
            className={`text-left p-3.5 bg-white rounded-xl border transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
              isSelected ? card.activeColor : `${card.accentColor} hover:shadow-xs`
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 leading-tight">
                {card.label}
              </span>
              <div className="p-1.5 rounded-lg bg-slate-50 group-hover:scale-105 transition-transform">
                {card.icon}
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {card.value}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {card.sublabel}
            </p>
          </button>
        );
      })}
    </div>
  );
};
