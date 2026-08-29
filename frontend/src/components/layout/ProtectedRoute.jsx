import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const ProtectedRoute = ({ children, requiresProfile = true }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const hasCompleteProfile = Boolean(
    profile && (profile.age || profile.weightKg || profile.weight || profile.heightCm || profile.height || profile.targetKcal || profile.targetCalories)
  );

  if (requiresProfile && !hasCompleteProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};
