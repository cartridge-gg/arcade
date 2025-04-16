import { createContext, useState, ReactNode, useMemo } from "react";
import { useActivitiesQuery } from "@cartridge/utils/api/cartridge";
import { useArcade } from "@/hooks/arcade";
import { useUsernames } from "@/hooks/account";
import { addAddressPadding } from "starknet";
import { useAddress } from "@/hooks/address";

const LIMIT = 1000;

export type Activity = {
  project: string;
  callerAddress: string;
  contractAddress: string;
  transactionHash: string;
  entrypoint: string;
  timestamp: number;
  count: number;
};

export type ActivitiesContextType = {
  activities: { [key: string]: Activity[] };
  playerActivities: { [key: string]: Activity[] };
  usernames: { [key: string]: string };
  status: "success" | "error" | "idle" | "loading";
};

export const ActivitiesContext = createContext<ActivitiesContextType | null>(
  null,
);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const { projects: slots } = useArcade();
  const [activities, setActivities] = useState<{ [key: string]: Activity[] }>(
    {},
  );
  const [playerActivities, setPlayerActivities] = useState<{
    [key: string]: Activity[];
  }>({});
  const { address, isZero } = useAddress();
  const addresses = useMemo(() => {
    const addresses = Object.values(activities).flatMap((activity) =>
      activity.map((activity) => activity.callerAddress),
    );
    const uniqueAddresses = [...new Set(addresses)];
    return uniqueAddresses;
  }, [activities]);

  const { usernames } = useUsernames({ addresses });
  const usernamesData = useMemo(() => {
    const data: { [key: string]: string } = {};
    addresses.forEach((address) => {
      data[addAddressPadding(address)] =
        usernames.find(
          (username) => BigInt(username.address || "0x0") === BigInt(address),
        )?.username || address.slice(0, 9);
    });
    return data;
  }, [usernames, addresses]);

  const projects = useMemo(() => {
    return slots.map((slot) => {
      return {
        project: slot.project,
        address: "",
        limit: LIMIT,
      };
    });
  }, [slots]);

  const playerProjects = useMemo(() => {
    return slots.map((slot) => {
      return {
        project: slot.project,
        address: address,
        limit: LIMIT,
      };
    });
  }, [slots, address]);

  const { status: allStatus } = useActivitiesQuery(
    {
      projects: projects,
    },
    {
      queryKey: ["activities", projects],
      enabled: projects.length > 0,
      onSuccess: ({ activities }) => {
        const newActivities: { [key: string]: Activity[] } = {};
        activities?.items.forEach((item) => {
          const project = item.meta.project;
          newActivities[project] = item.activities.map((activity) => {
            return {
              project: project,
              callerAddress: activity.callerAddress,
              contractAddress: activity.contractAddress,
              transactionHash: activity.transactionHash,
              entrypoint: activity.entrypoint,
              timestamp: new Date(activity.executedAt).getTime(),
              count: 1,
            };
          });
        });
        setActivities(newActivities);
      },
    },
  );

  const { status: playerStatus } = useActivitiesQuery(
    {
      projects: playerProjects,
    },
    {
      queryKey: ["activities", playerProjects],
      enabled: playerProjects.length > 0 && !isZero,
      onSuccess: ({ activities }) => {
        const newActivities: { [key: string]: Activity[] } = {};
        activities?.items.forEach((item) => {
          const project = item.meta.project;
          newActivities[project] = item.activities.map((activity) => {
            return {
              project: project,
              callerAddress: activity.callerAddress,
              contractAddress: activity.contractAddress,
              transactionHash: activity.transactionHash,
              entrypoint: activity.entrypoint,
              timestamp: new Date(activity.executedAt).getTime(),
              count: 1,
            };
          });
        });
        setPlayerActivities(newActivities);
      },
    },
  );

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        playerActivities,
        usernames: usernamesData,
        status:
          allStatus === "error" || playerStatus === "error"
            ? "error"
            : allStatus === "loading" || playerStatus === "loading"
              ? "loading"
              : "success",
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}
