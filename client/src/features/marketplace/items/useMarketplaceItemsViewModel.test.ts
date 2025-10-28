import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { Token } from "@/types/torii";
import type { OrderModel } from "@cartridge/arcade";
import { StatusType } from "@cartridge/arcade";
import { useMarketplaceItemsViewModel } from "./useMarketplaceItemsViewModel";

const mockUseAccount = vi.fn();
const mockConnect = vi.fn();
let mockConnectors: any[] = [];

vi.mock("@starknet-react/core", () => ({
  useAccount: () => mockUseAccount(),
  useConnect: () => ({ connect: mockConnect, connectors: mockConnectors }),
}));

const mockGetClassAt = vi.fn();

vi.mock("@/hooks/arcade", () => ({
  useArcade: () => ({ provider: { provider: { getClassAt: mockGetClassAt } } }),
}));

let mockSales: Record<string, Record<string, any>> = {};
const mockGetCollectionOrders = vi.fn();

vi.mock("@/hooks/marketplace", () => ({
  useMarketplace: () => ({
    sales: mockSales,
    getCollectionOrders: mockGetCollectionOrders,
  }),
}));

const mockTrackEvent = vi.fn();
const mockEvents = {
  MARKETPLACE_SEARCH_PERFORMED: "MARKETPLACE_SEARCH_PERFORMED",
  MARKETPLACE_ITEM_INSPECTED: "MARKETPLACE_ITEM_INSPECTED",
  MARKETPLACE_BULK_PURCHASE_INITIATED: "MARKETPLACE_BULK_PURCHASE_INITIATED",
  MARKETPLACE_PURCHASE_INITIATED: "MARKETPLACE_PURCHASE_INITIATED",
  MARKETPLACE_PURCHASE_FAILED: "MARKETPLACE_PURCHASE_FAILED",
};

vi.mock("@/hooks/useAnalytics", () => ({
  useAnalytics: () => ({ trackEvent: mockTrackEvent, events: mockEvents }),
}));

const mockGetTokens = vi.fn();
const mockGetListedTokens = vi.fn();

vi.mock("@/store", () => ({
  useMarketplaceTokensStore: (selector: any) =>
    selector({
      getTokens: mockGetTokens,
      getListedTokens: mockGetListedTokens,
    }),
}));

const mockUseMetadataFilters = vi.fn();

vi.mock("@/hooks/use-metadata-filters", () => ({
  useMetadataFilters: (args: any) => mockUseMetadataFilters(args),
}));

const mockUseMarketTokensFetcher = vi.fn();
const mockUseListedTokensFetcher = vi.fn();

vi.mock("@/hooks/marketplace-tokens-fetcher", () => ({
  useMarketTokensFetcher: (args: any) => mockUseMarketTokensFetcher(args),
}));

vi.mock("@/hooks/use-listed-tokens-fetcher", () => ({
  useListedTokensFetcher: (args: any) => mockUseListedTokensFetcher(args),
}));

describe("useMarketplaceItemsViewModel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseAccount.mockReturnValue({
      connector: {},
      address: "0x123",
      isConnected: true,
    });
    mockConnectors = [{ id: "mock-connector" }];
    mockConnect.mockResolvedValue(undefined);
    mockGetClassAt.mockResolvedValue({ abi: [] });

    const token = {
      token_id: "1",
      contract_address: "0xabc",
      metadata: { name: "Token #1" },
      name: "Token #1",
    } as unknown as Token;

    const order = {
      id: 1n,
      tokenId: 1n,
      price: 200,
      currency: "0x1",
      status: { value: StatusType.Placed },
    } as unknown as OrderModel;

    mockGetTokens.mockReturnValue([token]);
    mockGetListedTokens.mockReturnValue([]);
    mockUseMetadataFilters.mockReturnValue({
      filteredTokens: [token],
      activeFilters: {},
      clearAllFilters: vi.fn(),
      statusFilter: "all",
    });

    mockGetCollectionOrders.mockReturnValue({
      "1": [order],
    });

    mockSales = {
      "0xabc": {
        1: {
          saleA: {
            time: 100,
            order: { currency: "0x1", price: 300 },
          },
        },
      },
    };

    mockUseMarketTokensFetcher.mockReturnValue({
      collection: {
        total_supply: "0x10",
        image: "https://example.com/image.png",
      },
      status: "success",
      loadingProgress: undefined,
      hasMore: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("creates enriched assets with orders and counts", () => {
    const { result } = renderHook(() =>
      useMarketplaceItemsViewModel({ collectionAddress: "0xabc" }),
    );

    expect(result.current.collectionSupply).toBe(16);
    expect(result.current.assets).toHaveLength(1);
    expect(result.current.assets[0].orders).toHaveLength(1);
    expect(result.current.searchFilteredTokensCount).toBe(1);
    expect(result.current.totalTokensCount).toBe(1);
  });

  it("toggles selection state", () => {
    const { result } = renderHook(() =>
      useMarketplaceItemsViewModel({ collectionAddress: "0xabc" }),
    );

    const asset = result.current.assets[0];

    act(() => {
      result.current.toggleSelection(asset);
    });

    expect(result.current.selection).toHaveLength(1);

    act(() => {
      result.current.toggleSelection(asset);
    });

    expect(result.current.selection).toHaveLength(0);
  });

  it("connects wallet via provided connector", async () => {
    const { result } = renderHook(() =>
      useMarketplaceItemsViewModel({ collectionAddress: "0xabc" }),
    );

    await act(async () => {
      await result.current.connectWallet();
    });

    expect(mockConnect).toHaveBeenCalledWith({ connector: mockConnectors[0] });
  });
});
