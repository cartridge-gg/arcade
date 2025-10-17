import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { GameModel } from "@cartridge/arcade";
import { useGameItemViewModel } from "./useGameItemViewModel";

const mockUseAccount = vi.fn();
const mockUseArcade = vi.fn();
const mockUseOwnerships = vi.fn();
const mockUsePlayerStats = vi.fn();
const mockUsePlayerGameStats = vi.fn();
const mockUseSidebar = vi.fn();
const mockUseRouterState = vi.fn();
const mockUseAnalytics = vi.fn();

vi.mock("@starknet-react/core", () => ({
  useAccount: () => mockUseAccount(),
}));

vi.mock("@/hooks/arcade", () => ({
  useArcade: () => mockUseArcade(),
}));

vi.mock("@/hooks/ownerships", () => ({
  useOwnerships: () => mockUseOwnerships(),
}));

vi.mock("@/hooks/achievements", () => ({
  usePlayerStats: () => mockUsePlayerStats(),
  usePlayerGameStats: () => mockUsePlayerGameStats(),
}));

vi.mock("@/hooks/sidebar", () => ({
  useSidebar: () => mockUseSidebar(),
}));

vi.mock("@tanstack/react-router", () => ({
  useRouterState: () => mockUseRouterState(),
}));

vi.mock("@/hooks/useAnalytics", () => ({
  useAnalytics: () => mockUseAnalytics(),
}));

describe("useGameItemViewModel", () => {
  const createGame = (overrides: Partial<GameModel> = {}): GameModel =>
    ({
      id: 1,
      name: "Sample Game",
      properties: { icon: "icon.png", cover: "cover.png" },
      whitelisted: true,
      published: true,
      color: "#fff",
      clone() {
        return { ...this } as GameModel;
      },
      ...overrides,
    }) as GameModel;

  beforeEach(() => {
    vi.resetAllMocks();
    mockUseAccount.mockReturnValue({ address: "0x1" });
    mockUseArcade.mockReturnValue({
      accesses: [],
      editions: [
        {
          id: 10,
          gameId: 1,
          config: { project: "proj" },
        },
      ],
    });
    mockUseOwnerships.mockReturnValue({
      ownerships: [
        {
          tokenId: BigInt(1),
          accountAddress: "0x1",
        },
      ],
    });
    mockUsePlayerStats.mockReturnValue({ earnings: 50 });
    mockUsePlayerGameStats.mockReturnValue({ earnings: 20 });
    mockUseSidebar.mockReturnValue({ close: vi.fn() });
    mockUseRouterState.mockReturnValue({ location: { pathname: "/" } });
    mockUseAnalytics.mockReturnValue({ trackGameInteraction: vi.fn() });
  });

  it("computes view model for a game", () => {
    const game = createGame();
    const { result } = renderHook(() =>
      useGameItemViewModel(game, { selectedGameId: 1 }),
    );

    expect(result.current.active).toBe(true);
    expect(result.current.owner).toBe(true);
    expect(result.current.points).toBe(20);
  });

  it("tracks selection on select", () => {
    const game = createGame();
    const trackGameInteraction = vi.fn();
    mockUseAnalytics.mockReturnValue({ trackGameInteraction });

    const { result } = renderHook(() =>
      useGameItemViewModel(game, { selectedGameId: 0 }),
    );

    act(() => {
      result.current.onSelect();
    });

    expect(trackGameInteraction).toHaveBeenCalled();
  });

  it("does not treat disconnected accounts as owners or admins", () => {
    const game = createGame();
    mockUseAccount.mockReturnValue({ address: undefined });
    mockUseArcade.mockReturnValue({
      accesses: [
        {
          address: "0x1",
          role: { value: "Admin" },
        },
      ],
      editions: [
        {
          id: 10,
          gameId: 1,
          config: { project: "proj" },
        },
      ],
    });

    const { result } = renderHook(() =>
      useGameItemViewModel(game, { selectedGameId: 1 }),
    );

    expect(result.current.owner).toBe(false);
    expect(result.current.admin).toBe(false);
  });
});
