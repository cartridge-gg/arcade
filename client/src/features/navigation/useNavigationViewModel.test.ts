import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useNavigationViewModel } from "./useNavigationViewModel";

const mockNavigate = vi.fn();
const mockUseProject = vi.fn();
const mockUseRouterState = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  useRouterState: () => mockUseRouterState(),
}));

vi.mock("@/hooks/project", async () => {
  const actual = await vi.importActual<typeof import("@/hooks/project")>(
    "@/hooks/project",
  );
  return {
    ...actual,
    useProject: () => mockUseProject(),
  };
});

vi.mock("@/lib/helpers", () => ({
  joinPaths: (...paths: string[]) => `/${paths.join("/")}`,
}));

describe("useNavigationViewModel", () => {
  const setRouterPathname = (pathname: string) => {
    mockUseRouterState.mockReturnValue({
      location: { pathname },
      resolvedLocation: { pathname },
    });
    (window as any).location = { pathname };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setRouterPathname("/game/test/marketplace");
  });

  it("returns marketplace tabs when game is not defined", () => {
    setRouterPathname("/marketplace");
    mockUseProject.mockReturnValue({
      game: undefined,
      tab: "marketplace",
    });

    const { result } = renderHook(() => useNavigationViewModel());

    const tabs = result.current.tabs;
    expect(tabs.map((item) => item.tab)).toEqual([
      "marketplace",
      "leaderboard",
    ]);
    expect(
      Object.fromEntries(tabs.map((item) => [item.tab, item.href])),
    ).toEqual({
      marketplace: "/",
      leaderboard: "/leaderboard",
    });
    expect(result.current.activeTab).toBe("marketplace");
  });

  it("returns full tabs when game is defined", () => {
    setRouterPathname("/game/test/leaderboard");
    mockUseProject.mockReturnValue({
      game: { id: 1, name: "Test Game" },
      tab: "leaderboard",
    });

    const { result } = renderHook(() => useNavigationViewModel());

    const tabs = result.current.tabs;
    expect(tabs.map((item) => item.tab)).toEqual([
      "marketplace",
      "leaderboard",
      "guilds",
      "about",
    ]);
    expect(tabs.find((item) => item.tab === "leaderboard")?.href).toBe(
      "/game/test/leaderboard",
    );
    expect(tabs.find((item) => item.tab === "marketplace")?.href).toBe(
      "/game/test/marketplace",
    );
    expect(result.current.activeTab).toBe("leaderboard");
  });

  it("defaults to marketplace when tab is not in available tabs", () => {
    setRouterPathname("/game/test/marketplace");
    mockUseProject.mockReturnValue({
      game: { id: 1, name: "Test Game" },
      tab: "invalid-tab",
    });

    const { result } = renderHook(() => useNavigationViewModel());

    expect(result.current.activeTab).toBe("marketplace");
  });


  it("builds hrefs for edition-scoped routes", () => {
    setRouterPathname("/game/test/edition/season-1/marketplace");
    mockUseProject.mockReturnValue({
      game: { id: 1, name: "Test Game" },
      tab: "marketplace",
    });

    const { result } = renderHook(() => useNavigationViewModel());

    const tabs = result.current.tabs;
    expect(
      tabs.find((item) => item.tab === "leaderboard")?.href,
    ).toBe("/game/test/edition/season-1/leaderboard");
    expect(tabs.find((item) => item.tab === "guilds")?.href).toBe(
      "/game/test/edition/season-1/guilds",
    );
  });
});
