import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { PWAInstallBanner } from '../components/layout/PWAInstallBanner';
import { CalorieCard } from '../components/features/dashboard/CalorieCard';
import { MacrosCard } from '../components/features/dashboard/MacrosCard';
import { WaterTracker } from '../components/features/dashboard/WaterTracker';
import { StreakCard } from '../components/features/dashboard/StreakCard';
import { MealSlots } from '../components/features/dashboard/MealSlots';
import { DietPlanPreview } from '../components/features/dashboard/DietPlanPreview';
import { useAuthStore } from '../store/authStore';
import { useLogsByDate, useUpdateWater } from '../hooks/useFoodLog';
import { useCurrentPlan } from '../hooks/useDietPlan';
import { formatDate, formatISODate } from '../utils/formatters';
import { calculateMacros } from '../utils/calculations';

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const today = formatISODate();

  const { data: foodLog } = useLogsByDate(today);
  const { data: currentPlan } = useCurrentPlan();
  const updateWaterMutation = useUpdateWater();

  const mealsList = foodLog?.meals || [];
  
  // Calculate total consumed calories directly from logged meal items as primary source of truth
  const totalConsumedFromMeals = mealsList.reduce((slotAcc, slot) => {
    return slotAcc + (slot.items || []).reduce((itemAcc, item) => itemAcc + (Number(item.calories) || 0), 0);
  }, 0);

  const totalProteinFromMeals = mealsList.reduce((slotAcc, slot) => {
    return slotAcc + (slot.items || []).reduce((itemAcc, item) => itemAcc + (Number(item.protein) || 0), 0);
  }, 0);

  const totalCarbsFromMeals = mealsList.reduce((slotAcc, slot) => {
    return slotAcc + (slot.items || []).reduce((itemAcc, item) => itemAcc + (Number(item.carbs) || 0), 0);
  }, 0);

  const totalFatFromMeals = mealsList.reduce((slotAcc, slot) => {
    return slotAcc + (slot.items || []).reduce((itemAcc, item) => itemAcc + (Number(item.fat) || 0), 0);
  }, 0);

  const totalFiberFromMeals = mealsList.reduce((slotAcc, slot) => {
    return slotAcc + (slot.items || []).reduce((itemAcc, item) => itemAcc + (Number(item.fiber) || 0), 0);
  }, 0);

  const targetKcal = Number(foodLog?.summary?.targetCalories || profile?.targetKcal || profile?.targetCalories || 2000);
  const calculatedMacros = calculateMacros(targetKcal);

  // Consumed values prefer direct meal sums, fallback to summary
  const consumedCalories = totalConsumedFromMeals > 0 
    ? Math.round(totalConsumedFromMeals) 
    : Math.round(foodLog?.summary?.totalCalories || 0);

  const summary = {
    consumedKcal: consumedCalories,
    targetKcal,
    protein: totalProteinFromMeals > 0 ? Math.round(totalProteinFromMeals) : Math.round(foodLog?.summary?.totalProtein || 0),
    targetProtein: profile?.proteinTargetG || calculatedMacros.protein,
    carbs: totalCarbsFromMeals > 0 ? Math.round(totalCarbsFromMeals) : Math.round(foodLog?.summary?.totalCarbs || 0),
    targetCarbs: profile?.carbTargetG || calculatedMacros.carbs,
    fat: totalFatFromMeals > 0 ? Math.round(totalFatFromMeals) : Math.round(foodLog?.summary?.totalFat || 0),
    targetFat: profile?.fatTargetG || calculatedMacros.fat,
    fiber: totalFiberFromMeals > 0 ? Math.round(totalFiberFromMeals) : Math.round(foodLog?.summary?.totalFiber || 0),
    targetFiber: profile?.fiberTargetG || calculatedMacros.fiber,
    waterGlasses: foodLog?.summary?.waterGlasses || 0,
    streak: foodLog?.summary?.streak || 0
  };

  const handleWaterToggle = (newGlasses) => {
    updateWaterMutation.mutate(newGlasses);
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <PageWrapper>
      <PWAInstallBanner />

      {/* Greeting Header */}
      <div className="mb-8">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label block mb-1">
          {formatDate(new Date())}
        </span>
        <h1 className="font-serif text-[32px] font-bold text-black">
          {greeting}, {user?.firstName || 'User'}.
        </h1>
      </div>

      {/* 3-Column Grid on Desktop / 1-Column Stacked on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <CalorieCard consumed={summary.consumedKcal} target={summary.targetKcal} />

        <MacrosCard
          protein={{ current: summary.protein, target: summary.targetProtein }}
          carbs={{ current: summary.carbs, target: summary.targetCarbs }}
          fat={{ current: summary.fat, target: summary.targetFat }}
          fiber={{ current: summary.fiber, target: summary.targetFiber }}
        />

        <div className="flex flex-col gap-6">
          <WaterTracker
            glasses={summary.waterGlasses}
            onToggleGlass={handleWaterToggle}
            userWeight={profile?.weightKg || profile?.weight || 70}
          />
          <StreakCard streak={summary.streak} />
        </div>
      </div>

      {/* Diet Plan Banner Preview */}
      <div className="mb-8">
        <DietPlanPreview plan={currentPlan} />
      </div>

      {/* Full-width Meal Slots Grid */}
      <MealSlots meals={foodLog?.meals || []} />
    </PageWrapper>
  );
};
