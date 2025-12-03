import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { GameModel } from "@cartridge/arcade";
import { useGameItemViewModel } from "./useGameItemViewModel";
import type { GameItemSharedContext } from "./useGamesViewModel";

const mockUsePlayerGameStats = vi.fn();

vi.mock("@/hooks/achievements", () => ({
  usePlayerGameStats: () => mockUsePlayerGameStats(),
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

  const createSharedContext = (
    overrides: Partial<GameItemSharedContext> = {},
  ): GameItemSharedContext => ({
    address: "0x1",
    accesses: [],
    editions: [
      {
        id: 10,
        gameId: 1,
        config: { project: "proj" },
      },
    ] as GameItemSharedContext["editions"],
    ownerships: [
      {
        tokenId: BigInt(1),
        accountAddress: "0x1",
        contractAddress: "0x0",
        balance: BigInt(1),
      },
    ],
    pathname: "/",
    close: vi.fn(),
    trackGameInteraction: vi.fn(),
    totalStats: { completed: 0, total: 0, rank: 0, earnings: 50 },
    ...overrides,
  });

  beforeEach(() => {
    vi.resetAllMocks();
    mockUsePlayerGameStats.mockReturnValue({ earnings: 20 });
  });

  it("computes view model for a game", () => {
    const game = createGame();
    const sharedContext = createSharedContext();
    const { result } = renderHook(() =>
      useGameItemViewModel(game, { selectedGameId: 1 }, sharedContext),
    );

    expect(result.current.active).toBe(true);
    expect(result.current.owner).toBe(true);
    expect(result.current.points).toBe(20);
  });

  it("tracks selection on select", () => {
    const game = createGame();
    const trackGameInteraction = vi.fn();
    const sharedContext = createSharedContext({ trackGameInteraction });

    const { result } = renderHook(() =>
      useGameItemViewModel(game, { selectedGameId: 0 }, sharedContext),
    );

    act(() => {
      result.current.onSelect();
    });

    expect(trackGameInteraction).toHaveBeenCalled();
  });

  it("does not treat disconnected accounts as owners or admins", () => {
    const game = createGame();
    const sharedContext = createSharedContext({
      address: undefined,
      accesses: [
        {
          address: "0x1",
          role: { value: "Admin" },
        },
      ] as GameItemSharedContext["accesses"],
    });

    const { result } = renderHook(() =>
      useGameItemViewModel(game, { selectedGameId: 1 }, sharedContext),
    );

    expect(result.current.owner).toBe(false);
    expect(result.current.admin).toBe(false);
  });
});
