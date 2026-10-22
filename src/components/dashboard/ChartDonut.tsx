import React, { useState } from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  textColor?: string;
}

interface ChartDonutProps {
  title: string;
  subtitle?: string;
  data: DonutSegment[];
  totalLabel?: string;
  size?: number;
  donutThickness?: number;
}

export const ChartDonut: React.FC<ChartDonutProps> = ({
  title,
  subtitle,
  data,
  totalLabel = 'Total',
  size = 200,
  donutThickness = 28,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  // SVG arc math
  const radius = size / 2;
  const innerRadius = radius - donutThickness;
  const center = radius;

  // Generate SVG path for each arc
  let accumulatedAngle = -90; // Start at top

  const segments = data.map((seg, idx) => {
    if (total === 0 || seg.value === 0) {
      return { ...seg, path: '', startAngle: 0, endAngle: 0, percentage: 0 };
    }

    const angle = (seg.value / total) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    // Convert polar coordinates to cartesian
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    // SVG path string: outer arc + line to inner + inner arc reverse + close
    const path = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    const percentage = Math.round((seg.value / total) * 100);

    return {
      ...seg,
      path,
      startAngle,
      endAngle,
      percentage,
    };
  });

  const activeSegment = hoveredIndex !== null ? segments[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-200 mb-3 flex items-center justify-center">
            <span className="text-xs font-semibold">Sem dados</span>
          </div>
          <span className="text-xs text-slate-500">Nenhum chamado registrado para este filtro</span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Donut graphic */}
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform transition-transform duration-200"
            >
              {segments.map((seg, idx) => {
                if (!seg.path) return null;
                const isHovered = hoveredIndex === idx;
                return (
                  <path
                    key={idx}
                    d={seg.path}
                    fill={seg.color}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      opacity: hoveredIndex === null || isHovered ? 1 : 0.45,
                      transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                      transformOrigin: `${center}px ${center}px`,
                      filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                    }}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Center metric */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4"
              style={{
                width: innerRadius * 2,
                height: innerRadius * 2,
                top: center - innerRadius,
                left: center - innerRadius,
              }}
            >
              {activeSegment ? (
                <>
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    {activeSegment.value}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 line-clamp-1">
                    {activeSegment.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium tabular-nums">
                    {activeSegment.percentage}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    {total}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {totalLabel}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Legend and breakdown list */}
          <div className="flex-1 w-full space-y-2">
            {segments.map((seg, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    isHovered ? 'bg-slate-50 ring-1 ring-slate-200' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span
                      className={`truncate font-medium ${
                        isHovered ? 'text-slate-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      {seg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 tabular-nums">
                    <span className="font-bold text-slate-900">{seg.value}</span>
                    <span className="text-[11px] text-slate-400 font-medium w-9 text-right">
                      {seg.percentage}%
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
