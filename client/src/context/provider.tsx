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
import { MarketplaceProvider } from "./marketplace";
import { MarketCollectionProvider } from "./market-collection";
import { MarketFiltersProvider } from "./market-filters";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persister } from "../queries";

export function Provider({ children }: PropsWithChildren) {
  const qc = new QueryClient();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <PostHogProvider>
        <CartridgeAPIProvider
          url={`${import.meta.env.VITE_CARTRIDGE_API_URL}/query`}
        >
          <IndexerAPIProvider credentials="omit">
            <QueryClientProvider client={qc}>
              <MarketplaceProvider>
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
                                    <SidebarProvider>
                                      {children}
                                    </SidebarProvider>
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
              </MarketplaceProvider>
            </QueryClientProvider>
          </IndexerAPIProvider>
        </CartridgeAPIProvider>
      </PostHogProvider>
    </PersistQueryClientProvider>
  );
}
