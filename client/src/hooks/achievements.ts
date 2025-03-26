import { useContext, useMemo } from "react";
import { AchievementContext } from "@/context";
import { addAddressPadding } from "starknet";
import { useArcade } from "./arcade";
import { useAddress } from "./address";

export interface Item {
  id: string;
  hidden: boolean;
  index: number;
  earning: number;
  group: string;
  icon: string;
  title: string;
  description: string;
  timestamp: number;
  percentage: string;
  completed: boolean;
  pinned: boolean;
  tasks: ItemTask[];
}

export interface ItemTask {
  id: string;
  count: number;
  total: number;
  description: string;
}

export interface Counters {
  [player: string]: { [quest: string]: { count: number; timestamp: number }[] };
}

export interface Stats {
  [quest: string]: number;
}

export interface Player {
  address: string;
  earnings: number;
  timestamp: number;
  completeds: string[];
}

export function useAchievements() {
  const {
    achievements,
    players,
    events,
    usernames,
    globals,
    isLoading,
    isError,
    projects,
    setProjects,
  } = useContext(AchievementContext);
  return {
    achievements,
    players,
    events,
    usernames,
    globals,
    isLoading,
    isError,
    projects,
    setProjects,
  };
}

export function usePlayerStats() {
  const { address } = useAddress();
  const { achievements, globals } = useAchievements();

  const { completed, total } = useMemo(() => {
    let completed = 0;
    let total = 0;
    Object.values(achievements).forEach((gameAchievements) => {
      completed += gameAchievements.filter((item) => item.completed).length;
      total += gameAchievements.length;
    });
    return { completed, total };
  }, [achievements]);

  const { rank, earnings } = useMemo(() => {
    const rank =
      globals.findIndex(
        (player) => BigInt(player.address || 0) === BigInt(address),
      ) + 1;
    const earnings =
      globals.find((player) => BigInt(player.address || 0) === BigInt(address))
        ?.earnings || 0;
    return { rank, earnings };
  }, [address, globals]);

  return { completed, total, rank, earnings };
}

export function usePlayerGameStats(project: string) {
  const { pins } = useArcade();
  const { address } = useAddress();
  const { achievements, players } = useAchievements();

  const gameAchievements = useMemo(() => {
    return achievements[project || ""] || [];
  }, [achievements, project]);

  const gamePlayers = useMemo(
    () => players[project || ""] || [],
    [players, project],
  );

  const { pinneds, completed, total } = useMemo(() => {
    const ids = pins[addAddressPadding(address)] || [];
    const pinneds = gameAchievements
      .filter((item) => ids.includes(item.id))
      .sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage))
      .slice(0, 3); // There is a front-end limit of 3 pinneds
    const completed = gameAchievements.filter((item) => item.completed).length;
    const total = gameAchievements.length;
    return { pinneds, completed, total };
  }, [pins, address, gameAchievements]);

  const { rank, earnings } = useMemo(() => {
    const rank =
      gamePlayers.findIndex(
        (player) => BigInt(player.address || 0) === BigInt(address),
      ) + 1;
    const earnings =
      gamePlayers.find(
        (player) => BigInt(player.address || 0) === BigInt(address),
      )?.earnings || 0;
    return { rank, earnings };
  }, [address, gamePlayers]);

  return { pinneds, completed, total, rank, earnings };
}
