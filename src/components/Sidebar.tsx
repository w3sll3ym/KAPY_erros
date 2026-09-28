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
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { UserRole, TicketStatus } from '../types/workflow';

export type AppPage =
  | 'csm_reportados'
  | 'csm_contestados'
  | 'analista_reportados'
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  onOpenNewTicket,
  onOpenGuide,
  isMobileOpen,
  onCloseMobile,
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
      return [
        {
          id: 'csm_reportados' as AppPage,
          label: 'Erros Reportados',
          sublabel: 'Abertos & Em andamento',
          icon: <Clock className="w-4 h-4 text-blue-600" />,
          badgeCount: tickets.filter((t) => t.status === 'NOVO_AGUARDANDO_TRIAGEM').length,
          badgeColor: 'bg-blue-100 text-blue-800 font-bold',
        },
        {
          id: 'csm_contestados' as AppPage,
          label: 'Erros Contestados',
          sublabel: 'Informações Faltando',
          icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
          badgeCount: metrics.informacoesFaltando,
          badgeColor: 'bg-amber-100 text-amber-800 font-bold',
        },
      ];
    }

    if (currentRole === 'ANALISTA') {
      return [
        {
          id: 'analista_reportados' as AppPage,
          label: 'Erros Reportados',
          sublabel: 'Fila de Triagem Técnica',
          icon: <Clock className="w-4 h-4 text-blue-600" />,
          badgeCount: metrics.novoAguardandoTriagem,
          badgeColor: 'bg-blue-100 text-blue-800 font-bold',
        },
      ];
    }

    // QUALIDADE
    return [
      {
        id: 'qualidade_aprovados' as AppPage,
        label: 'Erros Aprovados',
        sublabel: 'Aguardando Análise da Qualidade',
        icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
        badgeCount: metrics.aprovadosAnalista,
        badgeColor: 'bg-blue-100 text-blue-800 font-bold',
      },
      {
        id: 'qualidade_reprovados' as AppPage,
        label: 'Erros Reprovados',
        sublabel: 'Para Parecer Final (Aprovar/Reprovar)',
        icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
        badgeCount: metrics.reprovadosAnalista,
        badgeColor: 'bg-orange-100 text-orange-800 font-bold',
      },
      {
        id: 'qualidade_finalizados' as AppPage,
        label: 'Erros Finalizados',
        sublabel: 'Consolidado Concluídos',
        icon: <Archive className="w-4 h-4 text-emerald-600" />,
        badgeCount: metrics.finalizadosTotal,
        badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
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
      icon: <Headphones className="w-4 h-4 text-amber-600" />,
      pendingCount: metrics.informacoesFaltando,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      role: 'ANALISTA',
      label: 'Analista / Supervisor',
      team: 'Triagem Técnica N2',
      icon: <Layers className="w-4 h-4 text-blue-600" />,
      pendingCount: metrics.novoAguardandoTriagem,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      role: 'QUALIDADE',
      label: 'Qualidade (QA)',
      team: 'Auditoria & Arbitragem',
      icon: <Shield className="w-4 h-4 text-purple-600" />,
      pendingCount: metrics.aprovadosAnalista + metrics.reprovadosAnalista,
      badgeColor: 'bg-purple-100 text-purple-800',
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base">
                  Nexus QA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Tratamento de Erros
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Main Pages */}
          <div>
            <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Páginas & Filas de Trabalho
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageClick(item.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-900 font-bold shadow-2xs border border-blue-200/80'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <div className="text-left truncate">
                        <span className="block truncate">{item.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal block truncate">
                          {item.sublabel}
                        </span>
                      </div>
                    </div>
                    {typeof item.badgeCount === 'number' && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ml-2 ${item.badgeColor}`}
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
            <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Processo & Regras
            </span>
            <button
              onClick={() => {
                onOpenGuide();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <div className="text-left">
                <span className="block font-semibold">Guia do Workflow</span>
                <span className="text-[10px] text-slate-400 font-normal block">
                  Matriz de transições e papéis
                </span>
              </div>
            </button>
          </div>

          {/* RBAC Persona Selector Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="px-2.5 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Simular Papel (RBAC)
              </span>
            </div>

            <div className="space-y-1">
              {rolesList.map((r) => {
                const isSelected = currentRole === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => handleSelectRole(r.role)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={isSelected ? 'text-blue-300' : ''}>
                        {r.icon}
                      </span>
                      <div className="text-left truncate">
                        <span className="block text-xs leading-tight truncate">
                          {r.label}
                        </span>
                        <span
                          className={`text-[10px] font-normal leading-tight block truncate ${
                            isSelected ? 'text-slate-400' : 'text-slate-400'
                          }`}
                        >
                          {r.team}
                        </span>
                      </div>
                    </div>

                    {r.pendingCount > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          isSelected
                            ? 'bg-blue-500 text-white'
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
