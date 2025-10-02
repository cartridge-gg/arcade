/**
 * Player stats computation for SSR
 * Ported from client-side achievement helpers but optimized for server use
 */

export interface RawProgression {
  playerId: string;
  achievementId: string;
  points: number;
  taskId: string;
  taskTotal: number;
  total: number;
  completionTime: string;
}

export interface RawAchievement {
  id: string;
  hidden: boolean;
  page: number;
  points: number;
  start?: string;
  end?: string;
  achievementGroup: string;
  icon: string;
  title: string;
  description: string;
  taskId: string;
  taskTotal: number;
  taskDescription: string;
  data?: string;
}

export interface ProgressionsResponse {
  playerAchievements: {
    items: {
      meta: {
        project: string;
        model: string;
        namespace: string;
        count: number;
      };
      achievements: RawProgression[];
    }[];
  };
}

export interface AchievementsResponse {
  achievements: {
    items: {
      meta: {
        project: string;
        model: string;
        namespace: string;
        count: number;
      };
      achievements: RawAchievement[];
    }[];
  };
}

export interface GameStats {
  points: number;
  completed: number;
  total: number;
  rank?: number;
}

export interface PlayerStats {
  address: string;
  username: string;
  totalPoints: number;
  totalCompleted: number;
  totalAchievements: number;
  rank?: number;
  gameStats: Record<string, GameStats>;
}

/**
 * Compute player statistics from GraphQL data
 *
 * @param address - Player's Starknet address
 * @param username - Player's username
 * @param progressionsData - Raw progressions data from GraphQL
 * @param achievementsData - Raw achievements data from GraphQL
 * @returns Computed player statistics
 */
export function computePlayerStats(
  address: string,
  username: string,
  progressionsData: ProgressionsResponse,
  achievementsData: AchievementsResponse
): PlayerStats {
  let totalPoints = 0;
  let totalCompleted = 0;
  let totalAchievements = 0;

  const gameStats: Record<string, GameStats> = {};

  // Normalize target address once at the start
  let normalizedTargetAddress: string;
  try {
    normalizedTargetAddress = normalizeAddress(address);
  } catch (error) {
    console.error(`Failed to normalize address ${address}:`, error);
    // Return empty stats for invalid address
    return {
      address,
      username,
      totalPoints: 0,
      totalCompleted: 0,
      totalAchievements: 0,
      gameStats: {},
    };
  }

  // Create a map of achievements by project for efficient lookup
  const achievementsByProject = new Map<string, RawAchievement[]>();
  for (const item of achievementsData.achievements.items) {
    achievementsByProject.set(item.meta.project, item.achievements);
  }

  // Process each project's progressions
  for (const item of progressionsData.playerAchievements.items) {
    const project = item.meta.project;
    const projectAchievements = achievementsByProject.get(project) || [];

    // Filter to non-hidden achievements for accurate totals
    const visibleAchievements = projectAchievements.filter((a) => !a.hidden);

    // Get player's progressions for this project
    const playerProgressions = item.achievements.filter((p) => {
      try {
        return normalizeAddress(p.playerId) === normalizedTargetAddress;
      } catch (error) {
        // Skip progressions with invalid player IDs
        console.warn(`Invalid player ID format: ${p.playerId}`);
        return false;
      }
    });

    // Calculate points for this project
    const projectPoints = playerProgressions.reduce((sum, p) => sum + p.points, 0);

    // Count unique completed achievements
    const completedIds = new Set(
      playerProgressions
        .filter((p) => p.total >= p.taskTotal) // Only count fully completed
        .map((p) => p.achievementId)
    );
    const completedCount = completedIds.size;

    // Store game-specific stats
    gameStats[project] = {
      points: projectPoints,
      completed: completedCount,
      total: visibleAchievements.length,
    };

    // Accumulate totals
    totalPoints += projectPoints;
    totalCompleted += completedCount;
    totalAchievements += visibleAchievements.length;
  }

  return {
    address,
    username,
    totalPoints,
    totalCompleted,
    totalAchievements,
    gameStats,
  };
}

/**
 * Calculate player's rank among all players
 * Note: This requires all players' data. For efficiency, this should
 * ideally be computed backend-side. For now, we'll skip rank calculation
 * in SSR to avoid fetching all players.
 *
 * @param playerAddress - Target player's address
 * @param allProgressions - All players' progressions
 * @returns Player's rank (1-indexed)
 */
export function calculatePlayerRank(
  playerAddress: string,
  allProgressions: ProgressionsResponse
): number | undefined {
  // Normalize target address
  let normalizedTarget: string;
  try {
    normalizedTarget = normalizeAddress(playerAddress);
  } catch (error) {
    console.error(`Failed to normalize target address ${playerAddress}:`, error);
    return undefined;
  }

  // Calculate total points for all players
  const playerPoints = new Map<string, number>();

  for (const item of allProgressions.playerAchievements.items) {
    for (const progression of item.achievements) {
      try {
        const normalizedAddress = normalizeAddress(progression.playerId);
        const currentPoints = playerPoints.get(normalizedAddress) || 0;
        playerPoints.set(normalizedAddress, currentPoints + progression.points);
      } catch (error) {
        // Skip progressions with invalid player IDs
        console.warn(`Invalid player ID format: ${progression.playerId}`);
        continue;
      }
    }
  }

  // Sort players by points (descending)
  const sortedPlayers = Array.from(playerPoints.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  // Find target player's rank
  const rank = sortedPlayers.findIndex(([addr]) => addr === normalizedTarget) + 1;

  return rank > 0 ? rank : undefined;
}

/**
 * Normalize Starknet address for comparison
 * Handles both checksummed and non-checksummed addresses
 * @throws Error if address format is invalid
 */
function normalizeAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid address: must be a non-empty string');
  }

  // Remove 0x prefix and convert to lowercase
  const cleaned = address.toLowerCase().replace(/^0x/, "");

  // Validate hex characters only
  if (!/^[0-9a-f]+$/.test(cleaned)) {
    throw new Error(`Invalid address format: ${address}`);
  }

  // Validate length (should be 64 hex chars max for felt252)
  if (cleaned.length > 64) {
    throw new Error(`Address too long: ${address}`);
  }

  // Pad to 64 characters (32 bytes)
  return cleaned.padStart(64, "0");
}

/**
 * Format player stats for OG image URL
 */
export function formatStatsForOGImage(stats: PlayerStats): string {
  const params = new URLSearchParams({
    username: stats.username,
    points: stats.totalPoints.toString(),
    achievements: `${stats.totalCompleted}/${stats.totalAchievements}`,
  });

  if (stats.rank) {
    params.append("rank", stats.rank.toString());
  }

  return params.toString();
}

/**
 * Get game-specific stats for a player
 * @param stats - Full player stats object
 * @param gameId - Game identifier (e.g., "dopewars", "loot-survivor")
 * @returns Game-specific stats or undefined if player hasn't played this game
 */
export function getGameStats(
  stats: PlayerStats,
  gameId: string
): GameStats | undefined {
  return stats.gameStats[gameId];
}

/**
 * Format game-specific stats for display
 * @param gameStats - Game-specific stats
 * @param gameId - Game identifier
 * @returns Formatted string for meta tags
 */
export function formatGameStatsDescription(
  gameStats: GameStats,
  gameId: string
): string {
  return `${gameStats.points.toLocaleString()} Points • ${gameStats.completed}/${gameStats.total} Achievements in ${gameId}`;
}

/**
 * Check if player has played a specific game
 * @param stats - Full player stats object
 * @param gameId - Game identifier
 * @returns True if player has achievements in this game
 */
export function hasPlayedGame(stats: PlayerStats, gameId: string): boolean {
  const gameStats = stats.gameStats[gameId];
  return gameStats !== undefined && gameStats.points > 0;
}
