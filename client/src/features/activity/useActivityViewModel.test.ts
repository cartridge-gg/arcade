import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { CardProps } from "@/context/activities";
import { useActivityViewModel } from "./useActivityViewModel";

const mockUseActivities = vi.fn();

vi.mock("@/hooks/activities", () => ({
  useActivities: () => mockUseActivities(),
}));

describe("useActivityViewModel", () => {
  const createEvent = (overrides: Partial<CardProps> = {}): CardProps => ({
    variant: "token",
    key: `key-${Math.random()}`,
    project: "proj",
    chainId: "SN_MAIN" as any,
    contractAddress: "0x1",
    transactionHash: "0xabc",
    amount: "10",
    address: "0x2",
    value: "5",
    name: "Item",
    collection: "Collection",
    image: "https://example.com/image.png",
    title: "Entry",
    website: "https://example.com",
    certified: true,
    action: "mint",
    timestamp: 1000,
    date: "2024-01-01",
    points: 10,
    color: "#fff",
    ...overrides,
  });

  beforeEach(() => {
    mockUseActivities.mockReturnValue({
      activities: [
        createEvent({ key: "a", date: "2024-01-02", timestamp: 2000 }),
        createEvent({ key: "b", date: "2024-01-01", timestamp: 1000 }),
      ],
      status: "success",
    });
  });

  it("groups activities by date respecting cap", () => {
    const { result } = renderHook(() => useActivityViewModel({ cap: 1 }));
    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0].events).toHaveLength(1);
    expect(result.current.canLoadMore).toBe(true);
  });

  it("returns empty status when no events", () => {
    mockUseActivities.mockReturnValueOnce({
      activities: [],
      status: "success",
    });
    const { result } = renderHook(() => useActivityViewModel({ cap: 10 }));
    expect(result.current.status).toBe("empty");
  });

  it("propagates error status", () => {
    mockUseActivities.mockReturnValueOnce({
      activities: [],
      status: "error",
    });
    const { result } = renderHook(() => useActivityViewModel({ cap: 10 }));
    expect(result.current.status).toBe("error");
  });
});
