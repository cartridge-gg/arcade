import { useMemo } from "react";
import { useArcade } from "./arcade";
import { useAddressByUsernameQuery } from "@cartridge/ui/utils/api/cartridge";
import { getChecksumAddress } from "starknet";
import { useRouterState, useSearch } from "@tanstack/react-router";

export const TAB_SEGMENTS = [
  "inventory",
  "achievements",
  "leaderboard",
  "guilds",
  "activity",
  "metrics",
  "about",
  "marketplace",
  "items",
  "holders",
  "predict",
  "positions",
] as const;

interface RouteParams {
  game?: string;
  edition?: string;
  player?: string;
  collection?: string;
  tab?: string;
  token?: string;
}

export const parseRouteParams = (pathname: string): RouteParams => {
  const segments = pathname.split("/").filter(Boolean);
  const params: RouteParams = {};

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const next = segments[index + 1];

    switch (segment) {
      case "game":
        if (next) {
          params.game = next;
          index += 1;
        }
        break;
      case "edition":
        if (next) {
          params.edition = next;
          index += 1;
        }
        break;
      case "player":
        if (next) {
          params.player = next;
          index += 1;
        }
        break;
      case "collection":
        if (next) {
          params.collection = next;
          index += 1;
        }
        break;
      case "token":
        if (next) {
          params.token = next;
          index += 1;
        }
        break;
      default:
        if (!params.tab && TAB_SEGMENTS.includes(segment as any)) {
          params.tab = segment;
        }
        break;
    }
  }

  return params;
};

/**
 * Custom hook to access the Project context and account information.
 * Must be used within a ProjectProvider component.
 */
export const useProject = () => {
  const { games, editions } = useArcade();
  const routerState = useRouterState();
  const search = useSearch({ strict: false });

  const { game: gameParam, edition: editionParam, player: playerParam, collection: collectionParam, tab } = useMemo(
    () => parseRouteParams(routerState.location.pathname),
    [routerState.location.pathname],
  );

  const filter = useMemo(() => {
    if (!search) return undefined;
    const value = (search as Record<string, unknown>).filter;
    return typeof value === "string" ? value : undefined;
  }, [search]);

  const { data: playerData } = useAddressByUsernameQuery(
    {
      username: playerParam?.toLowerCase() || "",
    },
    {
      enabled: !!playerParam && !playerParam.match(/^0x[0-9a-fA-F]+$/),
      refetchOnWindowFocus: false,
    },
  );

  const game = useMemo(() => {
    if (!gameParam || games.length === 0) return undefined;
    return games.find(
      (candidate) =>
        candidate.id.toString() === gameParam ||
        candidate.name.toLowerCase().replace(/ /g, "-") ===
          gameParam.toLowerCase(),
    );
  }, [gameParam, games]);

  const collection = useMemo(() => {
    if (!collectionParam) return undefined;
    try {
      return getChecksumAddress(collectionParam);
    } catch (error) {
      console.error("Invalid collection address", error);
      return undefined;
    }
  }, [collectionParam]);

  const edition = useMemo(() => {
    if (!game || editions.length === 0) return undefined;
    const gameEditions = editions.filter((candidate) => candidate.gameId === game.id);
    if (gameEditions.length === 0) return undefined;

    if (!editionParam) {
      return gameEditions
        .sort((a, b) => b.id - a.id)
        .sort((a, b) => b.priority - a.priority)[0];
    }

    return gameEditions.find(
      (candidate) =>
        candidate.id.toString() === editionParam ||
        candidate.name.toLowerCase().replace(/ /g, "-") ===
          editionParam.toLowerCase(),
    );
  }, [game, editionParam, editions]);

  const player = useMemo(() => {
    if (playerParam && playerParam.match(/^0x[0-9a-fA-F]+$/)) {
      try {
        return getChecksumAddress(playerParam);
      } catch (error) {
        console.error("Invalid player address", error);
        return undefined;
      }
    }

    const address = playerData?.account?.controllers?.edges?.[0]?.node?.address;
    if (address) {
      try {
        return getChecksumAddress(address);
      } catch (error) {
        console.error("Invalid controller address", error);
      }
    }

    return undefined;
  }, [playerData, playerParam]);

  return {
    game,
    edition,
    player,
    filter,
    collection,
    tab,
  };
};
