import React from 'react';

export const ComplianceTable = ({ rows = [] }) => {
  return (
    <div className="w-full border border-border rounded-card overflow-hidden bg-white">
      <div className="p-4 border-b border-border bg-surface">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          DAILY DIET COMPLIANCE LOG
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-[12px]">
          <thead>
            <tr className="border-b border-border text-label text-[10px] uppercase">
              <th className="py-3 px-4 font-normal">Date</th>
              <th className="py-3 px-4 font-normal">Status</th>
              <th className="py-3 px-4 font-normal">Calories</th>
              <th className="py-3 px-4 font-normal text-right">Delta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const cals = Number(row.kcal ?? row.calories ?? 0);
              const target = Number(row.target ?? 2000);
              const delta = row.delta !== undefined ? Number(row.delta) : (cals - target);
              const statusText = row.status || (cals >= target * 0.9 && cals <= target * 1.1 ? 'On Track' : cals < target ? 'Under Target' : 'Over Limit');
              const icon = row.icon || (statusText.toLowerCase().includes('on track') ? '✅' : statusText.toLowerCase().includes('under') ? '⚠️' : '🔺');

              return (
                <tr key={row.date || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-surface'}>
                  <td className="py-3 px-4 font-medium text-black">{row.date}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 font-sans text-[12px]">
                      <span>{icon}</span>
                      <span>{statusText}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-black font-medium">{cals.toLocaleString()} kcal</td>
                  <td className={`py-3 px-4 text-right ${delta <= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {delta > 0 ? `▲ +${delta.toLocaleString()}` : delta < 0 ? `▼ ${delta.toLocaleString()}` : `✓ 0`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
