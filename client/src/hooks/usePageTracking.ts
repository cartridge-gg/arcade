import { useEffect } from "react";
import { useAnalytics } from "./useAnalytics";
import { useRouterState } from "@tanstack/react-router";

// Page name mapping for cleaner analytics
const pageNameMap: Record<string, string> = {
  "/": "inventory",
  "/achievements": "achievements",
  "/activity": "activity",
  "/marketplace": "marketplace",
  "/discover": "discover",
  "/game": "game_detail",
  "/player": "player_profile",
  "/collection": "collection",
  "/register": "game_register",
};

export function usePageTracking() {
  const { location } = useRouterState();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // Extract the base path for page name
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const basePath = pathSegments[0] || "home";

    // Get the page name from map or use the base path
    const pageName = pageNameMap[`/${basePath}`] || basePath;

    // Extract any IDs from the path
    const properties: Record<string, any> = {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
    };

    // Check for specific route patterns and add relevant properties
    if (location.pathname.startsWith("/game/")) {
      properties.game_id = pathSegments[1];
    } else if (location.pathname.startsWith("/player/")) {
      properties.player_username = pathSegments[1];
    } else if (location.pathname.startsWith("/collection/")) {
      properties.collection_id = pathSegments[1];
    }

    // Track the page view
    trackPageView(pageName, properties);
  }, [location, trackPageView]);
}
