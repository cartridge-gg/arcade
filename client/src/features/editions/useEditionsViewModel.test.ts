import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { EditionModel, GameModel } from "@cartridge/arcade";
import { useEditionsViewModel } from "./useEditionsViewModel";

const mockUseAccount = vi.fn();
const mockUseArcade = vi.fn();
const mockUseProject = vi.fn();
const mockUseOwnerships = vi.fn();
const mockUseNavigate = vi.fn();
const mockUseRouterState = vi.fn();

vi.mock("@starknet-react/core", () => ({
  useAccount: () => mockUseAccount(),
}));

vi.mock("@/hooks/arcade", () => ({
  useArcade: () => mockUseArcade(),
}));

vi.mock("@/hooks/project", () => ({
  useProject: () => mockUseProject(),
}));

vi.mock("@/hooks/ownerships", () => ({
  useOwnerships: () => mockUseOwnerships(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockUseNavigate,
  useRouterState: () => mockUseRouterState(),
}));

describe("useEditionsViewModel", () => {
  const createEdition = (overrides: Partial<EditionModel> = {}): EditionModel =>
    ({
      id: 1,
      name: "Edition One",
      certified: true,
      whitelisted: true,
      published: true,
      gameId: 1,
      description: "",
      color: "#fff",
      clone() {
        return { ...this } as EditionModel;
      },
      ...overrides,
    }) as EditionModel;

  beforeEach(() => {
    vi.resetAllMocks();
    mockUseAccount.mockReturnValue({ address: "0x1" });
    mockUseArcade.mockReturnValue({
      editions: [createEdition()],
    });
    mockUseProject.mockReturnValue({
      game: { id: 1, name: "Game" } as GameModel,
      edition: createEdition(),
    });
    mockUseOwnerships.mockReturnValue({
      ownerships: [
        {
          tokenId: BigInt(1),
          accountAddress: "0x1",
        },
      ],
    });
    mockUseRouterState.mockReturnValue({ location: { pathname: "/" } });
  });

  it("returns edition list with active state", () => {
    const { result } = renderHook(() => useEditionsViewModel());
    expect(result.current.editions).toHaveLength(1);
    expect(result.current.editions[0].active).toBe(true);
  });

  it("calculates ownership flags", () => {
    const { result } = renderHook(() => useEditionsViewModel());
    expect(result.current.isEditionOwner).toBe(true);
  });
});
