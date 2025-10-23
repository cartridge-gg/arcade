import { parseRouteParams, type TAB_SEGMENTS } from "@/hooks/project";
import { joinPaths } from "@/lib/helpers";

export type TabValue = (typeof TAB_SEGMENTS)[number];

export type NavigationContext =
  | "general"
  | "game"
  | "edition"
  | "marketplace"
  | "player";

export interface NavigationTab {
  tab: TabValue;
  href: string;
  isVisible: boolean;
}

export interface ArcadeGame {
  id: number;
  name: string;
}

export interface ArcadeEdition {
  id: number;
  gameId: number;
  name: string;
  priority: number;
}

interface NavigationContextManagerOptions {
  pathname: string;
  games: ArcadeGame[];
  editions: ArcadeEdition[];
  isLoggedIn: boolean;
}

export class NavigationContextManager {
  private readonly pathname: string;
  private readonly games: ArcadeGame[];
  private readonly editions: ArcadeEdition[];
  private readonly isLoggedIn: boolean;
  private readonly params: ReturnType<typeof parseRouteParams>;

  constructor(options: NavigationContextManagerOptions) {
    this.pathname = options.pathname;
    this.games = options.games;
    this.editions = options.editions;
    this.isLoggedIn = options.isLoggedIn;
    this.params = parseRouteParams(this.pathname);
  }

  getParams(): ReturnType<typeof parseRouteParams> {
    return this.params;
  }

  getActiveContext(): NavigationContext {
    if (this.params.collection) return "marketplace";
    if (this.params.player) return "player";
    if (this.params.edition) return "edition";
    if (this.params.game) return "game";
    return "general";
  }

  getActiveGame(): ArcadeGame | null {
    if (!this.params.game || this.games.length === 0) return null;

    return (
      this.games.find(
        (game) =>
          game.id.toString() === this.params.game ||
          game.name.toLowerCase().replace(/ /g, "-") ===
            this.params.game?.toLowerCase(),
      ) ?? null
    );
  }

  getActiveEdition(): ArcadeEdition | null {
    const game = this.getActiveGame();
    if (!game || this.editions.length === 0) return null;

    const gameEditions = this.editions.filter(
      (edition) => edition.gameId === game.id,
    );
    if (gameEditions.length === 0) return null;

    if (!this.params.edition) {
      return gameEditions
        .sort((a, b) => b.id - a.id)
        .sort((a, b) => b.priority - a.priority)[0];
    }

    return (
      gameEditions.find(
        (edition) =>
          edition.id.toString() === this.params.edition ||
          edition.name.toLowerCase().replace(/ /g, "-") ===
            this.params.edition?.toLowerCase(),
      ) ?? null
    );
  }

  getPlayerContext(): string | null {
    return this.params.player ?? null;
  }

  getDefaultTab(): TabValue {
    const context = this.getActiveContext();
    switch (context) {
      case "general":
      case "game":
      case "edition":
        return "marketplace";
      case "player":
        return "inventory";
      case "marketplace":
        return "items";
      default:
        return "marketplace";
    }
  }

  getAvailableTabs(): NavigationTab[] {
    const context = this.getActiveContext();
    const tabConfigs = this.getTabConfigsForContext(context);
    const isDev = process.env.NODE_ENV === "development";

    return tabConfigs
      .map((tab) => {
        let isVisible = true;

        if (tab === "predict" && !isDev) {
          isVisible = false;
        }

        if (tab === "inventory" && context !== "player" && !this.isLoggedIn) {
          isVisible = false;
        }

        return {
          tab,
          href: this.generateHref(tab),
          isVisible,
        };
      })
      .filter((navTab) => navTab.isVisible);
  }

  private getTabConfigsForContext(context: NavigationContext): TabValue[] {
    switch (context) {
      case "general":
        return ["marketplace", "leaderboard", "inventory", "predict"];
      case "game":
      case "edition":
        return [
          // "activity",
          "marketplace",
          "leaderboard",
          "inventory",
          "predict",
          // "guilds",
          "about",
        ];
      case "marketplace":
        return [
          // "activity",
          "items",
          "holders",
        ];
      case "player":
        return [
          "inventory",
          "achievements",
          // "activity"
        ];
      default:
        return ["marketplace"];
    }
  }

  private generateHref(tab: TabValue): string {
    const segments = this.pathname.split("/").filter(Boolean);
    const currentTab = this.params.tab;
    const hasTrailingTab =
      currentTab && segments[segments.length - 1] === currentTab;

    const baseSegments = hasTrailingTab
      ? segments.slice(0, segments.length - 1)
      : segments;

    const defaultTab = this.getDefaultTab();

    if (baseSegments.length === 0 && tab === defaultTab) {
      return "/";
    }

    if (tab === defaultTab) {
      return joinPaths(...baseSegments);
    }

    return joinPaths(...baseSegments, tab);
  }

  generatePlayerHref(playerNameOrAddress: string, tab?: TabValue): string {
    const playerName = playerNameOrAddress.toLowerCase();

    if (this.params.edition && this.params.game) {
      const segments = [
        "game",
        this.params.game,
        "edition",
        this.params.edition,
        "player",
        playerName,
      ];
      return tab ? joinPaths(...segments, tab) : joinPaths(...segments);
    }

    if (this.params.game) {
      const segments = ["game", this.params.game, "player", playerName];
      return tab ? joinPaths(...segments, tab) : joinPaths(...segments);
    }

    return tab
      ? joinPaths("player", playerName, tab)
      : joinPaths("player", playerName);
  }

  getParentContextHref(): string {
    if (this.params.edition && this.params.game) {
      return joinPaths(
        "game",
        this.params.game,
        "edition",
        this.params.edition,
      );
    }

    if (this.params.game) {
      return joinPaths("game", this.params.game);
    }

    return "/";
  }
}
