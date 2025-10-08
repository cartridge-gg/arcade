import { MarketplaceCollectionsContainer } from "@/features/marketplace/collections";
import { useProject } from "@/hooks/project";

export const MarketplaceScene = () => {
  const { game, edition } = useProject();

  if (!game) return <MarketplaceCollectionsContainer />;

  if (!edition) return null;

  return <MarketplaceCollectionsContainer edition={edition} game={game} />;
};
