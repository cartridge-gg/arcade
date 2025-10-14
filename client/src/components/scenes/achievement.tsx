import { AchievementsContainer } from "@/features/achievements";
import { useProject } from "@/hooks/project";

export const AchievementScene = () => {
  const { game, edition } = useProject();

  return <AchievementsContainer game={game} edition={edition} />;
};
