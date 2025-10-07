import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePositionsViewModel } from "./usePositionsViewModel";

describe("usePositionsViewModel", () => {
  it("returns static positions list", () => {
    const { result } = renderHook(() => usePositionsViewModel());
    expect(result.current.positions).toHaveLength(3);
    expect(result.current.positions[0].username).toBe("bal7hazar");
  });
});
