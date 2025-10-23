import { NotificationsView } from "@/components/ui/notifications/NotificationsView";
import { useNotificationsViewModel } from "./useNotificationsViewModel";

export const NotificationsContainer = () => {
  const viewModel = useNotificationsViewModel(true);
  return <NotificationsView {...viewModel} />;
};
