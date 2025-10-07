import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { EditionModel } from "@cartridge/arcade";
import { useMarketplaceHoldersViewModel } from "./useMarketplaceHoldersViewModel";

type MockOwner = {
  address: string;
  balance: number;
  ratio: number;
  token_ids: string[];
  username?: string;
};

const mockUseMarketOwnersFetcher = vi.fn();
const mockUseMarketplaceTokensStore = vi.fn();
const mockUseMetadataFilters = vi.fn();

vi.mock("@/hooks/marketplace-owners-fetcher", () => ({
  useMarketOwnersFetcher: (args: any) => mockUseMarketOwnersFetcher(args),
}));

vi.mock("@/store", () => ({
  useMarketplaceTokensStore: (selector: any) =>
    selector({ getTokens: mockUseMarketplaceTokensStore }),
}));

vi.mock("@/hooks/use-metadata-filters", () => ({
  useMetadataFilters: (args: any) => mockUseMetadataFilters(args),
}));

describe("useMarketplaceHoldersViewModel", () => {
  const edition = {
    config: { project: "proj" },
  } as EditionModel;

  const owners: MockOwner[] = [
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

    mockUseMarketOwnersFetcher.mockReturnValue({
      owners,
      status: "success",
      editionError: [],
      loadingProgress: undefined,
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

  it("returns base owners when no filters are active", () => {
    const { result } = renderHook(() =>
      useMarketplaceHoldersViewModel({ edition, collectionAddress: "0xabc" }),
    );

    expect(result.current.owners).toHaveLength(2);
    expect(result.current.displayedOwners).toHaveLength(2);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.totalOwners).toBe(2);
    expect(result.current.filteredOwnersCount).toBe(2);
    expect(result.current.isFilteredResultEmpty).toBe(false);
  });

  it("filters owners based on active metadata filters", () => {
    mockUseMetadataFilters.mockReturnValueOnce({
      filteredTokens: [{ token_id: "1" }],
      activeFilters: { Rarity: new Set(["Legendary"]) },
      clearAllFilters: vi.fn(),
    });

    const { result } = renderHook(() =>
      useMarketplaceHoldersViewModel({ edition, collectionAddress: "0xabc" }),
    );

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.displayedOwners).toHaveLength(1);
    expect(result.current.displayedOwners[0].address).toBe("0x1");
    expect(result.current.displayedOwners[0].balance).toBe(1);
    expect(result.current.displayedOwners[0].ratio).toBe(100);
  });

  it("reports empty state when filters remove all owners", () => {
    mockUseMetadataFilters.mockReturnValueOnce({
      filteredTokens: [],
      activeFilters: { Rarity: new Set(["Legendary"]) },
      clearAllFilters: vi.fn(),
    });

    const { result } = renderHook(() =>
      useMarketplaceHoldersViewModel({ edition, collectionAddress: "0xabc" }),
    );

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.displayedOwners).toHaveLength(0);
    expect(result.current.isFilteredResultEmpty).toBe(true);
  });
});
