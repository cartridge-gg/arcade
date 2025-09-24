import { Achievements } from "@/components/achievements";
import { useProject } from "@/hooks/project";

export const AchievementScene = () => {
  const { game, edition } = useProject();

  return <Achievements game={game} edition={edition} />;
};
