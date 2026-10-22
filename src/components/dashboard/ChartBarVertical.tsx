import React from 'react';

export interface BarVerticalItem {
  id: string;
  label: string;
  value: number;
  color: string;
  sublabel?: string;
}

interface ChartBarVerticalProps {
  title: string;
  subtitle?: string;
  items: BarVerticalItem[];
  emptyText?: string;
  height?: number;
}

export const ChartBarVertical: React.FC<ChartBarVerticalProps> = ({
  title,
  subtitle,
  items,
  emptyText = 'Nenhum dado registrado',
  height = 180,
}) => {
  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const total = items.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {total === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          {emptyText}
        </div>
      ) : (
        <div>
          {/* Chart area */}
          <div
            className="flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100"
            style={{ height }}
          >
            {items.map((item) => {
              const heightPercent = Math.max(Math.round((item.value / maxValue) * 100), 6);
              return (
                <div
                  key={item.id}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 bg-slate-900 text-white text-[10px] rounded-md font-semibold pointer-events-none whitespace-nowrap shadow-xs z-10">
                    {item.label}: {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                  </div>

                  {/* Value above bar */}
                  <span className="text-[11px] font-bold text-slate-700 mb-1 tabular-nums">
                    {item.value}
                  </span>

                  {/* Vertical bar */}
                  <div className="w-full max-w-[40px] bg-slate-100 rounded-t-md overflow-hidden flex items-end h-full">
                    <div
                      className="w-full rounded-t-md transition-all duration-500 group-hover:brightness-95"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Labels underneath */}
          <div className="flex items-center justify-between gap-3 px-2 pt-2 text-center">
            {items.map((item) => (
              <div key={item.id} className="flex-1 min-w-0">
                <span
                  className="block text-[11px] font-medium text-slate-600 truncate"
                  title={item.label}
                >
                  {item.label}
                </span>
                {item.sublabel && (
                  <span className="block text-[10px] text-slate-400 truncate">
                    {item.sublabel}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
