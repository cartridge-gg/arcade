import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTokenDetailViewModel } from "./useTokenDetailViewModel";

const mockUseAccount = vi.fn();

vi.mock("@starknet-react/core", () => ({
  useAccount: () => mockUseAccount(),
}));

const mockGetCollectionOrders = vi.fn();

vi.mock("@/hooks/marketplace", () => ({
  useMarketplace: () => ({
    getCollectionOrders: mockGetCollectionOrders,
  }),
}));

const mockGetTokens = vi.fn();

vi.mock("@/store", () => ({
  useMarketplaceTokensStore: (selector: any) =>
    selector({
      getTokens: mockGetTokens,
    }),
}));

const mockUseMarketTokensFetcher = vi.fn();

vi.mock("@/hooks/marketplace-tokens-fetcher", () => ({
  useMarketTokensFetcher: (args: any) => mockUseMarketTokensFetcher(args),
}));

describe("useTokenDetailViewModel", () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({
      address: "0x123",
    });
    mockGetTokens.mockReturnValue([]);
    mockGetCollectionOrders.mockReturnValue({});
    mockUseMarketTokensFetcher.mockReturnValue({
      collection: null,
      status: "idle",
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
    };

    mockGetTokens.mockReturnValue([mockToken]);

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
    };

    mockGetTokens.mockReturnValue([mockToken]);
    mockGetCollectionOrders.mockReturnValue({
      "1": [{ tokenId: 1n, price: "100" }],
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
