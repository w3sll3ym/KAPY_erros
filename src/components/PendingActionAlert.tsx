import React from 'react';
import { AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, Headphones, Layers, Shield } from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

interface PendingActionAlertProps {
  onFilterMyRoleActions: () => void;
  isOnlyMyActionsActive: boolean;
}

export const PendingActionAlert: React.FC<PendingActionAlertProps> = ({
  onFilterMyRoleActions,
  isOnlyMyActionsActive,
}) => {
  const { currentRole, currentUser, metrics } = useWorkflow();

  let message = '';
  let submessage = '';
  let count = 0;
  let borderColor = '';
  let bgColor = '';
  let textColor = '';
  let buttonColor = '';
  let icon = null;

  if (currentRole === 'CSM') {
    count = metrics.informacoesFaltando;
    if (count > 0) {
      message = `${count} chamado(s) com informações solicitadas pelo Analista`;
      submessage =
        'O Analista precisa de mais dados ou logs para prosseguir com a triagem. Clique para responder e reenviar.';
      borderColor = 'border-amber-300';
      bgColor = 'bg-amber-50/70';
      textColor = 'text-amber-900';
      buttonColor = 'bg-amber-600 hover:bg-amber-700 text-white';
      icon = <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />;
    }
  } else if (currentRole === 'ANALISTA') {
    count = metrics.novoAguardandoTriagem;
    if (count > 0) {
      message = `${count} chamado(s) novos aguardando sua triagem`;
      submessage =
        'Analise a evidência técnica para Aprovar Diretamente, Pedir Mais Informações ao CSM ou Contestar à Qualidade.';
      borderColor = 'border-blue-300';
      bgColor = 'bg-blue-50/70';
      textColor = 'text-blue-900';
      buttonColor = 'bg-blue-600 hover:bg-blue-700 text-white';
      icon = <Layers className="w-5 h-5 text-blue-600 shrink-0" />;
    }
  } else if (currentRole === 'QUALIDADE') {
    count = metrics.emContestacaoQualidade;
    if (count > 0) {
      message = `${count} chamado(s) em contestação aguardando deliberação de QA`;
      submessage =
        'O Analista contestou os reportes. Avalie as evidências e emita o parecer conclusivo de Aprovação ou Reprovação.';
      borderColor = 'border-purple-300';
      bgColor = 'bg-purple-50/70';
      textColor = 'text-purple-900';
      buttonColor = 'bg-purple-600 hover:bg-purple-700 text-white';
      icon = <Shield className="w-5 h-5 text-purple-600 shrink-0" />;
    }
  }

  if (count === 0) {
    return (
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 sm:p-4 flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <span className="font-bold">Fila em dia para {currentUser.title} ({currentRole})</span>
            <p className="text-[11px] text-emerald-700/90 mt-0.5">
              Nenhum chamado pendente de ação imediata neste papel no momento.
            </p>
          </div>
        </div>
        <span className="text-[11px] text-emerald-700 font-medium hidden sm:inline">
          Tudo atualizado
        </span>
      </div>
    );
  }

  return (
    <div
      className={`border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${borderColor} ${bgColor}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`text-xs sm:text-sm font-bold ${textColor}`}>
              {message}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/80 rounded border border-slate-200/60">
              Ação Requerida
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-2xl">
            {submessage}
          </p>
        </div>
      </div>

      <button
        onClick={onFilterMyRoleActions}
        className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 ${buttonColor}`}
      >
        <span>{isOnlyMyActionsActive ? 'Ver Todos os Chamados' : 'Filtrar Minhas Ações'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
