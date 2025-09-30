import type { AchievementOGData } from "../og-templates/achievement";

export async function fetchAchievementData(
  achievementId: string,
  playerName?: string
): Promise<AchievementOGData | null> {
  try {
    // TODO: Replace with actual API endpoint when available
    // This would typically fetch from your GraphQL API or REST endpoint
    
    // Mock data for now - replace with actual API call
    const mockData: AchievementOGData = {
      title: "Dragon Slayer",
      description: "Defeat the ancient dragon and claim the legendary treasure hidden in the depths of the mountain.",
      icon: "🐉",
      game: "Eternal Quest",
      points: 500,
      percentage: "2.3",
      difficulty: "Expert",
      playerName: playerName,
      completed: playerName ? Math.random() > 0.5 : false,
    };

    // Example of what the actual implementation might look like:
    // const response = await fetch(`${API_URL}/api/achievements/${achievementId}`);
    // const data = await response.json();
    // 
    // let completed = false;
    // if (playerName) {
    //   const playerResponse = await fetch(
    //     `${API_URL}/api/players/${playerName}/achievements/${achievementId}`
    //   );
    //   const playerData = await playerResponse.json();
    //   completed = playerData.completed;
    // }
    // 
    // return {
    //   title: data.title,
    //   description: data.description,
    //   icon: data.icon,
    //   game: data.game_name,
    //   points: data.points,
    //   percentage: data.completion_percentage,
    //   difficulty: data.difficulty,
    //   playerName: playerName,
    //   completed: completed,
    // };

    return mockData;
  } catch (error) {
    console.error("Error fetching achievement data:", error);
    return null;
  }
}