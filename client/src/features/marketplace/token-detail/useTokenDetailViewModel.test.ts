import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Token } from "@/types/torii";
import type { OrderModel } from "@cartridge/arcade";
import { useTokenDetailViewModel } from "./useTokenDetailViewModel";

const mockUseAccount = vi.fn();

vi.mock("@starknet-react/core", () => ({
  useAccount: () => mockUseAccount(),
  useConnect: () => ({ connector: null }),
}));

const mockGetCollectionOrders = vi.fn();

vi.mock("@/hooks/marketplace", () => ({
  useMarketplace: () => ({
    getCollectionOrders: mockGetCollectionOrders,
  }),
}));

const mockTokens: Record<string, Record<string, Token[]>> = {};

vi.mock("@/store", () => ({
  useMarketplaceTokensStore: (selector: any) =>
    selector({
      tokens: mockTokens,
    }),
}));

const mockUseMarketTokensFetcher = vi.fn();

vi.mock("@/hooks/marketplace-tokens-fetcher", () => ({
  useMarketTokensFetcher: (args: any) => mockUseMarketTokensFetcher(args),
}));

const mockUseMarketBalancesFetcher = vi.fn();

vi.mock("@/hooks/marketplace-balances-fetcher", () => ({
  useMarketBalancesFetcher: (args: any) => mockUseMarketBalancesFetcher(args),
}));

const mockTrackEvent = vi.fn();
const mockEvents = {};

vi.mock("@/hooks/useAnalytics", () => ({
  useAnalytics: () => ({ trackEvent: mockTrackEvent, events: mockEvents }),
}));

vi.mock("@/hooks/arcade", () => ({
  useArcade: () => ({
    provider: { provider: {} },
    games: [],
    editions: [],
  }),
}));

vi.mock("@/collections", () => ({
  useAccountByAddress: () => ({ data: null }),
}));

vi.mock("@tanstack/react-router", () => ({
  useRouterState: () => ({ location: { pathname: "/" } }),
}));

describe("useTokenDetailViewModel", () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({
      address: "0x123",
      isConnected: true,
    });
    mockTokens["arcade-main"] = { "0xabc": [] };
    mockGetCollectionOrders.mockReturnValue({});
    mockUseMarketTokensFetcher.mockReturnValue({
      collection: null,
      status: "idle",
    });
    mockUseMarketBalancesFetcher.mockReturnValue({
      balances: [],
    });
  });

  it("should initialize with correct defaults", () => {
    const { result } = renderHook(() =>
      useTokenDetailViewModel({
        collectionAddress: "0xabc",
        tokenId: "1",
      }),
    );

    expect(result.current.token).toBeUndefined();
    expect(result.current.orders).toEqual([]);
    expect(result.current.isListed).toBe(false);
  });

  it("should find token by ID", () => {
    const mockToken = {
      token_id: "1",
      name: "Test Token",
      contract_address: "0xabc",
    } as Token;

    mockTokens["arcade-main"]["0xabc"] = [mockToken];

    const { result } = renderHook(() =>
      useTokenDetailViewModel({
        collectionAddress: "0xabc",
        tokenId: "1",
      }),
    );

    expect(result.current.token).toEqual(mockToken);
  });

  it("should detect listed tokens", () => {
    const mockToken = {
      token_id: "1",
      name: "Test Token",
      contract_address: "0xabc",
    } as Token;

    mockTokens["arcade-main"]["0xabc"] = [mockToken];
    mockGetCollectionOrders.mockReturnValue({
      "1": [{ tokenId: 1n, price: "100" } as unknown as OrderModel],
    });

    const { result } = renderHook(() =>
      useTokenDetailViewModel({
        collectionAddress: "0xabc",
        tokenId: "1",
      }),
    );

    expect(result.current.isListed).toBe(true);
    expect(result.current.orders).toHaveLength(1);
  });
});
