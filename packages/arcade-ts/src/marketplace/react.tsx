import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type {
  CollectionListingsOptions,
  CollectionOrdersOptions,
  CollectionSummaryOptions,
  FetchCollectionTokensOptions,
  FetchCollectionTokensResult,
  FetchTokenBalancesOptions,
  FetchTokenBalancesResult,
  MarketplaceClient,
  MarketplaceClientConfig,
  MarketplaceFees,
  NormalizedCollection,
  RoyaltyFee,
  RoyaltyFeeOptions,
  TokenDetailsOptions,
  TokenDetails,
} from "./types";
import { fetchTokenBalances } from "./tokens";
import { createMarketplaceClient } from "./client";
import type { OrderModel } from "../modules/marketplace";

// ============================================================================
// Marketplace Client Context
// ============================================================================

export type MarketplaceClientStatus = "idle" | "loading" | "ready" | "error";

export interface MarketplaceClientContextValue {
  client: MarketplaceClient | null;
  status: MarketplaceClientStatus;
  error: Error | null;
  refresh: () => Promise<MarketplaceClient | null>;
}

const MarketplaceClientContext = createContext<
  MarketplaceClientContextValue | undefined
>(undefined);

interface MarketplaceClientProviderBaseProps {
  children: ReactNode;
  queryClient?: QueryClient;
  onClientReady?: (client: MarketplaceClient) => void;
}

interface MarketplaceClientProviderWithConfig
  extends MarketplaceClientProviderBaseProps {
  config: MarketplaceClientConfig;
  client?: undefined;
}

interface MarketplaceClientProviderWithClient
  extends MarketplaceClientProviderBaseProps {
  config?: MarketplaceClientConfig;
  client: MarketplaceClient;
}

export type MarketplaceClientProviderProps =
  | MarketplaceClientProviderWithConfig
  | MarketplaceClientProviderWithClient;

interface ProviderState {
  client: MarketplaceClient | null;
  status: MarketplaceClientStatus;
  error: Error | null;
}

export function MarketplaceClientProvider(
  props: MarketplaceClientProviderProps,
) {
  const { children, queryClient: externalQueryClient, onClientReady } = props;

  const [state, setState] = useState<ProviderState>({
    client: props.client ?? null,
    status: props.client ? "ready" : "idle",
    error: null,
  });

  const initialize = useCallback(async () => {
    if ("client" in props && props.client) {
      setState({ client: props.client, status: "ready", error: null });
      onClientReady?.(props.client);
      return props.client;
    }

    if (!("config" in props) || !props.config) {
      const error = new Error(
        "MarketplaceClientProvider: either `client` or `config` must be provided.",
      );
      setState({ client: null, status: "error", error });
      return null;
    }

    setState((prev) => ({
      ...prev,
      status: "loading",
      error: null,
    }));

    try {
      const client = await createMarketplaceClient(props.config);
      setState({ client, status: "ready", error: null });
      onClientReady?.(client);
      return client;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error(String(err ?? "Unknown error"));
      setState({ client: null, status: "error", error });
      return null;
    }
  }, [props, onClientReady]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const refresh = useCallback(async () => {
    return initialize();
  }, [initialize]);

  const contextValue = useMemo<MarketplaceClientContextValue>(
    () => ({
      client: state.client,
      status: state.status,
      error: state.error,
      refresh,
    }),
    [state, refresh],
  );

  const content = (
    <MarketplaceClientContext.Provider value={contextValue}>
      {children}
    </MarketplaceClientContext.Provider>
  );

  // If an external QueryClient is provided, wrap with QueryClientProvider
  if (externalQueryClient) {
    return (
      <QueryClientProvider client={externalQueryClient}>
        {content}
      </QueryClientProvider>
    );
  }

  return content;
}

export function useMarketplaceClient(): MarketplaceClientContextValue {
  const context = useContext(MarketplaceClientContext);
  if (!context) {
    throw new Error(
      "useMarketplaceClient must be used within a MarketplaceClientProvider or a compatible context bridge.",
    );
  }
  return context;
}

export { MarketplaceClientContext };

// ============================================================================
// Query key factory
// ============================================================================

export const marketplaceKeys = {
  all: ["marketplace"] as const,
  collection: (address: string) =>
    [...marketplaceKeys.all, "collection", address] as const,
  collectionTokens: (options: FetchCollectionTokensOptions) =>
    [
      ...marketplaceKeys.all,
      "collectionTokens",
      options.address,
      options.project,
      options.cursor,
      options.limit,
      options.tokenIds,
      options.attributeFilters
        ? serializeFilters(options.attributeFilters)
        : undefined,
    ] as const,
  collectionOrders: (options: CollectionOrdersOptions) =>
    [
      ...marketplaceKeys.all,
      "collectionOrders",
      options.collection,
      options.tokenId,
      options.status,
      options.category,
      options.limit,
      options.orderIds,
    ] as const,
  collectionListings: (options: CollectionListingsOptions) =>
    [
      ...marketplaceKeys.all,
      "collectionListings",
      options.collection,
      options.tokenId,
      options.limit,
      options.verifyOwnership,
    ] as const,
  token: (options: TokenDetailsOptions) =>
    [
      ...marketplaceKeys.all,
      "token",
      options.collection,
      options.tokenId,
      options.projectId,
    ] as const,
  fees: () => [...marketplaceKeys.all, "fees"] as const,
  royaltyFee: (options: RoyaltyFeeOptions) =>
    [
      ...marketplaceKeys.all,
      "royaltyFee",
      options.collection,
      options.tokenId,
      options.amount.toString(),
    ] as const,
  tokenBalances: (options: FetchTokenBalancesOptions) =>
    [
      ...marketplaceKeys.all,
      "tokenBalances",
      options.project,
      options.contractAddresses,
      options.accountAddresses,
      options.tokenIds,
      options.cursor,
      options.limit,
    ] as const,
};

function serializeFilters(
  filters: FetchCollectionTokensOptions["attributeFilters"],
): string {
  if (!filters) return "";
  return JSON.stringify(
    Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, v != null ? String(v) : null]),
  );
}

// ============================================================================
// TanStack Query hooks
// ============================================================================

function ensureClient(client: MarketplaceClient | null): MarketplaceClient {
  if (!client) throw new Error("MarketplaceClient not ready");
  return client;
}

type QueryOptions<T> = Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">;

export function useMarketplaceCollection(
  options: CollectionSummaryOptions,
  queryOptions?: QueryOptions<NormalizedCollection | null> & {
    enabled?: boolean;
  },
): UseQueryResult<NormalizedCollection | null, Error> {
  const { client, status } = useMarketplaceClient();
  const isReady = status === "ready" && client !== null;

  return useQuery({
    queryKey: marketplaceKeys.collection(options.address),
    queryFn: () => ensureClient(client).getCollection(options),
    enabled:
      isReady && Boolean(options.address) && (queryOptions?.enabled ?? true),
    ...queryOptions,
  });
}

export function useMarketplaceCollectionTokens(
  options: FetchCollectionTokensOptions,
  queryOptions?: QueryOptions<FetchCollectionTokensResult> & {
    enabled?: boolean;
  },
): UseQueryResult<FetchCollectionTokensResult, Error> {
  const { client, status } = useMarketplaceClient();
  const isReady = status === "ready" && client !== null;

  return useQuery({
    queryKey: marketplaceKeys.collectionTokens(options),
    queryFn: () => ensureClient(client).listCollectionTokens(options),
    enabled:
      isReady && Boolean(options.address) && (queryOptions?.enabled ?? true),
    ...queryOptions,
  });
}

export function useMarketplaceCollectionOrders(
  options: CollectionOrdersOptions,
  queryOptions?: QueryOptions<OrderModel[]> & { enabled?: boolean },
): UseQueryResult<OrderModel[], Error> {
  const { client, status } = useMarketplaceClient();
  const isReady = status === "ready" && client !== null;

  return useQuery({
    queryKey: marketplaceKeys.collectionOrders(options),
    queryFn: () => ensureClient(client).getCollectionOrders(options),
    enabled:
      isReady && Boolean(options.collection) && (queryOptions?.enabled ?? true),
    ...queryOptions,
  });
}

export function useMarketplaceCollectionListings(
  options: CollectionListingsOptions,
  queryOptions?: QueryOptions<OrderModel[]> & { enabled?: boolean },
): UseQueryResult<OrderModel[], Error> {
  const { client, status } = useMarketplaceClient();
  const isReady = status === "ready" && client !== null;

  return useQuery({
    queryKey: marketplaceKeys.collectionListings(options),
    queryFn: () => ensureClient(client).listCollectionListings(options),
    enabled:
      isReady && Boolean(options.collection) && (queryOptions?.enabled ?? true),
    ...queryOptions,
  });
}

export function useMarketplaceToken(
  options: TokenDetailsOptions,
  queryOptions?: QueryOptions<TokenDetails | null> & { enabled?: boolean },
): UseQueryResult<TokenDetails | null, Error> {
  const { client, status } = useMarketplaceClient();
  const isReady = status === "ready" && client !== null;

  return useQuery({
    queryKey: marketplaceKeys.token(options),
    queryFn: () => ensureClient(client).getToken(options),
    enabled:
      isReady &&
      Boolean(options.collection) &&
      Boolean(options.tokenId) &&
      (queryOptions?.enabled ?? true),
    ...queryOptions,
  });
}

export function useMarketplaceTokenBalances(
  options: FetchTokenBalancesOptions,
  queryOptions?: QueryOptions<FetchTokenBalancesResult> & {
    enabled?: boolean;
  },
): UseQueryResult<FetchTokenBalancesResult, Error> {
  return useQuery({
    queryKey: marketplaceKeys.tokenBalances(options),
    queryFn: () => fetchTokenBalances(options),
    enabled: queryOptions?.enabled ?? true,
    ...queryOptions,
  });
}

export function useMarketplaceFees(
  queryOptions?: QueryOptions<MarketplaceFees | null> & { enabled?: boolean },
): UseQueryResult<MarketplaceFees | null, Error> {
  const { client, status } = useMarketplaceClient();
  const isReady = status === "ready" && client !== null;

  return useQuery({
    queryKey: marketplaceKeys.fees(),
    queryFn: () => ensureClient(client).getFees(),
    enabled: isReady && (queryOptions?.enabled ?? true),
    ...queryOptions,
  });
}

export function useMarketplaceRoyaltyFee(
  options: RoyaltyFeeOptions,
  queryOptions?: QueryOptions<RoyaltyFee | null> & { enabled?: boolean },
): UseQueryResult<RoyaltyFee | null, Error> {
  const { client, status } = useMarketplaceClient();
  const isReady = status === "ready" && client !== null;

  return useQuery({
    queryKey: marketplaceKeys.royaltyFee(options),
    queryFn: () => ensureClient(client).getRoyaltyFee(options),
    enabled:
      isReady &&
      Boolean(options.collection) &&
      Boolean(options.tokenId) &&
      options.amount > 0n &&
      (queryOptions?.enabled ?? true),
    ...queryOptions,
  });
}

// ============================================================================
// Invalidation helpers
// ============================================================================

/** Invalidate all marketplace queries */
export function useInvalidateMarketplace() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: marketplaceKeys.all }),
    [queryClient],
  );
}

/** Invalidate queries for a specific collection */
export function useInvalidateCollection(address: string) {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: marketplaceKeys.collection(address),
      }),
    [queryClient, address],
  );
}
