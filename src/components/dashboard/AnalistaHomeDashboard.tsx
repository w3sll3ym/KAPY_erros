import React, { useMemo } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Ticket, TicketSeverity } from '../../types/workflow';
import { ChartDonut, DonutSegment } from './ChartDonut';
import { ChartBarHorizontal, BarHorizontalItem } from './ChartBarHorizontal';
import { ChartBarVertical, BarVerticalItem } from './ChartBarVertical';
import { ChartSeverityDistribution } from './ChartSeverityDistribution';
import { StatusBadge } from '../StatusBadge';
import {
  Inbox,
  Clock,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  CheckSquare,
} from 'lucide-react';
import { AppPage } from '../Sidebar';

interface AnalistaHomeDashboardProps {
  onSelectTicket: (ticketId: string) => void;
  onNavigateToPage: (page: AppPage) => void;
}

export const AnalistaHomeDashboard: React.FC<AnalistaHomeDashboardProps> = ({
  onSelectTicket,
  onNavigateToPage,
}) => {
  const { tickets, metrics, currentUser } = useWorkflow();

  // Tickets awaiting technical triage
  const ticketsAguardandoTriagem = useMemo(() => {
    return tickets
      .filter((t) => t.status === 'NOVO_AGUARDANDO_TRIAGEM')
      .sort((a, b) => {
        const severityWeight: Record<TicketSeverity, number> = {
          CRITICA: 4,
          ALTA: 3,
          MEDIA: 2,
          BAIXA: 1,
        };
        return (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
      });
  }, [tickets]);

  // Tickets contested waiting for CSM
  const ticketsContestados = useMemo(() => {
    return tickets.filter((t) => t.status === 'INFORMACOES_FALTANDO');
  }, [tickets]);

  // Direct resolution rate: (Aprovados Analista) / (Total triados com decisão)
  const directResolutionRate = useMemo(() => {
    const totalDecididos =
      metrics.aprovadosAnalista + metrics.reprovadosAnalista + metrics.aprovadosQualidade + metrics.reprovadosQualidade;
    if (totalDecididos === 0) return 0;
    return Math.round((metrics.aprovadosAnalista / totalDecididos) * 100);
  }, [metrics]);

  // Average impacted employees
  const avgEmployeesPerTicket = useMemo(() => {
    if (tickets.length === 0) return 0;
    const totalEmp = tickets.reduce(
      (acc, curr) => acc + (Number(curr.impactedEmployeesCount) || 0),
      0
    );
    return Math.round(totalEmp / tickets.length);
  }, [tickets]);

  // Donut: Triage decisions distribution
  const triageDonutData: DonutSegment[] = useMemo(() => {
    const aguardando = tickets.filter((t) => t.status === 'NOVO_AGUARDANDO_TRIAGEM').length;
    const contestados = tickets.filter((t) => t.status === 'INFORMACOES_FALTANDO').length;
    const aprovadosDireto = tickets.filter((t) => t.status === 'APROVADO_ANALISTA').length;
    const reprovadosQualidade = tickets.filter(
      (t) =>
        t.status === 'REPROVADO_ANALISTA' ||
        t.status === 'EM_CONTESTACAO_QUALIDADE' ||
        t.status === 'APROVADO_QUALIDADE' ||
        t.status === 'REPROVADO_QUALIDADE'
    ).length;

    return [
      {
        label: 'Aprovados Diretamente',
        value: aprovadosDireto,
        color: '#10b981', // emerald-500
      },
      {
        label: 'Contestados (Falta Info CSM)',
        value: contestados,
        color: '#f59e0b', // amber-500
      },
      {
        label: 'Reprovados (Parecer QA)',
        value: reprovadosQualidade,
        color: '#f97316', // orange-500
      },
      {
        label: 'Aguardando Triagem',
        value: aguardando,
        color: '#3b82f6', // blue-500
      },
    ].filter((s) => s.value > 0);
  }, [tickets]);

  // Most frequent Error Reasons DC (Motivo do Erro - DC)
  const errorReasonData: BarHorizontalItem[] = useMemo(() => {
    const reasonMap = new Map<string, number>();
    tickets.forEach((t) => {
      const reason = t.errorReasonDC?.trim() || 'Motivo não classificado';
      reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
    });

    const colors = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

    return Array.from(reasonMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count], idx) => ({
        id: reason,
        label: reason,
        value: count,
        color: colors[idx % colors.length],
      }));
  }, [tickets]);

  // Breakdown by Analyst Cell (Célula do Analista)
  const cellData: BarHorizontalItem[] = useMemo(() => {
    const cellMap = new Map<string, number>();
    tickets.forEach((t) => {
      const cell = t.analystCell?.trim() || 'Sem Célula Definida';
      cellMap.set(cell, (cellMap.get(cell) || 0) + 1);
    });

    const colors = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];

    return Array.from(cellMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cell, count], idx) => ({
        id: cell,
        label: cell,
        value: count,
        color: colors[idx % colors.length],
      }));
  }, [tickets]);

  // Severity counts across all tickets
  const severityCounts: Record<TicketSeverity, number> = useMemo(() => {
    const counts: Record<TicketSeverity, number> = {
      CRITICA: 0,
      ALTA: 0,
      MEDIA: 0,
      BAIXA: 0,
    };
    tickets.forEach((t) => {
      if (counts[t.severity] !== undefined) {
        counts[t.severity] += 1;
      }
    });
    return counts;
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* Welcome & Context Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Olá, {currentUser.name}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Gerencie a fila de triagem técnica, avalie motivos de erro DC, conteste chamados incompletos e conclua análises com rigor operacional.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateToPage('analista_reportados')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Inbox className="w-4 h-4" />
            <span>Fila de Triagem ({metrics.novoAguardandoTriagem})</span>
          </button>
        </div>
      </div>

      {/* Urgent Backlog Alert */}
      {metrics.novoAguardandoTriagem > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200/90 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-blue-900">
                Fila de Triagem Ativa: {metrics.novoAguardandoTriagem} chamado(s) aguardando sua análise
              </h4>
              <p className="text-xs text-blue-700 mt-0.5">
                Revise os dados, verifique documentos e defina o parecer: aprovar, contestar por dados faltantes ou reprovar enviando à Qualidade.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToPage('analista_reportados')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-200/80 hover:bg-blue-300/80 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <span>Iniciar Triagem</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigateToPage('analista_reportados')}
          className={`p-4 bg-white rounded-xl border shadow-2xs hover:shadow-xs transition-all cursor-pointer group ${
            metrics.novoAguardandoTriagem > 0
              ? 'border-blue-300 ring-1 ring-blue-200/70 bg-blue-50/20'
              : 'border-slate-200/80 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-blue-900">Aguardando Triagem</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900 tabular-nums">
            {metrics.novoAguardandoTriagem}
          </div>
          <p className="text-[11px] text-blue-700 font-medium mt-1 truncate">
            Novos chamados abertos
          </p>
        </div>

        <div
          onClick={() => onNavigateToPage('analista_reportados')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-amber-800">Contestados (CSM)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 tabular-nums">
            {metrics.informacoesFaltando}
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1 truncate">
            Aguardando resposta do CSM
          </p>
        </div>

        <div
          onClick={() => onNavigateToPage('analista_finalizados')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-emerald-800">Aprovados Direto</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900 tabular-nums">
            {metrics.aprovadosAnalista}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1 truncate">
            Concluídos sem escala
          </p>
        </div>

        <div
          onClick={() => onNavigateToPage('analista_finalizados')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-orange-800">Reprovados / QA</span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-900 tabular-nums">
            {metrics.reprovadosAnalista}
          </div>
          <p className="text-[11px] text-orange-700 font-medium mt-1 truncate">
            Para veredito da Qualidade
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Resolução Direta</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-900 tabular-nums">
            {directResolutionRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Eficácia do Analista
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Média Impacto</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900 tabular-nums">
            {avgEmployeesPerTicket}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Colaboradores / chamado
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Triage Decisions Donut */}
        <ChartDonut
          title="Distribuição das Decisões de Triagem"
          subtitle="Proporção de resoluções diretas, contestações e encaminhamentos à Qualidade"
          data={triageDonutData}
          totalLabel="Decisões"
          size={190}
          donutThickness={28}
        />

        {/* Chart 2: Error Reasons DC (Crucial for Analyst diagnosis) */}
        <ChartBarHorizontal
          title="Motivos de Erro - DC Mais Incidentes"
          subtitle="Principais justificativas e falhas apontadas nos documentos"
          items={errorReasonData}
          emptyText="Nenhum motivo DC registrado"
          maxBars={5}
        />
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Volume by Analyst Cell */}
        <ChartBarHorizontal
          title="Volume por Célula do Analista"
          subtitle="Distribuição operacional de chamados entre as células técnicas"
          items={cellData}
          emptyText="Nenhuma célula cadastrada"
          maxBars={5}
        />

        {/* Chart 4: Severity Breakdown */}
        <ChartSeverityDistribution
          counts={severityCounts}
          total={metrics.total}
          title="Severidade Geral dos Casos"
          subtitle="Classificação do impacto técnico para triagem"
        />
      </div>

      {/* Priority Triage Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Fila Prioritária de Triagem (Aguardando Seu Parecer)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chamados novos ordenados por criticidade de impacto para análise técnica
            </p>
          </div>
          <button
            onClick={() => onNavigateToPage('analista_reportados')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver fila aberta completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {ticketsAguardandoTriagem.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            🎉 Parabéns! Nenhum chamado pendente de triagem no momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Código</th>
                  <th className="py-2.5 px-3 font-semibold">Cliente</th>
                  <th className="py-2.5 px-3 font-semibold">Célula / Motivo DC</th>
                  <th className="py-2.5 px-3 font-semibold">Severidade</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ticketsAguardandoTriagem.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {t.code}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {t.clientName}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-600">
                      <span className="font-semibold text-slate-700">
                        {t.analystCell ? `[${t.analystCell}] ` : ''}
                      </span>
                      {t.errorReasonDC || t.title}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.severity === 'CRITICA'
                            ? 'bg-rose-100 text-rose-800'
                            : t.severity === 'ALTA'
                            ? 'bg-orange-100 text-orange-800'
                            : t.severity === 'MEDIA'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectTicket(t.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer ml-auto"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Triar Chamado</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
