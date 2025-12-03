import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { useOwnerships } from "@/hooks/ownerships";
import { useProject } from "@/hooks/project";
import { useSidebar } from "@/hooks/sidebar";
import { usePlayerStats } from "@/hooks/achievements";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useRouterState } from "@tanstack/react-router";
import type { GameModel, AccessModel, EditionModel } from "@cartridge/arcade";
import { useArcade } from "@/hooks/arcade";
import type { Ownership } from "@/effect/atoms/ownerships";

export interface GameListItem {
  id: number;
  name: string;
  icon: string;
  cover?: string;
  active: boolean;
  owner: boolean;
  whitelisted: boolean;
  published: boolean;
  color?: string;
  game?: GameModel;
}

export interface GameItemSharedContext {
  address: string | undefined;
  accesses: AccessModel[];
  editions: EditionModel[];
  ownerships: Ownership[];
  pathname: string;
  close: () => void;
  trackGameInteraction: ReturnType<typeof useAnalytics>["trackGameInteraction"];
  totalStats: ReturnType<typeof usePlayerStats>;
}

export interface GamesViewModel {
  games: GameListItem[];
  selectedGameId: number;
  isMobile: boolean;
  isPWA: boolean;
  sidebar: {
    isOpen: boolean;
    handleTouchStart: (event: React.TouchEvent) => void;
    handleTouchMove: (event: React.TouchEvent) => void;
    close: () => void;
  };
  sharedContext: GameItemSharedContext;
}

export function useGamesViewModel({
  isMobile,
  isPWA,
}: {
  isMobile: boolean;
  isPWA: boolean;
}): GamesViewModel {
  const { address } = useAccount();
  const { games, accesses, editions } = useArcade();
  const { game } = useProject();
  const { ownerships } = useOwnerships();
  const sidebar = useSidebar();
  const { location } = useRouterState();
  const { trackGameInteraction } = useAnalytics();
  const totalStats = usePlayerStats();
  const selectedGameId = useMemo(() => game?.id || 0, [game?.id]);

  const gameItems = useMemo(() => {
    return games.map((currentGame) => {
      const ownerAddress = ownerships.find(
        (ownership) => ownership.tokenId === BigInt(currentGame.id),
      )?.accountAddress;
      const isOwner =
        ownerAddress !== undefined &&
        address !== undefined &&
        BigInt(ownerAddress) === BigInt(address);

      return {
        id: currentGame.id,
        name: currentGame.name,
        icon: currentGame.properties.icon ?? "",
        cover: currentGame.properties.cover,
        active: BigInt(selectedGameId || "0x0") === BigInt(currentGame.id),
        owner: isOwner,
        whitelisted: currentGame.whitelisted,
        published: currentGame.published,
        color: currentGame.color,
        game: currentGame,
      } satisfies GameListItem;
    });
  }, [games, ownerships, address, selectedGameId]);

  const sharedContext = useMemo<GameItemSharedContext>(
    () => ({
      address,
      accesses,
      editions,
      ownerships,
      pathname: location.pathname,
      close: sidebar.close,
      trackGameInteraction,
      totalStats,
    }),
    [
      address,
      accesses,
      editions,
      ownerships,
      location.pathname,
      sidebar.close,
      trackGameInteraction,
      totalStats,
    ],
  );

  const sidebarProps = useMemo(
    () => ({
      isOpen: sidebar.isOpen,
      handleTouchStart: sidebar.handleTouchStart,
      handleTouchMove: sidebar.handleTouchMove,
      close: sidebar.close,
    }),
    [
      sidebar.isOpen,
      sidebar.handleTouchStart,
      sidebar.handleTouchMove,
      sidebar.close,
    ],
  );

  return useMemo(
    () => ({
      games: gameItems as GameListItem[],
      selectedGameId,
      isMobile,
      isPWA,
      sidebar: sidebarProps,
      sharedContext,
    }),
    [gameItems, selectedGameId, isMobile, isPWA, sidebarProps, sharedContext],
  );
}
