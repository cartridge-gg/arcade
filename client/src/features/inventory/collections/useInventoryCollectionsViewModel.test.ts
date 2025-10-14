import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { EnrichedTokenContract } from "@/collections";
import { useInventoryCollectionsViewModel } from "./useInventoryCollectionsViewModel";

const mockUseArcade = vi.fn();
const mockUseCollections = vi.fn();
const mockUseAddress = vi.fn();
const mockUseAccount = vi.fn();
const mockUseMarketplace = vi.fn();
const mockUseAnalytics = vi.fn();
const mockUseRouterState = vi.fn();
const mockUseAccountByAddress = vi.fn();

vi.mock("@/hooks/arcade", () => ({
  useArcade: () => mockUseArcade(),
}));

vi.mock("@/hooks/collections", () => ({
  useCollections: () => mockUseCollections(),
  useAccountByAddress: (address: string) => mockUseAccountByAddress(address),
}));

vi.mock("@/hooks/address", () => ({
  useAddress: () => mockUseAddress(),
}));

vi.mock("@starknet-react/core", () => ({
  useAccount: () => mockUseAccount(),
}));

vi.mock("@/hooks/marketplace", () => ({
  useMarketplace: () => mockUseMarketplace(),
}));

vi.mock("@/hooks/useAnalytics", () => ({
  useAnalytics: () => mockUseAnalytics(),
}));

vi.mock("@tanstack/react-router", () => ({
  useRouterState: () => mockUseRouterState(),
}));

describe("useInventoryCollectionsViewModel", () => {
  const collection = {
    contract_address: "0xabc",
    contract_type: "ERC721",
    name: "Sample Collection",
    totalSupply: BigInt(10),
    total_supply: "0x0",
    image: "https://example.com/image.png",
    project: "proj",
  } as unknown as EnrichedTokenContract;

  beforeEach(() => {
    mockUseArcade.mockReturnValue({ editions: [] });
    mockUseCollections.mockReturnValue({ collections: [{ address: "0xabc" }] });
    mockUseAddress.mockReturnValue({ isSelf: false, address: "0x123" });
    mockUseAccount.mockReturnValue({ connector: {} });
    mockUseMarketplace.mockReturnValue({ orders: {} });
    mockUseAnalytics.mockReturnValue({
      trackEvent: vi.fn(),
      events: { INVENTORY_COLLECTION_CLICKED: "collection_clicked" },
    });
    mockUseRouterState.mockReturnValue({
      location: { pathname: "/inventory" },
    });
    mockUseAccountByAddress.mockReturnValue({ data: { username: "alice" } });
  });

  it("returns collection cards for owned collections", () => {
    const { result } = renderHook(() =>
      useInventoryCollectionsViewModel({
        collections: [collection],
        status: "success",
      }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.collectionCards).toHaveLength(1);
    expect(result.current.collectionCards[0].title).toBe("Sample Collection");
    expect(result.current.collectionCards[0].href).toBeDefined();
  });

  it("marks loading state when status is loading", () => {
    const { result } = renderHook(() =>
      useInventoryCollectionsViewModel({
        collections: [],
        status: "loading",
      }),
    );

    expect(result.current.isLoading).toBe(true);
  });
});
