import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHeaderViewModel } from "./useHeaderViewModel";

const mockUseAnalytics = vi.fn();

vi.mock("@/hooks/useAnalytics", () => ({
  useAnalytics: () => mockUseAnalytics(),
}));

describe("useHeaderViewModel", () => {
  it("tracks logo clicks", () => {
    const trackEvent = vi.fn();
    mockUseAnalytics.mockReturnValue({
      trackEvent,
      events: { NAVIGATION_HOME_CLICKED: "navigation_home_clicked" },
    });

    const { result } = renderHook(() => useHeaderViewModel());

    act(() => {
      result.current.onLogoClick();
    });

    expect(trackEvent).toHaveBeenCalledWith("navigation_home_clicked", {
      from_page: window.location.pathname,
    });
  });
});
