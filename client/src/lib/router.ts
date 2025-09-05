import React from "react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { constants } from "starknet";
import { queryClient } from "@/queries";
import { queryKeys } from "@/queries/keys";
import { fetchGames, fetchEditions } from "@/queries/games/registry";

interface OptimizedRouteConfig {
  component: React.ComponentType;
  pendingComponent?: React.ComponentType;
  additionalPrefetches?: Array<() => Promise<any>>;
}

interface SimpleRouteConfig {
  component: React.ComponentType;
}

interface LayoutRouteConfig {
  component?: React.ComponentType;
}

interface RedirectRouteConfig {
  to: string;
}

const validateSearch = (search: Record<string, unknown>) => {
  return {
    filter: search.filter as string | undefined,
  };
};

export const createOptimizedRoute = (path: string) => {
  return (config: OptimizedRouteConfig) => {
    return createFileRoute(path)({
      validateSearch,
      loader: async () => {
        // const chainId = constants.StarknetChainId.SN_MAIN;
        //
        // const promises = [
        //   queryClient.prefetchQuery({
        //     queryKey: queryKeys.games.all,
        //     queryFn: () => fetchGames(chainId),
        //   }),
        //   queryClient.prefetchQuery({
        //     queryKey: queryKeys.games.editions,
        //     queryFn: () => fetchEditions(chainId),
        //   }),
        //   ...(config.additionalPrefetches || []),
        // ];
        //
        // await Promise.all(promises);
        return {};
      },
      pendingMs: 0,
      pendingMinMs: 500,
      component: config.component,
      pendingComponent: config.pendingComponent,
    });
  };
};

export const createSimpleRoute = (path: string) => {
  return (config: SimpleRouteConfig) => {
    return createFileRoute(path)({
      validateSearch,
      component: config.component,
    });
  };
};

export const createLayoutRoute = (path: string) => {
  return (config: LayoutRouteConfig = {}) => {
    return createFileRoute(path)({
      validateSearch,
      component: config.component || (() => React.createElement(Outlet)),
    });
  };
};

export const createRedirectRoute = (path: string) => {
  return (config: RedirectRouteConfig) => {
    return createFileRoute(path)({
      validateSearch,
      beforeLoad: ({ params, search }) => {
        throw redirect({
          to: config.to,
          params,
          search,
        });
      },
    });
  };
};
