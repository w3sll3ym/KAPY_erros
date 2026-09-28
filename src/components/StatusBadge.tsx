import React from 'react';
import {
  FileText,
  Clock,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { TicketStatus } from '../types/workflow';
import { STATUS_CONFIG, SEVERITY_CONFIG } from '../data/statusConfig';

// Status Badge Component
export const StatusBadge: React.FC<{ status: TicketStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const config = STATUS_CONFIG[status];
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-medium'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${config.color.bg} ${config.color.text} ${config.color.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.color.indicator}`} />
      <span>{config.shortLabel}</span>
    </span>
  );
};

// Severity Badge Component
export const SeverityBadge: React.FC<{ severity: string; size?: 'sm' | 'md' }> = ({
  severity,
  size = 'md',
}) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.BAIXA;
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-medium'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.badge} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
};

interface StepperStep {
  id: string;
  title: string;
  actor: string;
  isCompleted: boolean;
  isActive: boolean;
  sublabel?: string;
  isSkipped?: boolean;
  isSuccess?: boolean;
  isRejected?: boolean;
}

// Visual Workflow Stepper
export const WorkflowStepper: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const steps: StepperStep[] = [
    {
      id: 'step-1',
      title: '1. Abertura',
      actor: 'CSM',
      isCompleted: true,
      isActive: false,
    },
    {
      id: 'step-2',
      title: '2. Triagem',
      actor: 'Analista / Sup.',
      isCompleted:
        status === 'APROVADO_ANALISTA' ||
        status === 'REPROVADO_ANALISTA' ||
        status === 'EM_CONTESTACAO_QUALIDADE' ||
        status === 'APROVADO_QUALIDADE' ||
        status === 'REPROVADO_QUALIDADE',
      isActive:
        status === 'NOVO_AGUARDANDO_TRIAGEM' || status === 'INFORMACOES_FALTANDO',
      sublabel:
        status === 'INFORMACOES_FALTANDO' ? 'Contestado CSM' : 'Em triagem',
    },
    {
      id: 'step-3',
      title: '3. Qualidade',
      actor: 'Auditoria QA',
      isCompleted:
        status === 'APROVADO_QUALIDADE' || status === 'REPROVADO_QUALIDADE',
      isActive:
        status === 'APROVADO_ANALISTA' ||
        status === 'REPROVADO_ANALISTA' ||
        status === 'EM_CONTESTACAO_QUALIDADE',
      sublabel:
        status === 'APROVADO_ANALISTA'
          ? 'Análise de erro'
          : status === 'REPROVADO_ANALISTA'
          ? 'Parecer final'
          : undefined,
    },
    {
      id: 'step-4',
      title: '4. Conclusão',
      actor: 'Final',
      isCompleted:
        status === 'APROVADO_QUALIDADE' || status === 'REPROVADO_QUALIDADE',
      isActive: false,
      isSuccess: status === 'APROVADO_QUALIDADE',
      isRejected: status === 'REPROVADO_QUALIDADE',
    },
  ];

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
        <span>Ciclo de Vida do Chamado</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {steps.map((step, idx) => {
          let bgClass = 'bg-white border-slate-200 text-slate-600';
          let indicatorClass = 'bg-slate-300 text-slate-600';

          if (step.isActive) {
            bgClass = 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-xs';
            indicatorClass = 'bg-blue-600 text-white';
          } else if (step.isCompleted) {
            if (step.isRejected) {
              bgClass = 'bg-rose-50 border-rose-200 text-rose-900';
              indicatorClass = 'bg-rose-600 text-white';
            } else {
              bgClass = 'bg-emerald-50 border-emerald-200 text-emerald-900';
              indicatorClass = 'bg-emerald-600 text-white';
            }
          } else if (step.isSkipped) {
            bgClass = 'bg-slate-100 border-dashed border-slate-200 text-slate-400';
            indicatorClass = 'bg-slate-200 text-slate-400';
          }

          return (
            <div
              key={step.id}
              className={`flex flex-col p-2 rounded-md border ${bgClass} transition-all`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${indicatorClass}`}
                >
                  {idx + 1}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  {step.actor}
                </span>
              </div>
              <span className="text-xs font-semibold truncate">{step.title}</span>
              {step.sublabel && (
                <span className="text-[10px] text-amber-700 font-medium">
                  {step.sublabel}
                </span>
              )}
              {step.isSkipped && (
                <span className="text-[10px] text-slate-400 italic">
                  Ignorado (Aprovado direto)
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
