import { describe, it, expect } from "vitest";
import { parseSemVer, compareSemVer, isVersionCompatible } from "./semver";

describe("parseSemVer", () => {
  it("should parse basic semver string", () => {
    const result = parseSemVer("1.2.3");
    expect(result).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: undefined,
      build: undefined,
      raw: "1.2.3",
    });
  });

  it("should parse semver with v prefix", () => {
    const result = parseSemVer("v2.0.0");
    expect(result).toEqual({
      major: 2,
      minor: 0,
      patch: 0,
      prerelease: undefined,
      build: undefined,
      raw: "v2.0.0",
    });
  });

  it("should parse semver with prerelease", () => {
    const result = parseSemVer("1.0.0-alpha.1");
    expect(result).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: "alpha.1",
      build: undefined,
      raw: "1.0.0-alpha.1",
    });
  });

  it("should parse semver with build metadata", () => {
    const result = parseSemVer("1.0.0+build.123");
    expect(result).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: undefined,
      build: "build.123",
      raw: "1.0.0+build.123",
    });
  });

  it("should parse semver with prerelease and build", () => {
    const result = parseSemVer("1.0.0-beta.2+build.456");
    expect(result).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: "beta.2",
      build: "build.456",
      raw: "1.0.0-beta.2+build.456",
    });
  });

  it("should throw error for invalid semver", () => {
    expect(() => parseSemVer("invalid")).toThrow("Invalid semver format: invalid");
    expect(() => parseSemVer("1.2")).toThrow("Invalid semver format: 1.2");
    expect(() => parseSemVer("1.2.a")).toThrow("Invalid semver format: 1.2.a");
  });
});

describe("compareSemVer", () => {
  it("should compare major versions", () => {
    const a = parseSemVer("1.0.0");
    const b = parseSemVer("2.0.0");
    expect(compareSemVer(a, b)).toBeLessThan(0);
    expect(compareSemVer(b, a)).toBeGreaterThan(0);
  });

  it("should compare minor versions", () => {
    const a = parseSemVer("1.1.0");
    const b = parseSemVer("1.2.0");
    expect(compareSemVer(a, b)).toBeLessThan(0);
    expect(compareSemVer(b, a)).toBeGreaterThan(0);
  });

  it("should compare patch versions", () => {
    const a = parseSemVer("1.0.1");
    const b = parseSemVer("1.0.2");
    expect(compareSemVer(a, b)).toBeLessThan(0);
    expect(compareSemVer(b, a)).toBeGreaterThan(0);
  });

  it("should handle prerelease versions", () => {
    const a = parseSemVer("1.0.0-alpha");
    const b = parseSemVer("1.0.0");
    expect(compareSemVer(a, b)).toBeLessThan(0);
    expect(compareSemVer(b, a)).toBeGreaterThan(0);
  });

  it("should compare prerelease versions", () => {
    const a = parseSemVer("1.0.0-alpha");
    const b = parseSemVer("1.0.0-beta");
    expect(compareSemVer(a, b)).toBeLessThan(0);
    expect(compareSemVer(b, a)).toBeGreaterThan(0);
  });

  it("should compare numeric prerelease identifiers numerically", () => {
    const a = parseSemVer("1.0.0-alpha.1");
    const b = parseSemVer("1.0.0-alpha.2");
    const c = parseSemVer("1.0.0-alpha.10");
    expect(compareSemVer(a, b)).toBeLessThan(0);
    expect(compareSemVer(b, c)).toBeLessThan(0);
    expect(compareSemVer(a, c)).toBeLessThan(0);
  });

  it("should compare mixed prerelease identifiers correctly", () => {
    const a = parseSemVer("1.0.0-alpha.beta");
    const b = parseSemVer("1.0.0-alpha.1");
    // Numeric identifiers have lower precedence than non-numeric
    expect(compareSemVer(b, a)).toBeLessThan(0);
    expect(compareSemVer(a, b)).toBeGreaterThan(0);
  });

  it("should handle prerelease with different number of parts", () => {
    const a = parseSemVer("1.0.0-alpha");
    const b = parseSemVer("1.0.0-alpha.1");
    // Shorter prerelease has lower precedence
    expect(compareSemVer(a, b)).toBeLessThan(0);
    expect(compareSemVer(b, a)).toBeGreaterThan(0);
  });

  it("should compare complex prerelease versions", () => {
    const versions = [
      parseSemVer("1.0.0-alpha"),
      parseSemVer("1.0.0-alpha.1"),
      parseSemVer("1.0.0-alpha.beta"),
      parseSemVer("1.0.0-beta"),
      parseSemVer("1.0.0-beta.2"),
      parseSemVer("1.0.0-beta.11"),
      parseSemVer("1.0.0-rc.1"),
    ];

    // Each version should be less than the next
    for (let i = 0; i < versions.length - 1; i++) {
      expect(compareSemVer(versions[i], versions[i + 1])).toBeLessThan(0);
    }
  });

  it("should return 0 for equal versions", () => {
    const a = parseSemVer("1.2.3");
    const b = parseSemVer("1.2.3");
    expect(compareSemVer(a, b)).toBe(0);
  });
});

describe("isVersionCompatible", () => {
  it("should check major version compatibility", () => {
    const current = parseSemVer("2.0.0");
    expect(isVersionCompatible(current, { major: 2 })).toBe(true);
    expect(isVersionCompatible(current, { major: 1 })).toBe(false);
    expect(isVersionCompatible(current, { major: 3 })).toBe(false);
  });

  it("should check minor version compatibility", () => {
    const current = parseSemVer("1.2.0");
    expect(isVersionCompatible(current, { minor: 2 })).toBe(true);
    expect(isVersionCompatible(current, { minor: 1 })).toBe(true);
    expect(isVersionCompatible(current, { minor: 3 })).toBe(false);
  });

  it("should check patch version compatibility", () => {
    const current = parseSemVer("1.0.5");
    expect(isVersionCompatible(current, { patch: 5 })).toBe(true);
    expect(isVersionCompatible(current, { patch: 4 })).toBe(true);
    expect(isVersionCompatible(current, { patch: 6 })).toBe(false);
  });

  it("should check combined compatibility", () => {
    const current = parseSemVer("2.3.4");
    expect(isVersionCompatible(current, { major: 2, minor: 3 })).toBe(true);
    expect(isVersionCompatible(current, { major: 2, minor: 4 })).toBe(false);
    expect(isVersionCompatible(current, { major: 2, minor: 3, patch: 4 })).toBe(true);
    expect(isVersionCompatible(current, { major: 2, minor: 3, patch: 5 })).toBe(false);
  });
});
