import { constants } from "starknet";
import {
  MarketplaceClientProvider,
  useMarketplaceCollectionTokens,
} from "@cartridge/arcade/marketplace/react";

function TokensPreview() {
  const { data, status, error, refresh } = useMarketplaceCollectionTokens({
    address:
      "0x04f51290f2b0e16524084c27890711c7a955eb276cffec185d6f24f2a620b15f",
    limit: 10,
  });

  if (status === "loading") return <p>Loading marketplace…</p>;
  if (status === "error") {
    return (
      <div>
        <p>Failed to load: {error?.message}</p>
        <button onClick={() => void refresh()}>Retry</button>
      </div>
    );
  }

  const tokens = data?.page?.tokens ?? [];
  return <p>Fetched {tokens.length} tokens</p>;
}

export function MarketplaceReactExample() {
  return (
    <MarketplaceClientProvider
      config={{
        chainId: constants.StarknetChainId.SN_MAIN,
        defaultProject: "arcade-main",
      }}
    >
      <TokensPreview />
    </MarketplaceClientProvider>
  );
}
