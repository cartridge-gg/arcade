import { describe, it, expect } from "vitest";
import { useErrorsViewModel } from "./useErrorsViewModel";

describe("useErrorsViewModel", () => {
  it("returns default messages", () => {
    const result = useErrorsViewModel();
    expect(result.messageTitle).toBe("Connect your Controller");
    expect(result.messageSubtitle).toBe(
      "Build and customize your own Dojo activity feed.",
    );
  });
});
