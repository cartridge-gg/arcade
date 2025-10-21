import { NotificationsView } from "@/components/ui/notifications/NotificationsView";
import { useNotificationsViewModel } from "./useNotificationsViewModel";

export const NotificationsContainer = () => {
  const viewModel = useNotificationsViewModel();
  return <NotificationsView {...viewModel} />;
};
