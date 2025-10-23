import type { NotificationsViewModel } from "@/features/notifications/useNotificationsViewModel";
import { BellIcon } from "@cartridge/ui";

export const NotificationsView = ({
  disabled,
  notifications,
  unreadCount,
  onNotificationClick,
}: NotificationsViewModel) => {
  if (disabled) return null;
  return (
    <div className="relative">
      <button
        disabled={disabled}
        className="relative p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        <span className="text-lg">
          <BellIcon variant="solid" />
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => onNotificationClick(notification.id)}
              className="p-3 border-b hover:bg-gray-50 cursor-pointer"
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
