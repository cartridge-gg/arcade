import { createCollection, eq, liveQueryCollectionOptions, useLiveQuery } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { getChecksumAddress } from "starknet";
import { completedAchievements, trophiesCollection } from "./achievements";
import { accountsCollection } from "./users";
import { queryClient } from "@/queries";
import { cyrb64Hash } from "./utils";
import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";

export type LeaderboardPlayerGames = {
  [edition: string]: {
    earnings: number;
    completedAchievements: string[];
  };
};

export type LeaderboardPlayer = {
  address: string;
  username: string;
  games: LeaderboardPlayerGames;
  totalEarnings: number;
};

export type Leaderboard = LeaderboardPlayer[];

// Calculate player stats from achievements and progressions
export const playersStatsCollection = createCollection(
  queryCollectionOptions({
    queryKey: (() => {
      const achievements = completedAchievements.toArray;
      const trophies = trophiesCollection.toArray;
      return [
        'leaderboard',
        'players-stats',
        { achievements: cyrb64Hash(achievements.map(a => a.key).sort().join('///')), length: achievements.length },
        { trophies: cyrb64Hash(trophies.map(t => t.key).sort().join('///')), length: trophies.length }
      ];
    })(),
    queryFn: async () => {
      await completedAchievements.preload();
      const achievements = await completedAchievements.toArrayWhenReady();
      const trophies = await trophiesCollection.toArrayWhenReady();

      // Create a map of trophy points by id and edition
      const trophyPoints = new Map<string, number>();
      trophies.forEach(trophy => {
        const key = `${trophy.edition}-${trophy.id}`;
        trophyPoints.set(key, trophy.earning || 0);
      });

      // Build player data with nested games structure
      const playerMap = new Map<string, LeaderboardPlayer>();

      // Process achievements to build player stats
      achievements.forEach(achievement => {
        if (!achievement.completion) return;

        const checksumAddress = getChecksumAddress(achievement.playerId);
        const trophyKey = `${achievement.edition}-${achievement.achievementId}`;
        const points = trophyPoints.get(trophyKey) || 0;
        const username = accountsCollection.get(checksumAddress);

        // Get or create player entry
        if (!playerMap.has(checksumAddress)) {
          playerMap.set(checksumAddress, {
            address: checksumAddress,
            username: username?.username ?? checksumAddress.slice(0, 9), // Will be updated with real username later
            games: {},
            totalEarnings: 0,
          });
        }

        const player = playerMap.get(checksumAddress)!;

        // Initialize edition entry if needed
        if (!player.games[achievement.edition]) {
          player.games[achievement.edition] = {
            earnings: 0,
            completedAchievements: [],
          };
        }

        // Add achievement if not already tracked
        const gameData = player.games[achievement.edition];
        if (!gameData.completedAchievements.includes(achievement.achievementId)) {
          gameData.completedAchievements.push(achievement.achievementId);
          gameData.earnings += points;
          player.totalEarnings += points;
        }
      });

      return Array.from(playerMap.values());
    },
    queryClient,
    getKey: (item: LeaderboardPlayer) => item.address,
  })
);

// Main leaderboard collection with usernames joined
export const leaderboardCollection = createCollection(liveQueryCollectionOptions({
  query: q => q
    .from({ player: playersStatsCollection })
    .leftJoin({ account: accountsCollection }, ({ player, account }) =>
      eq(player.address, account.address)
    )
    .select(({ player, account }) => ({
      ...player,
      username: account?.username || player.address.slice(0, 9),
    })),
  getKey: (item) => item.address,
}));

// Main hook for consuming leaderboard data
export function useLeaderboard(edition?: string, following?: string[]) {
  // Get all players with computed rankings
  const { data: allPlayers = [], status } = useLiveQuery(q =>
    q.from({ player: leaderboardCollection })
      .orderBy(({ player }) => player.totalEarnings, 'desc')
      .select(({ player }) => ({ ...player }))
  );

  // Compute global leaderboard
  const globalLeaderboard = useMemo(() => {
    const sorted = [...allPlayers]
      .map((player, index) => ({
        ...player,
        rank: index + 1,
        earnings: player.totalEarnings,
      }));

    const all = sorted;
    const followingPlayers = following?.length
      ? sorted.filter(p => following.includes(p.address))
      : [];

    return { all, following: followingPlayers };
  }, [allPlayers, following]);

  // Compute game-specific leaderboard
  const gameLeaderboard = useMemo(() => {
    if (!edition) {
      return { all: [], following: [] };
    }

    const playersWithGameData = allPlayers
      .filter(player => player.games[edition])
      .map(player => ({
        ...player,
        earnings: player.games[edition].earnings,
        completedAchievements: player.games[edition].completedAchievements,
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));

    const all = playersWithGameData;
    const followingPlayers = following?.length
      ? playersWithGameData.filter(p => following.includes(p.address))
      : [];

    return { all, following: followingPlayers };
  }, [allPlayers, edition, following]);

  return {
    global: {
      ...globalLeaderboard,
      status,
    },
    game: {
      ...gameLeaderboard,
      status,
    },
  };
}

export function usePlayerLeaderboard(game: string) {
  const { address } = useAccount();

  const { data } = useLiveQuery(q =>
    q.from({ player: leaderboardCollection })
      .fn.where(({ player }) => {
        const hasGame = player.games[game];
        return player.address === getChecksumAddress(address ?? "0x0") && hasGame
      })
      .select(({ player }) => player)
  );
  console.log(data);

  return data?.[0];
}

