import { Leaderboard } from "@/components/leaderboard";
import { useProject } from "@/hooks/project";

export const LeaderboardScene = () => {
  const { edition } = useProject();

  return <Leaderboard edition={edition} />;
};
