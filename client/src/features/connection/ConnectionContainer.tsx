import { useConnectionViewModel } from "./useConnectionViewModel";
import { ConnectionView } from "@/components/ui/connection/ConnectionView";

export const ConnectionContainer = () => {
  const viewModel = useConnectionViewModel();
  return <ConnectionView {...viewModel} />;
};
