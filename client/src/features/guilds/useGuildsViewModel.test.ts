import { describe, it, expect } from "vitest";
import { useGuildsViewModel } from "./useGuildsViewModel";

describe("useGuildsViewModel", () => {
  it("returns default message", () => {
    const result = useGuildsViewModel();
    expect(result.messageTitle).toBe("Coming soon");
    expect(result.messageIcon).toBe("guild");
  });
});
