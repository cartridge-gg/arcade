import { describe, it, expect, vi } from "vitest";
import { getToriiVersion, parseToriiVersion, type VersionFetcher, type ToriiVersionResponse } from "./torii-version";

describe("parseToriiVersion", () => {
  it("should parse standard semver", () => {
    const result = parseToriiVersion("1.2.3");
    expect(result).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: undefined,
      build: undefined,
      raw: "1.2.3",
      branch: undefined,
      commit: undefined,
    });
  });

  it("should parse version with prerelease but no branch info", () => {
    const result = parseToriiVersion("1.5.8-preview.4");
    expect(result).toEqual({
      major: 1,
      minor: 5,
      patch: 8,
      prerelease: "preview.4",
      build: undefined,
      raw: "1.5.8-preview.4",
      branch: undefined,
      commit: undefined,
    });
  });

  it("should parse Torii version with branch and commit", () => {
    const result = parseToriiVersion("1.5.8-preview.4 (main 5392c8a)");
    expect(result).toEqual({
      major: 1,
      minor: 5,
      patch: 8,
      prerelease: "preview.4",
      build: undefined,
      raw: "1.5.8-preview.4",
      branch: "main",
      commit: "5392c8a",
    });
  });

  it("should parse version without prerelease but with branch info", () => {
    const result = parseToriiVersion("2.0.0 (develop abc123)");
    expect(result).toEqual({
      major: 2,
      minor: 0,
      patch: 0,
      prerelease: undefined,
      build: undefined,
      raw: "2.0.0",
      branch: "develop",
      commit: "abc123",
    });
  });

  it("should parse version with v prefix and branch info", () => {
    const result = parseToriiVersion("v1.0.0-beta.1 (feature/test def456)");
    expect(result).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: "beta.1",
      build: undefined,
      raw: "v1.0.0-beta.1",
      branch: "feature/test",
      commit: "def456",
    });
  });

  it("should handle version with build metadata and branch info", () => {
    const result = parseToriiVersion("1.0.0+build.123 (main 789xyz)");
    expect(result).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: undefined,
      build: "build.123",
      raw: "1.0.0+build.123",
      branch: "main",
      commit: "789xyz",
    });
  });
});

describe("getToriiVersion", () => {
  it("should fetch and parse version", async () => {
    const mockFetcher: VersionFetcher = vi.fn().mockResolvedValue({
      version: "1.2.3",
      service: "torii",
      success: true,
    } as ToriiVersionResponse);

    const result = await getToriiVersion("http://localhost:8080", mockFetcher);

    expect(mockFetcher).toHaveBeenCalledWith("http://localhost:8080");
    expect(result).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: undefined,
      build: undefined,
      raw: "1.2.3",
      branch: undefined,
      commit: undefined,
    });
  });

  it("should handle version with v prefix", async () => {
    const mockFetcher: VersionFetcher = vi.fn().mockResolvedValue({
      version: "v2.0.0-beta.1",
      service: "torii",
      success: true,
    } as ToriiVersionResponse);

    const result = await getToriiVersion("http://localhost:8080", mockFetcher);

    expect(result).toEqual({
      major: 2,
      minor: 0,
      patch: 0,
      prerelease: "beta.1",
      build: undefined,
      raw: "v2.0.0-beta.1",
      branch: undefined,
      commit: undefined,
    });
  });

  it("should parse Torii-specific version format with branch and commit", async () => {
    const mockFetcher: VersionFetcher = vi.fn().mockResolvedValue({
      version: "1.5.8-preview.4 (main 5392c8a)",
      service: "torii",
      success: true,
    } as ToriiVersionResponse);

    const result = await getToriiVersion("http://localhost:8080", mockFetcher);

    expect(result).toEqual({
      major: 1,
      minor: 5,
      patch: 8,
      prerelease: "preview.4",
      build: undefined,
      raw: "1.5.8-preview.4",
      branch: "main",
      commit: "5392c8a",
    });
  });

  it("should throw error when service is not torii", async () => {
    const mockFetcher: VersionFetcher = vi.fn().mockResolvedValue({
      version: "1.2.3",
      service: "other-service",
      success: true,
    } as ToriiVersionResponse);

    await expect(getToriiVersion("http://localhost:8080", mockFetcher)).rejects.toThrow(
      "Invalid service: expected 'torii', got 'other-service'",
    );
  });

  it("should throw error when success is false", async () => {
    const mockFetcher: VersionFetcher = vi.fn().mockResolvedValue({
      version: "1.2.3",
      service: "torii",
      success: false,
    } as ToriiVersionResponse);

    await expect(getToriiVersion("http://localhost:8080", mockFetcher)).rejects.toThrow(
      "Torii service response indicates failure",
    );
  });

  it("should propagate fetcher errors", async () => {
    const mockFetcher: VersionFetcher = vi.fn().mockRejectedValue(new Error("Network error"));

    await expect(getToriiVersion("http://localhost:8080", mockFetcher)).rejects.toThrow("Network error");
  });

  it("should throw error for invalid version format", async () => {
    const mockFetcher: VersionFetcher = vi.fn().mockResolvedValue({
      version: "invalid-version",
      service: "torii",
      success: true,
    } as ToriiVersionResponse);

    await expect(getToriiVersion("http://localhost:8080", mockFetcher)).rejects.toThrow(
      "Invalid semver format: invalid-version",
    );
  });
});
