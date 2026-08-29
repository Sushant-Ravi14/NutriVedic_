import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotificationsApi, markNotificationReadApi } from '../api/notifications.api';

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const query = useQuery(['notifications'], getNotificationsApi, {
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationReadApi,
    onSuccess: (_, id) => {
      queryClient.setQueryData(['notifications'], (old) =>
        old ? old.map((n) => (n.id === id ? { ...n, unread: false } : n)) : []
      );
    }
  });

  return {
    ...query,
    markAsRead: markReadMutation.mutate
  };
};
