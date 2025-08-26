import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { constants } from "starknet";
import {
  EditionModel,
  GameModel,
  Registry,
  RegistryModel,
} from "@cartridge/arcade";

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
export type GamesResponse = GameModel[];
export type EditionsResponse = EditionModel[];

async function fetchRegistry(chainId: string): Promise<RegistryResponse> {
  // Initialize the Registry SDK
  await Registry.init(chainId as constants.StarknetChainId);

  // Fetch all registry data
  const response: RegistryResponse = {
    games: [],
    editions: [],
    access: [],
  };

  await Registry.fetch(
    (models: any[]) => {
      models.forEach((model: any) => {
        if (model.constructor.name === "GameModel") {
          response.games.push(model as Game);
        } else if (model.constructor.name === "EditionModel") {
          response.editions.push(model as Edition);
        } else if (model.constructor.name === "AccessModel") {
          response.access?.push(model);
        }
      });
    },
    {
      game: true,
      edition: true,
      access: true,
    },
  );

  return response;
}

export async function fetchGames(chainId: string): Promise<GameModel[]> {
  // Initialize the Registry SDK
  await Registry.init(chainId as constants.StarknetChainId);

  // Fetch all registry data
  const response: GamesResponse = [];

  await Registry.fetch(
    (models: RegistryModel[]) => {
      models.forEach((model) => {
        if (model.type === "Game") {
          response.push(model as GameModel);
        }
      });
    },
    {
      game: true,
      edition: false,
      access: false,
    },
  );

  return Object.values(response).sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchEditions(chainId: string): Promise<EditionModel[]> {
  // Initialize the Registry SDK
  await Registry.init(chainId as constants.StarknetChainId);

  // Fetch all registry data
  const response: EditionsResponse = [];

  await Registry.fetch(
    (models: RegistryModel[]) => {
      models.forEach((model) => {
        if (model.type === "Edition") {
          response.push(model as EditionModel);
        }
      });
    },
    {
      game: false,
      edition: true,
      access: false,
    },
  );

  return Object.values(response)
    .sort((a, b) => a.id - b.id)
    .sort((a, b) => b.priority - a.priority);
}

export function useRegistryQuery(chainId: string) {
  return useQuery({
    queryKey: queryKeys.games.registry(chainId),
    queryFn: () => fetchRegistry(chainId),
    ...queryConfigs.games,
  });
}

export function useGamesQuery(chainId: string) {
  return useQuery({
    queryKey: queryKeys.games.all,
    queryFn: () => fetchGames(chainId),
    ...queryConfigs.games,
  });
}

export function useEditionsQuery(chainId: string) {
  return useQuery({
    queryKey: queryKeys.games.editions,
    queryFn: () => fetchEditions(chainId),
    ...queryConfigs.games,
  });
}

// Suspense versions for route loaders
export function useSuspenseGamesQuery(chainId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.games.all,
    queryFn: () => fetchGames(chainId),
    ...queryConfigs.games,
  });
}

export function useSuspenseEditionsQuery(chainId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.games.editions,
    queryFn: () => fetchEditions(chainId),
    ...queryConfigs.games,
  });
}
