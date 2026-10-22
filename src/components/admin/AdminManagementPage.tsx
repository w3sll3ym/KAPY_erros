import React, { useState } from 'react';
import {
  Users,
  Building2,
  Tags,
  SlidersHorizontal,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Headphones,
  Shield,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import { AdminUsersManagement } from './AdminUsersManagement';
import { AdminClientsManagement } from './AdminClientsManagement';
import { AdminCategoriesManagement } from './AdminCategoriesManagement';

export type ManagementTab = 'usuarios' | 'clientes' | 'categorias' | 'parametros';

interface AdminManagementPageProps {
  initialTab?: ManagementTab;
}

export const AdminManagementPage: React.FC<AdminManagementPageProps> = ({
  initialTab = 'usuarios',
}) => {
  const [activeTab, setActiveTab] = useState<ManagementTab>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const { systemUsers, clients, categories } = useWorkflow();

  const csmCount = systemUsers.filter((u) => u.role === 'CSM').length;
  const analistaCount = systemUsers.filter((u) => u.role === 'ANALISTA').length;
  const qualidadeCount = systemUsers.filter((u) => u.role === 'QUALIDADE').length;
  const adminCount = systemUsers.filter((u) => u.role === 'ADMIN').length;

  const activeClients = clients.filter((c) => c.status !== 'INATIVO').length;
  const activeCategories = categories.filter((c) => c.status !== 'INATIVO').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'usuarios'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuários & Papéis</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'usuarios'
                  ? 'bg-purple-800 text-purple-100'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {systemUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('clientes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'clientes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Cadastro de Clientes</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'clientes'
                  ? 'bg-blue-800 text-blue-100'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {activeClients}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categorias')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'categorias'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>Parametrização de Categorias</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'categorias'
                  ? 'bg-indigo-800 text-indigo-100'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {activeCategories}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('parametros')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'parametros'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Políticas & SLAs do Workflow</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'usuarios' && <AdminUsersManagement />}

      {activeTab === 'clientes' && <AdminClientsManagement />}

      {activeTab === 'categorias' && <AdminCategoriesManagement />}

      {activeTab === 'parametros' && (
        <div className="space-y-6">
          {/* Workflow Rules & Responsibilities Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Matriz de Regras Operacionais e Papéis do Workflow
                </h3>
                <p className="text-xs text-slate-500">
                  Regras de transição executadas pelos papéis configurados pelo Administrador
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-blue-900 font-bold text-xs">
                    <Headphones className="w-4 h-4 text-blue-700" />
                    <span>Papel: CSM (Customer Success)</span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-600 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Cadastra novos erros reportados com os 8 campos obrigatórios da operação.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Recebe notificações no sino quando o Analista contesta por falta de evidências.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Complementa respostas, anexa logs e reenvia diretamente à triagem.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-200/60 text-[11px] font-semibold text-blue-800">
                  Usuários Ativos: {csmCount}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-indigo-900 font-bold text-xs">
                    <Layers className="w-4 h-4 text-indigo-700" />
                    <span>Papel: Analista / Supervisor N2</span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-600 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>Realiza triagem técnica operacional de chamados recém-abertos.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><strong>Aprovação Direta:</strong> Conclui o chamado sem necessidade de homologação da Qualidade.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><strong>Reprovação Técnica:</strong> Encaminha compulsoriamente para deliberação final da Qualidade.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-indigo-200/60 text-[11px] font-semibold text-indigo-800">
                  Usuários Ativos: {analistaCount}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-orange-900 font-bold text-xs">
                    <Shield className="w-4 h-4 text-orange-700" />
                    <span>Papel: Qualidade (QA)</span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-600 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Fila exclusiva de chamados reprovados pelo Analista/Supervisor.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Emissão de veredito final conclusivo (Aprovar chamado ou Confirmar reprovação).</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Emissão de laudo técnico formal com auditoria de causa-raiz.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-orange-200/60 text-[11px] font-semibold text-orange-800">
                  Usuários Ativos: {qualidadeCount}
                </div>
              </div>
            </div>
          </div>

          {/* SLA Parameters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Parâmetros de SLA por Severidade</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Prazos máximos estabelecidos para conclusão da triagem e emissão de parecer técnico:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg border border-rose-200 bg-rose-50/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <span className="font-bold text-rose-900">Crítica</span>
                  </div>
                  <span className="font-bold text-rose-800">SLA: 4 horas</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span className="font-bold text-orange-900">Alta</span>
                  </div>
                  <span className="font-bold text-orange-800">SLA: 24 horas</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-sky-200 bg-sky-50/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span className="font-bold text-sky-900">Média</span>
                  </div>
                  <span className="font-bold text-sky-800">SLA: 48 horas</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="font-bold text-slate-700">Baixa</span>
                  </div>
                  <span className="font-bold text-slate-700">SLA: 72 horas</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Governança e Permissões Administrativas</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Recursos sob autoridade exclusiva do Administrador do Sistema:
              </p>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-purple-950 block">Atribuição Imediata de Papéis</strong>
                    <span>O administrador pode promover ou alternar qualquer usuário entre CSM, Analista, Qualidade e Admin com atualização instantânea de permissões.</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-blue-950 block">Cadastro de Clientes em Tempo Real</strong>
                    <span>Novas empresas parceiras e contratos cadastrados ficam automaticamente integrados no auto-complete e filtros de relatórios.</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-indigo-950 block">Parametrização de Categorias</strong>
                    <span>Criação, inativação e categorização de causas de erro e módulos sistêmicos com identificação por cor.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
