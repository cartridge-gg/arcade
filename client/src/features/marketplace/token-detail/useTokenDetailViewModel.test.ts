import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Token } from "@/types/torii";
import type { OrderModel } from "@cartridge/arcade";
import { useTokenDetailViewModel } from "./useTokenDetailViewModel";

const mockUseAccount = vi.fn();

vi.mock("@starknet-react/core", () => ({
  useAccount: () => mockUseAccount(),
  useConnect: () => ({ connector: null }),
  useDisconnect: () => ({ disconnect: null }),
}));

const mockCollectionOrders = vi.fn();

vi.mock("@/effect/atoms", () => ({
  collectionOrdersAtom: () => mockCollectionOrders(),
}));

vi.mock("@effect-atom/atom-react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@effect-atom/atom-react")>();
  return {
    ...actual,
    useAtomValue: (atom: any) => atom,
  };
});

const mockUseMarketplaceTokens = vi.fn();
const mockUseAccountByAddress = vi.fn();

vi.mock("@/effect", () => ({
  useMarketplaceTokens: () => mockUseMarketplaceTokens(),
  useAccountByAddress: () => mockUseAccountByAddress(),
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

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: {} }),
}));

describe("useTokenDetailViewModel", () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({
      address: "0x123",
      isConnected: true,
    });
    mockCollectionOrders.mockReturnValue({});
    mockUseMarketplaceTokens.mockReturnValue({
      collection: null,
      tokens: [],
      status: "idle",
      hasMore: false,
      isLoading: false,
      isError: false,
      errorMessage: null,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });
    mockUseAccountByAddress.mockReturnValue({ data: null });
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

    mockUseMarketplaceTokens.mockReturnValue({
      collection: null,
      tokens: [mockToken],
      status: "success",
      hasMore: false,
      isLoading: false,
      isError: false,
      errorMessage: null,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

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

    mockUseMarketplaceTokens.mockReturnValue({
      collection: null,
      tokens: [mockToken],
      status: "success",
      hasMore: false,
      isLoading: false,
      isError: false,
      errorMessage: null,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });
    mockCollectionOrders.mockReturnValue({
      "1": [
        {
          tokenId: 1n,
          price: "100",
          expiration: new Date("2099-01-01T00:00:00").getTime() / 1000,
        } as unknown as OrderModel,
      ],
    });

    const { result } = renderHook(() =>
      useTokenDetailViewModel({
        collectionAddress: "0xabc",
        tokenId: "1",
      }),
    );

    expect(result.current.orders).toHaveLength(1);
    expect(result.current.isListed).toBe(true);
  });
});
