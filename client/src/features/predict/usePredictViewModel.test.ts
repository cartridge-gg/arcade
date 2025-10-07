import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePredictViewModel } from "./usePredictViewModel";

describe("usePredictViewModel", () => {
  it("returns static predictions", () => {
    const { result } = renderHook(() => usePredictViewModel());
    expect(result.current.predictions).toHaveLength(4);
    expect(result.current.predictions[0].title).toBe("Loot Survivor");
  });
});
