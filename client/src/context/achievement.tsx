import {
  createContext,
  useState,
  type ReactNode,
  useEffect,
  useMemo,
} from "react";
import { useProgressions, useTrophies } from "@/collections";
import {
  AchievementHelper,
  type AchievementData,
  type Item,
  type Player,
  type Event,
} from "@/lib/achievements";
import { getChecksumAddress } from "starknet";
import { useAddress } from "@/hooks/address";
import { useAccounts } from "@/collections";

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

  const { data } = useAccounts();

  const usernames = useMemo(() => {
    if (!data || addresses.length === 0) return [];
    return addresses.map(
      (address) => {
        return {
          address: getChecksumAddress(address),
          username:
            data.get(getChecksumAddress(address)) || address.slice(0, 9),
        };
      },
      {} as { [key: string]: string },
    );
  }, [data, addresses]);

  const usernamesData = useMemo(() => {
    const data: { [key: string]: string | undefined } = {};
    for (const address of addresses) {
      data[getChecksumAddress(address)] = usernames.find(
        (username) => BigInt(username.address || "0x0") === BigInt(address),
      )?.username;
    }
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
