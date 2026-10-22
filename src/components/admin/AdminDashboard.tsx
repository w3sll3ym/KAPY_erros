import React from 'react';
import {
  Users,
  Building2,
  Tags,
  ClipboardList,
  UserPlus,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import { AppPage } from '../Sidebar';
import { ManagementTab } from './AdminManagementPage';

interface AdminDashboardProps {
  onNavigate: (page: AppPage, tab?: ManagementTab) => void;
  onOpenNewUser?: () => void;
  onOpenNewClient?: () => void;
  onOpenNewCategory?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenNewUser,
  onOpenNewClient,
  onOpenNewCategory,
}) => {
  const {
    systemUsers,
    clients,
    categories,
    tickets,
    metrics,
    currentUser,
  } = useWorkflow();

  const csmCount = systemUsers.filter((u) => u.role === 'CSM').length;
  const analistaCount = systemUsers.filter((u) => u.role === 'ANALISTA').length;
  const qualidadeCount = systemUsers.filter((u) => u.role === 'QUALIDADE').length;
  const adminCount = systemUsers.filter((u) => u.role === 'ADMIN').length;

  const activeClientsCount = clients.filter((c) => c.status !== 'INATIVO').length;
  const activeCategoriesCount = categories.filter((c) => c.status !== 'INATIVO').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b132b] via-[#1c2541] to-[#3a506b] p-6 text-white shadow-sm border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Olá, {currentUser.name}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Como Administrador, você configura os papéis que cada usuário desempenha (CSM, Analista, Qualidade, Admin), cadastra clientes, parametriza categorias de erros e audita a operação completa.
            </p>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Card */}
        <div
          onClick={() => onNavigate('admin_configuracao', 'usuarios')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-purple-300 transition-all cursor-pointer shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Usuários Cadastrados
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {systemUsers.length}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>
              {adminCount} Admin · {csmCount} CSM · {analistaCount} Ops · {qualidadeCount} QA
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Clients Card */}
        <div
          onClick={() => onNavigate('admin_configuracao', 'clientes')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Clientes & Empresas
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {activeClientsCount}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{clients.length - activeClientsCount} inativos · {clients.length} no total</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Categories Card */}
        <div
          onClick={() => onNavigate('admin_configuracao', 'categorias')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Categorias Parametrizadas
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Tags className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {activeCategoriesCount}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Módulos de classificação de erros</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Total Processed Tickets */}
        <div
          onClick={() => onNavigate('admin_chamados')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-xs hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Auditoria de Erros
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {metrics.total}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>
              {metrics.finalizadosTotal} finalizados ({metrics.taxaAprovacao}% procedência)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Role Distribution & System Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Distribution Section */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Distribuição de Papéis dos Usuários
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quantitativo de colaboradores habilitados para cada papel operacional no workflow
              </p>
            </div>
            <button
              onClick={() => onNavigate('admin_configuracao', 'usuarios')}
              className="text-xs text-purple-600 hover:text-purple-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Gerenciar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* CSM role block */}
            <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-blue-900">
                  Customer Success (CSM)
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  {csmCount} {csmCount === 1 ? 'usuário' : 'usuários'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Abertura de chamados, complemento de informações contestadas e acompanhamento com o cliente.
              </p>
            </div>

            {/* Analista role block */}
            <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-indigo-900">
                  Analista / Supervisor N2
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  {analistaCount} {analistaCount === 1 ? 'usuário' : 'usuários'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Triagem técnica, contestação por falta de evidências, aprovação direta conclusiva ou reprovação.
              </p>
            </div>

            {/* Qualidade role block */}
            <div className="p-3.5 rounded-xl border border-orange-100 bg-orange-50/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-orange-900">
                  Garantia da Qualidade (QA)
                </span>
                <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                  {qualidadeCount} {qualidadeCount === 1 ? 'usuário' : 'usuários'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Deliberação exclusiva com veredito final conclusivo quando o Analista reprova um chamado do CSM.
              </p>
            </div>

            {/* Administrador role block */}
            <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-purple-900">
                  Administrador (Governança)
                </span>
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  {adminCount} {adminCount === 1 ? 'usuário' : 'usuários'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Atribui e troca os papéis dos usuários, cadastra clientes, categorias de erro e audita o sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions Box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Ações Rápidas de Gestão</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Atalhos diretos para a Página de Gerenciamento do sistema.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('admin_configuracao', 'usuarios')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 text-xs font-semibold text-slate-800 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-purple-600" />
                  <span>Configurar Papéis dos Usuários</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('admin_configuracao', 'clientes')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-xs font-semibold text-slate-800 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Cadastrar e Gerenciar Clientes</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('admin_configuracao', 'categorias')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-xs font-semibold text-slate-800 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Tags className="w-4 h-4 text-indigo-600" />
                  <span>Parametrizar Categorias de Erro</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('exportar_relatorios')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-xs font-semibold text-slate-800 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                  <span>Exportar Relatórios (CSV / JSON)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Persistência em tempo real com Firebase Firestore
          </div>
        </div>
      </div>
    </div>
  );
};
