import { Discover } from "@/components/discover";
import { useProject } from "@/hooks/project";

export const DiscoverScene = () => {
  const { game, edition } = useProject();

  if (!game) return <Discover />;

  if (!edition) return null;

  return <Discover edition={edition} />;
};
