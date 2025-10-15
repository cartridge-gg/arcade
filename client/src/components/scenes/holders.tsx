import { MarketplaceHoldersContainer } from "@/features/marketplace/holders";
import { useProject } from "@/hooks/project";

export const HoldersScene = () => {
  const { collection, edition } = useProject();
  if (!edition) return;
  if (!collection) return;
  return (
    <MarketplaceHoldersContainer
      edition={edition}
      collectionAddress={collection}
    />
  );
};
