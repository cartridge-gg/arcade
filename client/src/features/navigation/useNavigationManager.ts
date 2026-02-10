import { useMemo } from "react";
import { useArcade } from "@/hooks/arcade";
import { NavigationContextManager } from "@/features/navigation/NavigationContextManager";
import { useAccount } from "@starknet-react/core";
import { useRouterState } from "@tanstack/react-router";

export function useNavigationManager(): NavigationContextManager {
  const { location } = useRouterState();
  const { games, editions } = useArcade();
  const { isConnected } = useAccount();

  const navManager = useMemo(
    () =>
      new NavigationContextManager({
        pathname: location.pathname,
        games,
        editions,
        isLoggedIn: Boolean(isConnected),
      }),
    [location.pathname, games, editions, isConnected],
  );

  return navManager;
}
