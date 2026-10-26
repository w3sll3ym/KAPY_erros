import React, { useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Archive,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Building2,
  Tags,
  ShieldCheck,
  ClipboardList,
  SlidersHorizontal,
  Settings,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

export type AppPage =
  | 'csm_inicio'
  | 'csm_reportados'
  | 'csm_contestados'
  | 'csm_avaliados'
  | 'analista_inicio'
  | 'analista_reportados'
  | 'analista_finalizados'
  | 'gestor_inicio'
  | 'gestor_equipe'
  | 'gestor_finalizados'
  | 'qualidade_inicio'
  | 'qualidade_aprovados'
  | 'qualidade_reprovados'
  | 'qualidade_finalizados'
  | 'admin_inicio'
  | 'admin_configuracao'
  | 'admin_gerenciamento'
  | 'admin_usuarios'
  | 'admin_clientes'
  | 'admin_categorias'
  | 'admin_chamados'
  | 'exportar_relatorios';

interface SidebarProps {
  currentPage: AppPage;
  onSelectPage: (page: AppPage) => void;
  onOpenNewTicket: () => void;
  onOpenGuide: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  onOpenNewTicket,
  onOpenGuide,
  isMobileOpen,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    logout,
    metrics,
    tickets,
    systemUsers,
    clients,
    categories,
    getSupervisedAnalysts,
  } = useWorkflow();

  // Navigation items strictly mapped per user role
  const navItems = useMemo(() => {
    if (currentRole === 'CSM') {
      const avaliadosCount = tickets.filter((t) =>
        [
          'APROVADO_ANALISTA',
          'REPROVADO_ANALISTA',
          'EM_CONTESTACAO_QUALIDADE',
          'APROVADO_QUALIDADE',
          'REPROVADO_QUALIDADE',
        ].includes(t.status)
      ).length;

      return [
        {
          id: 'csm_inicio' as AppPage,
          label: 'Início',
          sublabel: 'Dashboard & Indicadores',
          icon: <LayoutDashboard className="w-4 h-4 text-white" />,
        },
        {
          id: 'csm_reportados' as AppPage,
          label: 'Erros Reportados',
          sublabel: 'Todos os Chamados',
          icon: <Clock className="w-4 h-4 text-white" />,
          badgeCount: metrics.total,
          badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        },
        {
          id: 'csm_contestados' as AppPage,
          label: 'Erros Contestados',
          sublabel: 'Informações Faltando',
          icon: <AlertCircle className="w-4 h-4 text-white" />,
          badgeCount: metrics.informacoesFaltando,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        },
        {
          id: 'csm_avaliados' as AppPage,
          label: 'Erros Avaliados',
          sublabel: 'Aprovados & Reprovados',
          icon: <CheckCircle2 className="w-4 h-4 text-white" />,
          badgeCount: avaliadosCount,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        },
      ];
    }

    if (currentRole === 'ANALISTA') {
      const abertosCount = tickets.filter(
        (t) => t.status === 'NOVO_AGUARDANDO_TRIAGEM' || t.status === 'INFORMACOES_FALTANDO'
      ).length;
      const finalizadosCount = tickets.filter(
        (t) => t.status !== 'NOVO_AGUARDANDO_TRIAGEM' && t.status !== 'INFORMACOES_FALTANDO'
      ).length;
      return [
        {
          id: 'analista_inicio' as AppPage,
          label: 'Início',
          sublabel: 'Dashboard de Triagem',
          icon: <LayoutDashboard className="w-4 h-4 text-white" />,
        },
        {
          id: 'analista_reportados' as AppPage,
          label: 'Erros Abertos',
          sublabel: 'Novos & Contestados',
          icon: <Clock className="w-4 h-4 text-white" />,
          badgeCount: abertosCount,
          badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        },
        {
          id: 'analista_finalizados' as AppPage,
          label: 'Erros Finalizados',
          sublabel: 'Tratados & Acompanhamento',
          icon: <Archive className="w-4 h-4 text-white" />,
          badgeCount: finalizadosCount,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        },
      ];
    }

    if (currentRole === 'GESTOR_ANALISTA') {
      const myAnalysts = getSupervisedAnalysts(currentUser.name);
      const teamOpenCount = tickets.filter((t) => {
        const isTeamTicket =
          !t.analystName || myAnalysts.length === 0 || myAnalysts.includes(t.analystName);
        return (
          isTeamTicket &&
          (t.status === 'NOVO_AGUARDANDO_TRIAGEM' || t.status === 'INFORMACOES_FALTANDO')
        );
      }).length;

      const teamFinalizedCount = tickets.filter((t) => {
        const isTeamTicket =
          !t.analystName || myAnalysts.length === 0 || myAnalysts.includes(t.analystName);
        return (
          isTeamTicket &&
          t.status !== 'NOVO_AGUARDANDO_TRIAGEM' &&
          t.status !== 'INFORMACOES_FALTANDO'
        );
      }).length;

      return [
        {
          id: 'gestor_inicio' as AppPage,
          label: 'Início',
          sublabel: 'Visão Geral & Hierarquia',
          icon: <LayoutDashboard className="w-4 h-4 text-white" />,
        },
        {
          id: 'gestor_equipe' as AppPage,
          label: 'Erros da Equipe',
          sublabel: 'Abertos sob sua Hierarquia',
          icon: <Clock className="w-4 h-4 text-white" />,
          badgeCount: teamOpenCount,
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
        },
        {
          id: 'gestor_finalizados' as AppPage,
          label: 'Finalizados da Equipe',
          sublabel: 'Histórico Concluído',
          icon: <Archive className="w-4 h-4 text-white" />,
          badgeCount: teamFinalizedCount,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        },
      ];
    }

    if (currentRole === 'QUALIDADE') {
      return [
        {
          id: 'qualidade_inicio' as AppPage,
          label: 'Início',
          sublabel: 'Dashboard de Qualidade',
          icon: <LayoutDashboard className="w-4 h-4 text-white" />,
        },
        {
          id: 'qualidade_reprovados' as AppPage,
          label: 'Erros Reprovados',
          sublabel: 'Para Parecer Final da Qualidade',
          icon: <AlertTriangle className="w-4 h-4 text-white" />,
          badgeCount: metrics.reprovadosAnalista,
          badgeColor: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
        },
        {
          id: 'qualidade_aprovados' as AppPage,
          label: 'Erros Aprovados',
          sublabel: 'Aprovados pelo Analista (Direto)',
          icon: <CheckCircle2 className="w-4 h-4 text-white" />,
          badgeCount: metrics.aprovadosAnalista,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        },
        {
          id: 'qualidade_finalizados' as AppPage,
          label: 'Erros Finalizados',
          sublabel: 'Consolidado Concluídos',
          icon: <Archive className="w-4 h-4 text-white" />,
          badgeCount: metrics.finalizadosTotal,
          badgeColor: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
        },
      ];
    }

    if (currentRole === 'ADMIN') {
      return [
        {
          id: 'admin_inicio' as AppPage,
          label: 'Início',
          sublabel: 'Dashboard Executivo',
          icon: <LayoutDashboard className="w-4 h-4 text-white" />,
        },
        {
          id: 'admin_usuarios' as AppPage,
          label: 'Usuários Cadastrados',
          sublabel: 'Gestão de Papéis & Acessos',
          icon: <Users className="w-4 h-4 text-white" />,
          badgeCount: systemUsers.length,
          badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
        },
        {
          id: 'admin_clientes' as AppPage,
          label: 'Clientes & Empresas',
          sublabel: 'Empresas e Segmentos',
          icon: <Building2 className="w-4 h-4 text-white" />,
          badgeCount: clients.length,
          badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        },
        {
          id: 'admin_categorias' as AppPage,
          label: 'Categorias Parametrizadas',
          sublabel: 'Classificação de Erros',
          icon: <Tags className="w-4 h-4 text-white" />,
          badgeCount: categories.length,
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
        },
        {
          id: 'admin_chamados' as AppPage,
          label: 'Auditoria de Erros',
          sublabel: 'Todos os Chamados',
          icon: <ClipboardList className="w-4 h-4 text-white" />,
          badgeCount: metrics.total,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        },
      ];
    }

    return [];
  }, [currentRole, metrics, tickets, systemUsers, clients, categories, getSupervisedAnalysts, currentUser]);

  const handlePageClick = (page: AppPage) => {
    onSelectPage(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0b132b] text-slate-100 border-r border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isCollapsed ? 'w-72 lg:w-[72px]' : 'w-72'
        } ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`border-b border-white/[0.08] flex items-center bg-[#0b132b] transition-all ${
            isCollapsed
              ? 'p-3 justify-center'
              : 'px-4 py-3.5 justify-between'
          }`}
        >
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-bold text-white tracking-tight text-sm block leading-tight truncate">
                KAPY OPs
              </span>
              <span className="text-[11px] text-slate-400 font-normal block leading-tight truncate mt-0.5">
                Report de Erros
              </span>
            </div>
          )}

          {/* Action buttons (Minimize button for desktop & Close for mobile) */}
          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 text-white hover:bg-white/[0.12] rounded-lg transition-colors cursor-pointer"
                title={isCollapsed ? 'Expandir menu lateral' : 'Minimizar menu lateral'}
                aria-label={isCollapsed ? 'Expandir menu lateral' : 'Minimizar menu lateral'}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-white" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-white" />
                )}
              </button>
            )}

            <button
              onClick={onCloseMobile}
              className="p-1.5 text-white hover:bg-white/[0.12] rounded-lg lg:hidden cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className={`flex-1 overflow-y-auto p-3 space-y-5 ${isCollapsed ? 'px-2' : ''}`}>
          {/* Main Pages */}
          <div>
            {!isCollapsed && (
              <span className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80 block mb-1.5">
                {currentRole === 'ADMIN' ? 'Módulos de Gestão & Auditoria' : 'Filas de Trabalho'}
              </span>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;

                if (isCollapsed) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePageClick(item.id)}
                      title={`${item.label} ${
                        typeof item.badgeCount === 'number' ? `(${item.badgeCount})` : ''
                      } - ${item.sublabel}`}
                      className={`w-full flex items-center justify-center p-2 rounded-lg text-xs font-medium transition-all cursor-pointer relative group ${
                        isActive
                          ? 'bg-blue-600/20 text-white font-semibold border border-blue-500/30'
                          : 'text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <span className="text-white scale-105 transition-transform flex items-center justify-center">
                        {item.icon}
                      </span>
                      {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-3.5 h-3.5 px-1 flex items-center justify-center text-[8px] font-bold rounded-full bg-blue-500 text-white shadow-xs">
                          {item.badgeCount > 99 ? '99+' : item.badgeCount}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageClick(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer group ${
                      isActive
                        ? 'bg-blue-600/20 text-white font-semibold border border-blue-500/30 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-white shrink-0 flex items-center justify-center">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                          isActive
                            ? 'bg-blue-500/30 text-blue-200'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Configuração do Sistema (acesso rápido para perfis operacionais) */}
          {currentRole !== 'ADMIN' && (
            <div>
              {!isCollapsed && (
                <span className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80 block mb-1.5">
                  Configuração
                </span>
              )}
              <button
                onClick={() => {
                  setCurrentRole('ADMIN');
                  handlePageClick('admin_configuracao');
                }}
                title={`Configuração do Sistema (${systemUsers.length} usuários cadastrados)`}
                className={`w-full flex items-center rounded-lg text-xs font-medium transition-colors cursor-pointer group ${
                  currentPage === 'admin_configuracao' ||
                  currentPage === 'admin_gerenciamento' ||
                  currentPage === 'admin_usuarios' ||
                  currentPage === 'admin_clientes' ||
                  currentPage === 'admin_categorias'
                    ? 'bg-purple-600/25 text-white font-semibold border border-purple-500/40 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                } ${isCollapsed ? 'justify-center p-2' : 'px-2.5 py-2 justify-between'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Settings className="w-4 h-4 text-purple-400 shrink-0 group-hover:rotate-45 transition-transform" />
                  {!isCollapsed && (
                    <span className="truncate">Configuração</span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 ml-1.5">
                    {systemUsers.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Relatórios & Exportação */}
          <div>
            {!isCollapsed && (
              <span className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80 block mb-1.5">
                Relatórios
              </span>
            )}
            <button
              onClick={() => handlePageClick('exportar_relatorios')}
              title="Exportação de Relatórios e Dados (CSV/JSON)"
              className={`w-full flex items-center px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer group ${
                currentPage === 'exportar_relatorios'
                  ? 'bg-blue-600/20 text-white font-semibold border border-blue-500/30 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              } ${isCollapsed ? 'justify-center p-2' : 'gap-2.5'}`}
            >
              <FileSpreadsheet className="w-4 h-4 text-white shrink-0 group-hover:scale-105 transition-transform" />
              {!isCollapsed && (
                <span className="truncate">Exportar Relatórios</span>
              )}
            </button>
          </div>

          {/* Quick Guide / Help */}
          <div>
            {!isCollapsed && (
              <span className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80 block mb-1.5">
                Processo
              </span>
            )}
            <button
              onClick={() => {
                onOpenGuide();
                onCloseMobile();
              }}
              title="Guia do Workflow - Matriz de transições e papéis"
              className={`w-full flex items-center px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer group ${
                isCollapsed ? 'justify-center p-2' : 'gap-2.5'
              }`}
            >
              <BookOpen className="w-4 h-4 text-white shrink-0 group-hover:scale-105 transition-transform" />
              {!isCollapsed && (
                <span className="truncate">Guia do Workflow</span>
              )}
            </button>
          </div>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-[#070d1e]">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20"
                title={`${currentUser.name} (${currentUser.role})`}
              />
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                title="Sair / Trocar Usuário"
                aria-label="Sair / Trocar Usuário"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate block">
                      {currentUser.name}
                    </span>
                    {currentUser.role !== 'GESTOR_ANALISTA' && (
                      <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-white/10 text-slate-300 border border-white/10 shrink-0">
                        {currentUser.role}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 truncate block">
                    {currentUser.email}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Sair da conta"
                aria-label="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
