import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { Token } from "@/hooks/tokens";
import { useInventoryTokensViewModel } from "./useInventoryTokensViewModel";

const mockUseArcade = vi.fn();
const mockUseProject = vi.fn();
const mockUseAddress = vi.fn();
const mockUseAccount = vi.fn();
const mockUseAnalytics = vi.fn();

vi.mock("@/hooks/arcade", () => ({
  useArcade: () => mockUseArcade(),
}));

vi.mock("@/hooks/project", () => ({
  useProject: () => mockUseProject(),
}));

vi.mock("@/hooks/address", () => ({
  useAddress: () => mockUseAddress(),
}));

vi.mock("@starknet-react/core", () => ({
  useAccount: () => mockUseAccount(),
}));

vi.mock("@/hooks/useAnalytics", () => ({
  useAnalytics: () => mockUseAnalytics(),
}));

describe("useInventoryTokensViewModel", () => {
  const sampleToken = (overrides: Partial<Token> = {}): Token =>
    ({
      balance: {
        amount: 10,
        value: 100,
        change: 5,
      },
      metadata: {
        name: "Token A",
        symbol: "TKA",
        address: "0x1",
        image: "",
        project: "proj",
        decimals: 6,
      },
      ...overrides,
    }) as Token;

  const credits = sampleToken({
    metadata: {
      name: "Credits",
      symbol: "CRD",
      address: "credits",
      image: "",
    } as any,
  });

  beforeEach(() => {
    mockUseArcade.mockReturnValue({ editions: [] });
    mockUseProject.mockReturnValue({ edition: { id: "1" } });
    mockUseAddress.mockReturnValue({ isSelf: true });
    mockUseAccount.mockReturnValue({ connector: {} });
    mockUseAnalytics.mockReturnValue({
      trackEvent: vi.fn(),
      events: {
        INVENTORY_VIEW_COLLAPSED: "collapsed",
        INVENTORY_VIEW_EXPANDED: "expanded",
        INVENTORY_TOKEN_CLICKED: "token_clicked",
      },
    });
  });

  it("filters tokens with balance and creates view cards", () => {
    const tokens = [
      sampleToken(),
      sampleToken({ balance: { amount: 0, value: 0, change: 0 } as any }),
    ];

    const { result } = renderHook(() =>
      useInventoryTokensViewModel({ tokens, credits, status: "success" }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.tokenCards).toHaveLength(1);
    const card = result.current.tokenCards[0];
    expect(card.amount).toContain("10");
    expect(card.value).toBe("$100.00");
    expect(card.change).toBe("+$5.00");
  });

  it("handles toggle interactions and analytics", () => {
    const trackEvent = vi.fn();
    mockUseAnalytics.mockReturnValue({
      trackEvent,
      events: {
        INVENTORY_VIEW_COLLAPSED: "collapsed",
        INVENTORY_VIEW_EXPANDED: "expanded",
        INVENTORY_TOKEN_CLICKED: "token_clicked",
      },
    });

    const manyTokens = Array.from({ length: 5 }, (_, index) =>
      sampleToken({
        metadata: {
          address: `0x${index + 1}`,
          name: `Token ${index}`,
          symbol: "TKN",
        } as any,
      }),
    );

    const { result } = renderHook(() =>
      useInventoryTokensViewModel({
        tokens: manyTokens,
        credits,
        status: "success",
      }),
    );

    expect(result.current.canToggle).toBe(true);
    expect(result.current.isExpanded).toBe(false);

    act(() => {
      result.current.onToggle();
    });

    expect(trackEvent).toHaveBeenCalledWith("expanded", expect.any(Object));
    expect(result.current.isExpanded).toBe(true);
  });
});
