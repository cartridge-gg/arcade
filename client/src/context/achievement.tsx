import { createContext, useState, ReactNode, useEffect, useMemo } from "react";
import { TROPHY, PROGRESS } from "@/constants";
import { Trophy, Progress } from "@/models";
import { useProgressions } from "@/hooks/progressions";
import { useTrophies } from "@/hooks/trophies";
import {
  AchievementHelper,
  AchievementData,
  Item,
  Player,
  Event,
} from "@/helpers/achievements";
import { useUsernames } from "@/hooks/account";
import { getChecksumAddress } from "starknet";
import { useAddress } from "@/hooks/address";
import { useArcade } from "@/hooks/arcade";

type AchievementContextType = {
  achievements: { [game: string]: Item[] };
  players: { [game: string]: Player[] };
  events: { [game: string]: Event[] };
  usernames: { [key: string]: string | undefined };
  globals: Player[];
  isLoading: boolean;
  isError: boolean;
};

export const AchievementContext = createContext<AchievementContextType | null>(
  null,
);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<{ [game: string]: Player[] }>({});
  const [events, setEvents] = useState<{ [game: string]: Event[] }>({});
  const [globals, setGlobals] = useState<Player[]>([]);
  const [achievements, setAchievements] = useState<{ [game: string]: Item[] }>(
    {},
  );

  const { editions } = useArcade();
  const { address } = useAddress();

  const trophiesProps = useMemo(
    () =>
      editions.map((edition) => ({
        project: edition.config.project,
        namespace: edition.namespace,
        name: TROPHY,
      })),
    [editions],
  );
  const progressProps = useMemo(
    () =>
      editions.map((edition) => ({
        project: edition.config.project,
        namespace: edition.namespace,
        name: PROGRESS,
      })),
    [editions],
  );

  const {
    trophies,
    isLoading: trophiesLoading,
    isError: trophiesError,
  } = useTrophies({
    props: trophiesProps,
    parser: Trophy.parse,
  });

  const {
    progressions,
    isLoading: progressionsLoading,
    isError: progressionsError,
  } = useProgressions({
    props: progressProps,
    parser: Progress.parse,
  });

  // Compute achievements and players
  useEffect(() => {
    if (
      !Object.values(trophies).length ||
      !Object.values(progressions).length ||
      !address ||
      address === "0x0"
    )
      return;
    // Compute players and achievement stats
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

  const { usernames } = useUsernames({ addresses });
  const usernamesData = useMemo(() => {
    const data: { [key: string]: string | undefined } = {};
    addresses.forEach((address) => {
      data[getChecksumAddress(address)] = usernames.find(
        (username) => BigInt(username.address || "0x0") === BigInt(address),
      )?.username;
    });
    return data;
  }, [usernames, addresses]);

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        players,
        events,
        usernames: usernamesData,
        globals,
        isLoading:
          !trophiesError &&
          !progressionsError &&
          (trophiesLoading || progressionsLoading),
        isError: trophiesError || progressionsError,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}
