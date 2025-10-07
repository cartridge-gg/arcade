import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { EditionModel } from "@cartridge/arcade";
import { useLeaderboardViewModel } from "./useLeaderboardViewModel";

const mockUseAccount = vi.fn();
const mockUseRouterState = vi.fn();
const mockUseAchievements = vi.fn();
const mockUseArcade = vi.fn();

vi.mock("@starknet-react/core", () => ({
  useAccount: () => mockUseAccount(),
}));

vi.mock("@tanstack/react-router", () => ({
  useRouterState: () => mockUseRouterState(),
}));

vi.mock("@/hooks/achievements", () => ({
  useAchievements: () => mockUseAchievements(),
}));

vi.mock("@/hooks/arcade", () => ({
  useArcade: () => mockUseArcade(),
}));

describe("useLeaderboardViewModel", () => {
  const baseEdition = {
    config: { project: "game-project" },
  } as EditionModel;

  beforeEach(() => {
    mockUseAccount.mockReturnValue({ isConnected: true, address: "0x1" });
    mockUseRouterState.mockReturnValue({
      location: { pathname: "/leaderboard" },
    });
    mockUseArcade.mockReturnValue({
      pins: {
        "0x1": ["ach-1", "ach-2"],
      },
      follows: {
        "0x1": ["0x2"],
      },
    });
    mockUseAchievements.mockReturnValue({
      achievements: {
        "game-project": [
          { id: "ach-1", icon: "icon-1", percentage: "10" },
          { id: "ach-2", icon: "icon-2", percentage: "20" },
        ],
      },
      globals: [
        { address: "0x1", earnings: 100, completeds: [] },
        { address: "0x2", earnings: 80, completeds: [] },
      ],
      players: {
        "game-project": [
          { address: "0x1", earnings: 50, completeds: ["ach-1"] },
          { address: "0x2", earnings: 30, completeds: ["ach-2"] },
          { address: "0x3", earnings: 20, completeds: [] },
        ],
      },
      usernames: {
        "0x1": "alice",
        "0x2": "bob",
      },
      isLoading: false,
      isError: false,
    });
  });

  it("returns game leaderboard entries when edition is provided", () => {
    const { result } = renderHook(() =>
      useLeaderboardViewModel({ edition: baseEdition }),
    );

    expect(result.current.isConnected).toBe(true);
    expect(result.current.allEntries).toHaveLength(3);
    expect(result.current.allEntries[0].name).toBe("alice");
    expect(result.current.allEntries[0].pins).toHaveLength(1);
    expect(result.current.followingEntries).toHaveLength(1);
    expect(result.current.followingEntries[0].following).toBe(true);
  });

  it("falls back to global leaderboard when edition is undefined", () => {
    const { result } = renderHook(() => useLeaderboardViewModel({}));

    expect(result.current.allEntries).toHaveLength(2);
    expect(result.current.allEntries[0].name).toBe("alice");
    expect(result.current.followingEntries).toHaveLength(1);
  });

  it("builds player target paths", () => {
    const { result } = renderHook(() => useLeaderboardViewModel({}));
    const target = result.current.getPlayerTarget("0x1");
    expect(target).toBe("/player/0x1/achievements");
  });
});
