/**
 * PWA Utility Functions
 */
export const isStandalone = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone ||
    document.referrer.includes('android-app://')
  );
};

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW registered successfully:', reg.scope))
        .catch((err) => console.warn('SW registration failed:', err));
    });
  }
};

/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications.');
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  const permission = await Notification.requestPermission();
  return permission;
};

/**
 * Trigger local browser notification immediately or via SW
 */
export const showLocalNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const defaultOptions = {
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    ...options
  };

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, defaultOptions);
    });
  } else {
    new Notification(title, defaultOptions);
  }
  return true;
};

let waterReminderInterval = null;

/**
 * Schedule recurring or demo water hydration reminder
 */
export const startWaterReminder = (minutes = 30, callback) => {
  if (waterReminderInterval) {
    clearInterval(waterReminderInterval);
  }

  const ms = minutes * 60 * 1000;
  waterReminderInterval = setInterval(() => {
    showLocalNotification('💧 NutriVedic Hydration Reminder', {
      body: 'Time to hydrate! Drink at least 500ml of water to stay fresh, focused, and energized.',
      tag: 'water-reminder'
    });
    if (callback) callback();
  }, ms);

  return waterReminderInterval;
};

export const stopWaterReminder = () => {
  if (waterReminderInterval) {
    clearInterval(waterReminderInterval);
    waterReminderInterval = null;
  }
};
