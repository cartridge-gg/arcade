import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { GameModel } from "@cartridge/arcade";
import { useGamesViewModel } from "./useGamesViewModel";

const mockUseAccount = vi.fn();
const mockUseArcade = vi.fn();
const mockUseOwnerships = vi.fn();
const mockUseProject = vi.fn();
const mockUseSidebar = vi.fn();

vi.mock("@starknet-react/core", () => ({
  useAccount: () => mockUseAccount(),
}));

vi.mock("@/hooks/arcade", () => ({
  useArcade: () => mockUseArcade(),
}));

vi.mock("@/hooks/ownerships", () => ({
  useOwnerships: () => mockUseOwnerships(),
}));

vi.mock("@/hooks/project", () => ({
  useProject: () => mockUseProject(),
}));

vi.mock("@/hooks/sidebar", () => ({
  useSidebar: () => mockUseSidebar(),
}));

describe("useGamesViewModel", () => {
  const createGame = (overrides: Partial<GameModel> = {}): GameModel =>
    ({
      id: 1,
      name: "Sample Game",
      properties: { icon: "icon.png", cover: "cover.png" },
      whitelisted: true,
      published: true,
      color: "#fff",
      ...overrides,
    }) as GameModel;

  beforeEach(() => {
    mockUseAccount.mockReturnValue({ address: "0x1" });
    mockUseArcade.mockReturnValue({
      games: [createGame()],
      editions: [
        {
          id: 10,
          gameId: 1,
          config: { project: "proj" },
        },
      ],
      accesses: [],
    });
    mockUseOwnerships.mockReturnValue({
      ownerships: [
        {
          tokenId: BigInt(1),
          accountAddress: "0x1",
        },
      ],
    });
    mockUseProject.mockReturnValue({ game: { id: 1 } });
    mockUseSidebar.mockReturnValue({
      isOpen: true,
      handleTouchStart: vi.fn(),
      handleTouchMove: vi.fn(),
      close: vi.fn(),
    });
  });

  it("returns games list with All Games entry", () => {
    const { result } = renderHook(() =>
      useGamesViewModel({ isMobile: false, isPWA: false }),
    );
    expect(result.current.games).toHaveLength(2);
    expect(result.current.games[0].id).toBe(0);
    expect(result.current.games[1].owner).toBe(true);
  });

  it("marks selected game id", () => {
    mockUseProject.mockReturnValue({ game: { id: 2 } });
    const { result } = renderHook(() =>
      useGamesViewModel({ isMobile: false, isPWA: false }),
    );
    expect(result.current.selectedGameId).toBe(2);
  });

  it("does not mark ownership when account is disconnected", () => {
    mockUseAccount.mockReturnValue({ address: undefined });
    const { result } = renderHook(() =>
      useGamesViewModel({ isMobile: false, isPWA: false }),
    );
    expect(result.current.games[1].owner).toBe(false);
  });
});
