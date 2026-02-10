import { useCallback, useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { getChecksumAddress } from "starknet";
import { useAchievements } from "@/hooks/achievements";
import { useArcade } from "@/hooks/arcade";
import type { EditionModel } from "@cartridge/arcade";
import { useNavigationManager } from "@/features/navigation/useNavigationManager";

export interface LeaderboardPin {
  id: string;
  icon: string;
}

export interface LeaderboardEntry {
  address: string;
  name: string;
  rank: number;
  points: number;
  highlight: boolean;
  following: boolean;
  pins: LeaderboardPin[];
}

export interface LeaderboardViewModel {
  isConnected: boolean;
  isLoading: boolean;
  isError: boolean;
  allEntries: LeaderboardEntry[];
  followingEntries: LeaderboardEntry[];
  getPlayerTarget: (nameOrAddress: string) => string;
}

interface UseLeaderboardViewModelArgs {
  edition?: EditionModel;
}

type RawPlayer = {
  address: string;
  earnings: number;
  completeds: string[];
};

type RawAchievement = {
  id: string;
  icon: string;
  percentage: string;
};

const NORMALIZED_ADDRESS = "";

export function useLeaderboardViewModel({
  edition,
}: UseLeaderboardViewModelArgs): LeaderboardViewModel {
  const { isConnected, address } = useAccount();
  const normalizedAddress = address
    ? getChecksumAddress(address)
    : NORMALIZED_ADDRESS;

  const { achievements, globals, players, usernames, isLoading, isError } =
    useAchievements();
  const { pins, follows } = useArcade();

  const followingSet = useMemo(() => {
    if (!normalizedAddress) return new Set<string>();
    const addresses = follows[normalizedAddress] || [];
    if (addresses.length === 0) {
      return new Set([normalizedAddress]);
    }
    return new Set([normalizedAddress, ...addresses.map(getChecksumAddress)]);
  }, [normalizedAddress, follows]);

  const projectKey = edition?.config.project ?? "";
  const gamePlayers: RawPlayer[] = useMemo(
    () => players[projectKey] || [],
    [players, projectKey],
  );
  const gameAchievements: RawAchievement[] = useMemo(
    () => achievements[projectKey] || [],
    [achievements, projectKey],
  );

  const computeEntries = useCallback(
    (
      sourcePlayers: RawPlayer[],
      includePins: boolean,
    ): { all: LeaderboardEntry[]; following: LeaderboardEntry[] } => {
      const assembled = sourcePlayers.map((player, index) => {
        const playerAddress = getChecksumAddress(player.address);
        const lowercaseChecksum = playerAddress.toLowerCase();
        const lowercaseRaw = player.address.toLowerCase();
        const username =
          usernames[playerAddress] ??
          usernames[player.address] ??
          usernames[lowercaseChecksum] ??
          usernames[lowercaseRaw];
        const playerPins = includePins
          ? collectPins(
              playerAddress,
              player.completeds,
              pins,
              gameAchievements,
            )
          : [];
        const fallbackName = player.address.slice(
          0,
          Math.min(player.address.length, 9),
        );
        const entry: LeaderboardEntry = {
          address: playerAddress,
          name: username ?? fallbackName,
          rank: index + 1,
          points: player.earnings,
          highlight:
            normalizedAddress !== NORMALIZED_ADDRESS &&
            playerAddress === normalizedAddress,
          following: followingSet.has(playerAddress),
          pins: playerPins,
        };
        return entry;
      });

      const followingEntries = assembled.filter((entry) =>
        followingSet.has(entry.address),
      );

      return {
        all: assembled,
        following: followingEntries,
      };
    },
    [normalizedAddress, followingSet, usernames, pins, gameAchievements],
  );

  const gameData = useMemo(
    () => computeEntries(gamePlayers, true),
    [computeEntries, gamePlayers],
  );

  const globalData = useMemo(
    () => computeEntries(globals, false),
    [computeEntries, globals],
  );

  const dataset = edition ? gameData : globalData;

  const navManager = useNavigationManager();

  const getPlayerTarget = useCallback(
    (nameOrAddress: string) => {
      return navManager.generatePlayerHref(nameOrAddress, "achievements");
    },
    [navManager],
  );

  return {
    isConnected: Boolean(isConnected),
    isLoading,
    isError,
    allEntries: dataset.all,
    followingEntries: dataset.following,
    getPlayerTarget,
  };
}

function collectPins(
  playerAddress: string,
  completeds: string[],
  pinsMap: Record<string, string[]>,
  achievements: RawAchievement[],
): LeaderboardPin[] {
  const playerPinsIds = pinsMap[playerAddress] || [];

  const relevant = achievements
    .filter(
      (achievement) =>
        completeds.includes(achievement.id) &&
        (playerPinsIds.length === 0 || playerPinsIds.includes(achievement.id)),
    )
    .sort((a, b) => a.id.localeCompare(b.id))
    .sort(
      (a, b) =>
        Number.parseFloat(a.percentage) - Number.parseFloat(b.percentage),
    )
    .slice(0, 3);

  return relevant.map((achievement) => ({
    id: achievement.id,
    icon: achievement.icon,
  }));
}
