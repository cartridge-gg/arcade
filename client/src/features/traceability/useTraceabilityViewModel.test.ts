import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTraceabilityViewModel } from "./useTraceabilityViewModel";

describe("useTraceabilityViewModel", () => {
  it("returns the default traceability state", () => {
    const { result } = renderHook(() => useTraceabilityViewModel());
    expect(result.current.title).toBe("Coming soon");
    expect(result.current.icon).toBe("guild");
  });
});
