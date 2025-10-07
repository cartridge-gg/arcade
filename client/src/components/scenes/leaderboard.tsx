import { LeaderboardContainer } from "@/features/leaderboard";
import { useProject } from "@/hooks/project";

export const LeaderboardScene = () => {
  const { edition } = useProject();

  return <LeaderboardContainer edition={edition} />;
};
