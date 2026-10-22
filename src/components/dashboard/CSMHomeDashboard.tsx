import React, { useMemo } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Ticket, TicketSeverity } from '../../types/workflow';
import { ChartDonut, DonutSegment } from './ChartDonut';
import { ChartBarHorizontal, BarHorizontalItem } from './ChartBarHorizontal';
import { ChartBarVertical, BarVerticalItem } from './ChartBarVertical';
import { ChartSeverityDistribution } from './ChartSeverityDistribution';
import { StatusBadge } from '../StatusBadge';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  FileEdit,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { AppPage } from '../Sidebar';

interface CSMHomeDashboardProps {
  onSelectTicket: (ticketId: string) => void;
  onNavigateToPage: (page: AppPage) => void;
  onOpenNewTicket: () => void;
  onEditTicket: (ticket: Ticket) => void;
}

export const CSMHomeDashboard: React.FC<CSMHomeDashboardProps> = ({
  onSelectTicket,
  onNavigateToPage,
  onOpenNewTicket,
  onEditTicket,
}) => {
  const { tickets, metrics, currentUser } = useWorkflow();

  // Filter tickets that need urgent CSM action (INFORMACOES_FALTANDO)
  const contestadosTickets = useMemo(() => {
    return tickets.filter((t) => t.status === 'INFORMACOES_FALTANDO');
  }, [tickets]);



  // Donut data: Workflow status breakdown
  const statusDonutData: DonutSegment[] = useMemo(() => {
    const aguardandoTriagem = tickets.filter((t) => t.status === 'NOVO_AGUARDANDO_TRIAGEM').length;
    const contestados = tickets.filter((t) => t.status === 'INFORMACOES_FALTANDO').length;
    const aprovadosAnalista = tickets.filter((t) => t.status === 'APROVADO_ANALISTA').length;
    const reprovadosAnalista = tickets.filter(
      (t) => t.status === 'REPROVADO_ANALISTA' || t.status === 'EM_CONTESTACAO_QUALIDADE'
    ).length;
    const aprovadosQualidade = tickets.filter((t) => t.status === 'APROVADO_QUALIDADE').length;
    const reprovadosQualidade = tickets.filter((t) => t.status === 'REPROVADO_QUALIDADE').length;

    return [
      {
        label: 'Aguardando Triagem',
        value: aguardandoTriagem,
        color: '#3b82f6', // blue-500
      },
      {
        label: 'Contestados (Falta Info)',
        value: contestados,
        color: '#f59e0b', // amber-500
      },
      {
        label: 'Aprovados (Analista)',
        value: aprovadosAnalista,
        color: '#10b981', // emerald-500
      },
      {
        label: 'Reprovados (Em Parecer QA)',
        value: reprovadosAnalista,
        color: '#f97316', // orange-500
      },
      {
        label: 'Aprovados (Qualidade)',
        value: aprovadosQualidade,
        color: '#0d9488', // teal-600
      },
      {
        label: 'Reprovados (Qualidade)',
        value: reprovadosQualidade,
        color: '#ef4444', // red-500
      },
    ].filter((s) => s.value > 0);
  }, [tickets]);

  // Top clients with most errors
  const topClientsData: BarHorizontalItem[] = useMemo(() => {
    const clientMap = new Map<string, number>();
    tickets.forEach((t) => {
      const client = t.clientName?.trim() || 'Não especificado';
      clientMap.set(client, (clientMap.get(client) || 0) + 1);
    });

    const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

    return Array.from(clientMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([client, count], idx) => ({
        id: client,
        label: client,
        value: count,
        color: colors[idx % colors.length],
        onClick: () => onNavigateToPage('csm_reportados'),
      }));
  }, [tickets, onNavigateToPage]);

  // Severity counts
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

  // Category breakdown for vertical bars
  const categoryData: BarVerticalItem[] = useMemo(() => {
    const catMap = new Map<string, number>();
    tickets.forEach((t) => {
      const cat = t.category || 'Geral';
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });

    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'];
    return Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, count], idx) => ({
        id: cat,
        label: cat,
        value: count,
        color: colors[idx % colors.length],
      }));
  }, [tickets]);

  // Recent 5 tickets
  const recentTickets = useMemo(() => {
    return tickets.slice(0, 5);
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* Welcome & Context Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2
            className="tracking-tight"
            style={{
              fontSize: '25px',
              lineHeight: '30px',
              fontWeight: 'normal',
              fontFamily: 'system-ui',
              textDecorationLine: 'none',
            }}
          >
            Olá, {currentUser.name}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Acompanhe a triagem técnica, complemente chamados contestados e monitore o impacto dos erros reportados nos clientes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewTicket}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span
              style={{
                fontWeight: 'normal',
                textAlign: 'center',
              }}
            >
              Abrir Novo Chamado
            </span>
          </button>
        </div>
      </div>

      {/* Urgent Contestation Alert Banner if applicable */}
      {contestadosTickets.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                Atenção Requerida: {contestadosTickets.length} chamado(s) contestado(s) pelo Analista
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Faltam dados, evidências ou documentos para dar seguimento à triagem técnica. Complemente as informações solicitadas.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToPage('csm_contestados')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300/80 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <span>Ver Fila de Contestados</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigateToPage('csm_reportados')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Total Reportados</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-slate-900 tabular-nums"
            style={{
              fontWeight: 'normal',
              fontSize: '28px',
              textAlign: 'left',
            }}
          >
            {metrics.total}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Histórico completo
          </p>
        </div>

        <div
          onClick={() => onNavigateToPage('csm_contestados')}
          className={`p-4 bg-white rounded-xl border shadow-2xs hover:shadow-xs transition-all cursor-pointer group ${
            metrics.informacoesFaltando > 0
              ? 'border-amber-300 ring-1 ring-amber-200/70 bg-amber-50/20'
              : 'border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-amber-800">Contestados</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-amber-900 tabular-nums"
            style={{
              fontWeight: 'normal',
              fontSize: '28px',
            }}
          >
            {metrics.informacoesFaltando}
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1 truncate">
            Aguardando resposta do CSM
          </p>
        </div>

        <div
          onClick={() => onNavigateToPage('csm_reportados')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Em Triagem</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-slate-900 tabular-nums"
            style={{
              fontWeight: 'normal',
              fontSize: '28px',
            }}
          >
            {metrics.novoAguardandoTriagem}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Com o Analista/Supervisor
          </p>
        </div>

        <div
          onClick={() => onNavigateToPage('csm_avaliados')}
          className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-emerald-800">Concluídos</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-emerald-900 tabular-nums"
            style={{
              fontWeight: 'normal',
              fontSize: '28px',
            }}
          >
            {metrics.finalizadosTotal}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1 truncate">
            {metrics.aprovadosTotal} aprov. / {metrics.reprovadosQualidade} repr.
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Donut Status */}
        <ChartDonut
          title="Status do Fluxo de Atendimento"
          subtitle="Proporção dos chamados em cada etapa do workflow"
          data={statusDonutData}
          totalLabel="Chamados"
          size={190}
          donutThickness={28}
        />

        {/* Chart 2: Top Clientes com Mais Erros */}
        <ChartBarHorizontal
          title="Top Clientes com Erros Reportados"
          subtitle="Empresas com maior recorrência de chamados reportados"
          items={topClientsData}
          emptyText="Nenhum cliente com erro reportado no momento"
          maxBars={5}
        />
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Severity Breakdown */}
        <ChartSeverityDistribution
          counts={severityCounts}
          total={metrics.total}
          title="Criticidade dos Erros Reportados"
          subtitle="Classificação do impacto operacional para os clientes"
        />

        {/* Chart 4: Categories */}
        <ChartBarVertical
          title="Módulos & Categorias Mais Impactadas"
          subtitle="Áreas do sistema com maior volume de relatos"
          items={categoryData}
          emptyText="Nenhuma categoria registrada"
          height={160}
        />
      </div>

      {/* Operational Section: Urgent Contested Tickets to Answer */}
      {contestadosTickets.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-amber-900 tracking-tight flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Chamados Contestados Aguardando Sua Correção</span>
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                O Analista solicitou mais detalhes. Você pode editar todos os campos do chamado e reenviar.
              </p>
            </div>
            <button
              onClick={() => onNavigateToPage('csm_contestados')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {contestadosTickets.slice(0, 3).map((ticket) => (
              <div
                key={ticket.id}
                className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-900">{ticket.code}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {ticket.clientName}
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-[11px] text-slate-500">
                      Célula: {ticket.analystCell || 'N/A'}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {ticket.title}
                  </h4>
                  {ticket.missingInfoRequest?.question && (
                    <p className="text-xs text-amber-800 font-medium mt-1 bg-amber-100/70 p-2 rounded-md">
                      <strong>Solicitação do Analista:</strong> {ticket.missingInfoRequest.question}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectTicket(ticket.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => onEditTicket(ticket)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Editar & Reenviar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Chamados Reportados Recentemente
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Últimos chamados cadastrados no sistema
            </p>
          </div>
          <button
            onClick={() => onNavigateToPage('csm_reportados')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver listagem completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTickets.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Nenhum chamado registrado no momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Código</th>
                  <th className="py-2.5 px-3 font-semibold">Cliente</th>
                  <th className="py-2.5 px-3 font-semibold">Título / Motivo DC</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {t.code}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {t.clientName}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-600">
                      {t.title}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge status={t.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectTicket(t.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                      >
                        Visualizar
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
