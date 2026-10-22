import React, { useMemo } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Ticket, TicketSeverity } from '../../types/workflow';
import { ChartDonut, DonutSegment } from './ChartDonut';
import { ChartBarHorizontal, BarHorizontalItem } from './ChartBarHorizontal';
import { ChartBarVertical, BarVerticalItem } from './ChartBarVertical';
import { ChartSeverityDistribution } from './ChartSeverityDistribution';
import { StatusBadge } from '../StatusBadge';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  ArrowRight,
  ClipboardCheck,
  Gavel,
  Users,
} from 'lucide-react';
import { AppPage } from '../Sidebar';

interface QualidadeHomeDashboardProps {
  onSelectTicket: (ticketId: string) => void;
  onNavigateToPage: (page: AppPage) => void;
}

export const QualidadeHomeDashboard: React.FC<QualidadeHomeDashboardProps> = ({
  onSelectTicket,
  onNavigateToPage,
}) => {
  const { tickets, metrics, currentUser } = useWorkflow();

  // Tickets awaiting Quality final verdict (REPROVADO_ANALISTA or EM_CONTESTACAO_QUALIDADE)
  const ticketsAguardandoVeredito = useMemo(() => {
    return tickets.filter(
      (t) => t.status === 'REPROVADO_ANALISTA' || t.status === 'EM_CONTESTACAO_QUALIDADE'
    );
  }, [tickets]);

  // Tickets audited and finalized by Quality
  const ticketsFinalizadosQualidade = useMemo(() => {
    return tickets.filter(
      (t) => t.status === 'APROVADO_QUALIDADE' || t.status === 'REPROVADO_QUALIDADE'
    );
  }, [tickets]);

  // Impacted employees in quality cases
  const totalEmployeesInQuality = useMemo(() => {
    const list = tickets.filter(
      (t) =>
        t.status === 'REPROVADO_ANALISTA' ||
        t.status === 'EM_CONTESTACAO_QUALIDADE' ||
        t.status === 'APROVADO_QUALIDADE' ||
        t.status === 'REPROVADO_QUALIDADE'
    );
    return list.reduce((acc, curr) => acc + (Number(curr.impactedEmployeesCount) || 0), 0);
  }, [tickets]);

  // Donut: Quality Verdicts breakdown
  const qualityDonutData: DonutSegment[] = useMemo(() => {
    const pendentes = ticketsAguardandoVeredito.length;
    const aprovadosQA = metrics.aprovadosQualidade;
    const reprovadosQA = metrics.reprovadosQualidade;

    return [
      {
        label: 'Aprovados pela Qualidade (Procedente)',
        value: aprovadosQA,
        color: '#0d9488', // teal-600
      },
      {
        label: 'Reprovados Definitivo (Improcedente)',
        value: reprovadosQA,
        color: '#e11d48', // rose-600
      },
      {
        label: 'Aguardando Veredito Final',
        value: pendentes,
        color: '#f97316', // orange-500
      },
    ].filter((s) => s.value > 0);
  }, [ticketsAguardandoVeredito, metrics]);

  // Comparative resolution vertical bars
  const resolutionData: BarVerticalItem[] = useMemo(() => {
    return [
      {
        id: 'analista_direto',
        label: 'Aprovado Analista',
        sublabel: 'Direto (Sem QA)',
        value: metrics.aprovadosAnalista,
        color: '#10b981', // emerald-500
      },
      {
        id: 'qualidade_aprovado',
        label: 'Aprovado Qualidade',
        sublabel: 'Procedente QA',
        value: metrics.aprovadosQualidade,
        color: '#0d9488', // teal-600
      },
      {
        id: 'qualidade_reprovado',
        label: 'Reprovado Qualidade',
        sublabel: 'Improcedente QA',
        value: metrics.reprovadosQualidade,
        color: '#e11d48', // rose-600
      },
      {
        id: 'pendente_qa',
        label: 'Pendente Parecer',
        sublabel: 'Na Mesa do QA',
        value: ticketsAguardandoVeredito.length,
        color: '#f97316', // orange-500
      },
    ];
  }, [metrics, ticketsAguardandoVeredito]);

  // Motivos DC of tickets that arrived at Quality
  const rootCausesData: BarHorizontalItem[] = useMemo(() => {
    const map = new Map<string, number>();
    const relevant = tickets.filter(
      (t) =>
        t.status === 'REPROVADO_ANALISTA' ||
        t.status === 'EM_CONTESTACAO_QUALIDADE' ||
        t.status === 'APROVADO_QUALIDADE' ||
        t.status === 'REPROVADO_QUALIDADE'
    );

    relevant.forEach((t) => {
      const reason = t.errorReasonDC?.trim() || 'Motivo não informado';
      map.set(reason, (map.get(reason) || 0) + 1);
    });

    const colors = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'];

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count], idx) => ({
        id: reason,
        label: reason,
        value: count,
        color: colors[idx % colors.length],
      }));
  }, [tickets]);

  // Severity counts among Quality-scope tickets
  const qualitySeverityCounts: Record<TicketSeverity, number> = useMemo(() => {
    const counts: Record<TicketSeverity, number> = {
      CRITICA: 0,
      ALTA: 0,
      MEDIA: 0,
      BAIXA: 0,
    };
    const relevant = tickets.filter(
      (t) =>
        t.status === 'REPROVADO_ANALISTA' ||
        t.status === 'EM_CONTESTACAO_QUALIDADE' ||
        t.status === 'APROVADO_QUALIDADE' ||
        t.status === 'REPROVADO_QUALIDADE'
    );
    relevant.forEach((t) => {
      if (counts[t.severity] !== undefined) {
        counts[t.severity] += 1;
      }
    });
    return counts;
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* Welcome & Context Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Olá, {currentUser.name}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Realize auditorias técnicas nos chamados reprovados pelo Analista, emita laudos conclusivos e acompanhe a conformidade dos processos.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateToPage('qualidade_reprovados')}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Gavel className="w-4 h-4" />
            <span>Fila para Veredito ({ticketsAguardandoVeredito.length})</span>
          </button>
        </div>
      </div>

      {/* Urgent Verdict Alert */}
      {ticketsAguardandoVeredito.length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200/90 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-orange-900">
                Pendente de Veredito: {ticketsAguardandoVeredito.length} chamado(s) reprovado(s) pelo Analista
              </h4>
              <p className="text-xs text-orange-700 mt-0.5">
                A Qualidade é a instância final de homologação. Emita laudo técnico aprovando a improcedência ou julgando procedente o erro.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToPage('qualidade_reprovados')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-orange-900 bg-orange-200/80 hover:bg-orange-300/80 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <span>Auditar Casos Pendentes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigateToPage('qualidade_reprovados')}
          className={`p-4 bg-white rounded-xl border shadow-2xs hover:shadow-xs transition-all cursor-pointer group ${
            ticketsAguardandoVeredito.length > 0
              ? 'border-orange-300 ring-1 ring-orange-200/70 bg-orange-50/20'
              : 'border-slate-200/80 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-orange-900">Aguardando Veredito</span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-900 tabular-nums">
            {ticketsAguardandoVeredito.length}
          </div>
          <p className="text-[11px] text-orange-700 font-medium mt-1 truncate">
            Para decisão final da QA
          </p>
        </div>

        <div
          onClick={() => onNavigateToPage('qualidade_finalizados')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-teal-800">Aprovados (QA)</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-900 tabular-nums">
            {metrics.aprovadosQualidade}
          </div>
          <p className="text-[11px] text-teal-700 font-medium mt-1 truncate">
            Homologados procedentes
          </p>
        </div>

        <div
          onClick={() => onNavigateToPage('qualidade_finalizados')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-rose-800">Reprovados (QA)</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-900 tabular-nums">
            {metrics.reprovadosQualidade}
          </div>
          <p className="text-[11px] text-rose-700 font-medium mt-1 truncate">
            Reprovação confirmada
          </p>
        </div>

        <div
          onClick={() => onNavigateToPage('qualidade_aprovados')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-emerald-800">Aprovados Direto</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900 tabular-nums">
            {metrics.aprovadosAnalista}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1 truncate">
            Validados pelo Analista
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Taxa de Procedência</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-900 tabular-nums">
            {metrics.taxaAprovacao}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Índice de conformidade
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Impacto Auditado</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900 tabular-nums">
            {totalEmployeesInQuality}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Colaboradores auditados
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Quality Verdicts Donut */}
        <ChartDonut
          title="Desfecho dos Casos sob Tutela da Qualidade"
          subtitle="Taxa de homologações procedentes vs confirmações de reprovação"
          data={qualityDonutData}
          totalLabel="Em Auditoria"
          size={190}
          donutThickness={28}
        />

        {/* Chart 2: Resolution Flow Comparison */}
        <ChartBarVertical
          title="Comparativo do Fluxo de Conclusão de Chamados"
          subtitle="Aprovações diretas pelo analista vs decisões finais da qualidade"
          items={resolutionData}
          emptyText="Nenhum dado de resolução no momento"
          height={160}
        />
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Motivo DC dos Casos Reprovados */}
        <ChartBarHorizontal
          title="Motivo DC dos Casos Reprovados pelo Analista"
          subtitle="Causas que estão gerando reprovação técnica e necessitando veredito"
          items={rootCausesData}
          emptyText="Nenhum caso de reprovação para análise de causas"
          maxBars={5}
        />

        {/* Chart 4: Severity of Audited Tickets */}
        <ChartSeverityDistribution
          counts={qualitySeverityCounts}
          total={
            qualitySeverityCounts.CRITICA +
            qualitySeverityCounts.ALTA +
            qualitySeverityCounts.MEDIA +
            qualitySeverityCounts.BAIXA
          }
          title="Criticidade dos Casos Auditados"
          subtitle="Severidade dos erros submetidos à homologação da Qualidade"
        />
      </div>

      {/* Quality Verdict Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Gavel className="w-4 h-4 text-orange-600" />
              <span>Fila de Homologação da Qualidade (Aguardando Parecer)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chamados que foram reprovados pelo Analista/Supervisor e requerem parecer final
            </p>
          </div>
          <button
            onClick={() => onNavigateToPage('qualidade_reprovados')}
            className="text-xs font-semibold text-orange-700 hover:text-orange-900 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver fila completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {ticketsAguardandoVeredito.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            🎉 Todos os chamados contestados/reprovados já tiveram parecer emitido pela Qualidade!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Código</th>
                  <th className="py-2.5 px-3 font-semibold">Cliente</th>
                  <th className="py-2.5 px-3 font-semibold">Motivo DC / Parecer Analista</th>
                  <th className="py-2.5 px-3 font-semibold">Severidade</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ticketsAguardandoVeredito.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {t.code}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {t.clientName}
                    </td>
                    <td className="py-2.5 px-3 max-w-sm truncate text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {t.errorReasonDC || t.title}
                      </span>
                      {t.analystReview?.notes && (
                        <span className="text-slate-500 block text-[11px] truncate mt-0.5">
                          Nota do Analista: {t.analystReview.notes}
                        </span>
                      )}
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
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-2xs transition-colors cursor-pointer ml-auto"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        <span>Emitir Laudo</span>
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
