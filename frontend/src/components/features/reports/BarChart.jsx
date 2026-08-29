import React from 'react';
import { Card } from '../../ui/Card';

export const BarChart = ({ data = [], target = 2000 }) => {
  const targetKcal = target || 2000;
  const maxDataKcal = Math.max(...data.map(d => Number(d.calories ?? d.kcal ?? 0)), 0);
  const maxKcal = Math.max(targetKcal * 1.25, maxDataKcal * 1.15, 2000);

  return (
    <Card className="flex flex-col justify-between w-full h-full min-h-[260px]">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          WEEKLY INTAKE VS TARGET
        </span>
        <span className="font-mono text-[11px] text-muted">Target: {targetKcal.toLocaleString()} kcal</span>
      </div>

      {/* Chart container */}
      <div className="relative flex-1 flex items-end justify-between gap-2 pt-8 pb-2 border-b border-border min-h-[160px]">
        {/* Dashed Target Line */}
        <div
          className="absolute left-0 right-0 border-b border-dashed border-black/40 z-10 flex items-center justify-end"
          style={{ bottom: `${Math.min(Math.max((targetKcal / maxKcal) * 100, 10), 90)}%` }}
        >
          <span className="font-mono text-[9px] bg-black text-white px-1.5 py-0.5 rounded -mr-2">
            Target
          </span>
        </div>

        {data.map((item) => {
          const val = Number(item.calories ?? item.kcal ?? 0);
          const itemTarget = Number(item.target || targetKcal);
          const heightPct = val > 0 ? Math.min(Math.max((val / maxKcal) * 100, 4), 100) : 2;
          const isTargetMet = val >= itemTarget * 0.85 && val <= itemTarget * 1.15;

          return (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group z-20">
              <span className="font-mono text-[10px] text-black opacity-0 group-hover:opacity-100 transition-opacity">
                {val > 0 ? `${val}` : ''}
              </span>
              <div
                className={`w-full max-w-[28px] rounded-t transition-all duration-500 ${
                  val === 0 ? 'bg-[#f0f0f0]' : isTargetMet ? 'bg-black' : val > itemTarget ? 'bg-amber-600' : 'bg-[#a3a3a3]'
                }`}
                style={{ height: `${heightPct}%` }}
                title={`${item.day}: ${val} kcal`}
              />
              <span className="font-mono text-[11px] text-muted mt-1">{item.day}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
