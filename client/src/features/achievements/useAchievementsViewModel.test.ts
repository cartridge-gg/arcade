import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { EditionModel, GameModel } from "@cartridge/arcade";
import { useAchievementsViewModel } from "./useAchievementsViewModel";

const mockUseNavigate = vi.fn();
const mockUseRouterState = vi.fn();
const mockUseAddress = vi.fn();
const mockUseAchievements = vi.fn();
const mockUseArcade = vi.fn();
const mockUseOwnerships = vi.fn();
const mockUseAccount = vi.fn();
const mockUseAnalytics = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockUseNavigate,
  useRouterState: () => mockUseRouterState(),
}));

vi.mock("@/hooks/address", () => ({
  useAddress: () => mockUseAddress(),
}));

vi.mock("@/hooks/achievements", () => ({
  useAchievements: () => mockUseAchievements(),
}));

vi.mock("@/hooks/arcade", () => ({
  useArcade: () => mockUseArcade(),
}));

vi.mock("@/hooks/ownerships", () => ({
  useOwnerships: () => mockUseOwnerships(),
}));

vi.mock("@starknet-react/core", () => ({
  useAccount: () => mockUseAccount(),
}));

vi.mock("@/hooks/useAnalytics", () => ({
  useAnalytics: () => mockUseAnalytics(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useAchievementsViewModel", () => {
  const baseEdition = {
    id: 1,
    name: "Main Edition",
    color: "#fff",
    gameId: 10,
    config: { project: "proj" },
    properties: { icon: "icon.png", banner: "banner.png" },
    socials: { twitter: "https://twitter.com/game" },
  } as unknown as EditionModel;

  const game = {
    id: 10,
    name: "Sample Game",
    socials: { website: "https://game.example" },
  } as unknown as GameModel;

  beforeEach(() => {
    mockUseAddress.mockReturnValue({ address: "0x1", isSelf: true });
    mockUseRouterState.mockReturnValue({
      location: { pathname: "/achievements" },
    });
    mockUseNavigate.mockReturnValue(vi.fn());
    mockUseAchievements.mockReturnValue({
      achievements: {
        proj: [
          {
            id: "ach-1",
            group: "Story",
            index: 1,
            completed: true,
            earning: 100,
            percentage: "10",
            hidden: false,
            icon: "icon-1",
            title: "Champion",
            description: "Win the game",
            tasks: [],
            timestamp: "123",
          },
        ],
      },
      players: {
        proj: [
          {
            address: "0x1",
            earnings: 150,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    mockUseArcade.mockReturnValue({
      pins: { "0x1": ["ach-1"] },
      games: [game],
      editions: [baseEdition],
      provider: { social: { pin: vi.fn(), unpin: vi.fn() } },
    });
    mockUseOwnerships.mockReturnValue({ ownerships: [] });
    mockUseAccount.mockReturnValue({
      account: { execute: vi.fn().mockResolvedValue(true) },
      connector: {},
    });
    mockUseAnalytics.mockReturnValue({
      trackEvent: vi.fn(),
      events: {
        ACHIEVEMENT_PINNED: "pin",
        ACHIEVEMENT_UNPINNED: "unpin",
        ACHIEVEMENT_SHARED: "share",
      },
    });
  });

  it("returns summary cards and trophies when edition provided", () => {
    const { result } = renderHook(() =>
      useAchievementsViewModel({ game, edition: baseEdition, isMobile: false }),
    );

    expect(result.current.status).toBe("success");
    expect(result.current.summaryCards).toHaveLength(1);
    expect(result.current.showTrophies).toBe(true);
    expect(result.current.trophies).toBeDefined();
    expect(result.current.trophies?.groups[0].items[0].pin?.pinned).toBe(true);
  });

  it("returns multiple summary cards when no edition provided", () => {
    const { result } = renderHook(() =>
      useAchievementsViewModel({ game, isMobile: false }),
    );

    expect(result.current.summaryCards.length).toBeGreaterThan(0);
    expect(result.current.showTrophies).toBe(false);
  });

  it("returns loading status when achievements loading", () => {
    mockUseAchievements.mockReturnValueOnce({
      achievements: {},
      players: {},
      isLoading: true,
      isError: false,
    });

    const { result } = renderHook(() =>
      useAchievementsViewModel({ game, edition: baseEdition, isMobile: false }),
    );

    expect(result.current.status).toBe("loading");
  });
});
