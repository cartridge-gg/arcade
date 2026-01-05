import { useMemo } from "react";
import { useArcade } from "@/hooks/arcade";
import { FEATURED_GAMES_CONFIG } from "@/config/featured-games";

export interface DashboardGameItem {
  id: number;
  name: string;
  icon: string;
  cover?: string;
  color: string;
  studio?: string;
  whitelisted: boolean;
}

export interface DashboardViewModel {
  featuredGames: DashboardGameItem[];
  allGames: DashboardGameItem[];
  isLoading: boolean;
}

export function useDashboardViewModel(): DashboardViewModel {
  const { games } = useArcade();

  const gameItems = useMemo((): DashboardGameItem[] => {
    return games.map((game) => ({
      id: game.id,
      name: game.name,
      icon: game.properties?.icon ?? "",
      cover: game.properties?.cover,
      color: game.color || "",
      studio: game.properties?.studio,
      whitelisted: game.whitelisted,
    }));
  }, [games]);

  const featuredGames = useMemo((): DashboardGameItem[] => {
    return FEATURED_GAMES_CONFIG.featured
      .map((id) => gameItems.find((g) => g.id === id))
      .filter((g): g is DashboardGameItem => g !== undefined);
  }, [gameItems]);

  const allGames = useMemo((): DashboardGameItem[] => {
    return gameItems.filter((g) => g.whitelisted);
  }, [gameItems]);

  return {
    featuredGames,
    allGames,
    isLoading: games.length === 0,
  };
}
