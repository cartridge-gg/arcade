import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import type { ReactNode } from "react";

import { describe, it, expect, beforeEach } from "vitest";
import type { MarketplaceClient } from "./types";
import type { FetchCollectionTokensResult } from "./types";
import {
  MarketplaceClientProvider,
  useMarketplaceCollectionTokens,
} from "./react";

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
