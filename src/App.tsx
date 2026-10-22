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
import { NotificationBell } from './components/NotificationBell';
import { LoginScreen } from './components/LoginScreen';
import { Ticket, TicketStatus, TicketSeverity, UserRole } from './types/workflow';
import {
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
  PanelLeftOpen,
  LogOut,
  FileSpreadsheet,
  Users,
  Building2,
  Tags,
  ClipboardList,
  SlidersHorizontal,
  Settings,
} from 'lucide-react';

import { RoleHomeDashboard } from './components/dashboard/RoleHomeDashboard';
import { ExportReportsPage } from './components/ExportReportsPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminManagementPage, ManagementTab } from './components/admin/AdminManagementPage';

const PAGE_METADATA: Record<
  AppPage,
  {
    title: string;
    subtitle: string;
    targetStatus?: TicketStatus | TicketStatus[];
    icon: React.ReactNode;
  }
> = {
  admin_inicio: {
    title: 'Início · Visão Geral Administrador',
    subtitle: 'Painel executivo de governança, configuração de papéis e indicadores operacionais.',
    icon: <LayoutDashboard className="w-5 h-5 text-purple-600" />,
  },
  admin_configuracao: {
    title: 'Configuração do Sistema',
    subtitle: 'Configure os papéis dos usuários, cadastre clientes e parametrize categorias operacionais.',
    icon: <Settings className="w-5 h-5 text-purple-600" />,
  },
  admin_gerenciamento: {
    title: 'Configuração do Sistema',
    subtitle: 'Configure os papéis dos usuários, cadastre clientes e parametrize categorias operacionais.',
    icon: <Settings className="w-5 h-5 text-purple-600" />,
  },
  admin_usuarios: {
    title: 'Gestão de Usuários & Atribuição de Papéis',
    subtitle: 'Configure e defina quais papéis cada usuário irá desempenhar (CSM, Analista, Qualidade ou Administrador).',
    icon: <Users className="w-5 h-5 text-purple-600" />,
  },
  admin_clientes: {
    title: 'Cadastro e Gestão de Clientes',
    subtitle: 'Cadastre e mantenha as empresas, clientes corporativos e seus respectivos segmentos.',
    icon: <Building2 className="w-5 h-5 text-blue-600" />,
  },
  admin_categorias: {
    title: 'Parametrização de Categorias',
    subtitle: 'Parametrize e gerencie os módulos e categorias de erro para triagem e classificação.',
    icon: <Tags className="w-5 h-5 text-indigo-600" />,
  },
  admin_chamados: {
    title: 'Auditoria Geral de Erros',
    subtitle: 'Visão global e irrestrita de todos os chamados reportados em todas as fases do workflow.',
    icon: <ClipboardList className="w-5 h-5 text-emerald-600" />,
  },
  csm_inicio: {
    title: 'Início · Visão Geral CSM',
    subtitle: 'Painel executivo com métricas, gráficos e indicadores de erros reportados para Customer Success.',
    icon: <LayoutDashboard className="w-5 h-5 text-blue-600" />,
  },
  exportar_relatorios: {
    title: 'Exportação de Relatórios',
    subtitle: 'Exporte relatórios personalizados em CSV (Excel) ou JSON com filtros granulares e seleção de colunas.',
    icon: <FileSpreadsheet className="w-5 h-5 text-indigo-600" />,
  },
  csm_reportados: {
    title: 'Erros Reportados',
    subtitle: 'Visão completa de todos os chamados reportados pelo perfil CSM (em andamento e finalizados).',
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
  analista_inicio: {
    title: 'Início · Visão Geral Analista',
    subtitle: 'Painel operacional de triagem técnica, volume por células e diagnóstico de causas de erro.',
    icon: <LayoutDashboard className="w-5 h-5 text-indigo-600" />,
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
  qualidade_inicio: {
    title: 'Início · Visão Geral Qualidade',
    subtitle: 'Painel gerencial de auditoria, taxa de procedência de erros e controle de homologações.',
    icon: <LayoutDashboard className="w-5 h-5 text-teal-600" />,
  },
  qualidade_reprovados: {
    title: 'Erros Reprovados (Para Veredito)',
    subtitle: 'Chamados reprovados pelo Analista/Supervisor para a Qualidade dar parecer final (aprovar ou reprovar).',
    targetStatus: ['REPROVADO_ANALISTA', 'EM_CONTESTACAO_QUALIDADE'],
    icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
  },
  qualidade_aprovados: {
    title: 'Erros Aprovados',
    subtitle: 'Chamados aprovados diretamente pelo Analista (concluídos sem necessidade de homologação da Qualidade).',
    targetStatus: 'APROVADO_ANALISTA',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
  },
  qualidade_finalizados: {
    title: 'Erros Finalizados',
    subtitle: 'Visão consolidada de todos os erros que já tiveram parecer conclusivo finalizado.',
    targetStatus: ['APROVADO_ANALISTA', 'APROVADO_QUALIDADE', 'REPROVADO_QUALIDADE'],
    icon: <Archive className="w-5 h-5 text-emerald-600" />,
  },
  gestor_inicio: {
    title: 'Início · Visão Geral Gestor de Analista',
    subtitle: 'Painel operacional e gerencial de supervisão da equipe de analistas sob sua hierarquia.',
    icon: <LayoutDashboard className="w-5 h-5 text-indigo-600" />,
  },
  gestor_equipe: {
    title: 'Erros da Equipe de Analistas',
    subtitle: 'Chamados novos e contestados sob a responsabilidade dos analistas atrelados à sua hierarquia.',
    targetStatus: ['NOVO_AGUARDANDO_TRIAGEM', 'INFORMACOES_FALTANDO'],
    icon: <Clock className="w-5 h-5 text-indigo-600" />,
  },
  gestor_finalizados: {
    title: 'Erros Finalizados da Equipe',
    subtitle: 'Chamados triados e concluídos pelos analistas sob sua supervisão (aprovados ou com parecer da qualidade).',
    targetStatus: ['APROVADO_ANALISTA', 'APROVADO_QUALIDADE', 'REPROVADO_QUALIDADE'],
    icon: <Archive className="w-5 h-5 text-emerald-600" />,
  },
};

const MainDashboard: React.FC = () => {
  const {
    tickets,
    currentRole,
    setCurrentRole,
    currentUser,
    isAuthenticated,
    logout,
    loading,
    error,
    clientsList,
    getSupervisedAnalysts,
  } = useWorkflow();

  const getDefaultPage = (role: UserRole): AppPage => {
    if (role === 'CSM') return 'csm_inicio';
    if (role === 'ANALISTA') return 'analista_inicio';
    if (role === 'GESTOR_ANALISTA') return 'gestor_inicio';
    if (role === 'QUALIDADE') return 'qualidade_inicio';
    return 'admin_inicio';
  };

  // Active page state in Sidebar
  const [currentPage, setCurrentPage] = useState<AppPage>(() => getDefaultPage(currentRole));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [adminManagementTab, setAdminManagementTab] = useState<ManagementTab>('usuarios');

  // Sincroniza a página com o papel ativo (garantindo que cada perfil visualize apenas suas telas)
  // e fecha o modal de novo reporte se mudar para perfis sem permissão (ANALISTA, GESTOR_ANALISTA ou QUALIDADE)
  React.useEffect(() => {
    // Páginas compartilhadas e acessíveis a nível de configuração/relatórios
    if (
      currentPage === 'admin_configuracao' ||
      currentPage === 'admin_gerenciamento' ||
      currentPage === 'admin_usuarios' ||
      currentPage === 'admin_clientes' ||
      currentPage === 'admin_categorias' ||
      currentPage === 'exportar_relatorios'
    ) {
      if (currentRole !== 'CSM' && isNewTicketOpen) {
        setIsNewTicketOpen(false);
      }
      return;
    }

    if (currentRole === 'CSM') {
      if (
        currentPage !== 'csm_inicio' &&
        currentPage !== 'csm_reportados' &&
        currentPage !== 'csm_contestados' &&
        currentPage !== 'csm_avaliados'
      ) {
        setCurrentPage('csm_inicio');
      }
    } else if (currentRole === 'ANALISTA') {
      if (
        currentPage !== 'analista_inicio' &&
        currentPage !== 'analista_reportados' &&
        currentPage !== 'analista_finalizados'
      ) {
        setCurrentPage('analista_inicio');
      }
    } else if (currentRole === 'GESTOR_ANALISTA') {
      if (
        currentPage !== 'gestor_inicio' &&
        currentPage !== 'gestor_equipe' &&
        currentPage !== 'gestor_finalizados'
      ) {
        setCurrentPage('gestor_inicio');
      }
    } else if (currentRole === 'QUALIDADE') {
      if (
        currentPage !== 'qualidade_inicio' &&
        currentPage !== 'qualidade_aprovados' &&
        currentPage !== 'qualidade_reprovados' &&
        currentPage !== 'qualidade_finalizados'
      ) {
        setCurrentPage('qualidade_inicio');
      }
    } else if (currentRole === 'ADMIN') {
      if (
        currentPage !== 'admin_inicio' &&
        currentPage !== 'admin_chamados'
      ) {
        setCurrentPage('admin_inicio');
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nexus_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nexus_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Selected ticket derived from current ticket pool
  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    return tickets.find((t) => t.id === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

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
      } else if (currentRole === 'GESTOR_ANALISTA') {
        const myAnalysts = getSupervisedAnalysts(currentUser.name);
        const isTeamTicket =
          !t.analystName || myAnalysts.length === 0 || myAnalysts.includes(t.analystName);
        if (!isTeamTicket) return false;

        if (currentPage === 'gestor_equipe') {
          if (t.status !== 'NOVO_AGUARDANDO_TRIAGEM' && t.status !== 'INFORMACOES_FALTANDO') {
            return false;
          }
        } else if (currentPage === 'gestor_finalizados') {
          if (t.status === 'NOVO_AGUARDANDO_TRIAGEM' || t.status === 'INFORMACOES_FALTANDO') {
            return false;
          }
        }
      } else if (currentRole === 'CSM') {
        if (currentPage === 'csm_reportados') {
          // Na página de erros reportados para o perfil CSM deve constar todos os chamados (inclusive os finalizados)
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
          if (
            t.status !== 'APROVADO_ANALISTA' &&
            t.status !== 'APROVADO_QUALIDADE' &&
            t.status !== 'REPROVADO_QUALIDADE'
          ) {
            return false;
          }
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
        if (currentRole === 'GESTOR_ANALISTA' && t.status !== 'NOVO_AGUARDANDO_TRIAGEM') {
          return false;
        }
        if (
          currentRole === 'QUALIDADE' &&
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
    currentUser,
    getSupervisedAnalysts,
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
    } else if (currentRole === 'GESTOR_ANALISTA') {
      if (status === 'INFORMACOES_FALTANDO' || status === 'NOVO_AGUARDANDO_TRIAGEM') {
        setCurrentPage('gestor_equipe');
      } else if (status !== 'ALL') {
        setCurrentPage('gestor_finalizados');
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



  const activeMeta = PAGE_METADATA[currentPage];

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={(role) => {
          setCurrentPage(getDefaultPage(role));
          setStatusFilter('ALL');
        }}
      />
    );
  }

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
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content Area (Offset for desktop sidebar: w-72 or collapsed w-[72px]) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-72'
        }`}
      >
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
          <div className="flex items-center gap-2">
            {(currentRole === 'CSM' ||
              currentRole === 'ANALISTA' ||
              currentRole === 'GESTOR_ANALISTA') && (
              <NotificationBell
                onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
                onNavigateContestados={() => {
                  if (currentRole === 'CSM') {
                    setCurrentPage('csm_contestados');
                  } else if (currentRole === 'GESTOR_ANALISTA') {
                    setCurrentPage('gestor_equipe');
                  } else {
                    setCurrentPage('analista_reportados');
                  }
                  setStatusFilter('ALL');
                }}
                onNavigateQueue={() => {
                  if (currentRole === 'GESTOR_ANALISTA') {
                    setCurrentPage('gestor_equipe');
                  } else {
                    setCurrentPage('analista_reportados');
                  }
                  setStatusFilter('ALL');
                }}
              />
            )}
            {currentRole === 'CSM' && (
              <button
                onClick={() => setIsNewTicketOpen(true)}
                className="p-2 bg-blue-600 text-white rounded-lg shadow-xs cursor-pointer"
                title="Abrir Chamado"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="Sair da conta"
              aria-label="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
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
            <div className="flex items-center gap-3">
              {isSidebarCollapsed && (
                <button
                  onClick={handleToggleSidebar}
                  className="hidden lg:flex p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-2xs bg-slate-50"
                  title="Expandir barra lateral"
                  aria-label="Expandir barra lateral"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              )}
              <div>
                <h1
                  className="text-slate-900 tracking-tight"
                  style={{
                    fontWeight: 'bold',
                    fontSize: '21px',
                    fontFamily: 'system-ui',
                  }}
                >
                  {activeMeta.title}
                </h1>
              </div>
            </div>

            {/* Quick Actions on Page Header */}
            <div className="flex items-center gap-2.5 shrink-0">
              {(currentRole === 'CSM' ||
                currentRole === 'ANALISTA' ||
                currentRole === 'GESTOR_ANALISTA') && (
                <NotificationBell
                  onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
                  onNavigateContestados={() => {
                    if (currentRole === 'CSM') {
                      setCurrentPage('csm_contestados');
                    } else if (currentRole === 'GESTOR_ANALISTA') {
                      setCurrentPage('gestor_equipe');
                    } else {
                      setCurrentPage('analista_reportados');
                    }
                    setStatusFilter('ALL');
                  }}
                  onNavigateQueue={() => {
                    if (currentRole === 'GESTOR_ANALISTA') {
                      setCurrentPage('gestor_equipe');
                    } else {
                      setCurrentPage('analista_reportados');
                    }
                    setStatusFilter('ALL');
                  }}
                />
              )}

              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

              <div className="hidden sm:flex items-center gap-2 pl-1">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
                />
                <div className="text-left leading-tight hidden md:block">
                  <span className="text-xs font-bold text-slate-800 block">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Sair / Trocar perfil"
                  aria-label="Sair / Trocar perfil"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Check if current page is Reports, Admin, Home/Dashboard, or Queue */}
          {(() => {
            if (currentPage === 'exportar_relatorios') {
              return <ExportReportsPage />;
            }

            if (currentPage === 'admin_inicio') {
              return (
                <AdminDashboard
                  onNavigate={(page, tab) => {
                    if (tab) setAdminManagementTab(tab);
                    setCurrentPage(page);
                  }}
                />
              );
            }

            if (currentPage === 'admin_configuracao' || currentPage === 'admin_gerenciamento') {
              return <AdminManagementPage initialTab={adminManagementTab} />;
            }

            if (currentPage === 'admin_usuarios') {
              return <AdminManagementPage initialTab="usuarios" />;
            }

            if (currentPage === 'admin_clientes') {
              return <AdminManagementPage initialTab="clientes" />;
            }

            if (currentPage === 'admin_categorias') {
              return <AdminManagementPage initialTab="categorias" />;
            }

            const isHomePage =
              currentPage === 'csm_inicio' ||
              currentPage === 'analista_inicio' ||
              currentPage === 'gestor_inicio' ||
              currentPage === 'qualidade_inicio';

            if (isHomePage) {
              return (
                <RoleHomeDashboard
                  onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
                  onNavigateToPage={(page) => {
                    setCurrentPage(page);
                    setStatusFilter('ALL');
                  }}
                  onOpenNewTicket={() => setIsNewTicketOpen(true)}
                  onEditTicket={(ticket) => setEditingTicket(ticket)}
                />
              );
            }

            return (
              <>
                {/* KPI Metrics Cards (Visible across list pages to give instant context) */}
                <MetricsCards
                  selectedStatusFilter={statusFilter}
                  onSelectStatusFilter={handleSelectStatusFromMetric}
                />

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
              </>
            );
          })()}
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
