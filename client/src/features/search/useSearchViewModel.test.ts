import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSearchViewModel } from "./useSearchViewModel";

describe("useSearchViewModel", () => {
  it("returns initial state with default disabled value", () => {
    const { result } = renderHook(() =>
      useSearchViewModel({ disabled: false }),
    );

    expect(result.current.disabled).toBe(false);
    expect(result.current.searchValue).toBe("");
    expect(result.current.placeholder).toBe("Search");
  });

  it("accepts disabled prop and sets it correctly", () => {
    const { result } = renderHook(() => useSearchViewModel({ disabled: true }));

    expect(result.current.disabled).toBe(true);
  });

  it("updates search value when onSearchChange is called", () => {
    const { result } = renderHook(() =>
      useSearchViewModel({ disabled: false }),
    );

    act(() => {
      result.current.onSearchChange("test query");
    });

    expect(result.current.searchValue).toBe("test query");
  });

  it("maintains stable onSearchChange callback reference", () => {
    const { result, rerender } = renderHook(() =>
      useSearchViewModel({ disabled: false }),
    );

    const firstCallback = result.current.onSearchChange;
    rerender();
    const secondCallback = result.current.onSearchChange;

    expect(firstCallback).toBe(secondCallback);
  });
});
