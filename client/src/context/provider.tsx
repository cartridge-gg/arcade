import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ArcadeProvider } from "./arcade";
import { ThemeProvider } from "./theme";
import { ConnectionProvider } from "./connection";
import { BrowserRouter } from "react-router-dom";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { IndexerAPIProvider } from "@cartridge/utils/api/indexer";
import { DataProvider } from "./data";
import { StarknetProvider } from "./starknet";

export function Provider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <CartridgeAPIProvider
        url={`${import.meta.env.VITE_CARTRIDGE_API_URL!}/query`}
      >
        <IndexerAPIProvider credentials="omit">
          <QueryClientProvider client={queryClient}>
            <StarknetProvider>
              <ArcadeProvider>
                <ConnectionProvider>
                  <ThemeProvider defaultScheme="system">
                    <DataProvider>{children}</DataProvider>
                  </ThemeProvider>
                </ConnectionProvider>
              </ArcadeProvider>
            </StarknetProvider>
          </QueryClientProvider>
        </IndexerAPIProvider>
      </CartridgeAPIProvider>
    </BrowserRouter>
  );
}
