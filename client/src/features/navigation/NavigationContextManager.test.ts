import { describe, expect, it } from "vitest";
import { NavigationContextManager } from "./NavigationContextManager";
import type { ArcadeGame, ArcadeEdition } from "./NavigationContextManager";

const mockGames: ArcadeGame[] = [
  { id: 1, name: "Test Game" },
  { id: 2, name: "Another Game" },
];

const mockEditions: ArcadeEdition[] = [
  { id: 1, gameId: 1, name: "Season 1", priority: 1 },
  { id: 2, gameId: 1, name: "Season 2", priority: 2 },
  { id: 3, gameId: 2, name: "Alpha", priority: 1 },
];

describe("NavigationContextManager", () => {
  describe("Context Detection", () => {
    it("detects general context for root path", () => {
      const manager = new NavigationContextManager({
        pathname: "/",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getActiveContext()).toBe("general");
    });

    it("detects general context for /marketplace", () => {
      const manager = new NavigationContextManager({
        pathname: "/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getActiveContext()).toBe("general");
    });

    it("detects game context", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getActiveContext()).toBe("game");
    });

    it("detects edition context", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/edition/1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getActiveContext()).toBe("edition");
    });

    it("detects marketplace context when collection is present", () => {
      const manager = new NavigationContextManager({
        pathname: "/collection/0x123/items",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getActiveContext()).toBe("marketplace");
    });

    it("detects player context", () => {
      const manager = new NavigationContextManager({
        pathname: "/player/0x456/inventory",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getActiveContext()).toBe("player");
    });

    it("marketplace context takes priority over game context", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/collection/0x123/items",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getActiveContext()).toBe("marketplace");
    });

    it("marketplace context takes priority over edition context", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/edition/1/collection/0x123/items",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getActiveContext()).toBe("marketplace");
    });
  });

  describe("Active Game Resolution", () => {
    it("resolves game by ID", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const game = manager.getActiveGame();
      expect(game).toEqual({ id: 1, name: "Test Game" });
    });

    it("resolves game by kebab-case name", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/test-game/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const game = manager.getActiveGame();
      expect(game).toEqual({ id: 1, name: "Test Game" });
    });

    it("returns null when no game in URL", () => {
      const manager = new NavigationContextManager({
        pathname: "/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getActiveGame()).toBeNull();
    });

    it("returns null when game not found", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/999/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getActiveGame()).toBeNull();
    });
  });

  describe("Active Edition Resolution", () => {
    it("resolves edition by ID", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/edition/1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const edition = manager.getActiveEdition();
      expect(edition).toEqual({
        id: 1,
        gameId: 1,
        name: "Season 1",
        priority: 1,
      });
    });

    it("resolves edition by kebab-case name", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/edition/season-1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const edition = manager.getActiveEdition();
      expect(edition).toEqual({
        id: 1,
        gameId: 1,
        name: "Season 1",
        priority: 1,
      });
    });

    it("returns highest priority edition when no edition specified", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const edition = manager.getActiveEdition();
      expect(edition).toEqual({
        id: 2,
        gameId: 1,
        name: "Season 2",
        priority: 2,
      });
    });

    it("returns null when no game in context", () => {
      const manager = new NavigationContextManager({
        pathname: "/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getActiveEdition()).toBeNull();
    });

    it("returns null when edition not found", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/edition/999/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getActiveEdition()).toBeNull();
    });
  });

  describe("Player Context", () => {
    it("returns player address from URL", () => {
      const manager = new NavigationContextManager({
        pathname: "/player/0x456/inventory",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getPlayerContext()).toBe("0x456");
    });

    it("returns null when no player in URL", () => {
      const manager = new NavigationContextManager({
        pathname: "/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getPlayerContext()).toBeNull();
    });
  });

  describe("Available Tabs - General Context", () => {
    it("returns general tabs when logged out", () => {
      const manager = new NavigationContextManager({
        pathname: "/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const tabs = manager.getAvailableTabs();
      expect(tabs.map((t) => t.tab)).toEqual([
        "about",
        "marketplace",
        "leaderboard",
      ]);
    });

    it("includes inventory when logged in", () => {
      const manager = new NavigationContextManager({
        pathname: "/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: true,
      });

      const tabs = manager.getAvailableTabs();
      expect(tabs.map((t) => t.tab)).toEqual([
        "about",
        "marketplace",
        "leaderboard",
        "inventory",
      ]);
    });
  });

  describe("Available Tabs - Game Context", () => {
    it("returns game tabs when logged out", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const tabs = manager.getAvailableTabs();
      expect(tabs.map((t) => t.tab)).toEqual([
        "about",
        "marketplace",
        "leaderboard",
      ]);
    });

    it("includes inventory when logged in", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: true,
      });

      const tabs = manager.getAvailableTabs();
      expect(tabs.map((t) => t.tab)).toEqual([
        "about",
        "marketplace",
        "leaderboard",
        "inventory",
      ]);
    });
  });

  describe("Available Tabs - Edition Context", () => {
    it("returns edition tabs (same as game)", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/edition/1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const tabs = manager.getAvailableTabs();
      expect(tabs.map((t) => t.tab)).toEqual([
        "about",
        "marketplace",
        "leaderboard",
      ]);
    });
  });

  describe("Available Tabs - Marketplace Context", () => {
    it("returns marketplace-specific tabs", () => {
      const manager = new NavigationContextManager({
        pathname: "/collection/0x123/items",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const tabs = manager.getAvailableTabs();
      expect(tabs.map((t) => t.tab)).toEqual(["items", "holders"]);
    });

    it("marketplace tabs always visible regardless of login", () => {
      const loggedIn = new NavigationContextManager({
        pathname: "/collection/0x123/items",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: true,
      });

      const loggedOut = new NavigationContextManager({
        pathname: "/collection/0x123/items",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(loggedIn.getAvailableTabs().map((t) => t.tab)).toEqual(
        loggedOut.getAvailableTabs().map((t) => t.tab),
      );
    });
  });

  describe("Available Tabs - Player Context", () => {
    it("returns player-specific tabs", () => {
      const manager = new NavigationContextManager({
        pathname: "/player/0x456/inventory",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const tabs = manager.getAvailableTabs();
      expect(tabs.map((t) => t.tab)).toEqual(["inventory", "achievements"]);
    });

    it("inventory is visible in player context even when logged out", () => {
      const manager = new NavigationContextManager({
        pathname: "/player/0x456/inventory",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const tabs = manager.getAvailableTabs();
      expect(tabs.some((t) => t.tab === "inventory")).toBe(true);
    });
  });

  describe("Default Tab", () => {
    it("returns about for general context", () => {
      const manager = new NavigationContextManager({
        pathname: "/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getDefaultTab()).toBe("about");
    });

    it("returns about for game context", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getDefaultTab()).toBe("about");
    });

    it("returns about for edition context", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/edition/1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getDefaultTab()).toBe("about");
    });

    it("returns items for marketplace context", () => {
      const manager = new NavigationContextManager({
        pathname: "/collection/0x123/items",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getDefaultTab()).toBe("items");
    });

    it("returns inventory for player context", () => {
      const manager = new NavigationContextManager({
        pathname: "/player/0x456/inventory",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.getDefaultTab()).toBe("inventory");
    });
  });

  describe("Link Generation", () => {
    it("generates root path for about in general context", () => {
      const manager = new NavigationContextManager({
        pathname: "/leaderboard",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const tabs = manager.getAvailableTabs();
      const aboutTab = tabs.find((t) => t.tab === "about");
      expect(aboutTab?.href).toBe("/");
    });

    it("generates proper hrefs for game context", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: true,
      });

      const tabs = manager.getAvailableTabs();
      const hrefMap = Object.fromEntries(tabs.map((t) => [t.tab, t.href]));

      expect(hrefMap).toMatchObject({
        about: "/game/1",
        marketplace: "/game/1/marketplace",
        leaderboard: "/game/1/leaderboard",
        inventory: "/game/1/inventory",
      });
    });

    it("generates proper hrefs for edition context", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/edition/season-1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: true,
      });

      const tabs = manager.getAvailableTabs();
      const hrefMap = Object.fromEntries(tabs.map((t) => [t.tab, t.href]));

      expect(hrefMap).toMatchObject({
        about: "/game/1/edition/season-1",
        marketplace: "/game/1/edition/season-1/marketplace",
        leaderboard: "/game/1/edition/season-1/leaderboard",
        inventory: "/game/1/edition/season-1/inventory",
      });
    });

    it("generates proper hrefs for marketplace context", () => {
      const manager = new NavigationContextManager({
        pathname: "/collection/0x123/items",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const tabs = manager.getAvailableTabs();
      const hrefMap = Object.fromEntries(tabs.map((t) => [t.tab, t.href]));

      expect(hrefMap).toMatchObject({
        items: "/collection/0x123",
        holders: "/collection/0x123/holders",
      });
    });

    it("generates proper hrefs for player context", () => {
      const manager = new NavigationContextManager({
        pathname: "/player/0x456/inventory",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      const tabs = manager.getAvailableTabs();
      const hrefMap = Object.fromEntries(tabs.map((t) => [t.tab, t.href]));

      expect(hrefMap).toMatchObject({
        inventory: "/player/0x456",
        achievements: "/player/0x456/achievements",
      });
    });

    it("preserves base path when switching tabs", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/edition/2/activity",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: true,
      });

      const tabs = manager.getAvailableTabs();
      const aboutTab = tabs.find((t) => t.tab === "about");
      const marketplaceTab = tabs.find((t) => t.tab === "marketplace");
      const inventoryTab = tabs.find((t) => t.tab === "inventory");

      expect(aboutTab?.href).toBe("/game/1/edition/2");
      expect(marketplaceTab?.href).toBe("/game/1/edition/2/marketplace");
      expect(inventoryTab?.href).toBe("/game/1/edition/2/inventory");
    });
  });

  describe("removeGameContext", () => {
    it("preserves tab when closing game context if tab is available in general context", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/marketplace",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.removeGameContext()).toBe("/marketplace");
    });

    it("preserves tab when closing edition context if tab is available in general context", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/edition/2/leaderboard",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.removeGameContext()).toBe("/leaderboard");
    });

    it("returns root when closing to about tab (default for general)", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/edition/2/about",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.removeGameContext()).toBe("/");
    });

    it("returns root when closing from about tab (implicit)", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/edition/2",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.removeGameContext()).toBe("/");
    });

    it("preserves inventory tab when logged in", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/inventory",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: true,
      });

      expect(manager.removeGameContext()).toBe("/inventory");
    });

    it("returns root when closing inventory tab and not logged in", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/inventory",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.removeGameContext()).toBe("/");
    });

    it("preserves player tab when in player context within game", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/player/0x123/inventory",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.removeGameContext()).toBe("/player/0x123/inventory");
    });

    it("preserves player achievements tab when in player context within game", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/player/0x123/achievements",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.removeGameContext()).toBe("/player/0x123/achievements");
    });

    it("returns root when closing from game-specific tab", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/activity",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.removeGameContext()).toBe("/");
    });

    it("returns root when closing from items tab (not available in general)", () => {
      const manager = new NavigationContextManager({
        pathname: "/game/1/collection/0x123/items",
        games: mockGames,
        editions: mockEditions,
        isLoggedIn: false,
      });

      expect(manager.removeGameContext()).toBe("/");
    });
  });
});
