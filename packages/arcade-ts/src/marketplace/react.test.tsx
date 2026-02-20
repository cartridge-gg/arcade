import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { describe, it, expect, beforeEach } from "vitest";
import type { MarketplaceClient } from "./types";
import type {
  FetchCollectionTokensResult,
  FetchTokenBalancesResult,
} from "./types";
import {
  MarketplaceClientProvider,
  useMarketplaceCollectionTokens,
  useMarketplaceTokenBalances,
} from "./react";
import * as tokensModule from "./tokens";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

describe("useMarketplaceCollectionTokens", () => {
  const mockResult: FetchCollectionTokensResult = {
    page: { tokens: [], nextCursor: null },
    error: null,
  };

  const createClient = (): MarketplaceClient => ({
    getCollection: vi.fn(),
    listCollectionTokens: vi.fn().mockResolvedValue(mockResult),
    getCollectionOrders: vi.fn(),
    listCollectionListings: vi.fn(),
    getToken: vi.fn(),
    getFees: vi.fn(),
    getRoyaltyFee: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches collection tokens via TanStack Query", async () => {
    const client = createClient();
    const queryClient = createQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MarketplaceClientProvider client={client}>
          {children}
        </MarketplaceClientProvider>
      </QueryClientProvider>
    );

    const hook = renderHook(
      () =>
        useMarketplaceCollectionTokens({
          address:
            "0x04f51290f2b0e16524084c27890711c7a955eb276cffec185d6f24f2a620b15f",
          limit: 10,
        }),
      { wrapper },
    );

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(client.listCollectionTokens).toHaveBeenCalledTimes(1);
    expect(hook.result.current.data).toEqual(mockResult);
  });

  it("deduplicates identical queries (TanStack Query caching)", async () => {
    const client = createClient();
    const queryClient = createQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MarketplaceClientProvider client={client}>
          {children}
        </MarketplaceClientProvider>
      </QueryClientProvider>
    );

    const hook = renderHook(
      ({ limit }) =>
        useMarketplaceCollectionTokens({
          address:
            "0x04f51290f2b0e16524084c27890711c7a955eb276cffec185d6f24f2a620b15f",
          limit,
        }),
      {
        wrapper,
        initialProps: { limit: 10 },
      },
    );

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(client.listCollectionTokens).toHaveBeenCalledTimes(1);

    // Same params → no refetch (cache hit)
    hook.rerender({ limit: 10 });
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(client.listCollectionTokens).toHaveBeenCalledTimes(1);

    // Different params → new fetch
    hook.rerender({ limit: 25 });
    await waitFor(() =>
      expect(client.listCollectionTokens).toHaveBeenCalledTimes(2),
    );
  });
});

describe("useMarketplaceTokenBalances", () => {
  const mockResult: FetchTokenBalancesResult = {
    page: { balances: [], nextCursor: null },
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches token balances successfully", async () => {
    const spy = vi
      .spyOn(tokensModule, "fetchTokenBalances")
      .mockResolvedValue(mockResult);

    const queryClient = createQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const hook = renderHook(
      () =>
        useMarketplaceTokenBalances({
          project: "projectA",
          contractAddresses: [
            "0x04f51290f2b0e16524084c27890711c7a955eb276cffec185d6f24f2a620b15f",
          ],
        }),
      { wrapper },
    );

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(hook.result.current.data).toEqual(mockResult);

    spy.mockRestore();
  });

  it("avoids repeated fetches when inline options are referentially unstable", async () => {
    const spy = vi
      .spyOn(tokensModule, "fetchTokenBalances")
      .mockResolvedValue(mockResult);

    const queryClient = createQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const hook = renderHook(
      ({ limit }) =>
        useMarketplaceTokenBalances({
          project: "projectA",
          contractAddresses: [
            "0x04f51290f2b0e16524084c27890711c7a955eb276cffec185d6f24f2a620b15f",
          ],
          limit,
        }),
      {
        wrapper,
        initialProps: { limit: 10 },
      },
    );

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledTimes(1);

    hook.rerender({ limit: 10 });
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

    hook.rerender({ limit: 25 });
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));

    spy.mockRestore();
  });

  it("handles errors", async () => {
    const spy = vi
      .spyOn(tokensModule, "fetchTokenBalances")
      .mockRejectedValue(new Error("network error"));

    const queryClient = createQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const hook = renderHook(
      () =>
        useMarketplaceTokenBalances({
          project: "projectA",
        }),
      { wrapper },
    );

    await waitFor(() => expect(hook.result.current.isError).toBe(true));
    expect(hook.result.current.error?.message).toBe("network error");

    spy.mockRestore();
  });

  it("respects enabled flag", async () => {
    const spy = vi
      .spyOn(tokensModule, "fetchTokenBalances")
      .mockResolvedValue(mockResult);

    const queryClient = createQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const hook = renderHook(
      () =>
        useMarketplaceTokenBalances(
          {
            project: "projectA",
          },
          { enabled: false },
        ),
      { wrapper },
    );

    // Should remain in pending state since enabled=false
    expect(hook.result.current.fetchStatus).toBe("idle");
    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
