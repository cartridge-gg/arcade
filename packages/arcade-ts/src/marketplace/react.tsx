import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type {
  CollectionListingsOptions,
  CollectionOrdersOptions,
  CollectionSummaryOptions,
  FetchCollectionTokensOptions,
  FetchCollectionTokensResult,
  MarketplaceClient,
  MarketplaceClientConfig,
  NormalizedCollection,
  TokenDetailsOptions,
  TokenDetails,
} from "./types";
import { createMarketplaceClient } from "./client";
import type { OrderModel } from "../modules/marketplace";

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

const READY_STATE: ProviderState = {
  client: null,
  status: "ready",
  error: null,
};

const hasOwn = Object.prototype.hasOwnProperty;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (typeof a !== typeof b || a == null || b == null) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) {
        return false;
      }
    }
    return true;
  }

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, value] of a) {
      if (!b.has(key)) {
        return false;
      }
      if (!deepEqual(value, b.get(key))) {
        return false;
      }
    }
    return true;
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
      return false;
    }
    for (const key of keysA) {
      if (!hasOwn.call(b, key)) {
        return false;
      }
      if (!deepEqual((a as Record<string, unknown>)[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
}

function useStableValue<T>(value: T): T {
  const ref = useRef(value);
  if (!deepEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}

export function MarketplaceClientProvider(
  props: MarketplaceClientProviderProps,
) {
  const { children, onClientReady } = props;

  const [state, setState] = useState<ProviderState>({
    client: props.client ?? null,
    status: props.client ? "ready" : "idle",
    error: null,
  });

  const initialize = useCallback(async () => {
    if ("client" in props && props.client) {
      setState({ ...READY_STATE, client: props.client });
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

  return (
    <MarketplaceClientContext.Provider value={contextValue}>
      {children}
    </MarketplaceClientContext.Provider>
  );
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

type QueryStatus = "idle" | "loading" | "success" | "error";

export interface UseMarketplaceQueryResult<TResult> {
  data: TResult | null;
  status: QueryStatus;
  error: Error | null;
  isFetching: boolean;
  refresh: () => Promise<TResult | null>;
}

function useMarketplaceClientQuery<TResult>(
  requestFactory: (client: MarketplaceClient) => Promise<TResult>,
  enabled = true,
): UseMarketplaceQueryResult<TResult> {
  const { client, status: clientStatus } = useMarketplaceClient();
  const fetchIdRef = useRef(0);
  const [state, setState] = useState<{
    data: TResult | null;
    status: QueryStatus;
    error: Error | null;
    isFetching: boolean;
  }>({
    data: null,
    status: "idle",
    error: null,
    isFetching: false,
  });

  const execute = useCallback(async () => {
    if (!enabled || !client || clientStatus !== "ready") {
      return null;
    }

    const fetchId = ++fetchIdRef.current;
    setState((prev) => ({
      ...prev,
      status: "loading",
      isFetching: true,
      error: null,
    }));

    try {
      const result = await requestFactory(client);
      if (fetchIdRef.current !== fetchId) {
        return result;
      }
      setState({
        data: result,
        status: "success",
        error: null,
        isFetching: false,
      });
      return result;
    } catch (err) {
      if (fetchIdRef.current !== fetchId) {
        return null;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      setState((prev) => ({
        ...prev,
        status: "error",
        error,
        isFetching: false,
      }));
      return null;
    }
  }, [enabled, client, clientStatus, requestFactory]);

  useEffect(() => {
    if (!enabled) {
      setState({
        data: null,
        status: "idle",
        error: null,
        isFetching: false,
      });
      return;
    }
    if (!client || clientStatus !== "ready") {
      return;
    }
    void execute();
  }, [enabled, client, clientStatus, execute]);

  const refresh = useCallback(() => {
    if (!enabled) {
      return Promise.resolve(state.data);
    }
    return execute();
  }, [enabled, execute, state.data]);

  return {
    ...state,
    refresh,
  };
}

export function useMarketplaceCollection(
  options: CollectionSummaryOptions,
  enabled = true,
): UseMarketplaceQueryResult<NormalizedCollection | null> {
  const stableOptions = useStableValue(options);

  const request = useCallback(
    (client: MarketplaceClient) => client.getCollection(stableOptions),
    [stableOptions],
  );

  const shouldFetch = enabled && Boolean(stableOptions.address);

  return useMarketplaceClientQuery(request, shouldFetch);
}

export function useMarketplaceCollectionTokens(
  options: FetchCollectionTokensOptions,
  enabled = true,
): UseMarketplaceQueryResult<FetchCollectionTokensResult> {
  const stableOptions = useStableValue(options);

  const request = useCallback(
    (client: MarketplaceClient) => client.listCollectionTokens(stableOptions),
    [stableOptions],
  );

  const shouldFetch = enabled && Boolean(stableOptions.address);
  return useMarketplaceClientQuery(request, shouldFetch);
}

export function useMarketplaceCollectionOrders(
  options: CollectionOrdersOptions,
  enabled = true,
): UseMarketplaceQueryResult<OrderModel[]> {
  const stableOptions = useStableValue(options);

  const request = useCallback(
    (client: MarketplaceClient) => client.getCollectionOrders(stableOptions),
    [stableOptions],
  );

  const shouldFetch = enabled && Boolean(stableOptions.collection);
  return useMarketplaceClientQuery(request, shouldFetch);
}

export function useMarketplaceCollectionListings(
  options: CollectionListingsOptions,
  enabled = true,
): UseMarketplaceQueryResult<OrderModel[]> {
  const stableOptions = useStableValue(options);

  const request = useCallback(
    (client: MarketplaceClient) => client.listCollectionListings(stableOptions),
    [stableOptions],
  );

  const shouldFetch = enabled && Boolean(stableOptions.collection);
  return useMarketplaceClientQuery(request, shouldFetch);
}

export function useMarketplaceToken(
  options: TokenDetailsOptions,
  enabled = true,
): UseMarketplaceQueryResult<TokenDetails | null> {
  const stableOptions = useStableValue(options);

  const request = useCallback(
    (client: MarketplaceClient) => client.getToken(stableOptions),
    [stableOptions],
  );

  const shouldFetch =
    enabled &&
    Boolean(stableOptions.collection) &&
    Boolean(stableOptions.tokenId);
  return useMarketplaceClientQuery(request, shouldFetch);
}
