import { ConnectionContainer } from "@/features/connection";
import { useErrorsViewModel } from "./useErrorsViewModel";
import { ConnectView } from "@/components/ui/errors/ConnectView";

export const ConnectContainer = ({ className }: { className?: string }) => {
  const viewModel = useErrorsViewModel();
  return (
    <ConnectView
      className={className}
      connection={<ConnectionContainer />}
      {...viewModel}
    />
  );
};
