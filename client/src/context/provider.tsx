import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ArcadeProvider } from "./arcade";
import { CartridgeAPIProvider } from "@cartridge/ui/utils/api/cartridge";
import { IndexerAPIProvider } from "@cartridge/ui/utils/api/indexer";
import { AchievementProvider } from "./achievement";
import { StarknetProvider } from "./starknet";
import { CollectionProvider } from "./collection";
import { TokenProvider } from "./token";
import { ActivitiesProvider } from "./activities";
import { MetricsProvider } from "./metrics";
import { OwnershipsProvider } from "./ownerships";
import { PostHogProvider } from "./posthog";
import { SidebarProvider } from "./sidebar";
import { MarketCollectionProvider } from "./market-collection";
import { MarketFiltersProvider } from "./market-filters";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persister } from "../queries";

export function Provider({ children }: PropsWithChildren) {
  const qc = new QueryClient();

  // Use PersistQueryClientProvider only in browser, fallback to QueryClientProvider in SSR
  const QueryProvider = typeof window !== "undefined" && persister
    ? PersistQueryClientProvider
    : QueryClientProvider;

  const queryProviderProps = typeof window !== "undefined" && persister
    ? { client: queryClient, persistOptions: { persister } }
    : { client: queryClient };

  return (
    <QueryProvider {...(queryProviderProps as any)}>
      <PostHogProvider>
        <CartridgeAPIProvider
          url={`${import.meta.env.VITE_CARTRIDGE_API_URL}/query`}
        >
          <IndexerAPIProvider credentials="omit">
            <QueryClientProvider client={qc}>
              <ArcadeProvider>
                <MarketCollectionProvider>
                  <StarknetProvider>
                    <OwnershipsProvider>
                      <CollectionProvider>
                        <TokenProvider>
                          <AchievementProvider>
                            <ActivitiesProvider>
                              <MetricsProvider>
                                <MarketFiltersProvider>
                                  <SidebarProvider>{children}</SidebarProvider>
                                </MarketFiltersProvider>
                              </MetricsProvider>
                            </ActivitiesProvider>
                          </AchievementProvider>
                        </TokenProvider>
                      </CollectionProvider>
                    </OwnershipsProvider>
                  </StarknetProvider>
                </MarketCollectionProvider>
              </ArcadeProvider>
            </QueryClientProvider>
          </IndexerAPIProvider>
        </CartridgeAPIProvider>
      </PostHogProvider>
    </QueryProvider>
  );
}
