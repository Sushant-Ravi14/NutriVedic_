import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { showLocalNotification } from '../utils/pwaUtils';
import { addLocalNotification } from '../api/notifications.api';

export const useHydrationReminder = () => {
  const addToast = useUIStore((state) => state.addToast);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    let intervalId = null;

    const checkAndTriggerReminder = () => {
      const isEnabled = localStorage.getItem('nutrivedic_water_reminder') === 'true';
      const intervalMinutes = parseFloat(localStorage.getItem('nutrivedic_water_interval') || '30');
      const lastTriggered = parseInt(localStorage.getItem('nutrivedic_last_water_reminder') || '0', 10);
      const now = Date.now();
      const intervalMs = intervalMinutes * 60 * 1000;

      if (isEnabled && lastTriggered > 0 && now - lastTriggered >= intervalMs) {
        localStorage.setItem('nutrivedic_last_water_reminder', now.toString());

        const title = '💧 Hydration Reminder';
        const msg = 'Time to drink at least 500ml of water! Staying hydrated keeps your body healthy and energized.';

        // 1. Add to In-App Message Box (/notifications)
        addLocalNotification(title, msg);
        queryClient.invalidateQueries(['notifications']);

        // 2. Show In-App Toast
        addToast('💧 Reminder: Drink at least 500ml of water!', 'info');

        // 3. Show Local Native Desktop Notification (if permitted)
        showLocalNotification(title, {
          body: msg,
          icon: '/icons/icon-192.png'
        });
      }
    };

    intervalId = setInterval(checkAndTriggerReminder, 5000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, addToast, queryClient]);
};
