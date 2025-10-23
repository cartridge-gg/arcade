import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useNotificationsViewModel } from "./useNotificationsViewModel";

describe("useNotificationsViewModel", () => {
  it("returns initial state with default disabled value", () => {
    const { result } = renderHook(() => useNotificationsViewModel());

    expect(result.current.disabled).toBe(false);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it("accepts disabled prop and sets it correctly", () => {
    const { result } = renderHook(() => useNotificationsViewModel(true));

    expect(result.current.disabled).toBe(true);
  });

  it("handles notification click callback", () => {
    const consoleSpy = vi.spyOn(console, "log");
    const { result } = renderHook(() => useNotificationsViewModel());

    act(() => {
      result.current.onNotificationClick("test-id");
    });

    expect(consoleSpy).toHaveBeenCalledWith("Notification clicked:", "test-id");
  });

  it("maintains stable onNotificationClick callback reference", () => {
    const { result, rerender } = renderHook(() => useNotificationsViewModel());

    const firstCallback = result.current.onNotificationClick;
    rerender();
    const secondCallback = result.current.onNotificationClick;

    expect(firstCallback).toBe(secondCallback);
  });
});
