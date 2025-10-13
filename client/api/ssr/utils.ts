/**
 * Utility functions for SSR meta tag generation
 */

import type { RawProgression, PlayerStats } from "./types";
import { API_URL, GAME_CONFIGS } from "./constants";

/**
 * Escape HTML special characters to prevent XSS attacks
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escape URL for HTML attributes without breaking query parameters
 * Only escapes dangerous characters that could break out of attributes
 */
export function escapeUrl(url: string): string {
  return url
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  if (!username || username.length === 0 || username.length > 100) {
    return false;
  }
  if (username.includes('<') || username.includes('>') || username.includes('"') || username.includes("'")) {
    return false;
  }
  return true;
}

/**
 * Validate Starknet address format
 */
export function isValidAddress(address: string): boolean {
  if (!address) return false;
  const cleaned = address.replace(/^0x/, '');
  return /^[0-9a-fA-F]{1,64}$/.test(cleaned);
}

/**
 * Normalize Starknet address for comparison
 */
export function normalizeAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid address: must be a non-empty string');
  }
  const cleaned = address.toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]+$/.test(cleaned)) {
    throw new Error(`Invalid address format: ${address}`);
  }
  if (cleaned.length > 64) {
    throw new Error(`Address too long: ${address}`);
  }
  return cleaned.padStart(64, "0");
}

/**
 * Generate avatar variant based on username
 * Replicates client-side avatar generation logic from components/user/avatar.tsx
 */
export function getAvatarVariant(username: string): string {
  const hash = username.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const index = hash % 8;
  switch (index) {
    case 1:
      return "two";
    case 2:
      return "three";
    case 3:
      return "four";
    case 4:
      return "eight";
    case 5:
      return "six";
    case 6:
      return "seven";
    case 7:
      return "five";
    case 0:
    default:
      return "one";
  }
}

/**
 * Compute player statistics from raw data
 * This is where all the computation happens
 */
export function computePlayerStats(
  address: string,
  progressionsData: any,
  achievementsData: any | null
): PlayerStats {
  let totalPoints = 0;
  let totalCompleted = 0;
  let totalAchievements = 0;
  const gameStats: Record<string, { points: number; completed: number; total: number }> = {};

  // Normalize target address once
  let normalizedTargetAddress: string;
  try {
    normalizedTargetAddress = normalizeAddress(address);
  } catch {
    return { totalPoints: 0, totalCompleted: 0, totalAchievements: 0, gameStats: {} };
  }

  // Process each project's progressions
  for (const item of progressionsData.playerAchievements.items) {
    const project = item.meta.project;

    // Get player's progressions for this project
    const playerProgressions = item.achievements.filter((p: RawProgression) => {
      try {
        const normalized = normalizeAddress(p.playerId);
        return normalized === normalizedTargetAddress;
      } catch {
        return false;
      }
    });

    // Calculate points only (achievements not needed for SSR meta tags)
    const projectPoints = playerProgressions.reduce((sum: number, p: RawProgression) => sum + p.points, 0);

    // Store per-game stats (only points matter for SSR)
    gameStats[project] = {
      points: projectPoints,
      completed: 0,
      total: 0,
    };

    totalPoints += projectPoints;
  }

  return {
    totalPoints,
    totalCompleted,
    totalAchievements,
    gameStats,
  };
}

/**
 * Generate OG image URL for game-specific player profile
 */
export function buildGamePlayerOgImageUrl(
  usernameOrAddress: string,
  gameId: string,
  points: number
): string {
  const gameConfig = GAME_CONFIGS[gameId];
  const ogParams = new URLSearchParams({
    username: usernameOrAddress,
    points: points.toString(),
    game: gameId,
    primaryColor: gameConfig?.color || '#2C250C',
    avatarVariant: getAvatarVariant(usernameOrAddress),
  });

  // Add game cover image and icon URLs if available
  if (gameConfig?.cover) {
    ogParams.set('gameImage', gameConfig.cover);
  }
  if (gameConfig?.icon) {
    ogParams.set('gameIcon', gameConfig.icon);
  }

  return `${API_URL}/og/profile?${ogParams.toString()}`;
}

/**
 * Build meta tags HTML string
 */
export function buildMetaTags(title: string, description: string, imageUrl: string, pageUrl: string): string {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImageUrl = escapeUrl(imageUrl);
  const safePageUrl = escapeUrl(pageUrl);

  return `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${safePageUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImageUrl}" />
    <meta property="og:site_name" content="Cartridge Arcade" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@cartridge_gg" />
    <meta name="twitter:creator" content="@cartridge_gg" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImageUrl}" />
  `.trim();
}
