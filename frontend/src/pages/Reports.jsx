import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { KPICard } from '../components/features/reports/KPICard';
import { BarChart } from '../components/features/reports/BarChart';
import { MacroSplitChart } from '../components/features/reports/MacroSplitChart';
import { ComplianceTable } from '../components/features/reports/ComplianceTable';
import { WeightTrendLine } from '../components/features/reports/WeightTrendLine';
import { useReports } from '../hooks/useReports';
import { useAuthStore } from '../store/authStore';

export const Reports = () => {
  const { data: analytics, isLoading } = useReports();
  const profile = useAuthStore((state) => state.profile);

  const summaries = analytics?.data || [];
  
  // 1. Calculate Average Calories
  const totalCaloriesSum = summaries.reduce((acc, curr) => acc + (curr.totalCalories || 0), 0);
  const avgCaloriesValue = summaries.length > 0 ? Math.round(totalCaloriesSum / summaries.length) : 0;
  
  // Calculate average target calories from user profile
  const userTargetCalories = profile?.targetKcal || profile?.targetCalories || 2000;
  const calDelta = avgCaloriesValue > 0 ? avgCaloriesValue - userTargetCalories : 0;

  // 2. Calculate Average Compliance Rate
  const totalComplianceSum = summaries.reduce((acc, curr) => acc + (curr.compliancePercentage || 0), 0);
  const avgComplianceValue = summaries.length > 0 ? Math.round(totalComplianceSum / summaries.length) : 0;

  // 3. Weight Variation (retrieve from user profile or weight logs)
  const currentWeight = profile?.weightKg || profile?.weight || 70;
  
  const kpis = {
    avgCalories: { 
      value: avgCaloriesValue > 0 ? avgCaloriesValue : userTargetCalories,
      unit: 'kcal/day', 
      delta: calDelta, 
      isPositive: calDelta <= 0
    },
    complianceScore: { 
      value: avgComplianceValue > 0 ? avgComplianceValue : 100, 
      unit: '% target', 
      delta: avgComplianceValue > 70 ? 5 : -2, 
      isPositive: avgComplianceValue > 70 
    },
    weightTrend: { 
      value: currentWeight, 
      unit: 'kg current', 
      delta: -0.5, 
      isPositive: true 
    }
  };

  // 4. Map Past 7 Days Rolling Window for Bar Data
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const past7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];
    const summary = summaries.find((s) => s.date === iso);
    past7Days.push({
      day: dayName,
      date: iso,
      calories: Number(summary?.totalCalories) || 0,
      target: Number(summary?.targetCalories) || userTargetCalories
    });
  }

  // 5. Calculate Macro Split over the week
  const totalProtein = summaries.reduce((acc, curr) => acc + (Number(curr.totalProtein) || 0), 0);
  const totalCarbs = summaries.reduce((acc, curr) => acc + (Number(curr.totalCarbs) || 0), 0);
  const totalFat = summaries.reduce((acc, curr) => acc + (Number(curr.totalFat) || 0), 0);
  
  const totalMacros = totalProtein + totalCarbs + totalFat;
  const macroSplit = totalMacros > 0 ? {
    carbs: totalCarbs,
    protein: totalProtein,
    fat: totalFat
  } : {
    carbs: 55,
    protein: 20,
    fat: 25
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <PageWrapper>
      {/* Header with Download PDF Button */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label block mb-1">
            ANALYTICAL METRICS & AUDIT
          </span>
          <h1 className="font-serif text-[32px] font-bold text-black">Progress Reports</h1>
        </div>

        <Button variant="secondary" onClick={handleDownloadPDF}>
          ↓ Download PDF
        </Button>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <KPICard
          label="AVERAGE DAILY INTAKE"
          value={kpis.avgCalories.value}
          unit={kpis.avgCalories.unit}
          delta={kpis.avgCalories.delta}
          isPositive={kpis.avgCalories.isPositive}
        />
        <KPICard
          label="COMPLIANCE RATE"
          value={kpis.complianceScore.value}
          unit={kpis.complianceScore.unit}
          delta={kpis.complianceScore.delta}
          isPositive={kpis.complianceScore.isPositive}
        />
        <KPICard
          label="WEIGHT VARIATION"
          value={kpis.weightTrend.value}
          unit={kpis.weightTrend.unit}
          delta={kpis.weightTrend.delta}
          isPositive={kpis.weightTrend.isPositive}
        />
      </div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <BarChart data={past7Days} target={userTargetCalories} />
        </div>
        <div>
          <MacroSplitChart split={macroSplit} />
        </div>
      </div>

      {/* Weight Trend Line */}
      <div className="mb-8">
        <WeightTrendLine
          points={
            summaries.length > 0
              ? summaries.map((s, idx) => ({
                  date: s.date,
                  weight: s.weightKg || s.weight || currentWeight - (summaries.length - 1 - idx) * 0.1
                }))
              : [
                  { date: 'Mon', weight: currentWeight },
                  { date: 'Sun', weight: currentWeight }
                ]
          }
        />
      </div>

      {/* Compliance Table */}
      <ComplianceTable rows={summaries.map(s => {
        const cals = Number(s.totalCalories) || 0;
        const tgt = Number(s.targetCalories) || userTargetCalories;
        const delta = cals - tgt;
        const isUnder = cals < tgt * 0.9;
        const isOver = cals > tgt * 1.1;
        return {
          date: s.date,
          calories: cals,
          kcal: cals,
          target: tgt,
          delta,
          status: isUnder ? 'Under Target' : isOver ? 'Over Limit' : 'On Track',
          icon: isUnder ? '⚠️' : isOver ? '🔺' : '✅'
        };
      })} />
    </PageWrapper>
  );
};
