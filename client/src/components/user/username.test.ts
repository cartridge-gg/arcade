import { describe, it, expect } from "vitest";
import { truncateAddress } from "./username";

describe("username", () => {
  it("truncateAddress", () => {
    expect(truncateAddress(null)).toBe("");
    expect(truncateAddress(undefined)).toBe("");
    expect(truncateAddress("0x123")).toBe("0x123");
    expect(truncateAddress("0x1234567890123456789")).toBe("0x1234...6789");
    expect(truncateAddress("123")).toBe("123");
    expect(truncateAddress("1234567890123456789")).toBe("123456...6789");
    expect(truncateAddress("shinobi")).toBe("shinobi");
    expect(truncateAddress("supersenseininja")).toBe("supers...inja");
  });
});
