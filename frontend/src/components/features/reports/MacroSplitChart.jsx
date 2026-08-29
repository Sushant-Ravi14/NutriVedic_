import React from 'react';
import { Card } from '../../ui/Card';

export const MacroSplitChart = ({ split = {} }) => {
  const carbsVal = Number(split?.carbsPct ?? split?.carbs ?? 50);
  const proteinVal = Number(split?.proteinPct ?? split?.protein ?? 25);
  const fatVal = Number(split?.fatPct ?? split?.fat ?? 25);

  const total = carbsVal + proteinVal + fatVal || 100;
  const carbsPct = Math.round((carbsVal / total) * 100);
  const proteinPct = Math.round((proteinVal / total) * 100);
  const fatPct = Math.max(0, 100 - carbsPct - proteinPct);

  return (
    <Card className="flex flex-col justify-between w-full h-full min-h-[260px]">
      <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label mb-4">
        MACRO RATIO DISTRIBUTION
      </span>

      {/* Stacked Horizontal Bar */}
      <div className="my-6">
        <div className="w-full h-7 rounded-lg overflow-hidden flex border border-border bg-surface">
          {carbsPct > 0 && (
            <div
              className="h-full bg-black flex items-center justify-center font-mono text-[10px] text-white transition-all duration-500 min-w-[20px]"
              style={{ width: `${carbsPct}%` }}
              title={`Carbs ${carbsPct}%`}
            >
              {carbsPct >= 10 ? `${carbsPct}%` : ''}
            </div>
          )}
          {proteinPct > 0 && (
            <div
              className="h-full bg-[#6b6b6b] flex items-center justify-center font-mono text-[10px] text-white transition-all duration-500 min-w-[20px]"
              style={{ width: `${proteinPct}%` }}
              title={`Protein ${proteinPct}%`}
            >
              {proteinPct >= 10 ? `${proteinPct}%` : ''}
            </div>
          )}
          {fatPct > 0 && (
            <div
              className="h-full bg-[#9e9e9e] flex items-center justify-center font-mono text-[10px] text-white transition-all duration-500 min-w-[20px]"
              style={{ width: `${fatPct}%` }}
              title={`Fat ${fatPct}%`}
            >
              {fatPct >= 10 ? `${fatPct}%` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-black shrink-0" />
          <span className="truncate">Carbs ({carbsPct}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#6b6b6b] shrink-0" />
          <span className="truncate">Protein ({proteinPct}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#9e9e9e] shrink-0" />
          <span className="truncate">Fat ({fatPct}%)</span>
        </div>
      </div>
    </Card>
  );
};
