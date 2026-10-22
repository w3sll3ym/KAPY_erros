import React from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  Shield,
  BellRing,
} from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import { AppPage } from '../Sidebar';
import { Ticket } from '../../types/workflow';

interface GestorHomeDashboardProps {
  onSelectTicket: (ticketId: string) => void;
  onNavigateToPage: (page: AppPage) => void;
}

export const GestorHomeDashboard: React.FC<GestorHomeDashboardProps> = ({
  onSelectTicket,
  onNavigateToPage,
}) => {
  const { tickets, currentUser, systemUsers, getSupervisedAnalysts } = useWorkflow();

  const supervisedAnalystsNames = getSupervisedAnalysts(currentUser.name);

  // Supervised analyst user objects
  const analystUsers = systemUsers.filter(
    (u) =>
      u.role === 'ANALISTA' &&
      u.status !== 'INATIVO' &&
      (supervisedAnalystsNames.length === 0 || supervisedAnalystsNames.includes(u.name))
  );

  // Tickets under hierarchy
  const hierarchyTickets = tickets.filter((t) => {
    if (!t.analystName) return true;
    return (
      supervisedAnalystsNames.length === 0 ||
      supervisedAnalystsNames.includes(t.analystName)
    );
  });

  const pendingTriageCount = hierarchyTickets.filter(
    (t) => t.status === 'NOVO_AGUARDANDO_TRIAGEM'
  ).length;

  const contestedCount = hierarchyTickets.filter(
    (t) => t.status === 'INFORMACOES_FALTANDO'
  ).length;

  const finalizedCount = hierarchyTickets.filter(
    (t) =>
      t.status === 'APROVADO_ANALISTA' ||
      t.status === 'APROVADO_QUALIDADE' ||
      t.status === 'REPROVADO_QUALIDADE'
  ).length;

  const totalTeamTickets = hierarchyTickets.length;
  const resolutionRate =
    totalTeamTickets > 0 ? Math.round((finalizedCount / totalTeamTickets) * 100) : 0;

  // Recent activity / tickets needing attention
  const priorityTickets = hierarchyTickets
    .filter(
      (t) => t.status === 'NOVO_AGUARDANDO_TRIAGEM' || t.status === 'INFORMACOES_FALTANDO'
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome & Hierarchy Overview Banner */}
      <div className="bg-linear-to-r from-[#0b132b] via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-indigo-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hierarquia de Operações & Triagem</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Painel de Gestão · {currentUser.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Supervisão centralizada da equipe de analistas. Você recebe todas as notificações e
              atualizações operacionais dos colaboradores atrelados à sua hierarquia.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateToPage('gestor_equipe')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Fila da Equipe ({pendingTriageCount + contestedCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total da Equipe */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total sob Gestão
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalTeamTickets}</div>
          <p className="text-[11px] text-slate-500 mt-1">Chamados em todas as fases</p>
        </div>

        {/* Aguardando Triagem */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Aguardando Triagem
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-900">{pendingTriageCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Pendentes de ação dos analistas</p>
        </div>

        {/* Informações Faltando */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Contestados (CSM)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-900">{contestedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Esperando resposta do CSM</p>
        </div>

        {/* Finalizados / Resolução */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Finalizados da Equipe
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-900">{finalizedCount}</span>
            <span className="text-xs font-semibold text-emerald-600">({resolutionRate}%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Chamados concluídos com sucesso</p>
        </div>
      </div>

      {/* Supervised Analysts Team Breakdown Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Analistas sob sua Hierarquia ({analystUsers.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Status de atendimento e carga de chamados por analista supervisionado
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToPage('gestor_equipe')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Fila Completa</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-2 sm:p-4 gap-3 sm:gap-0">
          {analystUsers.map((analyst) => {
            const analystTickets = tickets.filter(
              (t) => t.analystName?.toLowerCase() === analyst.name.toLowerCase()
            );
            const pending = analystTickets.filter(
              (t) => t.status === 'NOVO_AGUARDANDO_TRIAGEM'
            ).length;
            const waitingCSM = analystTickets.filter(
              (t) => t.status === 'INFORMACOES_FALTANDO'
            ).length;
            const finalized = analystTickets.filter(
              (t) =>
                t.status === 'APROVADO_ANALISTA' ||
                t.status === 'APROVADO_QUALIDADE' ||
                t.status === 'REPROVADO_QUALIDADE'
            ).length;

            return (
              <div key={analyst.id} className="p-4 hover:bg-slate-50/80 rounded-xl transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={analyst.avatar}
                    alt={analyst.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 text-sm block truncate">
                      {analyst.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {analyst.title || 'Analista de Operações N2'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                    {analystTickets.length} ch.
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 pt-3 border-t border-slate-100">
                  <div className="bg-blue-50/60 p-2 rounded-lg">
                    <span className="block font-bold text-blue-700 text-sm">{pending}</span>
                    <span className="text-[10px] text-slate-500">Triagem</span>
                  </div>
                  <div className="bg-amber-50/60 p-2 rounded-lg">
                    <span className="block font-bold text-amber-700 text-sm">{waitingCSM}</span>
                    <span className="text-[10px] text-slate-500">CSM</span>
                  </div>
                  <div className="bg-emerald-50/60 p-2 rounded-lg">
                    <span className="block font-bold text-emerald-700 text-sm">{finalized}</span>
                    <span className="text-[10px] text-slate-500">Concluídos</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Attention Tickets List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Chamados da Equipe Requerendo Atenção
              </h3>
              <p className="text-[11px] text-slate-500">
                Novos reportes e retornos de contestação dos analistas sob supervisão
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToPage('gestor_equipe')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Todos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {priorityTickets.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-xs font-medium text-slate-700">
                Nenhum chamado pendente no momento
              </p>
              <p className="text-[11px] text-slate-400">
                A fila dos analistas sob sua hierarquia está em dia!
              </p>
            </div>
          ) : (
            priorityTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTicket(t.id)}
                className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-xs text-slate-900">{t.code}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {t.clientName}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      <span>{t.analystName || 'Analista'}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        t.status === 'NOVO_AGUARDANDO_TRIAGEM'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {t.status === 'NOVO_AGUARDANDO_TRIAGEM'
                        ? 'Aguardando Triagem'
                        : 'Contestado (Esperando CSM)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium truncate">{t.title}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
