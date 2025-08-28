import { useRouterState } from "@tanstack/react-router";
import { useMemo } from "react";
import { joinPaths } from "@/helpers";

export function usePathBuilder() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const buildPlayerPath = useMemo(() => {
    return (playerNameOrAddress: string, tab?: string) => {
      let newPath = pathname;
      newPath = newPath.replace(/\/player\/[^/]+/, "");
      newPath = newPath.replace(/\/(activity|leaderboard|marketplace|guilds|about)($|\/)/, "");
      newPath = newPath.replace(/\/collection\/[^/]+/, "");

      const player = playerNameOrAddress.toLowerCase();
      const segments = [newPath, `/player/${player}`];
      if (tab) {
        segments.push(`/${tab}`);
      }
      return joinPaths(...segments);
    };
  }, [pathname]);

  const buildGamePath = useMemo(() => {
    return (gameName: string, editionName?: string) => {
      let newPath = pathname;
      newPath = newPath.replace(/\/game\/[^/]+/, "");
      newPath = newPath.replace(/\/edition\/[^/]+/, "");

      const game = gameName.toLowerCase().replace(/ /g, "-");
      if (editionName) {
        const edition = editionName.toLowerCase().replace(/ /g, "-");
        return joinPaths(`/game/${game}/edition/${edition}`, newPath);
      }
      return joinPaths(`/game/${game}`, newPath);
    };
  }, [pathname]);

  const buildCollectionPath = useMemo(() => {
    return (
      collectionAddress: string,
      tab?: string,
      gameName?: string,
      editionName?: string
    ) => {
      const collection = collectionAddress.toLowerCase();

      if (gameName && editionName) {
        const game = gameName.toLowerCase().replace(/ /g, "-");
        const edition = editionName.toLowerCase().replace(/ /g, "-");
        return `/game/${game}/edition/${edition}/collection/${collection}${tab ? `/${tab}` : ""}`;
      }

      if (gameName) {
        const game = gameName.toLowerCase().replace(/ /g, "-");
        return `/game/${game}/collection/${collection}${tab ? `/${tab}` : ""}`;
      }

      return `/collection/${collection}${tab ? `/${tab}` : ""}`;
    };
  }, []);

  const stripPathSegments = useMemo(() => {
    return (segments: string[]) => {
      let newPath = pathname;
      segments.forEach(segment => {
        const regex = new RegExp(`/${segment}/[^/]+`);
        newPath = newPath.replace(regex, "");
      });
      return newPath;
    };
  }, [pathname]);

  return {
    pathname,
    buildPlayerPath,
    buildGamePath,
    buildCollectionPath,
    stripPathSegments,
  };
}
