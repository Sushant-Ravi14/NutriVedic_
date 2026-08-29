import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export const NotesCard = ({ notes, conditions = [], preferFoods = [], avoidFoods = [] }) => {
  return (
    <Card className="w-full">
      <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label block mb-2">
        AYURVEDIC GUIDANCE & THERAPEUTIC NOTES
      </span>

      <p className="font-sans text-[14px] text-black/80 leading-relaxed mb-6">
        {notes || 'Ensure 3 liters of warm water intake throughout the day. Avoid refined sugar and excessive salt after 8 PM.'}
      </p>

      {/* Prefer / Avoid Foods Grid */}
      {(preferFoods.length > 0 || avoidFoods.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
          {preferFoods.length > 0 && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg">
              <span className="font-mono text-[11px] uppercase text-emerald-800 font-bold block mb-2">
                ✓ RECOMMENDED FOODS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {preferFoods.map((f) => (
                  <span key={f} className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-900 rounded-md text-xs font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {avoidFoods.length > 0 && (
            <div className="p-4 bg-red-50/60 border border-red-200 rounded-lg">
              <span className="font-mono text-[11px] uppercase text-red-800 font-bold block mb-2">
                ✕ FOODS TO AVOID / LIMIT
              </span>
              <div className="flex flex-wrap gap-1.5">
                {avoidFoods.map((f) => (
                  <span key={f} className="px-2.5 py-1 bg-white border border-red-200 text-red-900 rounded-md text-xs font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {conditions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] text-label uppercase">Tailored for:</span>
          {conditions.map((cond) => (
            <Badge key={cond} variant="dark">
              {cond}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
};
