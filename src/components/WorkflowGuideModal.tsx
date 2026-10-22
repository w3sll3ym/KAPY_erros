import React from 'react';
import { X, ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert, RotateCcw, HelpCircle } from 'lucide-react';
import { UserRole } from '../types/workflow';

interface WorkflowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRole: (role: UserRole) => void;
}

export const WorkflowGuideModal: React.FC<WorkflowGuideModalProps> = ({
  isOpen,
  onClose,
  onSwitchRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Guia do Fluxo de Trabalho (Workflow & Regras)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Como o sistema orquestra os chamados entre CSM, Analista/Supervisor e Qualidade
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Visual Step-by-Step Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                    Etapa 1
                  </span>
                  <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    CSM
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  Abertura do Chamado
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  O CSM registra o erro reportado pelo cliente com título, severidade, detalhes e evidências.
                </p>
                <div className="text-[11px] font-semibold bg-white p-2 rounded border border-blue-200 text-blue-800">
                  Status: NOVO_AGUARDANDO_TRIAGEM
                </div>
              </div>
              <button
                onClick={() => {
                  onSwitchRole('CSM');
                  onClose();
                }}
                className="mt-4 text-xs font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                Alternar para CSM <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 2 */}
            <div className="border border-slate-200 bg-slate-50/70 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Etapa 2
                  </span>
                  <span className="text-[11px] font-semibold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                    Analista / Sup.
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  Triagem Técnica
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  O Analista avalia os erros reportados e toma uma de três decisões:
                </p>
                <ul className="text-xs space-y-1.5 text-slate-700">
                  <li className="flex items-start gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <span><strong>Contestar</strong> → Retorna ao CSM por falta de dados</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Aprovar</strong> → Concluído diretamente (não requer homologação da Qualidade)</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-600 mt-0.5 shrink-0" />
                    <span><strong>Reprovar</strong> → Vai para a Qualidade dar o veredito final</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  onSwitchRole('ANALISTA');
                  onClose();
                }}
                className="mt-4 text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
              >
                Alternar para Analista <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 3 */}
            <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                    Etapa 3
                  </span>
                  <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    CSM
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  Erros Contestados (CSM)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Na tela de <em>Erros Contestados</em>, o CSM complementa as respostas e evidências solicitadas pelo Analista e reenvia à triagem.
                </p>
                <div className="text-[11px] font-semibold bg-white p-2 rounded border border-amber-200 text-amber-800">
                  Retorna para: NOVO_AGUARDANDO_TRIAGEM
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-amber-800 font-medium">
                <RotateCcw className="w-3.5 h-3.5" /> Retorno de dados
              </div>
            </div>

            {/* Step 4 */}
            <div className="border border-purple-200 bg-purple-50/40 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-800 uppercase tracking-wide">
                    Etapa 4
                  </span>
                  <span className="text-[11px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                    Qualidade
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  Veredito da Qualidade
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  A Qualidade só precisa dar o veredito quando o Analista reprova um erro aberto pelo CSM:
                </p>
                <ul className="text-xs space-y-1.5 text-slate-700">
                  <li className="flex items-start gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-600 mt-0.5 shrink-0" />
                    <span><strong>Erros Reprovados</strong> → Veredito: aprova o chamado ou confirma a reprovação</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Erros Aprovados</strong> → Concluídos diretamente pelo Analista (dispensa homologação)</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 mt-0.5 shrink-0" />
                    <span><strong>Erros Finalizados</strong> → Histórico consolidado</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  onSwitchRole('QUALIDADE');
                  onClose();
                }}
                className="mt-4 text-xs font-medium text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
              >
                Alternar para Qualidade <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Gestor de Analista Section */}
          <div className="border border-indigo-200 bg-indigo-50/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">
                  Perfil de Supervisão & Notificações
                </span>
                <span className="text-[11px] font-semibold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                  Gestor de Analista
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Supervisão de Hierarquia e Notificações Centralizadas
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Enquanto o perfil de analista recebe notificações atreladas exclusivamente ao seu nome, o Gestor de Analista recebe centralizadamente todas as notificações dos analistas sob sua hierarquia (novos chamados, retornos de contestação e pareceres).
              </p>
            </div>
            <button
              onClick={() => {
                onSwitchRole('GESTOR_ANALISTA');
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <span>Alternar para Gestor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Role Section */}
          <div className="border border-purple-200 bg-purple-50/30 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-purple-800 uppercase tracking-wide">
                  Perfil de Gestão
                </span>
                <span className="text-[11px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                  Administrador
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Configuração de Papéis, Clientes e Categorias
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                O Administrador gerencia quais papéis cada usuário irá desempenhar no sistema (CSM, Analista, Qualidade, Admin), cadastra novos clientes parceiros, parametriza categorias de erros e monitora a auditoria completa de chamados.
              </p>
            </div>
            <button
              onClick={() => {
                onSwitchRole('ADMIN');
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <span>Alternar para Administrador</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table of Statuses */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Matriz de Estados do Chamado (Status Workflow)
              </span>
            </div>
            <div className="divide-y divide-slate-200 text-xs">
              <div className="grid grid-cols-12 p-3 bg-white hover:bg-slate-50 gap-2 items-center">
                <div className="col-span-4 font-semibold text-blue-700">
                  NOVO_AGUARDANDO_TRIAGEM
                </div>
                <div className="col-span-6 text-slate-600">
                  Criado pelo CSM, aguarda análise técnica inicial do Analista/Supervisor.
                </div>
                <div className="col-span-2 text-right font-medium text-blue-600">
                  Ação: Analista
                </div>
              </div>

              <div className="grid grid-cols-12 p-3 bg-white hover:bg-slate-50 gap-2 items-center">
                <div className="col-span-4 font-semibold text-amber-700">
                  INFORMACOES_FALTANDO
                </div>
                <div className="col-span-6 text-slate-600">
                  Devolvido ao CSM para inclusão de detalhes, logs ou dados do cliente.
                </div>
                <div className="col-span-2 text-right font-medium text-amber-700">
                  Ação: CSM
                </div>
              </div>

              <div className="grid grid-cols-12 p-3 bg-white hover:bg-slate-50 gap-2 items-center">
                <div className="col-span-4 font-semibold text-emerald-700">
                  APROVADO_ANALISTA
                </div>
                <div className="col-span-6 text-slate-600">
                  Aprovado diretamente pelo Analista/Supervisor como defeito legítimo. (Estado Final)
                </div>
                <div className="col-span-2 text-right font-medium text-emerald-600">
                  Finalizado
                </div>
              </div>

              <div className="grid grid-cols-12 p-3 bg-white hover:bg-slate-50 gap-2 items-center">
                <div className="col-span-4 font-semibold text-purple-700">
                  EM_CONTESTACAO_QUALIDADE
                </div>
                <div className="col-span-6 text-slate-600">
                  Reprovado/contestado pelo Analista e encaminhado para arbitramento da Qualidade.
                </div>
                <div className="col-span-2 text-right font-medium text-purple-700">
                  Ação: Qualidade
                </div>
              </div>

              <div className="grid grid-cols-12 p-3 bg-white hover:bg-slate-50 gap-2 items-center">
                <div className="col-span-4 font-semibold text-teal-700">
                  APROVADO_QUALIDADE
                </div>
                <div className="col-span-6 text-slate-600">
                  Aprovado pela equipe de Qualidade após revisão do reporte e contestação. (Estado Final)
                </div>
                <div className="col-span-2 text-right font-medium text-teal-600">
                  Finalizado
                </div>
              </div>

              <div className="grid grid-cols-12 p-3 bg-white hover:bg-slate-50 gap-2 items-center">
                <div className="col-span-4 font-semibold text-rose-700">
                  REPROVADO_QUALIDADE
                </div>
                <div className="col-span-6 text-slate-600">
                  Reprovado definitivamente pela Qualidade com laudo técnico formal. (Estado Final)
                </div>
                <div className="col-span-2 text-right font-medium text-rose-600">
                  Finalizado
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            Entendido, fechar guia
          </button>
        </div>
      </div>
    </div>
  );
};
