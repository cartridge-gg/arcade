# Marketplace Data Client

The marketplace SDK bundles a lightweight data client that exposes the most common read paths needed by experiences
consuming Cartridge marketplace content. It can be accessed through the `@cartridge/arcade/marketplace` export.

```ts
import { createMarketplaceClient, type MarketplaceClientConfig } from "@cartridge/arcade/marketplace";
```

## Capabilities

The client surfaces the following high-level methods:

| Method                   | Description                                                                  |
| ------------------------ | ---------------------------------------------------------------------------- |
| `getCollection`          | Fetches marketplace metadata for a single collection.                        |
| `listCollectionTokens`   | Streams paginated tokens for the collection with optional attribute filters. |
| `getCollectionOrders`    | Reads open orders filtered by collection, token, status, or category.        |
| `listCollectionListings` | Returns currently listed sell orders for a collection or token.              |
| `getToken`               | Retrieves an enriched token with associated orders and listings.             |

Each method accepts strongly typed options so consumers can opt into pagination, attribute filters, or custom image
resolvers without re-implementing Torii plumbing. When no resolver is provided the client automatically serves assets
from Torii's static endpoints.

## Configuration

`createMarketplaceClient` requires the Starknet `chainId` to locate the right Arcade environment. Optional hooks let you
provide custom image resolvers if you need fine-grained control of token/contract imagery, as shown in the example
below.

```ts
const client = await createMarketplaceClient({
  chainId: constants.StarknetChainId.SN_MAIN,
  defaultProject: "arcade-main",
  // Optional hooks for custom caching/CDN logic. By default images are served from
  // https://api.cartridge.gg/x/{project}/torii/static/...
  resolveTokenImage: async (token, ctx) => myTokenCdn(token, ctx),
  resolveContractImage: async (contract, ctx) => myCollectionCdn(contract, ctx),
});
```

## Error handling

All data methods throw when the underlying Torii fetch fails. For the paginated `listCollectionTokens` call the result
contains a `pages` array and an `errors` array so you can present per-project failures while still rendering successful
responses. Fetch helpers rely on `getChecksumAddress` internally to ensure consistent casing.

## React integration

If you are building a React application, the package ships a context provider that handles client lifecycle and exposes
a ready-to-use hook:

```tsx
import {
  MarketplaceClientProvider,
  useMarketplaceCollectionTokens,
} from "@cartridge/arcade/marketplace/react";

function MarketplaceApp() {
  return (
    <MarketplaceClientProvider config={{ chainId: constants.StarknetChainId.SN_MAIN, defaultProject: "arcade-main" }}>
      <Dashboard />
    </MarketplaceClientProvider>
  );
}

function Dashboard() {
  const { data, status, error, refresh } = useMarketplaceCollectionTokens({
    address: "0x04f51290f2b0e16524084c27890711c7a955eb276cffec185d6f24f2a620b15f",
    limit: 10,
  });

  if (status === "loading") return <Spinner />;
  if (status === "error") return <ErrorView error={error} onRetry={refresh} />;

  const tokens = data?.pages.flatMap((page) => page.tokens) ?? [];
  return <TokensList tokens={tokens} />;
}
```

The provider accepts either a `config` object or an already-instantiated `MarketplaceClient`, making it easy to bridge
with existing application contexts.

The React module also ships dedicated hooks, each of which re-fetches automatically when its input parameters change:

| Hook | Returns |
| --- | --- |
| `useMarketplaceCollection` | A single collection summary. |
| `useMarketplaceCollectionTokens` | Token pages, including per-project errors. |
| `useMarketplaceCollectionOrders` | Orders filtered by collection/token/status. |
| `useMarketplaceCollectionListings` | Active listings for a collection/token. |
| `useMarketplaceToken` | Token snapshot with related orders and listings. |

Every hook exposes a `refresh` method to allow manual retries when needed.

## See also

An executable example demonstrating these APIs lives in `packages/arcade-ts/examples/marketplace-client.ts`.
