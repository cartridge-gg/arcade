import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ArcadeProvider } from "./arcade";
import { ThemeProvider } from "./theme";
import { BrowserRouter } from "react-router-dom";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { IndexerAPIProvider } from "@cartridge/utils/api/indexer";
import { AchievementProvider } from "./achievement";
import { StarknetProvider } from "./starknet";
import { ProjectProvider } from "./project";
import { CollectionProvider } from "./collection";
import { TokenProvider } from "./token";
import { ActivitiesProvider } from "./activities";
import { MetricsProvider } from "./metrics";
import { OwnershipProvider } from "./ownership";

export function Provider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <CartridgeAPIProvider
        url={`${import.meta.env.VITE_CARTRIDGE_API_URL}/query`}
      >
        <IndexerAPIProvider credentials="omit">
          <QueryClientProvider client={queryClient}>
            <ArcadeProvider>
              <StarknetProvider>
                <ProjectProvider>
                  <ThemeProvider defaultScheme="dark">
                    <OwnershipProvider>
                      <CollectionProvider>
                        <TokenProvider>
                          <ActivitiesProvider>
                            <MetricsProvider>
                              <AchievementProvider>
                                {children}
                              </AchievementProvider>
                            </MetricsProvider>
                          </ActivitiesProvider>
                        </TokenProvider>
                      </CollectionProvider>
                    </OwnershipProvider>
                  </ThemeProvider>
                </ProjectProvider>
              </StarknetProvider>
            </ArcadeProvider>
          </QueryClientProvider>
        </IndexerAPIProvider>
      </CartridgeAPIProvider>
    </BrowserRouter>
  );
}
