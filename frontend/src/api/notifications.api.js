import client from './client';

export const getLocalNotifications = () => {
  try {
    const raw = localStorage.getItem('nutrivedic_local_notifications');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addLocalNotification = (title, message) => {
  const list = getLocalNotifications();
  const newItem = {
    id: 'local_' + Date.now(),
    title: title || '💧 Hydration Reminder',
    message: message || 'Drink at least 500ml of water to stay hydrated!',
    unread: true,
    time: 'Just now',
    createdAt: new Date().toISOString()
  };
  const updated = [newItem, ...list].slice(0, 30);
  localStorage.setItem('nutrivedic_local_notifications', JSON.stringify(updated));
  return newItem;
};

export const getNotificationsApi = async () => {
  const localList = getLocalNotifications();
  let serverList = [];
  try {
    const res = await client.get('/api/notifications');
    const list = res.data?.data || res.data || [];
    serverList = list.map((item) => ({
      id: item._id,
      title: item.title || 'System Alert',
      message: item.message || '',
      unread: !item.read,
      time: item.createdAt 
        ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : 'Just now'
    }));
  } catch (e) {
    // offline or error, fallback to local notifications
  }
  return [...localList, ...serverList];
};

export const markNotificationReadApi = async (id) => {
  if (typeof id === 'string' && id.startsWith('local_')) {
    const list = getLocalNotifications().map((n) =>
      n.id === id ? { ...n, unread: false } : n
    );
    localStorage.setItem('nutrivedic_local_notifications', JSON.stringify(list));
    return { success: true };
  }
  try {
    const res = await client.put(`/api/notifications/${id}/read`);
    return res.data;
  } catch (e) {
    return { success: true };
  }
};

export const markAllNotificationsReadApi = async () => {
  const list = getLocalNotifications().map((n) => ({ ...n, unread: false }));
  localStorage.setItem('nutrivedic_local_notifications', JSON.stringify(list));
  try {
    const res = await client.put('/api/notifications/read-all');
    return res.data;
  } catch (e) {
    return { success: true };
  }
};

export const deleteNotificationApi = async (id) => {
  if (typeof id === 'string' && id.startsWith('local_')) {
    const list = getLocalNotifications().filter((n) => n.id !== id);
    localStorage.setItem('nutrivedic_local_notifications', JSON.stringify(list));
    return { success: true };
  }
  try {
    const res = await client.delete(`/api/notifications/${id}`);
    return res.data;
  } catch (e) {
    return { success: true };
  }
};
