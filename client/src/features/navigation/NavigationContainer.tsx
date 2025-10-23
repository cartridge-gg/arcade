import { NavigationView } from "@/components/ui/navigation/NavigationView";
import { useNavigationContext } from "./useNavigationContext";

export const NavigationContainer = () => {
  const viewModel = useNavigationContext();
  return <NavigationView {...viewModel} />;
};
