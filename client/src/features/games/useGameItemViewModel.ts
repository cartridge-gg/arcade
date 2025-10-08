import { useMemo, useState, useCallback, useEffect } from "react";
import { useAccount } from "@starknet-react/core";
import { useArcade } from "@/hooks/arcade";
import { useOwnerships } from "@/hooks/ownerships";
import { usePlayerGameStats, usePlayerStats } from "@/hooks/achievements";
import { useSidebar } from "@/hooks/sidebar";
import { useRouterState } from "@tanstack/react-router";
import { joinPaths } from "@/lib/helpers";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { GameModel } from "@cartridge/arcade";

export interface GameItemViewModel {
  id: number;
  name: string;
  icon: string;
  cover?: string;
  active: boolean;
  owner: boolean;
  admin: boolean;
  whitelisted: boolean;
  published: boolean;
  color?: string;
  points: number;
  target: string;
  onSelect: () => void;
  actions: Array<
    | { type: "update"; game: GameModel }
    | {
        type: "publish";
        game: GameModel;
        status: boolean;
        setPublished: (status: boolean) => void;
      }
    | {
        type: "whitelist";
        game: GameModel;
        status: boolean;
        setWhitelisted: (status: boolean) => void;
      }
  >;
}

export function useGameItemViewModel(
  game: GameModel | null,
  options: {
    selectedGameId: number;
  },
): GameItemViewModel {
  const { address } = useAccount();
  const { accesses, editions } = useArcade();
  const { ownerships } = useOwnerships();
  const { trackGameInteraction } = useAnalytics();
  const totalStats = usePlayerStats();
  const projects = useMemo(() => {
    if (!game) return [];
    return editions
      .filter((edition) => edition.gameId === game.id)
      .map((edition) => edition.config.project);
  }, [editions, game]);
  const gameStats = usePlayerGameStats(projects);
  const { close } = useSidebar();
  const { location } = useRouterState();

  const cloneGame = useCallback((source: GameModel | null) => {
    if (!source) return null;
    if (typeof source.clone === "function") {
      return source.clone() as GameModel;
    }
    return { ...source } as GameModel;
  }, []);

  const [localGame, setLocalGame] = useState(() => cloneGame(game));

  const ownerAddress = useMemo(() => {
    return ownerships.find(
      (ownership) => ownership.tokenId === BigInt(game?.id ?? 0),
    )?.accountAddress;
  }, [ownerships, game?.id]);

  const isOwner = useMemo(() => {
    if (!ownerAddress || !address) return false;
    return BigInt(ownerAddress) === BigInt(address);
  }, [ownerAddress, address]);

  const access = useMemo(() => {
    if (!address) return undefined;
    return accesses.find((entry) => BigInt(entry.address) === BigInt(address));
  }, [accesses, address]);

  const isAdmin = useMemo(() => {
    if (!access) return false;
    return access.role?.value === "Member" || access.role?.value === "Admin";
  }, [access]);

  const active = useMemo(() => {
    if (game === null) {
      return options.selectedGameId === 0;
    }
    return BigInt(options.selectedGameId || "0x0") === BigInt(game.id);
  }, [options.selectedGameId, game]);

  const target = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const playerIndex = segments.indexOf("player");
    const hasPlayer = playerIndex !== -1;
    const playerPath = hasPlayer ? segments.slice(playerIndex) : [];

    if (!game) {
      return hasPlayer ? joinPaths(...playerPath) : "/";
    }

    const gameName = (game.name || game.id.toString())
      .toLowerCase()
      .replace(/ /g, "-");
    const targetSegments = ["game", gameName];
    if (hasPlayer) {
      targetSegments.push(...playerPath);
    }
    return joinPaths(...targetSegments);
  }, [location.pathname, game]);

  const onSelect = useCallback(() => {
    trackGameInteraction({
      game: {
        action: "select",
        data: {
          id: (game?.id ?? 0).toString(),
          name: game?.name || "All Games",
        },
      },
      properties: {
        is_all_games: !game,
        is_owner: isOwner,
        is_admin: isAdmin,
        is_whitelisted: localGame?.whitelisted ?? true,
        is_published: localGame?.published ?? true,
      },
    });
    close();
  }, [trackGameInteraction, game, isOwner, isAdmin, localGame, close]);

  const setWhitelisted = useCallback(
    (status: boolean) => {
      if (!localGame) return;
      const clone = localGame.clone();
      clone.whitelisted = status;
      setLocalGame(clone);
      trackGameInteraction({
        game: {
          action: status ? "whitelist" : "blacklist",
          data: {
            id: clone.id.toString(),
            name: clone.name,
          },
        },
      });
    },
    [localGame, trackGameInteraction],
  );

  const setPublished = useCallback(
    (status: boolean) => {
      if (!localGame) return;
      const clone = localGame.clone();
      clone.published = status;
      setLocalGame(clone);
      trackGameInteraction({
        game: {
          action: status ? "publish" : "hide",
          data: {
            id: clone.id.toString(),
            name: clone.name,
          },
        },
      });
    },
    [localGame, trackGameInteraction],
  );

  useEffect(() => {
    setLocalGame(cloneGame(game));
  }, [game, cloneGame]);

  const actions = useMemo(() => {
    const list: GameItemViewModel["actions"] = [];
    if (!localGame) return list;

    if (isOwner) {
      list.push({ type: "update", game: localGame });
      list.push({
        type: "publish",
        game: localGame,
        status: localGame.published,
        setPublished,
      });
    }
    if (isAdmin) {
      list.push({
        type: "whitelist",
        game: localGame,
        status: localGame.whitelisted,
        setWhitelisted,
      });
    }
    return list;
  }, [localGame, isOwner, isAdmin, setPublished, setWhitelisted]);

  return {
    id: game?.id ?? 0,
    name: game?.name ?? "All Games",
    icon: game?.properties.icon ?? "",
    cover: game?.properties.cover,
    active,
    owner: isOwner,
    admin: isAdmin,
    whitelisted: localGame?.whitelisted ?? true,
    published: localGame?.published ?? true,
    color: game?.color,
    points: game ? gameStats.earnings : totalStats.earnings,
    target,
    onSelect,
    actions,
  } satisfies GameItemViewModel;
}
