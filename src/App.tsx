import React, { useState, useMemo } from 'react';
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext';
import { Sidebar, AppPage } from './components/Sidebar';
import { MetricsCards } from './components/MetricsCards';
import { TicketFilters } from './components/TicketFilters';
import { TicketTable } from './components/TicketTable';
import { TicketKanban } from './components/TicketKanban';
import { TicketDetailDrawer } from './components/TicketDetailDrawer';
import { NewTicketModal } from './components/NewTicketModal';
import { WorkflowGuideModal } from './components/WorkflowGuideModal';
import { ResubmitInfoModal } from './components/ActionModals';
import { Ticket, TicketStatus, TicketSeverity, UserRole } from './types/workflow';
import {
  Download,
  Menu,
  Plus,
  Clock,
  AlertCircle,
  AlertTriangle,
  Archive,
  Shield,
  CheckCircle2,
  LayoutDashboard,
  Filter,
} from 'lucide-react';

const PAGE_METADATA: Record<
  AppPage,
  {
    title: string;
    subtitle: string;
    targetStatus?: TicketStatus | TicketStatus[];
    icon: React.ReactNode;
  }
> = {
  csm_reportados: {
    title: 'Erros Reportados',
    subtitle: 'Chamados abertos pelo perfil de Relacionamento aguardando triagem técnica ou em andamento.',
    targetStatus: ['NOVO_AGUARDANDO_TRIAGEM', 'APROVADO_ANALISTA', 'REPROVADO_ANALISTA'],
    icon: <Clock className="w-5 h-5 text-blue-600" />,
  },
  csm_contestados: {
    title: 'Erros Contestados',
    subtitle: 'Chamados contestados pelo Analista/Supervisor por falta de informações para complemento de dados.',
    targetStatus: 'INFORMACOES_FALTANDO',
    icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
  },
  csm_avaliados: {
    title: 'Erros Avaliados (Analista & Qualidade)',
    subtitle: 'Acompanhe os chamados que foram aprovados ou reprovados pelo Analista e aprovados pela Qualidade.',
    targetStatus: [
      'APROVADO_ANALISTA',
      'REPROVADO_ANALISTA',
      'EM_CONTESTACAO_QUALIDADE',
      'APROVADO_QUALIDADE',
      'REPROVADO_QUALIDADE',
    ],
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
  },
  analista_reportados: {
    title: 'Erros Abertos',
    subtitle: 'Chamados abertos sob gestão do Analista: novos aguardando triagem e contestados aguardando correção do CSM.',
    targetStatus: ['NOVO_AGUARDANDO_TRIAGEM', 'INFORMACOES_FALTANDO'],
    icon: <Clock className="w-5 h-5 text-blue-600" />,
  },
  analista_finalizados: {
    title: 'Erros Finalizados',
    subtitle: 'Chamados triados e concluídos pelo Analista/Supervisor (aprovados ou reprovados com parecer da qualidade).',
    targetStatus: [
      'APROVADO_ANALISTA',
      'REPROVADO_ANALISTA',
      'EM_CONTESTACAO_QUALIDADE',
      'APROVADO_QUALIDADE',
      'REPROVADO_QUALIDADE',
    ],
    icon: <Archive className="w-5 h-5 text-emerald-600" />,
  },
  qualidade_aprovados: {
    title: 'Erros Aprovados',
    subtitle: 'Chamados aprovados pelo Analista/Supervisor aguardando análise técnica e homologação da Qualidade.',
    targetStatus: 'APROVADO_ANALISTA',
    icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
  },
  qualidade_reprovados: {
    title: 'Erros Reprovados',
    subtitle: 'Chamados reprovados pelo Analista/Supervisor para a Qualidade dar parecer final (aprovar ou reprovar).',
    targetStatus: ['REPROVADO_ANALISTA', 'EM_CONTESTACAO_QUALIDADE'],
    icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
  },
  qualidade_finalizados: {
    title: 'Erros Finalizados',
    subtitle: 'Visão consolidada de todos os erros que já tiveram parecer conclusivo finalizado.',
    targetStatus: ['APROVADO_QUALIDADE', 'REPROVADO_QUALIDADE'],
    icon: <Archive className="w-5 h-5 text-emerald-600" />,
  },
};

const MainDashboard: React.FC = () => {
  const { tickets, currentRole, setCurrentRole, loading, error } = useWorkflow();

  const getDefaultPage = (role: UserRole): AppPage => {
    if (role === 'CSM') return 'csm_reportados';
    if (role === 'ANALISTA') return 'analista_reportados';
    return 'qualidade_aprovados';
  };

  // Active page state in Sidebar
  const [currentPage, setCurrentPage] = useState<AppPage>(() => getDefaultPage(currentRole));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  // Sincroniza a página com o papel ativo (garantindo que cada perfil visualize apenas suas telas)
  // e fecha o modal de novo reporte se mudar para perfis sem permissão (ANALISTA ou QUALIDADE)
  React.useEffect(() => {
    if (currentRole === 'CSM') {
      if (
        currentPage !== 'csm_reportados' &&
        currentPage !== 'csm_contestados' &&
        currentPage !== 'csm_avaliados'
      ) {
        setCurrentPage('csm_reportados');
      }
    } else if (currentRole === 'ANALISTA') {
      if (currentPage !== 'analista_reportados' && currentPage !== 'analista_finalizados') {
        setCurrentPage('analista_reportados');
      }
    } else if (currentRole === 'QUALIDADE') {
      if (
        currentPage !== 'qualidade_aprovados' &&
        currentPage !== 'qualidade_reprovados' &&
        currentPage !== 'qualidade_finalizados'
      ) {
        setCurrentPage('qualidade_aprovados');
      }
    }

    if (currentRole !== 'CSM' && isNewTicketOpen) {
      setIsNewTicketOpen(false);
    }
  }, [currentRole, currentPage, isNewTicketOpen]);

  // View & Filter states
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');
  const [isOnlyMyActionsActive, setIsOnlyMyActionsActive] = useState(false);

  // Selected ticket derived from current ticket pool
  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    return tickets.find((t) => t.id === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

  // Unique clients list
  const clientsList = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.clientName) set.add(t.clientName);
    });
    return Array.from(set).sort();
  }, [tickets]);

  // Page filter integration: if on a dedicated page, restrict to its target status
  const pageTargetStatus = PAGE_METADATA[currentPage].targetStatus;

  // Filter application
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // 0. Strict role & page boundaries
      if (currentRole === 'ANALISTA') {
        if (currentPage === 'analista_reportados') {
          // Página "Erros Abertos": exibe exclusivamente chamados novos ou contestados aguardando correção do CSM
          if (t.status !== 'NOVO_AGUARDANDO_TRIAGEM' && t.status !== 'INFORMACOES_FALTANDO') {
            return false;
          }
        } else if (currentPage === 'analista_finalizados') {
          // Página "Erros Finalizados": NUNCA exibe chamados novos nem contestados (INFORMACOES_FALTANDO)
          if (t.status === 'NOVO_AGUARDANDO_TRIAGEM' || t.status === 'INFORMACOES_FALTANDO') {
            return false;
          }
        }
      } else if (currentRole === 'CSM') {
        if (currentPage === 'csm_reportados') {
          if (t.status !== 'NOVO_AGUARDANDO_TRIAGEM') {
            return false;
          }
        } else if (currentPage === 'csm_contestados') {
          if (t.status !== 'INFORMACOES_FALTANDO') {
            return false;
          }
        } else if (currentPage === 'csm_avaliados') {
          if (
            t.status !== 'APROVADO_ANALISTA' &&
            t.status !== 'REPROVADO_ANALISTA' &&
            t.status !== 'EM_CONTESTACAO_QUALIDADE' &&
            t.status !== 'APROVADO_QUALIDADE' &&
            t.status !== 'REPROVADO_QUALIDADE'
          ) {
            return false;
          }
        }
      } else if (currentRole === 'QUALIDADE') {
        if (currentPage === 'qualidade_aprovados') {
          if (t.status !== 'APROVADO_ANALISTA') return false;
        } else if (currentPage === 'qualidade_reprovados') {
          if (t.status !== 'REPROVADO_ANALISTA' && t.status !== 'EM_CONTESTACAO_QUALIDADE') return false;
        } else if (currentPage === 'qualidade_finalizados') {
          if (t.status !== 'APROVADO_QUALIDADE' && t.status !== 'REPROVADO_QUALIDADE') return false;
        }
      }

      // Dedicated Page constraints (applied when no direct status filter card is selected)
      if (pageTargetStatus && statusFilter === 'ALL') {
        if (Array.isArray(pageTargetStatus)) {
          if (!pageTargetStatus.includes(t.status)) return false;
        } else {
          if (t.status !== pageTargetStatus) return false;
        }
      }

      // 1. Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesCode = t.code?.toLowerCase().includes(query);
        const matchesTitle = t.title?.toLowerCase().includes(query);
        const matchesClient = t.clientName?.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        const matchesCategory = t.category?.toLowerCase().includes(query);
        if (!matchesCode && !matchesTitle && !matchesClient && !matchesDesc && !matchesCategory) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'REPROVADO_ANALISTA') {
          if (t.status !== 'REPROVADO_ANALISTA' && t.status !== 'EM_CONTESTACAO_QUALIDADE') {
            return false;
          }
        } else if (statusFilter === 'APROVADO_QUALIDADE' && currentPage === 'analista_finalizados') {
          if (t.status !== 'APROVADO_QUALIDADE' && t.status !== 'APROVADO_ANALISTA') {
            return false;
          }
        } else if (t.status !== statusFilter) {
          return false;
        }
      }

      // 3. Client filter
      if (clientFilter !== 'ALL' && t.clientName !== clientFilter) {
        return false;
      }

      // 4. My actions only
      if (isOnlyMyActionsActive) {
        if (currentRole === 'CSM' && t.status !== 'INFORMACOES_FALTANDO') {
          return false;
        }
        if (currentRole === 'ANALISTA' && t.status !== 'NOVO_AGUARDANDO_TRIAGEM') {
          return false;
        }
        if (
          currentRole === 'QUALIDADE' &&
          t.status !== 'APROVADO_ANALISTA' &&
          t.status !== 'REPROVADO_ANALISTA' &&
          t.status !== 'EM_CONTESTACAO_QUALIDADE'
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    tickets,
    currentPage,
    pageTargetStatus,
    searchTerm,
    statusFilter,
    clientFilter,
    isOnlyMyActionsActive,
    currentRole,
  ]);

  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'ALL' ||
    clientFilter !== 'ALL' ||
    isOnlyMyActionsActive;

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setClientFilter('ALL');
    setIsOnlyMyActionsActive(false);
  };

  const handleSelectStatusFromMetric = (status: TicketStatus | 'ALL') => {
    if (currentRole === 'ANALISTA') {
      if (status === 'INFORMACOES_FALTANDO' || status === 'NOVO_AGUARDANDO_TRIAGEM') {
        setCurrentPage('analista_reportados');
      } else if (
        status === 'APROVADO_QUALIDADE' ||
        status === 'APROVADO_ANALISTA' ||
        status === 'REPROVADO_ANALISTA'
      ) {
        setCurrentPage('analista_finalizados');
      }
    } else if (currentRole === 'CSM') {
      if (status === 'NOVO_AGUARDANDO_TRIAGEM') {
        setCurrentPage('csm_reportados');
      } else if (status === 'INFORMACOES_FALTANDO') {
        setCurrentPage('csm_contestados');
      } else if (status !== 'ALL') {
        setCurrentPage('csm_avaliados');
      }
    }
    if (statusFilter === status) {
      setStatusFilter('ALL');
    } else {
      setStatusFilter(status);
    }
  };

  const handleToggleMyActions = () => {
    setIsOnlyMyActionsActive((prev) => !prev);
  };

  // Export report as CSV
  const handleExportCSV = () => {
    if (filteredTickets.length === 0) return;
    const headers = [
      'Código',
      'Título',
      'Cliente',
      'Segmento',
      'Categoria',
      'Severidade',
      'Status',
      'Aberto Em',
      'Atualizado Em',
    ];
    const rows = filteredTickets.map((t) => [
      `"${t.code || ''}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.clientName || '').replace(/"/g, '""')}"`,
      `"${t.clientSegment || ''}"`,
      `"${t.category || ''}"`,
      `"${t.severity || ''}"`,
      `"${t.status || ''}"`,
      `"${t.createdAt || ''}"`,
      `"${t.updatedAt || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_${currentPage}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeMeta = PAGE_METADATA[currentPage];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex">
      {/* Sidebar Component replacing the entire Header */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={(page) => {
          setCurrentPage(page);
          setStatusFilter('ALL');
        }}
        onOpenNewTicket={() => setIsNewTicketOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (Offset for desktop sidebar w-72) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Mobile-only Top Bar with Hamburger */}
        <div className="lg:hidden flex items-center justify-between p-3.5 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
            <span>{activeMeta.title}</span>
          </div>
          {currentRole === 'CSM' && (
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="p-2 bg-blue-600 text-white rounded-lg shadow-xs cursor-pointer"
              title="Novo Reporte"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Page Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 p-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-xl shadow-2xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold">Aviso de Sincronização: </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Top Page Header (No header above this) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {activeMeta.title}
              </h1>
            </div>

            {/* Quick Actions on Page Header */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleExportCSV}
                disabled={filteredTickets.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Exportar CSV</span>
              </button>

              {currentRole === 'CSM' && (
                <button
                  onClick={() => setIsNewTicketOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Reporte</span>
                </button>
              )}
            </div>
          </div>

          {/* KPI Metrics Cards (Visible across pages to give instant context) */}
          <MetricsCards
            selectedStatusFilter={statusFilter}
            onSelectStatusFilter={handleSelectStatusFromMetric}
          />

          {/* Dedicated Status Filter Card for CSM Avaliados */}
          {currentPage === 'csm_avaliados' && currentRole === 'CSM' && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Situação dos Chamados Avaliados (Analista & Qualidade)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Acompanhe os chamados aprovados ou reprovados pelo Analista e aprovados pela Qualidade:
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {statusFilter !== 'ALL' && (
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold px-2 py-0.5 rounded bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
                    >
                      Mostrar Todos os Avaliados
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Aprovados pelo Analista */}
                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'APROVADO_ANALISTA' ? 'ALL' : 'APROVADO_ANALISTA')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    statusFilter === 'APROVADO_ANALISTA'
                      ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-blue-50/30 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      Aprovados pelo Analista
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {tickets.filter((t) => t.status === 'APROVADO_ANALISTA').length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Erros aprovados na triagem técnica do Analista que aguardam deliberação da Qualidade.
                  </p>
                </button>

                {/* 2. Reprovados pelo Analista */}
                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'REPROVADO_ANALISTA' ? 'ALL' : 'REPROVADO_ANALISTA')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    statusFilter === 'REPROVADO_ANALISTA'
                      ? 'bg-orange-50/90 border-orange-400 ring-2 ring-orange-500/20 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-orange-50/30 hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-900">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      Reprovados pelo Analista
                    </span>
                    <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                      {tickets.filter((t) => t.status === 'REPROVADO_ANALISTA' || t.status === 'EM_CONTESTACAO_QUALIDADE').length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Erros reprovados na triagem técnica aguardando parecer final da Qualidade.
                  </p>
                </button>

                {/* 3. Aprovados pela Qualidade */}
                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'APROVADO_QUALIDADE' ? 'ALL' : 'APROVADO_QUALIDADE')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    statusFilter === 'APROVADO_QUALIDADE'
                      ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-emerald-50/30 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      Aprovados pela Qualidade
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {tickets.filter((t) => t.status === 'APROVADO_QUALIDADE').length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Erros com validação e parecer definitivo de aprovação emitido pela Qualidade.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Dedicated Status Filter Card for Analista Finalizados */}
          {currentPage === 'analista_finalizados' && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Archive className="w-4 h-4 text-emerald-600" />
                    Status dos Erros Finalizados / Tratados pelo Analista
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Acompanhe a situação de cada erro após a triagem técnica. Clique nos blocos para filtrar:
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {statusFilter !== 'ALL' && (
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold px-2 py-0.5 rounded bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
                    >
                      Mostrar Todos os Finalizados
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Aprovado pelo analista */}
                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'APROVADO_ANALISTA' ? 'ALL' : 'APROVADO_ANALISTA')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    statusFilter === 'APROVADO_ANALISTA'
                      ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-blue-50/30 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      Aprovados pelo Analista
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {tickets.filter((t) => t.status === 'APROVADO_ANALISTA' || t.status === 'APROVADO_QUALIDADE').length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Erros validados e aprovados tecnicamente pelo Analista encaminhados ou homologados pela Qualidade.
                  </p>
                </button>

                {/* 2. Reprovado pelo analista e esperando parecer da qualidade */}
                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'REPROVADO_ANALISTA' ? 'ALL' : 'REPROVADO_ANALISTA')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    statusFilter === 'REPROVADO_ANALISTA'
                      ? 'bg-orange-50/90 border-orange-400 ring-2 ring-orange-500/20 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-orange-50/30 hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-900">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      Reprovados pelo Analista / Aguardando Parecer
                    </span>
                    <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                      {tickets.filter((t) => t.status === 'REPROVADO_ANALISTA' || t.status === 'EM_CONTESTACAO_QUALIDADE' || t.status === 'REPROVADO_QUALIDADE').length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Reprovados na triagem técnica aguardando ou já tendo recebido parecer conclusivo da Qualidade.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Filters & Search Bar */}
          <TicketFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            clientFilter={clientFilter}
            onClientFilterChange={setClientFilter}
            clientsList={clientsList}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isOnlyMyActionsActive={isOnlyMyActionsActive}
            onToggleOnlyMyActions={handleToggleMyActions}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Results Summary Subheader */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-2">
              <span>
                Exibindo <strong>{filteredTickets.length}</strong> de{' '}
                <strong>{tickets.length}</strong> chamados
              </span>
              {hasActiveFilters && (
                <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Filtros ativos
                </span>
              )}
            </div>
          </div>

          {/* View: Table or Kanban */}
          {viewMode === 'table' ? (
            <TicketTable
              tickets={filteredTickets}
              onSelectTicket={(t) => setSelectedTicketId(t.id)}
              onOpenNewTicket={currentRole === 'CSM' ? () => setIsNewTicketOpen(true) : undefined}
              onEditTicket={(t) => setEditingTicket(t)}
            />
          ) : (
            <TicketKanban
              tickets={filteredTickets}
              onSelectTicket={(t) => setSelectedTicketId(t.id)}
              onEditTicket={(t) => setEditingTicket(t)}
            />
          )}
        </main>
      </div>

      {/* Ticket Details Drawer */}
      <TicketDetailDrawer
        ticket={selectedTicket}
        onClose={() => setSelectedTicketId(null)}
      />

      {/* Direct Edit / Resubmit Ticket Modal (CSM) */}
      {editingTicket && (
        <ResubmitInfoModal
          isOpen={true}
          ticket={editingTicket}
          onClose={() => setEditingTicket(null)}
          onSuccess={() => setEditingTicket(null)}
        />
      )}

      {/* New Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onTicketCreated={(id) => setSelectedTicketId(id)}
      />

      {/* Workflow Guide Modal */}
      <WorkflowGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onSwitchRole={(role) => setCurrentRole(role)}
      />
    </div>
  );
};

export default function App() {
  return (
    <WorkflowProvider>
      <MainDashboard />
    </WorkflowProvider>
  );
}
