import { useMemo, useState, useEffect } from "react";
import { getChecksumAddress } from "starknet";
import { useProgressions, useTrophies, useAccounts } from "@/effect";
import {
  AchievementHelper,
  type AchievementData,
  type Item,
  type Player,
  type Event,
} from "@/lib/achievements";
import { useArcade } from "./arcade";
import { useAddress } from "./address";

export const useAchievements = () => {
  const [players, setPlayers] = useState<{ [game: string]: Player[] }>({});
  const [events, setEvents] = useState<{ [game: string]: Event[] }>({});
  const [globals, setGlobals] = useState<Player[]>([]);
  const [achievements, setAchievements] = useState<{ [game: string]: Item[] }>(
    {},
  );

  const { address } = useAddress();

  const {
    data: trophies,
    isLoading: trophiesLoading,
    isError: trophiesError,
  } = useTrophies();
  const {
    data: progressions,
    isLoading: progressionsLoading,
    isError: progressionsError,
  } = useProgressions();

  useEffect(() => {
    if (
      !Object.values(trophies).length ||
      !Object.values(progressions).length ||
      !address ||
      address === "0x0"
    )
      return;
    const data: AchievementData = AchievementHelper.extract(
      progressions,
      trophies,
    );
    const { stats, players, events, globals } =
      AchievementHelper.computePlayers(data, trophies);
    setPlayers(players);
    setEvents(events);
    setGlobals(globals);
    const achievements = AchievementHelper.computeAchievements(
      data,
      trophies,
      players,
      stats,
      address,
    );
    setAchievements(achievements);
  }, [address, trophies, progressions]);

  const addresses = useMemo(() => {
    const addresses = Object.values(players).flatMap((gamePlayers) =>
      gamePlayers.map((player) => player.address),
    );
    const uniqueAddresses = [...new Set(addresses)];
    return uniqueAddresses;
  }, [players]);

  const { data } = useAccounts();

  const usernamesData = useMemo(() => {
    if (!data || addresses.length === 0) return {};
    const usernamesList = addresses.map((addr) => ({
      address: getChecksumAddress(addr),
      username: data.get(getChecksumAddress(addr)) || addr.slice(0, 9),
    }));
    const result: { [key: string]: string | undefined } = {};
    for (const addr of addresses) {
      result[getChecksumAddress(addr)] = usernamesList.find(
        (u) => BigInt(u.address || "0x0") === BigInt(addr),
      )?.username;
    }
    return result;
  }, [data, addresses]);

  const isLoading =
    !trophiesError &&
    !progressionsError &&
    (trophiesLoading || progressionsLoading);
  const isError = trophiesError || progressionsError;

  return {
    achievements,
    players,
    events,
    usernames: usernamesData,
    globals,
    isLoading,
    isError,
  };
};

export function usePlayerStats(address?: string) {
  // show address for current opened player
  const { address: userAddress } = useAddress();
  const { achievements, globals } = useAchievements();

  const _address = address || userAddress;

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
        (player) => BigInt(player.address || 0) === BigInt(_address),
      ) + 1;
    const earnings =
      globals.find((player) => BigInt(player.address || 0) === BigInt(_address))
        ?.earnings || 0;
    return { rank, earnings };
  }, [_address, globals]);

  return { completed, total, rank, earnings };
}

export function usePlayerGameStats(projects: string[]) {
  const { pins } = useArcade();
  const { address } = useAddress();
  const { achievements, players } = useAchievements();

  const gameAchievements = useMemo(() => {
    return projects.flatMap((project) => achievements[project || ""] || []);
  }, [achievements, projects]);

  const gamePlayers = useMemo(
    () => projects.flatMap((project) => players[project || ""] || []),
    [players, projects],
  );

  const { pinneds, completed, total } = useMemo(() => {
    const ids = pins[getChecksumAddress(address)] || [];
    const pinneds = gameAchievements
      .filter((item) =>
        ids.length > 0
          ? ids.includes(item.id) && item.completed
          : item.completed,
      )
      .sort((a, b) => a.id.localeCompare(b.id))
      .sort(
        (a, b) =>
          Number.parseFloat(a.percentage) - Number.parseFloat(b.percentage),
      )
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
      gamePlayers
        .filter((player) => BigInt(player.address || 0) === BigInt(address))
        ?.reduce((acc, player) => acc + player.earnings, 0) || 0;
    return { rank, earnings };
  }, [address, gamePlayers]);

  return { pinneds, completed, total, rank, earnings };
}
