import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { Social } from "@cartridge/arcade";
import { constants, getChecksumAddress } from "starknet";
import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";

export interface Pin {
  id: string;
  playerAddress: string;
  achievementId: string;
  gameId: string;
  timestamp: number;
}

export interface Follow {
  id: string;
  followerAddress: string;
  followeeAddress: string;
  timestamp: number;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  open: boolean;
  free: boolean;
  memberCount: number;
  metadata?: any;
  socials?: any;
}

export interface Alliance {
  id: string;
  name: string;
  description: string;
  guildCount: number;
  metadata?: any;
}

export async function fetchPins(
  address: string,
  chainId: string = constants.StarknetChainId.SN_MAIN,
): Promise<Pin[]> {
  // Initialize the Social SDK
  await Social.init(chainId as constants.StarknetChainId);

  const pins: Pin[] = [];

  await Social.fetch(
    (models: any[]) => {
      models.forEach((model: any) => {
        if (model.constructor.name === "PinEvent") {
          pins.push(model as Pin);
        }
      });
    },
    {
      pin: true,
    },
  );

  return pins.filter((pin) => pin.playerAddress === address);
}

export async function fetchFollows(
  address: string,
  chainId: string = constants.StarknetChainId.SN_MAIN,
): Promise<Follow[]> {
  // Initialize the Social SDK
  await Social.init(chainId as constants.StarknetChainId);

  const follows: Follow[] = [];

  await Social.fetch(
    (models: any[]) => {
      models.forEach((model: any) => {
        if (model.constructor.name === "FollowEvent") {
          follows.push(model as Follow);
        }
      });
    },
    {
      follow: true,
    },
  );

  return follows.filter((follow) => follow.followerAddress === address);
}

export async function fetchGuilds(
  chainId: string = constants.StarknetChainId.SN_MAIN,
): Promise<Guild[]> {
  // Initialize the Social SDK
  await Social.init(chainId as constants.StarknetChainId);

  const guilds: Guild[] = [];

  await Social.fetch(
    (models: any[]) => {
      models.forEach((model: any) => {
        if (model.constructor.name === "GuildModel") {
          guilds.push(model as Guild);
        }
      });
    },
    {
      guild: true,
    },
  );

  return guilds;
}

export function usePinsQuery() {
  const { address = '' } = useAccount();
  return useQuery({
    queryKey: queryKeys.games.social.pins(address),
    queryFn: () => fetchPins(address),
    enabled: !!address,
    ...queryConfigs.games,
  });
}

export function useFollowsQuery(address: string) {
  const { data: follows = [], ...res } = useQuery({
    queryKey: queryKeys.games.social.follows(address),
    queryFn: () => fetchFollows(address),
    enabled: !!address,
    ...queryConfigs.games,
  });

  return useMemo(() => {
    if (!address) return { ...res, data: [] };
    const checksumAddress = getChecksumAddress(address);
    const addresses = follows[checksumAddress] || [];
    if (addresses.length === 0) return { ...res, data: [] };
    return { ...res, data: [...addresses, checksumAddress] };
  }, [follows, address, res]);
}

export function useGuildsQuery(guildId?: string) {
  return useQuery({
    queryKey: queryKeys.games.social.guilds(guildId),
    queryFn: () => fetchGuilds(),
    ...queryConfigs.games,
  });
}

// Suspense versions for route loaders
export function useSuspensePinsQuery(address: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.games.social.pins(address),
    queryFn: () => fetchPins(address),
    ...queryConfigs.games,
  });
}

export function useSuspenseFollowsQuery(address: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.games.social.follows(address),
    queryFn: () => fetchFollows(address),
    ...queryConfigs.games,
  });
}

export function useSuspenseGuildsQuery(guildId?: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.games.social.guilds(guildId),
    queryFn: () => fetchGuilds(),
    ...queryConfigs.games,
  });
}
