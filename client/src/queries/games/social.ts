import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

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

async function fetchPins(address: string): Promise<Pin[]> {
  // TODO: Replace with actual SDK call
  // This should use packages/sdk Social.fetch() for pins
  throw new Error('TODO: implement me at games/social.ts - Need to integrate SDK Social module for fetching pins');
}

async function fetchFollows(address: string): Promise<Follow[]> {
  // TODO: Replace with actual SDK call
  // This should use packages/sdk Social.fetch() for follows
  throw new Error('TODO: implement me at games/social.ts - Need to integrate SDK Social module for fetching follows');
}

async function fetchGuilds(guildId?: string): Promise<Guild[]> {
  // TODO: Replace with actual SDK call
  // This should use packages/sdk Social.fetch() for guilds
  throw new Error('TODO: implement me at games/social.ts - Need to integrate SDK Social module for fetching guilds');
}

export function usePinsQuery(address: string) {
  return useQuery({
    queryKey: queryKeys.games.social.pins(address),
    queryFn: () => fetchPins(address),
    enabled: !!address,
    ...queryConfigs.games,
  });
}

export function useFollowsQuery(address: string) {
  return useQuery({
    queryKey: queryKeys.games.social.follows(address),
    queryFn: () => fetchFollows(address),
    enabled: !!address,
    ...queryConfigs.games,
  });
}

export function useGuildsQuery(guildId?: string) {
  return useQuery({
    queryKey: queryKeys.games.social.guilds(guildId),
    queryFn: () => fetchGuilds(guildId),
    ...queryConfigs.games,
  });
}

export function useAlliancesQuery(allianceId?: string) {
  return useQuery({
    queryKey: queryKeys.games.social.alliances(allianceId),
    queryFn: async () => {
      // TODO: Fetch alliances via SDK
      throw new Error('TODO: implement me at games/social.ts - Need to fetch alliances');
    },
    ...queryConfigs.games,
  });
}

// Mutations for social actions
export function usePinMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ achievementId, gameId }: { achievementId: string; gameId: string }) => {
      // TODO: Implement via SDK Social.pin()
      throw new Error('TODO: implement me at games/social.ts - Need to implement achievement pinning');
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.social.pins,
      });
    },
  });
}

export function useFollowMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (followeeAddress: string) => {
      // TODO: Implement via SDK Social.follow()
      throw new Error('TODO: implement me at games/social.ts - Need to implement follow action');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.social.follows,
      });
    },
  });
}

export function useCreateGuildMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (guild: Partial<Guild>) => {
      // TODO: Implement via SDK Social.create_guild()
      throw new Error('TODO: implement me at games/social.ts - Need to implement guild creation');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.social.guilds,
      });
    },
  });
}