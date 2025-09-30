import type { GameOGData } from "../og-templates/game";

export async function fetchGameData(gameId: string): Promise<GameOGData | null> {
  try {
    // TODO: Replace with actual API endpoint when available
    // This would typically fetch from your GraphQL API or REST endpoint
    
    // Mock data for now - replace with actual API call
    const mockData: GameOGData = {
      name: gameId.charAt(0).toUpperCase() + gameId.slice(1),
      description: "An immersive on-chain gaming experience built on Starknet. Battle, explore, and conquer in this revolutionary blockchain game.",
      thumbnail: undefined,
      playerCount: 5432,
      achievementCount: 24,
      status: "LIVE",
      categories: ["Strategy", "RPG", "Multiplayer"],
    };

    // Example of what the actual implementation might look like:
    // const response = await fetch(`${API_URL}/api/games/${gameId}`);
    // const data = await response.json();
    // 
    // return {
    //   name: data.name,
    //   description: data.description,
    //   thumbnail: data.thumbnail_url,
    //   playerCount: data.player_count,
    //   achievementCount: data.achievements.length,
    //   status: data.status,
    //   categories: data.categories,
    // };

    return mockData;
  } catch (error) {
    console.error("Error fetching game data:", error);
    return null;
  }
}