import { useCallback, useState } from "react";

export interface NotificationsViewModel {
  disabled: boolean;
  notifications: Array<{ id: string; message: string }>;
  unreadCount: number;
  onNotificationClick: (id: string) => void;
}

export function useNotificationsViewModel(
  disabled = false,
): NotificationsViewModel {
  const [notifications] = useState<Array<{ id: string; message: string }>>([]);
  const [unreadCount] = useState(0);

  const onNotificationClick = useCallback((id: string) => {
    console.log("Notification clicked:", id);
  }, []);

  return {
    disabled,
    notifications,
    unreadCount,
    onNotificationClick,
  } satisfies NotificationsViewModel;
}
