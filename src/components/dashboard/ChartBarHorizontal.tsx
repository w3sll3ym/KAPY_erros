import React from 'react';

export interface BarHorizontalItem {
  id: string;
  label: string;
  value: number;
  sublabel?: string;
  color?: string;
  badge?: string;
  onClick?: () => void;
}

interface ChartBarHorizontalProps {
  title: string;
  subtitle?: string;
  items: BarHorizontalItem[];
  emptyText?: string;
  maxBars?: number;
  showPercent?: boolean;
}

export const ChartBarHorizontal: React.FC<ChartBarHorizontalProps> = ({
  title,
  subtitle,
  items,
  emptyText = 'Nenhum dado registrado',
  maxBars = 5,
  showPercent = true,
}) => {
  const displayItems = items.slice(0, maxBars);
  const maxValue = Math.max(...displayItems.map((i) => i.value), 1);
  const totalValue = items.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {totalValue > 0 && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md tabular-nums">
            {totalValue} total
          </span>
        )}
      </div>

      {displayItems.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-xs">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayItems.map((item, index) => {
            const percentage = Math.round((item.value / (totalValue || 1)) * 100);
            const barWidthPercent = Math.max(Math.round((item.value / maxValue) * 100), 4);
            const barColor = item.color || '#3b82f6';

            return (
              <div
                key={item.id || index}
                onClick={item.onClick}
                className={`group ${item.onClick ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-semibold text-slate-400 tabular-nums w-4">
                      {index + 1}.
                    </span>
                    <span
                      className="font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors"
                      title={item.label}
                    >
                      {item.label}
                    </span>
                    {item.sublabel && (
                      <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                        · {item.sublabel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 tabular-nums">
                    <span className="font-bold text-slate-900">{item.value}</span>
                    {showPercent && (
                      <span className="text-[10px] font-medium text-slate-400 w-9 text-right">
                        {percentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar Track */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 group-hover:opacity-90"
                    style={{
                      width: `${barWidthPercent}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
