import React, { useState, useMemo } from 'react';
import {
  Layers,
  BookOpen,
  Shield,
  Headphones,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  LayoutDashboard,
  Clock,
  Archive,
  ChevronDown,
  UserCheck,
  X,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { UserRole, TicketStatus } from '../types/workflow';

export type AppPage =
  | 'csm_reportados'
  | 'csm_contestados'
  | 'csm_avaliados'
  | 'analista_reportados'
  | 'analista_finalizados'
  | 'qualidade_aprovados'
  | 'qualidade_reprovados'
  | 'qualidade_finalizados';

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
    metrics,
    tickets,
  } = useWorkflow();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

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

    // QUALIDADE
    return [
      {
        id: 'qualidade_aprovados' as AppPage,
        label: 'Erros Aprovados',
        sublabel: 'Aguardando Análise da Qualidade',
        icon: <CheckCircle2 className="w-4 h-4 text-white" />,
        badgeCount: metrics.aprovadosAnalista,
        badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      },
      {
        id: 'qualidade_reprovados' as AppPage,
        label: 'Erros Reprovados',
        sublabel: 'Para Parecer Final (Aprovar/Reprovar)',
        icon: <AlertTriangle className="w-4 h-4 text-white" />,
        badgeCount: metrics.reprovadosAnalista,
        badgeColor: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
      },
      {
        id: 'qualidade_finalizados' as AppPage,
        label: 'Erros Finalizados',
        sublabel: 'Consolidado Concluídos',
        icon: <Archive className="w-4 h-4 text-white" />,
        badgeCount: metrics.finalizadosTotal,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      },
    ];
  }, [currentRole, metrics, tickets]);

  // RBAC Roles
  const rolesList: {
    role: UserRole;
    label: string;
    team: string;
    icon: React.ReactNode;
    pendingCount: number;
    badgeColor: string;
  }[] = [
    {
      role: 'CSM',
      label: 'CSM (Relacionamento)',
      team: 'Contas & Sucesso',
      icon: <Headphones className="w-4 h-4 text-white" />,
      pendingCount: metrics.informacoesFaltando,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      role: 'ANALISTA',
      label: 'Analista / Supervisor',
      team: 'Triagem Técnica N2',
      icon: <Layers className="w-4 h-4 text-white" />,
      pendingCount: metrics.novoAguardandoTriagem,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      role: 'QUALIDADE',
      label: 'Qualidade (QA)',
      team: 'Auditoria & Arbitragem',
      icon: <Shield className="w-4 h-4 text-white" />,
      pendingCount: metrics.aprovadosAnalista + metrics.reprovadosAnalista,
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    },
  ];

  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'CSM') {
      onSelectPage('csm_reportados');
    } else if (role === 'ANALISTA') {
      onSelectPage('analista_reportados');
    } else if (role === 'QUALIDADE') {
      onSelectPage('qualidade_aprovados');
    }
  };

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
                Filas de Trabalho
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

          {/* RBAC Persona Selector Section */}
          <div className="pt-2 border-t border-white/[0.08]">
            {!isCollapsed && (
              <div className="px-2.5 mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400/80">
                  Simular Papel
                </span>
              </div>
            )}

            <div className="space-y-1">
              {rolesList.map((r) => {
                const isSelected = currentRole === r.role;

                if (isCollapsed) {
                  return (
                    <button
                      key={r.role}
                      onClick={() => handleSelectRole(r.role)}
                      title={`${r.label} (${r.team}) ${
                        r.pendingCount > 0 ? `· ${r.pendingCount} pendente(s)` : ''
                      }`}
                      className={`w-full flex items-center justify-center p-2 rounded-lg text-xs transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-white/15 text-white font-semibold shadow-xs ring-1 ring-white/20'
                          : 'text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <span className="text-white scale-105 transition-transform shrink-0 flex items-center justify-center">
                        {r.icon}
                      </span>
                      {r.pendingCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-400 ring-2 ring-[#0b132b]" />
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={r.role}
                    onClick={() => handleSelectRole(r.role)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-white/10 text-white font-semibold border border-white/15 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-white shrink-0 flex items-center justify-center">
                        {r.icon}
                      </span>
                      <span className="truncate">{r.label}</span>
                    </div>

                    {r.pendingCount > 0 && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : r.badgeColor
                        }`}
                        title={`${r.pendingCount} chamado(s) aguardando`}
                      >
                        {r.pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
