import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMarketplaceHoldersViewModel } from "./useMarketplaceHoldersViewModel";

type MockHolder = {
  address: string;
  balance: number;
  ratio: number;
  token_ids: string[];
  username?: string;
};

const mockUseHolders = vi.fn();
const mockUseMarketplaceTokensStore = vi.fn();
const mockUseMetadataFilters = vi.fn();

vi.mock("@/effect", () => ({
  useHolders: (project: string, address: string) =>
    mockUseHolders(project, address),
}));

vi.mock("@/store", () => ({
  useMarketplaceTokensStore: (selector: any) =>
    selector({ getTokens: mockUseMarketplaceTokensStore }),
}));

vi.mock("@/hooks/use-metadata-filters", () => ({
  useMetadataFilters: (args: any) => mockUseMetadataFilters(args),
}));

describe("useMarketplaceHoldersViewModel", () => {
  const holders: MockHolder[] = [
    {
      address: "0x1",
      balance: 2,
      ratio: 50,
      token_ids: ["1", "2"],
      username: "Alice",
    },
    {
      address: "0x2",
      balance: 2,
      ratio: 50,
      token_ids: ["3", "4"],
      username: "Bob",
    },
  ];

  beforeEach(() => {
    mockUseMarketplaceTokensStore.mockReturnValue([
      { token_id: "1" },
      { token_id: "2" },
      { token_id: "3" },
      { token_id: "4" },
    ]);

    mockUseHolders.mockReturnValue({
      holders,
      status: "ready",
      isLoading: false,
      isLoadingMore: false,
      editionError: [],
    });

    mockUseMetadataFilters.mockReturnValue({
      filteredTokens: [
        { token_id: "1" },
        { token_id: "2" },
        { token_id: "3" },
        { token_id: "4" },
      ],
      activeFilters: {},
      clearAllFilters: vi.fn(),
    });
  });

  it("returns base holders when no filters are active", () => {
    const { result } = renderHook(() =>
      useMarketplaceHoldersViewModel({ collectionAddress: "0xabc" }),
    );

    expect(result.current.holders).toHaveLength(2);
    expect(result.current.displayedHolders).toHaveLength(2);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.totalHolders).toBe(2);
    expect(result.current.filteredHoldersCount).toBe(2);
    expect(result.current.isFilteredResultEmpty).toBe(false);
  });

  it("filters holders based on active metadata filters", () => {
    mockUseMetadataFilters.mockReturnValueOnce({
      filteredTokens: [{ token_id: "1" }],
      activeFilters: { Rarity: new Set(["Legendary"]) },
      clearAllFilters: vi.fn(),
    });

    const { result } = renderHook(() =>
      useMarketplaceHoldersViewModel({ collectionAddress: "0xabc" }),
    );

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.displayedHolders).toHaveLength(1);
    expect(result.current.displayedHolders[0].address).toBe("0x1");
    expect(result.current.displayedHolders[0].balance).toBe(1);
    expect(result.current.displayedHolders[0].ratio).toBe(100);
  });

  it("reports empty state when filters remove all holders", () => {
    mockUseMetadataFilters.mockReturnValueOnce({
      filteredTokens: [],
      activeFilters: { Rarity: new Set(["Legendary"]) },
      clearAllFilters: vi.fn(),
    });

    const { result } = renderHook(() =>
      useMarketplaceHoldersViewModel({ collectionAddress: "0xabc" }),
    );

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.displayedHolders).toHaveLength(0);
    expect(result.current.isFilteredResultEmpty).toBe(true);
  });
});
