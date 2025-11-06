import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import type { ReactNode } from "react";

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
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("avoids repeated fetches when inline options are referentially unstable", async () => {
    const client = createClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MarketplaceClientProvider client={client}>
        {children}
      </MarketplaceClientProvider>
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

    await waitFor(() => expect(hook.result.current.status).toBe("success"));
    expect(client.listCollectionTokens).toHaveBeenCalledTimes(1);

    hook.rerender({ limit: 10 });

    await waitFor(() =>
      expect(client.listCollectionTokens).toHaveBeenCalledTimes(1),
    );

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

    const hook = renderHook(() =>
      useMarketplaceTokenBalances({
        project: "projectA",
        contractAddresses: [
          "0x04f51290f2b0e16524084c27890711c7a955eb276cffec185d6f24f2a620b15f",
        ],
      }),
    );

    await waitFor(() => expect(hook.result.current.status).toBe("success"));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(hook.result.current.data).toEqual(mockResult);
    expect(hook.result.current.error).toBeNull();

    spy.mockRestore();
  });

  it("avoids repeated fetches when inline options are referentially unstable", async () => {
    const spy = vi
      .spyOn(tokensModule, "fetchTokenBalances")
      .mockResolvedValue(mockResult);

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
        initialProps: { limit: 10 },
      },
    );

    await waitFor(() => expect(hook.result.current.status).toBe("success"));
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

    const hook = renderHook(() =>
      useMarketplaceTokenBalances({
        project: "projectA",
      }),
    );

    await waitFor(() => expect(hook.result.current.status).toBe("error"));
    expect(hook.result.current.error?.message).toBe("network error");
    expect(hook.result.current.data).toBeNull();

    spy.mockRestore();
  });

  it("respects enabled flag", async () => {
    const spy = vi
      .spyOn(tokensModule, "fetchTokenBalances")
      .mockResolvedValue(mockResult);

    const hook = renderHook(() =>
      useMarketplaceTokenBalances(
        {
          project: "projectA",
        },
        false,
      ),
    );

    await waitFor(() => expect(hook.result.current.status).toBe("idle"));
    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
