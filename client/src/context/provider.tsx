import type { PropsWithChildren } from "react";
import { CartridgeAPIProvider } from "@cartridge/ui/utils/api/cartridge";
import { IndexerAPIProvider } from "@cartridge/ui/utils/api/indexer";
import { StarknetProvider } from "./starknet";
import { PostHogProvider } from "./posthog";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persister } from "../queries";
import { MarketplaceClientProvider } from "@cartridge/arcade/marketplace/react";
import { constants } from "starknet";
import { DEFAULT_PROJECT } from "@/constants";
import { checkAndClearStaleCache } from "@/utils/versionCheck";

checkAndClearStaleCache();

export function Provider({ children }: PropsWithChildren) {
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
            <MarketplaceClientProvider
              config={{
                chainId: constants.StarknetChainId.SN_MAIN,
                defaultProject: DEFAULT_PROJECT,
              }}
            >
              <StarknetProvider>{children}</StarknetProvider>
            </MarketplaceClientProvider>
          </IndexerAPIProvider>
        </CartridgeAPIProvider>
      </PostHogProvider>
    </PersistQueryClientProvider>
  );
}
