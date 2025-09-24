import { Marketplace } from "@/components/marketplace";
import { useProject } from "@/hooks/project";

export const MarketplaceScene = () => {
  const { game, edition } = useProject();

  if (!game) return <Marketplace />;

  if (!edition) return null;

  return <Marketplace edition={edition} />;
};
