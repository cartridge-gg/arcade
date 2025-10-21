import { NavigationView } from "@/components/ui/navigation/NavigationView";
import { useNavigationViewModel } from "./useNavigationViewModel";

export const NavigationContainer = () => {
  const viewModel = useNavigationViewModel();
  return <NavigationView {...viewModel} />;
};
