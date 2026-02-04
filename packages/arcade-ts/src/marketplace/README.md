# Marketplace Data Client

The marketplace SDK bundles a lightweight data client that exposes the most common read paths needed by experiences
consuming Cartridge marketplace content.

```ts
import {
  createMarketplaceClient,
  type MarketplaceClientConfig,
} from "@cartridge/arcade/marketplace";
```

## Quick Start

```ts
import { constants } from "starknet";
import { createMarketplaceClient } from "@cartridge/arcade/marketplace";

const client = await createMarketplaceClient({
  chainId: constants.StarknetChainId.SN_MAIN,
});

// Fetch a collection
const collection = await client.getCollection({
  address: "0x04f5...b15f",
});

// List tokens with pagination
const result = await client.listCollectionTokens({
  address: "0x04f5...b15f",
  limit: 20,
});

const tokens = result.page?.tokens ?? [];
const nextCursor = result.page?.nextCursor;
```

## Configuration

`createMarketplaceClient` accepts a `MarketplaceClientConfig` object:

```ts
const client = await createMarketplaceClient({
  chainId: constants.StarknetChainId.SN_MAIN,
  defaultProject: "arcade-main",
  resolveTokenImage: async (token, ctx) => myTokenCdn(token, ctx),
  resolveContractImage: async (contract, ctx) => myCollectionCdn(contract, ctx),
  provider: new RpcProvider({ nodeUrl: "..." }),
});
```

| Field                  | Type                    | Required | Description                                                            |
| ---------------------- | ----------------------- | -------- | ---------------------------------------------------------------------- |
| `chainId`              | `StarknetChainId`       | Yes      | Starknet chain to target (`SN_MAIN`, `SN_SEPOLIA`).                   |
| `defaultProject`       | `string`                | No       | Torii project identifier. Defaults to `"arcade-main"`.                 |
| `resolveTokenImage`    | `ResolveTokenImage`     | No       | Custom resolver for token images. Falls back to Torii static endpoint. |
| `resolveContractImage` | `ResolveContractImage`  | No       | Custom resolver for collection images.                                 |
| `provider`             | `RpcProvider`           | No       | Starknet RPC provider. Required for `getRoyaltyFee`.                   |

## Client Methods

### `getCollection`

Fetches marketplace metadata for a single collection.

```ts
const collection = await client.getCollection({
  address: "0x04f5...b15f",
  fetchImages: true,
});

console.log(collection?.totalSupply);  // bigint
console.log(collection?.contractType); // "ERC721" | "ERC1155"
console.log(collection?.image);        // resolved image URL
```

| Option        | Type      | Required | Description                          |
| ------------- | --------- | -------- | ------------------------------------ |
| `address`     | `string`  | Yes      | Contract address of the collection.  |
| `projectId`   | `string`  | No       | Override the default Torii project.  |
| `fetchImages` | `boolean` | No       | Resolve collection image if `true`.  |

Returns `Promise<NormalizedCollection | null>`.

---

### `listCollectionTokens`

Streams paginated tokens for a collection with optional attribute filters.

```ts
const result = await client.listCollectionTokens({
  address: "0x04f5...b15f",
  limit: 50,
  attributeFilters: { rarity: ["legendary", "epic"] },
});

if (result.error) {
  console.error(result.error.error.message);
} else {
  const tokens = result.page!.tokens;
  const next = result.page!.nextCursor; // null when exhausted
}
```

| Option             | Type                   | Required | Description                                        |
| ------------------ | ---------------------- | -------- | -------------------------------------------------- |
| `address`          | `string`               | Yes      | Contract address.                                   |
| `limit`            | `number`               | No       | Page size (default `100`).                          |
| `cursor`           | `string \| null`       | No       | Pagination cursor from a previous call.             |
| `attributeFilters` | `AttributeFilterInput` | No       | Trait filters as `{ trait: value \| values[] }`.    |
| `tokenIds`         | `string[]`             | No       | Return only specific token IDs.                     |
| `fetchImages`      | `boolean`              | No       | Resolve token images.                               |
| `project`          | `string`               | No       | Override project for this request.                  |
| `resolveTokenImage`| `ResolveTokenImage`    | No       | Per-call image resolver override.                   |
| `defaultProjectId` | `string`               | No       | Fallback project identifier.                        |

Returns `Promise<FetchCollectionTokensResult>` — `{ page, error }`.

---

### `getCollectionOrders`

Reads open orders filtered by collection, token, status, or category.

```ts
const orders = await client.getCollectionOrders({
  collection: "0x04f5...b15f",
  status: "OPEN",
  category: "LISTING",
  limit: 25,
});
```

| Option       | Type       | Required | Description                              |
| ------------ | ---------- | -------- | ---------------------------------------- |
| `collection` | `string`   | Yes      | Contract address.                        |
| `tokenId`    | `string`   | No       | Filter to a specific token.              |
| `status`     | `string`   | No       | Order status filter (e.g. `"OPEN"`).     |
| `category`   | `string`   | No       | Order category (e.g. `"LISTING"`).       |
| `limit`      | `number`   | No       | Maximum number of orders to return.      |
| `orderIds`   | `number[]` | No       | Fetch specific order IDs.                |

Returns `Promise<OrderModel[]>`.

---

### `listCollectionListings`

Returns currently listed sell orders for a collection or token.

```ts
const listings = await client.listCollectionListings({
  collection: "0x04f5...b15f",
  tokenId: "42",
  verifyOwnership: true,
});
```

| Option            | Type      | Required | Description                               |
| ----------------- | --------- | -------- | ----------------------------------------- |
| `collection`      | `string`  | Yes      | Contract address.                         |
| `tokenId`         | `string`  | No       | Filter to a specific token.               |
| `limit`           | `number`  | No       | Maximum number of listings to return.     |
| `verifyOwnership` | `boolean` | No       | Cross-check on-chain ownership.           |
| `projectId`       | `string`  | No       | Override the default Torii project.       |

Returns `Promise<OrderModel[]>`.

---

### `getToken`

Retrieves an enriched token with associated orders and listings.

```ts
const details = await client.getToken({
  collection: "0x04f5...b15f",
  tokenId: "42",
  fetchImages: true,
  orderLimit: 10,
});

if (details) {
  console.log(details.token.image);
  console.log(details.orders.length);
  console.log(details.listings.length);
}
```

| Option        | Type      | Required | Description                          |
| ------------- | --------- | -------- | ------------------------------------ |
| `collection`  | `string`  | Yes      | Contract address.                    |
| `tokenId`     | `string`  | Yes      | Token identifier.                    |
| `projectId`   | `string`  | No       | Override the default Torii project.  |
| `fetchImages` | `boolean` | No       | Resolve token images.                |
| `orderLimit`  | `number`  | No       | Cap the number of related orders.    |

Returns `Promise<TokenDetails | null>`.

---

### `getFees`

Reads the marketplace fee configuration from the on-chain contract.

```ts
const fees = await client.getFees();

if (fees) {
  const pct = (fees.feeNum / fees.feeDenominator) * 100;
  console.log(`Marketplace fee: ${pct}%`);
  console.log(`Fee receiver: ${fees.feeReceiver}`);
}
```

No parameters. Returns `Promise<MarketplaceFees | null>`.

---

### `getRoyaltyFee`

Computes the royalty fee for a given token and sale amount. Requires `provider` in the client config.

```ts
const client = await createMarketplaceClient({
  chainId: constants.StarknetChainId.SN_MAIN,
  provider: new RpcProvider({ nodeUrl: "..." }),
});

const royalty = await client.getRoyaltyFee({
  collection: "0x04f5...b15f",
  tokenId: "42",
  amount: 1000000000000000000n, // 1 ETH in wei
});

if (royalty) {
  console.log(`Royalty receiver: ${royalty.receiver}`);
  console.log(`Royalty amount: ${royalty.amount}`);
}
```

| Option       | Type     | Required | Description                         |
| ------------ | -------- | -------- | ----------------------------------- |
| `collection` | `string` | Yes      | Contract address.                   |
| `tokenId`    | `string` | Yes      | Token identifier.                   |
| `amount`     | `bigint` | Yes      | Sale amount to compute royalty for. |

Returns `Promise<RoyaltyFee | null>`.

## Standalone Functions

These functions are exported directly and do not require a client instance. They accept a `defaultProjectId` parameter for Torii project resolution.

### `fetchCollectionTokens`

Low-level paginated token fetch — the same function the client uses internally.

```ts
import { fetchCollectionTokens } from "@cartridge/arcade/marketplace";

const result = await fetchCollectionTokens({
  address: "0x04f5...b15f",
  limit: 50,
  cursor: null,
  attributeFilters: { background: "gold" },
});

const tokens = result.page?.tokens ?? [];
```

### `fetchTokenBalances`

Fetches token balances for accounts or contracts, useful for portfolio views.

```ts
import { fetchTokenBalances } from "@cartridge/arcade/marketplace";

const result = await fetchTokenBalances({
  accountAddresses: ["0xabc..."],
  contractAddresses: ["0x04f5...b15f"],
  limit: 100,
});

for (const balance of result.page?.balances ?? []) {
  console.log(balance);
}
```

| Option               | Type             | Required | Description                                   |
| -------------------- | ---------------- | -------- | --------------------------------------------- |
| `project`            | `string`         | No       | Torii project identifier.                     |
| `contractAddresses`  | `string[]`       | No       | Filter by contract addresses.                 |
| `accountAddresses`   | `string[]`       | No       | Filter by account addresses.                  |
| `tokenIds`           | `string[]`       | No       | Filter by token IDs.                          |
| `cursor`             | `string \| null` | No       | Pagination cursor.                            |
| `limit`              | `number`         | No       | Page size (default `100`).                    |
| `defaultProjectId`   | `string`         | No       | Fallback project identifier.                  |

Returns `Promise<FetchTokenBalancesResult>` — `{ page, error }`.

## Trait Metadata & Filtering

The module exports a full suite of functions for fetching trait metadata and applying client-side filters. These mirror the logic used in the Arcade frontend.

### Fetching Trait Data

```ts
import {
  fetchTraitNamesSummary,
  fetchTraitValues,
  fetchExpandedTraitsMetadata,
  fetchCollectionTraitMetadata,
  aggregateTraitNamesSummary,
  aggregateTraitValues,
  aggregateTraitMetadata,
} from "@cartridge/arcade/marketplace";
```

#### `fetchTraitNamesSummary`

Returns the list of trait names and how many distinct values each has.

```ts
const { pages, errors } = await fetchTraitNamesSummary({
  address: "0x04f5...b15f",
});

const traits = aggregateTraitNamesSummary(pages);
// [{ traitName: "Background", valueCount: 12 }, ...]
```

#### `fetchTraitValues`

Returns the distinct values for a single trait, with counts. Supports cross-filtering with other active traits.

```ts
const { pages, errors } = await fetchTraitValues({
  address: "0x04f5...b15f",
  traitName: "Background",
  otherTraitFilters: [{ name: "Rarity", value: "Legendary" }],
});

const values = aggregateTraitValues(pages);
// [{ traitValue: "Gold", count: 15 }, { traitValue: "Silver", count: 42 }, ...]
```

#### `fetchExpandedTraitsMetadata`

Fetches full metadata for multiple traits at once. Supports cross-filtering.

```ts
const { pages, errors } = await fetchExpandedTraitsMetadata({
  address: "0x04f5...b15f",
  traitNames: ["Background", "Rarity", "Weapon"],
});

const rows = aggregateTraitMetadata(pages);
// [{ traitName: "Background", traitValue: "Gold", count: 15 }, ...]
```

#### `fetchCollectionTraitMetadata`

Fetches trait metadata for a collection, optionally filtered by active trait selections.

```ts
const { pages, errors } = await fetchCollectionTraitMetadata({
  address: "0x04f5...b15f",
  traits: [{ name: "Rarity", value: "Legendary" }],
});
```

### Building UI Filters

Transform raw metadata into UI-ready structures:

```ts
import {
  buildAvailableFilters,
  buildPrecomputedFilters,
  type ActiveFilters,
} from "@cartridge/arcade/marketplace";

// Active user selections — AND between traits, OR within values
const activeFilters: ActiveFilters = {
  Rarity: new Set(["Legendary", "Epic"]),
  Background: new Set(["Gold"]),
};

const rows = aggregateTraitMetadata(pages);

// { Background: { Gold: 15, Silver: 42 }, Rarity: { Legendary: 5, Epic: 12 } }
const available = buildAvailableFilters(rows, activeFilters);

// { attributes: ["Background", "Rarity"], properties: { Background: [...], Rarity: [...] } }
const precomputed = buildPrecomputedFilters(available);
```

### Client-Side Token Filtering

Apply `ActiveFilters` to an in-memory token array:

```ts
import {
  filterTokensByMetadata,
  tokenMatchesFilters,
  flattenActiveFilters,
} from "@cartridge/arcade/marketplace";

const activeFilters: ActiveFilters = {
  Rarity: new Set(["Legendary"]),
};

// Filter a token array
const filtered = filterTokensByMetadata(tokens, activeFilters);

// Check a single token
const matches = tokenMatchesFilters(token, activeFilters);

// Convert ActiveFilters to TraitSelection[] for fetch calls
const selections = flattenActiveFilters(activeFilters);
// [{ name: "Rarity", value: "Legendary" }]
```

### Filter Logic

- **AND** between different traits — a token must match _all_ selected traits.
- **OR** within the same trait — a token matches if it has _any_ of the selected values.

Example: selecting `Rarity: Legendary, Epic` and `Background: Gold` matches tokens that are `(Legendary OR Epic) AND Gold background`.

## React Integration

### Provider Setup

```tsx
import { constants } from "starknet";
import {
  MarketplaceClientProvider,
  useMarketplaceCollectionTokens,
} from "@cartridge/arcade/marketplace/react";

function App() {
  return (
    <MarketplaceClientProvider
      config={{
        chainId: constants.StarknetChainId.SN_MAIN,
        defaultProject: "arcade-main",
      }}
    >
      <Dashboard />
    </MarketplaceClientProvider>
  );
}
```

The provider accepts either a `config` object (async initialization) or a pre-created `client` instance:

```tsx
const client = await createMarketplaceClient({ ... });

<MarketplaceClientProvider client={client}>
  <App />
</MarketplaceClientProvider>
```

An optional `onClientReady` callback fires when the client becomes available.

### Hooks

All hooks return `UseMarketplaceQueryResult<T>`:

```ts
interface UseMarketplaceQueryResult<T> {
  data: T | null;
  status: "idle" | "loading" | "success" | "error";
  error: Error | null;
  isFetching: boolean;
  refresh: () => Promise<T | null>;
}
```

Every hook accepts an optional `enabled` boolean as its last argument to conditionally skip fetching.

---

#### `useMarketplaceClient`

Access the underlying client and initialization status.

```tsx
const { client, status, error, refresh } = useMarketplaceClient();

if (status === "loading") return <Spinner />;
if (status === "error") return <p>Failed to init: {error?.message}</p>;
```

---

#### `useMarketplaceCollection`

```tsx
const { data, status, refresh } = useMarketplaceCollection({
  address: "0x04f5...b15f",
  fetchImages: true,
});

if (data) {
  console.log(data.totalSupply, data.contractType, data.image);
}
```

---

#### `useMarketplaceCollectionTokens`

```tsx
const { data, status, error, refresh } = useMarketplaceCollectionTokens({
  address: "0x04f5...b15f",
  limit: 20,
  attributeFilters: { rarity: "legendary" },
});

const tokens = data?.page?.tokens ?? [];
const nextCursor = data?.page?.nextCursor;
```

---

#### `useMarketplaceCollectionOrders`

```tsx
const { data } = useMarketplaceCollectionOrders({
  collection: "0x04f5...b15f",
  status: "OPEN",
  category: "LISTING",
});

const orders = data ?? [];
```

---

#### `useMarketplaceCollectionListings`

```tsx
const { data } = useMarketplaceCollectionListings({
  collection: "0x04f5...b15f",
  tokenId: "42",
});

const listings = data ?? [];
```

---

#### `useMarketplaceToken`

```tsx
const { data } = useMarketplaceToken(
  { collection: "0x04f5...b15f", tokenId: "42", fetchImages: true },
  Boolean(tokenId), // enabled
);

if (data) {
  console.log(data.token, data.orders, data.listings);
}
```

---

#### `useMarketplaceTokenBalances`

```tsx
const { data } = useMarketplaceTokenBalances({
  accountAddresses: ["0xabc..."],
  contractAddresses: ["0x04f5...b15f"],
  limit: 50,
});

const balances = data?.page?.balances ?? [];
```

---

#### `useMarketplaceFees`

```tsx
const { data: fees } = useMarketplaceFees();

if (fees) {
  const pct = (fees.feeNum / fees.feeDenominator) * 100;
  console.log(`Fee: ${pct}%`);
}
```

---

#### `useMarketplaceRoyaltyFee`

Requires `provider` in the client config.

```tsx
const { data: royalty } = useMarketplaceRoyaltyFee({
  collection: "0x04f5...b15f",
  tokenId: "42",
  amount: 1000000000000000000n,
});

if (royalty) {
  console.log(`Royalty: ${royalty.amount} → ${royalty.receiver}`);
}
```

## Error Handling

Data methods use a discriminated result pattern — `{ page | data, error }` — so consumers can inspect failures without try/catch:

```ts
const result = await client.listCollectionTokens({ address: "0x..." });

if (result.error) {
  console.error("Fetch failed:", result.error.error.message);
} else {
  const tokens = result.page!.tokens;
}
```

Trait metadata functions return `{ pages, errors }` where `errors` carry an optional `projectId` to identify which Torii project failed:

```ts
const { pages, errors } = await fetchCollectionTraitMetadata({ address: "0x..." });

for (const err of errors) {
  console.warn(`Project ${err.projectId} failed:`, err.error.message);
}
```

Methods that return a single entity (`getCollection`, `getToken`, `getFees`, `getRoyaltyFee`) return `null` on failure.

React hooks surface errors via the `error` field on the query result.

## Types Reference

### Configuration & Client

| Type                        | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| `MarketplaceClientConfig`   | Config object for `createMarketplaceClient`.             |
| `MarketplaceClient`         | Client interface returned by the factory.                |
| `ResolveTokenImage`         | `(token, ctx) => Promise<string \| undefined>`           |
| `ResolveContractImage`      | `(contract, ctx) => Promise<string \| undefined>`        |

### Collections & Tokens

| Type                              | Description                                         |
| --------------------------------- | --------------------------------------------------- |
| `NormalizedCollection`            | Collection with resolved metadata and image.        |
| `NormalizedToken`                 | Token with resolved `contract_address` and `image`. |
| `TokenDetails`                    | Token with related `orders` and `listings`.         |
| `CollectionTokensPage`            | `{ tokens, nextCursor }` page.                      |
| `FetchCollectionTokensResult`     | `{ page, error }` discriminated result.             |
| `TokenBalancesPage`               | `{ balances, nextCursor }` page.                    |
| `FetchTokenBalancesResult`        | `{ page, error }` discriminated result.             |

### Orders & Fees

| Type              | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `OrderModel`      | Marketplace order with status, category, and pricing.      |
| `MarketplaceFees` | `{ feeNum, feeDenominator, feeReceiver }`.                 |
| `RoyaltyFee`      | `{ receiver, amount }`.                                    |

### Options

| Type                          | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| `CollectionSummaryOptions`    | Options for `getCollection`.                   |
| `FetchCollectionTokensOptions`| Options for `listCollectionTokens`.            |
| `CollectionOrdersOptions`     | Options for `getCollectionOrders`.             |
| `CollectionListingsOptions`   | Options for `listCollectionListings`.          |
| `TokenDetailsOptions`         | Options for `getToken`.                        |
| `RoyaltyFeeOptions`           | Options for `getRoyaltyFee`.                   |
| `FetchTokenBalancesOptions`   | Options for `fetchTokenBalances`.              |

### Trait Metadata

| Type                                  | Description                                           |
| ------------------------------------- | ----------------------------------------------------- |
| `TraitSelection`                      | `{ name, value }` pair for filtering.                 |
| `TraitNameSummary`                    | `{ traitName, valueCount }`.                          |
| `TraitValueRow`                       | `{ traitValue, count }`.                              |
| `TraitMetadataRow`                    | `{ traitName, traitValue, count }`.                   |
| `TraitNameSummaryPage`                | Per-project page of trait name summaries.              |
| `TraitValuePage`                      | Per-project page of trait values.                      |
| `CollectionTraitMetadataPage`         | Per-project page of trait metadata rows.               |
| `CollectionTraitMetadataError`        | `{ projectId?, error }` on fetch failure.              |
| `FetchTraitNamesSummaryOptions`       | Options for `fetchTraitNamesSummary`.                  |
| `FetchTraitNamesSummaryResult`        | `{ pages, errors }`.                                  |
| `FetchTraitValuesOptions`             | Options for `fetchTraitValues`.                        |
| `FetchTraitValuesResult`              | `{ pages, errors }`.                                  |
| `FetchExpandedTraitsMetadataOptions`  | Options for `fetchExpandedTraitsMetadata`.             |
| `FetchCollectionTraitMetadataOptions` | Options for `fetchCollectionTraitMetadata`.            |
| `FetchCollectionTraitMetadataResult`  | `{ pages, errors }`.                                  |

### Filters

| Type                       | Description                                                      |
| -------------------------- | ---------------------------------------------------------------- |
| `ActiveFilters`            | `Record<string, Set<string>>` — current user selections.         |
| `AvailableFilters`         | `Record<string, Record<string, number>>` — values with counts.   |
| `PrecomputedFilterData`    | `{ attributes, properties }` — UI-ready filter structure.        |
| `PrecomputedFilterProperty`| `{ property, order, count }`.                                    |
| `AttributeFilterInput`     | `Record<string, string \| number \| bigint \| Iterable<...>>`.   |

### React

| Type                              | Description                                          |
| --------------------------------- | ---------------------------------------------------- |
| `MarketplaceClientContextValue`   | Context value: `{ client, status, error, refresh }`. |
| `MarketplaceClientStatus`         | `"idle" \| "loading" \| "ready" \| "error"`.         |
| `UseMarketplaceQueryResult<T>`    | Hook result: `{ data, status, error, isFetching, refresh }`. |

## See Also

An executable example demonstrating these APIs lives in `packages/arcade-ts/examples/marketplace-client.ts`.
