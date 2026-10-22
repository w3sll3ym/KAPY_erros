import React from 'react';
import { TicketSeverity } from '../../types/workflow';

interface SeverityDistributionProps {
  counts: Record<TicketSeverity, number>;
  total: number;
  title?: string;
  subtitle?: string;
}

const SEVERITY_INFO: Record<
  TicketSeverity,
  { label: string; color: string; bgBadge: string; textBadge: string }
> = {
  CRITICA: {
    label: 'Crítica',
    color: '#e11d48', // rose-600
    bgBadge: 'bg-rose-50 border-rose-200',
    textBadge: 'text-rose-700',
  },
  ALTA: {
    label: 'Alta',
    color: '#ea580c', // orange-600
    bgBadge: 'bg-orange-50 border-orange-200',
    textBadge: 'text-orange-700',
  },
  MEDIA: {
    label: 'Média',
    color: '#0284c7', // sky-600
    bgBadge: 'bg-sky-50 border-sky-200',
    textBadge: 'text-sky-700',
  },
  BAIXA: {
    label: 'Baixa',
    color: '#64748b', // slate-500
    bgBadge: 'bg-slate-50 border-slate-200',
    textBadge: 'text-slate-700',
  },
};

export const ChartSeverityDistribution: React.FC<SeverityDistributionProps> = ({
  counts,
  total,
  title = 'Distribuição por Nível de Severidade',
  subtitle = 'Impacto operacional dos erros reportados',
}) => {
  const severities: TicketSeverity[] = ['CRITICA', 'ALTA', 'MEDIA', 'BAIXA'];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md tabular-nums">
          {total} chamados
        </span>
      </div>

      {total === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          Nenhum chamado para cálculo de severidade
        </div>
      ) : (
        <div>
          {/* Segmented multi-colored bar */}
          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-4 shadow-inner">
            {severities.map((sev) => {
              const val = counts[sev] || 0;
              const percent = (val / total) * 100;
              if (val === 0) return null;
              return (
                <div
                  key={sev}
                  className="h-full transition-all duration-500 relative group cursor-pointer"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: SEVERITY_INFO[sev].color,
                  }}
                  title={`${SEVERITY_INFO[sev].label}: ${val} (${Math.round(percent)}%)`}
                />
              );
            })}
          </div>

          {/* Cards for each severity */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {severities.map((sev) => {
              const val = counts[sev] || 0;
              const percent = total > 0 ? Math.round((val / total) * 100) : 0;
              const info = SEVERITY_INFO[sev];

              return (
                <div
                  key={sev}
                  className={`p-2.5 rounded-lg border ${info.bgBadge} flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-bold ${info.textBadge}`}>
                      {info.label}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                      {val}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 tabular-nums">
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
