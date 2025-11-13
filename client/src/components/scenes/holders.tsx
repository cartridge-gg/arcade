import { MarketplaceHoldersContainer } from "@/features/marketplace/holders";
import { useProject } from "@/hooks/project";

export const HoldersScene = () => {
  const { collection } = useProject();
  if (!collection) return;
  return <MarketplaceHoldersContainer collectionAddress={collection} />;
};
