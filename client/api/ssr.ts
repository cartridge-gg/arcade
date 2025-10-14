import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

/**
 * ============================================================================
 * CONSTANTS
 * ============================================================================
 */

const API_URL = process.env.VITE_CARTRIDGE_API_URL || "https://api.cartridge.gg";
const BASE_URL = "https://play.cartridge.gg";

// Active game projects for achievement queries
const ACTIVE_PROJECTS = [
  { model: "", namespace: "dopewars", project: "dopewars" },
  { model: "", namespace: "loot_survivor", project: "loot-survivor" },
  { model: "", namespace: "underdark", project: "underdark" },
  { model: "", namespace: "zkube", project: "zkube" },
  { model: "", namespace: "blobert", project: "blobert" },
  { model: "", namespace: "zdefender", project: "zdefender" },
  { model: "", namespace: "realm", project: "realm" },
  { model: "", namespace: "eternum", project: "eternum" },
  { model: "", namespace: "ponziland", project: "ponziland" },
  { model: "", namespace: "evolute_genesis", project: "evolute-genesis" },
  { model: "", namespace: "pistols", project: "pistols" },
];

// Game configuration for OG images
interface GameConfig {
  name: string;
  icon: string;
  cover: string;
  color: string;
}

const GAME_CONFIGS: Record<string, GameConfig> = {
  "dopewars": {
    name: "Dope Wars",
    icon: "https://static.cartridge.gg/presets/dope-wars/icon.png",
    cover: "https://static.cartridge.gg/presets/dope-wars/cover.png",
    color: "#11ED83",
  },
  "loot-survivor": {
    name: "Loot Survivor",
    icon: "https://static.cartridge.gg/presets/loot-survivor/icon.png",
    cover: "https://static.cartridge.gg/presets/loot-survivor/cover.png",
    color: "#33FF33",
  },
  "underdark": {
    name: "Dark Shuffle",
    icon: "https://static.cartridge.gg/presets/underdark/icon.png",
    cover: "https://static.cartridge.gg/presets/underdark/cover.png",
    color: "#F59100",
  },
  "zkube": {
    name: "zKube",
    icon: "https://static.cartridge.gg/presets/zkube/icon.png",
    cover: "https://static.cartridge.gg/presets/zkube/cover.png",
    color: "#5bc3e6",
  },
  "blobert": {
    name: "Blob Arena",
    icon: "https://static.cartridge.gg/presets/blob-arena-amma/icon.png",
    cover: "https://static.cartridge.gg/presets/blob-arena-amma/cover.png",
    color: "#D7B000",
  },
  "zdefender": {
    name: "zDefender",
    icon: "https://static.cartridge.gg/presets/zdefender/icon.png",
    cover: "https://static.cartridge.gg/presets/zdefender/cover.png",
    color: "#F59100",
  },
  "realm": {
    name: "Eternum",
    icon: "https://static.cartridge.gg/presets/eternum/icon.svg",
    cover: "https://static.cartridge.gg/presets/eternum/cover.png",
    color: "#dc8b07",
  },
  "eternum": {
    name: "Eternum",
    icon: "https://static.cartridge.gg/presets/eternum/icon.svg",
    cover: "https://static.cartridge.gg/presets/eternum/cover.png",
    color: "#dc8b07",
  },
  "ponziland": {
    name: "Ponziland",
    icon: "https://static.cartridge.gg/presets/ponziland/icon.svg",
    cover: "https://static.cartridge.gg/presets/ponziland/cover.png",
    color: "#F38332",
  },
  "evolute-genesis": {
    name: "Mage Duel",
    icon: "https://static.cartridge.gg/presets/mage-duel/icon.png",
    cover: "https://static.cartridge.gg/presets/mage-duel/cover.png",
    color: "#BD835B",
  },
  "pistols": {
    name: "Pistols at Dawn",
    icon: "https://static.cartridge.gg/presets/pistols/icon.png",
    cover: "https://static.cartridge.gg/presets/pistols/cover.png",
    color: "#EF9758",
  },
};

/**
 * ============================================================================
 * TYPES
 * ============================================================================
 */

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface Project {
  model: string;
  namespace: string;
  project: string;
}

interface RawProgression {
  playerId: string;
  achievementId: string;
  points: number;
  taskId: string;
  taskTotal: number;
  total: number;
  completionTime: string;
}

interface PlayerStats {
  totalPoints: number;
  gameStats: Record<string, {
    points: number;
  }>;
}

interface GraphQLAccountResponse {
  account?: {
    controllers?: {
      edges?: Array<{
        node?: {
          address?: string;
        };
      }>;
    };
  };
}

interface GraphQLProgressionsResponse {
  playerAchievements: {
    items: Array<{
      meta: {
        project: string;
        model: string;
        namespace: string;
        count: number;
      };
      achievements: RawProgression[];
    }>;
  };
}

/**
 * ============================================================================
 * GRAPHQL QUERIES
 * ============================================================================
 */

const ADDRESS_BY_USERNAME_QUERY = `
  query AddressByUsername($username: String!) {
    account(username: $username) {
      controllers(first: 1) {
        edges {
          node {
            address
          }
        }
      }
    }
  }
`;

/**
 * Format projects array to GraphQL input syntax (not JSON)
 */
function formatProjectsForGraphQL(projects: Project[]): string {
  return projects
    .map(p => `{ model: "${p.model}", namespace: "${p.namespace}", project: "${p.project}" }`)
    .join(', ');
}

/**
 * Build progressions query
 * Note: This query returns ALL achievements for ALL players in the specified projects.
 * Filtering by playerId must be done client-side by matching the playerId field.
 */
function buildProgressionsQuery(projects: Project[]): string {
  return `
    query Progressions($projects: [Project!]!) {
      playerAchievements(projects: $projects) {
        items {
          meta {
            project
            model
            namespace
            count
          }
          achievements {
            playerId
            achievementId
            points
            taskId
            taskTotal
            total
            completionTime
          }
        }
      }
    }
  `;
}

/**
 * ============================================================================
 * GRAPHQL CLIENT
 * ============================================================================
 */

async function graphqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const json: GraphQLResponse<T> = await response.json();

    if (json.errors && json.errors.length > 0) {
      const errorMessage = json.errors.map((e) => e.message).join(", ");
      throw new Error(`GraphQL error: ${errorMessage}`);
    }

    if (!json.data) {
      throw new Error("No data returned from GraphQL query");
    }

    return json.data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("GraphQL request timed out after 10 seconds");
    }
    throw error;
  }
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Validate and resolve player username or address to a Starknet address
 */
async function resolvePlayerAddress(usernameOrAddress: string): Promise<string | null> {
  // Validate format
  const isAddress = usernameOrAddress.match(/^0x[0-9a-fA-F]+$/);
  if (isAddress) {
    if (!isValidAddress(usernameOrAddress)) {
      return null;
    }
    return usernameOrAddress;
  }

  if (!isValidUsername(usernameOrAddress)) {
    return null;
  }

  // Resolve username to address
  const data = await graphqlRequest<GraphQLAccountResponse>(ADDRESS_BY_USERNAME_QUERY, {
    username: usernameOrAddress.toLowerCase(),
  });

  const resolvedAddress = data.account?.controllers?.edges?.[0]?.node?.address;
  return resolvedAddress || null;
}

/**
 * Escape HTML special characters to prevent XSS attacks
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escape URL for HTML attributes without breaking query parameters
 */
function escapeUrl(url: string): string {
  return url
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Validate username format
 */
function isValidUsername(username: string): boolean {
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
function isValidAddress(address: string): boolean {
  if (!address) return false;
  const cleaned = address.replace(/^0x/, '');
  return /^[0-9a-fA-F]{1,64}$/.test(cleaned);
}

/**
 * Normalize Starknet address for comparison
 */
function normalizeAddress(address: string): string {
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
 */
function getAvatarVariant(username: string): string {
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
 */
function computePlayerStats(
  address: string,
  progressionsData: GraphQLProgressionsResponse,
): PlayerStats {
  let totalPoints = 0;
  const gameStats: Record<string, { points: number }> = {};

  // Normalize target address once
  let normalizedTargetAddress: string;
  try {
    normalizedTargetAddress = normalizeAddress(address);
    console.log(`[SSR Debug] Normalized target address: ${normalizedTargetAddress}`);
  } catch (error) {
    console.error(`[SSR Debug] Failed to normalize address: ${address}`, error);
    return { totalPoints: 0, gameStats: {} };
  }

  // Process each project's progressions
  for (const item of progressionsData.playerAchievements.items) {
    const project = item.meta.project;
    console.log(`[SSR Debug] Processing project: ${project}, achievements count: ${item.achievements.length}`);

    // Get player's progressions for this project
    const playerProgressions = item.achievements.filter((p: RawProgression) => {
      try {
        const normalized = normalizeAddress(p.playerId);
        const matches = normalized === normalizedTargetAddress;
        if (matches) {
          console.log(`[SSR Debug] Found matching progression for ${project}: ${p.points} points`);
        }
        return matches;
      } catch {
        return false;
      }
    });

    console.log(`[SSR Debug] Found ${playerProgressions.length} matching progressions for ${project}`);

    // Calculate points
    const projectPoints = playerProgressions.reduce((sum: number, p: RawProgression) => sum + p.points, 0);

    // Store per-game stats
    gameStats[project] = {
      points: projectPoints,
    };

    totalPoints += projectPoints;
  }

  return {
    totalPoints,
    gameStats,
  };
}

/**
 * Generate OG image URL for player profile (general or game-specific)
 * @param gameId - Optional game ID for game-specific profile
 */
function buildPlayerOgImageUrl(
  usernameOrAddress: string,
  points: number,
  gameId?: string
): string {
  const ogParams = new URLSearchParams({
    username: usernameOrAddress,
    points: points.toString(),
    primaryColor: '#FFD546',
    avatarVariant: getAvatarVariant(usernameOrAddress),
  });

  // Add game-specific parameters if gameId is provided
  if (gameId) {
    const gameConfig = GAME_CONFIGS[gameId];
    ogParams.set('game', gameId);

    if (gameConfig?.color) {
      ogParams.set('primaryColor', gameConfig.color);
    }
    if (gameConfig?.cover) {
      ogParams.set('gameImage', gameConfig.cover);
    }
    if (gameConfig?.icon) {
      ogParams.set('gameIcon', gameConfig.icon);
    }
  }

  return `${API_URL}/og/profile?${ogParams.toString()}`;
}

/**
 * Build meta tags HTML string
 */
function buildMetaTags(title: string, description: string, imageUrl: string, pageUrl: string): string {
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

/**
 * ============================================================================
 * MAIN SSR HANDLER
 * ============================================================================
 */

async function generateMetaTags(url: string): Promise<string> {
  const urlParts = url.split("/").filter(Boolean);

  let title = "Cartridge Arcade";
  let description = "Discover, Play and Compete in Onchain Games";
  let imageUrl = `${BASE_URL}/preview.png`;
  const pageUrl = `${BASE_URL}${url}`;

  try {
    // Profile page: /player/:username (with optional /tab/:tabName)
    if (urlParts[0] === "player" && urlParts[1]) {
      const usernameOrAddress = urlParts[1];

      // Validate and resolve to address
      const address = await resolvePlayerAddress(usernameOrAddress);
      if (!address) {
        return buildMetaTags(title, description, imageUrl, pageUrl);
      }

      // Fetch real player data from GraphQL API (only progressions for points)
      const query = buildProgressionsQuery(ACTIVE_PROJECTS);
      const progressionsData = await graphqlRequest<GraphQLProgressionsResponse>(query, {
        projects: ACTIVE_PROJECTS
      });
      console.log(`[SSR Debug] Received ${progressionsData.playerAchievements.items.length} project results`);

      // Debug logging
      console.log(`[SSR Debug] Username: ${usernameOrAddress}, Address: ${address}`);
      console.log(`[SSR Debug] Total achievements returned: ${progressionsData.playerAchievements.items.reduce((sum, item) => sum + item.achievements.length, 0)}`);

      // Compute player statistics
      const stats = computePlayerStats(address, progressionsData);

      console.log(`[SSR Debug] Computed total points: ${stats.totalPoints}`);
      console.log(`[SSR Debug] Game stats:`, JSON.stringify(stats.gameStats));

      title = `${usernameOrAddress} | Cartridge Arcade`;
      description = `${stats.totalPoints} points`;

      // Generate dynamic OG image URL
      imageUrl = buildPlayerOgImageUrl(usernameOrAddress, stats.totalPoints);
    }
    // Game-specific player page: /game/:gameId/player/:username
    else if (urlParts[0] === "game" && urlParts[1] && urlParts[2] === "player" && urlParts[3]) {
      const gameId = urlParts[1];
      const usernameOrAddress = urlParts[3];

      // Validate and resolve to address
      const address = await resolvePlayerAddress(usernameOrAddress);
      if (!address) {
        return buildMetaTags(title, description, imageUrl, pageUrl);
      }

      // Find the specific game project
      const gameProject = ACTIVE_PROJECTS.find(p => p.project === gameId);

      // Fetch player points for the game (0 if game not found in ACTIVE_PROJECTS)
      let gamePoints = 0;
      if (gameProject) {
        const query = buildProgressionsQuery([gameProject]);
        const progressionsData = await graphqlRequest<GraphQLProgressionsResponse>(query, {
          projects: [gameProject]
        });
        const stats = computePlayerStats(address, progressionsData);
        const gameStats = stats.gameStats[gameId] || { points: 0 };
        gamePoints = gameStats.points;
      }

      // Set title and description
      const gameConfig = GAME_CONFIGS[gameId];
      const gameName = gameConfig?.name || gameId;
      title = `${usernameOrAddress} in ${gameName} | Cartridge Arcade`;
      description = `${gamePoints} points in ${gameName}`;

      // Generate dynamic OG image URL
      imageUrl = buildPlayerOgImageUrl(usernameOrAddress, gamePoints, gameId);
    }
    // Game page: /game/:gameId
    else if (urlParts[0] === "game" && urlParts[1]) {
      const gameId = urlParts[1];
      const gameConfig = GAME_CONFIGS[gameId];
      const gameName = gameConfig?.name || gameId;

      if (gameConfig) {
        title = `${gameName} - Cartridge Arcade`;
        description = `Play ${gameName} on Cartridge Arcade - Discover onchain gaming`;
      } else {
        title = "Cartridge Arcade";
        description = "Discover, Play and Compete in Onchain Games";
      }

      // Generate dynamic OG image URL for game page
      if (gameConfig) {
        const ogParams = new URLSearchParams({
          game: gameId,
          displayName: gameConfig.name,
          primaryColor: gameConfig.color,
        });

        if (gameConfig.cover) {
          ogParams.set('gameImage', gameConfig.cover);
        }
        if (gameConfig.icon) {
          ogParams.set('gameIcon', gameConfig.icon);
        }

        imageUrl = `${API_URL}/og/game?${ogParams.toString()}`;
      } else {
        // Fallback to static preview if game not found
        imageUrl = `${BASE_URL}/preview.png`;
      }
    }
  } catch {
    // Silently fall back to default meta tags on error
  }

  return buildMetaTags(title, description, imageUrl, pageUrl);
}

// Cache the base HTML at module load time
let cachedBaseHtml: string | null = null;

async function loadBaseHtml(host: string): Promise<string> {
  if (cachedBaseHtml) {
    return cachedBaseHtml;
  }

  // In Vercel, static files and serverless functions are separate
  // We need to fetch the index.html from the static CDN
  const indexUrl = `https://${host}/index.html`;

  try {
    const response = await fetch(indexUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch index.html: ${response.status}`);
    }
    cachedBaseHtml = await response.text();
    return cachedBaseHtml;
  } catch (fetchError) {
    // Fallback: try reading from filesystem (local development)
    const localPaths = [
      path.join(process.cwd(), "dist/index.html"),
      path.join(process.cwd(), ".vercel/output/static/index.html"),
    ];

    for (const filePath of localPaths) {
      try {
        cachedBaseHtml = fs.readFileSync(filePath, "utf-8");
        return cachedBaseHtml;
      } catch {
        continue;
      }
    }

    throw new Error(
      `Could not load index.html from ${indexUrl} or local filesystem`
    );
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const requestPath = (req.query.path as string) || req.url || "/";
    const host = req.headers.host || "play.cartridge.gg";

    // Generate dynamic meta tags based on the route
    const metaTags = await generateMetaTags(requestPath);

    // Load the base HTML (uses cache after first load)
    const baseHtml = await loadBaseHtml(host);

    // Inject the dynamic meta tags into the <head> section
    // This replaces the closing </head> tag with meta tags + </head>
    const modifiedHtml = baseHtml.replace(
      "</head>",
      `  ${metaTags}\n  </head>`
    );

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(modifiedHtml);
  } catch (error) {
    console.error("SSR Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).send(`Internal Server Error: ${errorMessage}`);
  }
}
