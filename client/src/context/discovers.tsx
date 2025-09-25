import { createContext, useState, ReactNode, useMemo } from "react";
import { usePlaythroughsQuery } from "@cartridge/ui/utils/api/cartridge";
import { useArcade } from "@/hooks/arcade";
import { useUsernames } from "@/hooks/account";
import { getChecksumAddress } from "starknet";
import { useAchievements } from "@/hooks/achievements";

const LIMIT = 1000;

export type Discover = {
  identifier: string;
  project: string;
  callerAddress: string;
  start: number;
  end: number;
  count: number;
  actions: string[];
  achievements: {
    title: string;
    icon: string;
    points: number;
  }[];
};

export type DiscoversContextType = {
  playthroughs: { [key: string]: Discover[] };
  usernames: { [key: string]: string | undefined };
  status: "success" | "error" | "idle" | "loading";
};

export const DiscoversContext = createContext<DiscoversContextType | null>(
  null,
);

export function DiscoversProvider({ children }: { children: ReactNode }) {
  const { editions } = useArcade();
  const { events: achievements } = useAchievements();
  const [playthroughs, setPlaythroughs] = useState<{
    [key: string]: Discover[];
  }>({});

  const addresses = useMemo(() => {
    const addresses = Object.values(playthroughs).flatMap((activity) =>
      activity.map((activity) => activity.callerAddress),
    );
    const uniqueAddresses = [...new Set(addresses)];
    return uniqueAddresses;
  }, [playthroughs]);

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

  const projects = useMemo(() => {
    return editions.map((edition) => {
      return {
        project: edition.config.project,
        limit: LIMIT,
      };
    });
  }, [editions]);

  const { status } = usePlaythroughsQuery(
    {
      projects: projects,
    },
    {
      queryKey: ["playthroughs", projects],
      enabled: projects.length > 0,
      refetchInterval: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
      onSuccess: ({ playthroughs }) => {
        const newDiscovers: { [key: string]: Discover[] } = {};
        playthroughs?.items.forEach((item) => {
          const project = item.meta.project;
          newDiscovers[project] = item.playthroughs.map((playthrough) => {
            const start = new Date(playthrough.sessionStart).getTime();
            const end = new Date(playthrough.sessionEnd).getTime();
            const player = playthrough.callerAddress;
            const playerAchievements = (achievements[project] || [])
              .filter((item) => {
                const isPlayer = BigInt(item.player) === BigInt(player);
                const timestamp = new Date(item.timestamp * 1000).getTime();
                const inSession = timestamp >= start && timestamp <= end;
                return isPlayer && inSession;
              })
              .map((item) => item.achievement);
            return {
              identifier: `${project}-${playthrough.callerAddress}-${playthrough.sessionStart}`,
              project: project,
              callerAddress: playthrough.callerAddress,
              start: start,
              end: end,
              count: playthrough.actionCount,
              actions: playthrough.entrypoints.slice(1, -1).split(","),
              achievements: playerAchievements,
            };
          });
        });
        setPlaythroughs(newDiscovers);
      },
    },
  );

  return (
    <DiscoversContext.Provider
      value={{
        playthroughs: playthroughs,
        usernames: usernamesData,
        status,
      }}
    >
      {children}
    </DiscoversContext.Provider>
  );
}
