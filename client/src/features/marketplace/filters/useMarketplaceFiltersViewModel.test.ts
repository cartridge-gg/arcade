import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { Token } from "@dojoengine/torii-wasm";
import { useMarketplaceFiltersViewModel } from "./useMarketplaceFiltersViewModel";

const mockUseProject = vi.fn();

vi.mock("@/hooks/project", () => ({
  useProject: () => mockUseProject(),
}));

const mockGetTokens = vi.fn();

vi.mock("@/store", () => ({
  useMarketplaceTokensStore: (selector: any) =>
    selector({ getTokens: mockGetTokens }),
}));

const mockUseMetadataFilters = vi.fn();

vi.mock("@/hooks/use-metadata-filters", () => ({
  useMetadataFilters: (args: any) => mockUseMetadataFilters(args),
}));

const mockTrackEvent = vi.fn();
const mockEvents = {
  MARKETPLACE_FILTER_APPLIED: "MARKETPLACE_FILTER_APPLIED",
};

vi.mock("@/hooks/useAnalytics", () => ({
  useAnalytics: () => ({ trackEvent: mockTrackEvent, events: mockEvents }),
}));

const mockRouterState = { location: { pathname: "/marketplace" } };

vi.mock("@tanstack/react-router", () => ({
  useRouterState: () => mockRouterState,
  useNavigate: () => vi.fn(),
}));

vi.mock("@/hooks/filters", () => ({
  useOwnerFilter: () => ({
    inputValue: "",
    setInputValue: vi.fn(),
    resolvedAddress: null,
    isAddressInput: false,
    suggestions: [],
    clearOwner: vi.fn(),
  }),
  useFilterActions: () => ({
    setOwnerFilter: vi.fn(),
    replaceFilters: vi.fn(),
  }),
  useFilterUrlSync: vi.fn(),
}));

describe("useMarketplaceFiltersViewModel", () => {
  beforeEach(() => {
    mockUseProject.mockReturnValue({ collection: "0xabc" });

    const token = {
      token_id: "1",
      contract_address: "0xabc",
    } as unknown as Token;

    mockGetTokens.mockReturnValue([token]);

    mockUseMetadataFilters.mockReturnValue({
      activeFilters: { Rarity: new Set(["Legendary"]) },
      availableFilters: {
        Rarity: { Legendary: 2, Epic: 3 },
      },
      clearAllFilters: vi.fn(),
      setFilter: vi.fn(),
      removeFilter: vi.fn(),
      precomputed: {
        attributes: ["Rarity"],
        properties: {
          Rarity: [
            { property: "Legendary", order: 2 },
            { property: "Epic", order: 1 },
          ],
        },
      },
      statusFilter: "all",
      setStatusFilter: vi.fn(),
      traitSummary: [{ traitName: "Rarity", valueCount: 2 }],
      expandedTraits: new Set<string>(),
      expandTrait: vi.fn(),
      collapseTrait: vi.fn(),
      isLoading: false,
      isSummaryLoading: false,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("maps precomputed metadata into attributes with counts and active state", () => {
    const { result } = renderHook(() => useMarketplaceFiltersViewModel());

    expect(result.current.attributes).toHaveLength(1);
    const attribute = result.current.attributes[0];
    expect(attribute.name).toBe("Rarity");
    expect(attribute.properties).toHaveLength(2);
    const legendary = attribute.properties.find(
      (p) => p.property === "Legendary",
    );
    expect(legendary?.count).toBe(2);
    expect(legendary?.isActive).toBe(true);
  });

  it("tracks analytics when toggling filters", () => {
    const setFilter = vi.fn();
    const removeFilter = vi.fn();

    mockUseMetadataFilters.mockReturnValueOnce({
      activeFilters: {},
      availableFilters: { Rarity: { Legendary: 2 } },
      clearAllFilters: vi.fn(),
      setFilter,
      removeFilter,
      precomputed: {
        attributes: ["Rarity"],
        properties: { Rarity: [{ property: "Legendary", order: 1 }] },
      },
      statusFilter: "all",
      setStatusFilter: vi.fn(),
      traitSummary: [{ traitName: "Rarity", valueCount: 1 }],
      expandedTraits: new Set<string>(),
      expandTrait: vi.fn(),
      collapseTrait: vi.fn(),
      isLoading: false,
      isSummaryLoading: false,
    });

    const { result } = renderHook(() => useMarketplaceFiltersViewModel());

    act(() => {
      result.current.setFilter("Rarity", "Legendary", true);
    });

    expect(setFilter).toHaveBeenCalledWith("Rarity", "Legendary");
    expect(mockTrackEvent).toHaveBeenCalledWith(
      mockEvents.MARKETPLACE_FILTER_APPLIED,
      expect.objectContaining({
        filter_type: "Rarity",
        filter_value: "Legendary",
        filter_enabled: true,
      }),
    );

    act(() => {
      result.current.setFilter("Rarity", "Legendary", false);
    });

    expect(removeFilter).toHaveBeenCalledWith("Rarity", "Legendary");
  });

  it("clears search state when clearing filters", () => {
    const clearAllFilters = vi.fn();

    mockUseMetadataFilters.mockReturnValueOnce({
      activeFilters: {},
      availableFilters: {},
      clearAllFilters,
      setFilter: vi.fn(),
      removeFilter: vi.fn(),
      precomputed: { attributes: [], properties: {} },
      statusFilter: "all",
      setStatusFilter: vi.fn(),
      traitSummary: [],
      expandedTraits: new Set<string>(),
      expandTrait: vi.fn(),
      collapseTrait: vi.fn(),
      isLoading: false,
      isSummaryLoading: false,
    });

    const { result } = renderHook(() => useMarketplaceFiltersViewModel());

    act(() => {
      result.current.setSearchValue("Rarity", "Leg");
      result.current.clearAllFilters();
    });

    expect(clearAllFilters).toHaveBeenCalled();
    expect(result.current.searchValue).toEqual({});
  });
});
