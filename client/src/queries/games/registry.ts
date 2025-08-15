import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

export interface Game {
  id: string;
  published: boolean;
  whitelisted: boolean;
  color: string;
  image: string;
  name: string;
  description: string;
  attributes?: any;
  properties?: any;
  socials?: any;
}

export interface Edition {
  id: string;
  gameId: string;
  published: boolean;
  whitelisted: boolean;
  name: string;
  description: string;
  metadata?: any;
}

export interface RegistryResponse {
  games: Game[];
  editions: Edition[];
  access?: any[];
}

async function fetchRegistry(chainId: string): Promise<RegistryResponse> {
  // TODO: Replace with actual SDK call
  // This should use packages/sdk Registry.fetch() or Registry.sub()
  throw new Error('TODO: implement me at games/registry.ts - Need to integrate SDK Registry module for fetching games and editions');
}

export function useRegistryQuery(chainId: string) {
  return useQuery({
    queryKey: queryKeys.games.registry(chainId),
    queryFn: () => fetchRegistry(chainId),
    enabled: !!chainId,
    ...queryConfigs.games,
  });
}

// Query for specific game
export function useGameQuery(gameId: string) {
  return useQuery({
    queryKey: queryKeys.games.game(gameId),
    queryFn: async () => {
      // TODO: Fetch specific game details
      throw new Error('TODO: implement me at games/registry.ts - Need to fetch specific game details');
    },
    enabled: !!gameId,
    ...queryConfigs.games,
  });
}

// Query for specific edition
export function useEditionQuery(gameId: string, editionId: string) {
  return useQuery({
    queryKey: queryKeys.games.edition(gameId, editionId),
    queryFn: async () => {
      // TODO: Fetch specific edition details
      throw new Error('TODO: implement me at games/registry.ts - Need to fetch specific edition details');
    },
    enabled: !!gameId && !!editionId,
    ...queryConfigs.games,
  });
}

// Mutations for game management
export function useRegisterGameMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (game: Partial<Game>) => {
      // TODO: Implement via SDK Registry.register_game()
      throw new Error('TODO: implement me at games/registry.ts - Need to implement game registration');
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.all,
      });
    },
  });
}

export function usePublishGameMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (gameId: string) => {
      // TODO: Implement via SDK Registry.publish_game()
      throw new Error('TODO: implement me at games/registry.ts - Need to implement game publishing');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.all,
      });
    },
  });
}