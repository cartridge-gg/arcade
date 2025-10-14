import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

// Event categories for better organization
export const EventCategory = {
  NAVIGATION: "navigation",
  AUTH: "auth",
  GAME: "game",
  ACHIEVEMENT: "achievement",
  MARKETPLACE: "marketplace",
  INVENTORY: "inventory",
  SOCIAL: "social",
  DISCOVERY: "discovery",
  PROFILE: "profile",
} as const;

// Event naming convention: category_action_target
export const AnalyticsEvents = {
  // Navigation Events
  NAVIGATION_HOME_CLICKED: "navigation_home_clicked",
  NAVIGATION_SIDEBAR_TOGGLED: "navigation_sidebar_toggled",

  // Authentication Events
  AUTH_WALLET_CONNECT_CLICKED: "auth_wallet_connect_clicked",
  AUTH_WALLET_CONNECTED: "auth_wallet_connected",
  AUTH_WALLET_DISCONNECTED: "auth_wallet_disconnected",
  AUTH_USER_CARD_CLICKED: "auth_user_card_clicked",

  // Game Events
  GAME_SELECTED: "game_selected",
  GAME_PLAY_CLICKED: "game_play_clicked",
  GAME_REGISTER_STARTED: "game_register_started",
  GAME_REGISTER_SUBMITTED: "game_register_submitted",
  GAME_REGISTER_FAILED: "game_register_failed",
  GAME_MANAGEMENT_ACTION: "game_management_action",
  GAME_PUBLISHED: "game_published",
  GAME_HIDDEN: "game_hidden",
  GAME_UPDATED: "game_updated",

  // Achievement Events
  ACHIEVEMENT_VIEWED: "achievement_viewed",
  ACHIEVEMENT_CARD_CLICKED: "achievement_card_clicked",
  ACHIEVEMENT_PINNED: "achievement_pinned",
  ACHIEVEMENT_UNPINNED: "achievement_unpinned",
  ACHIEVEMENT_SHARED: "achievement_shared",
  ACHIEVEMENT_PAGE_CHANGED: "achievement_page_changed",

  // Marketplace Events
  MARKETPLACE_ITEM_INSPECTED: "marketplace_item_inspected",
  MARKETPLACE_PURCHASE_INITIATED: "marketplace_purchase_initiated",
  MARKETPLACE_PURCHASE_FAILED: "marketplace_purchase_failed",
  MARKETPLACE_BULK_PURCHASE_INITIATED: "marketplace_bulk_purchase_initiated",
  MARKETPLACE_FILTER_APPLIED: "marketplace_filter_applied",
  MARKETPLACE_SEARCH_PERFORMED: "marketplace_search_performed",
  MARKETPLACE_TAB_SWITCHED: "marketplace_tab_switched",

  // Inventory Events
  INVENTORY_TOKEN_CLICKED: "inventory_token_clicked",
  INVENTORY_COLLECTION_CLICKED: "inventory_collection_clicked",
  INVENTORY_VIEW_EXPANDED: "inventory_view_expanded",
  INVENTORY_VIEW_COLLAPSED: "inventory_view_collapsed",

  // Discovery Feed Events
  DISCOVERY_TAB_SWITCHED: "discovery_tab_switched",

  // Profile Events
  PROFILE_BUTTON_CLICKED: "profile_button_clicked",

  // Social Events
  SOCIAL_DISCORD_CLICKED: "social_discord_clicked",
  SOCIAL_TWITTER_CLICKED: "social_twitter_clicked",
  SOCIAL_GITHUB_CLICKED: "social_github_clicked",
  SOCIAL_TELEGRAM_CLICKED: "social_telegram_clicked",
  SOCIAL_WEBSITE_CLICKED: "social_website_clicked",
} as const;

// Game-specific types
export type GameAction =
  | "select"
  | "play"
  | "register"
  | "publish"
  | "hide"
  | "update"
  | "whitelist"
  | "blacklist";

export interface GameData {
  id?: string;
  name?: string;
  namespace?: string;
  worldAddress?: string;
}

// Type-safe event properties
export interface EventProperties {
  // Common properties
  timestamp?: number;
  user_address?: string;
  session_id?: string;

  // Navigation properties
  from_page?: string;
  to_page?: string;
  tab_name?: string;

  // Game properties
  game_id?: string;
  game_name?: string;
  game_namespace?: string;
  game_world_address?: string;
  game_action?: string;

  // Achievement properties
  achievement_id?: string;
  achievement_name?: string;
  achievement_game?: string;
  achievement_edition?: string;
  achievement_page?: number;

  // Marketplace properties
  collection_id?: string;
  collection_name?: string;
  collection_address?: string;
  item_id?: string;
  item_name?: string;
  item_price?: number;
  item_token_id?: string;
  seller_address?: string;
  buyer_address?: string;
  order_id?: string;
  order_ids?: string[];
  purchase_type?: "single" | "bulk";
  total_price?: number;
  currency?: string;
  items_count?: number;
  filter_type?: string;
  filter_value?: string;
  search_query?: string;
  marketplace_tab?: string;

  // Inventory properties
  token_address?: string;
  token_symbol?: string;
  token_amount?: string;

  // Discovery properties
  discovery_tab?: "all" | "following";

  // Profile properties
  profile_address?: string;
  profile_username?: string;

  // Social properties
  social_platform?: string;
  social_url?: string;

  // Error properties
  error_message?: string;
  error_code?: string;

  // Additional custom properties
  [key: string]: any;
}

export function useAnalytics() {
  const posthog = usePostHog();

  const trackEvent = useCallback(
    (eventName: string, properties?: EventProperties) => {
      if (!posthog) return;

      // Add common properties
      const enrichedProperties = {
        ...properties,
        timestamp: Date.now(),
        page_url: window.location.href,
        page_path: window.location.pathname,
        user_agent: navigator.userAgent,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
      };

      // Track the event
      posthog.capture(eventName, enrichedProperties);

      // Log in development
      if (import.meta.env.DEV) {
        console.log(`[Analytics] Event: ${eventName}`, enrichedProperties);
      }
    },
    [posthog],
  );

  const trackPageView = useCallback(
    (pageName: string, properties?: EventProperties) => {
      if (!posthog) return;

      posthog.capture("$pageview", {
        ...properties,
        page_name: pageName,
      });
    },
    [posthog],
  );

  // Helper functions for common tracking patterns
  const trackGameInteraction = useCallback(
    ({
      game,
      properties,
    }: {
      game: {
        action: GameAction;
        data: GameData;
      };
      properties?: EventProperties;
    }) => {
      const eventMap: Record<GameAction, string> = {
        select: AnalyticsEvents.GAME_SELECTED,
        play: AnalyticsEvents.GAME_PLAY_CLICKED,
        register: AnalyticsEvents.GAME_REGISTER_STARTED,
        publish: AnalyticsEvents.GAME_PUBLISHED,
        hide: AnalyticsEvents.GAME_HIDDEN,
        update: AnalyticsEvents.GAME_UPDATED,
        whitelist: AnalyticsEvents.GAME_MANAGEMENT_ACTION,
        blacklist: AnalyticsEvents.GAME_MANAGEMENT_ACTION,
      };

      const eventName = eventMap[game.action];

      trackEvent(eventName, {
        game_id: game.data.id,
        game_name: game.data.name,
        game_namespace: game.data.namespace,
        game_world_address: game.data.worldAddress,
        game_action: game.action,
        ...properties,
      });
    },
    [trackEvent],
  );

  const trackSocialClick = useCallback(
    (platform: string, url: string, properties?: EventProperties) => {
      const eventMap: Record<string, string> = {
        discord: AnalyticsEvents.SOCIAL_DISCORD_CLICKED,
        twitter: AnalyticsEvents.SOCIAL_TWITTER_CLICKED,
        github: AnalyticsEvents.SOCIAL_GITHUB_CLICKED,
        telegram: AnalyticsEvents.SOCIAL_TELEGRAM_CLICKED,
        website: AnalyticsEvents.SOCIAL_WEBSITE_CLICKED,
      };

      const eventName =
        eventMap[platform.toLowerCase()] ||
        AnalyticsEvents.SOCIAL_WEBSITE_CLICKED;

      trackEvent(eventName, {
        social_platform: platform,
        social_url: url,
        ...properties,
      });
    },
    [trackEvent],
  );

  return {
    // Core tracking functions
    trackEvent,
    trackPageView,

    // Helper functions
    trackGameInteraction,
    trackSocialClick,

    // Export event names for direct use
    events: AnalyticsEvents,
  };
}
