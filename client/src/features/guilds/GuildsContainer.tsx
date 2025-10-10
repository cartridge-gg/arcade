import { Empty } from "@cartridge/ui";
import { useGuildsViewModel } from "./useGuildsViewModel";

export const GuildsContainer = () => {
  const viewModel = useGuildsViewModel();
  return (
    <Empty
      title={viewModel.messageTitle}
      icon={viewModel.messageIcon}
      className="h-full py-3 lg:py-6"
    />
  );
};
