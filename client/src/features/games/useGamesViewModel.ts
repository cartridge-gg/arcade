import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { useArcade } from "@/hooks/arcade";
import { useOwnerships } from "@/hooks/ownerships";
import { useProject } from "@/hooks/project";
import { useSidebar } from "@/hooks/sidebar";
import type { GameModel } from "@cartridge/arcade";

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
}

export function useGamesViewModel({
  isMobile,
  isPWA,
}: {
  isMobile: boolean;
  isPWA: boolean;
}): GamesViewModel {
  const { address } = useAccount();
  const { games, editions } = useArcade();
  const { game } = useProject();
  const { ownerships } = useOwnerships();
  const sidebar = useSidebar();
  const selectedGameId = useMemo(() => game?.id || 0, [game?.id]);

  const gameItems = useMemo(() => {
    return games.map((currentGame) => {
      const ownerAddress = ownerships.find(
        (ownership) => ownership.tokenId === BigInt(currentGame.id),
      )?.accountAddress;
      const isOwner = Boolean(
        ownerAddress && BigInt(ownerAddress) === BigInt(address || "0x1"),
      );

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

  const listItems = useMemo(() => {
    const allGamesEntry: GameListItem = {
      id: 0,
      name: "All Games",
      icon: "",
      cover: undefined,
      active: selectedGameId === 0,
      owner: false,
      whitelisted: true,
      published: true,
    };

    return [allGamesEntry, ...gameItems];
  }, [gameItems, selectedGameId]);

  return {
    games: listItems,
    selectedGameId,
    isMobile,
    isPWA,
    sidebar: {
      isOpen: sidebar.isOpen,
      handleTouchStart: sidebar.handleTouchStart,
      handleTouchMove: sidebar.handleTouchMove,
      close: sidebar.close,
    },
  } satisfies GamesViewModel;
}
