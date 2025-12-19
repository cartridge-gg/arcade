import { DashboardView } from "@/components/ui/dashboard/DashboardView";
import { useDashboardViewModel } from "./useDashboardViewModel";

export const DashboardContainer = () => {
  const viewModel = useDashboardViewModel();
  return <DashboardView {...viewModel} />;
};
