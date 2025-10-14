import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";
import { type ByteArray, byteArray, hash } from "starknet";

/**
 * ============================================================================
 * CONSTANTS
 * ============================================================================
 */

const API_URL = process.env.VITE_CARTRIDGE_API_URL || "https://api.cartridge.gg";
const BASE_URL = "https://play.cartridge.gg";
const TORII_URL = "https://api.cartridge.gg/x/arcade-main/torii/graphql";

// Cache for active projects (refreshed every 5 minutes)
let cachedActiveProjects: Project[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache for games list (refreshed every 5 minutes)
let cachedGames: GameData[] | null = null;
let gamesCacheTimestamp = 0;

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

interface GameData {
  id: string;
  name: string;
  description: string;
  published: boolean;
  whitelisted: boolean;
  color: string;
  image: string;      // Icon/cover image URL
  external_url: string;
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
 * Progressions query - copied from @cartridge/ui library
 * This query returns ALL achievements for ALL players in the specified projects.
 * Filtering by playerId must be done client-side by matching the playerId field.
 */
const ProgressionsDocument = `
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

/**
 * Query to fetch active editions from Arcade Registry via Torii
 * Fetch up to 100 editions to ensure we get all active ones
 */
const EDITIONS_QUERY = `
  query {
    arcadeEditionModels(first: 100) {
      edges {
        node {
          namespace
          config
          whitelisted
          published
          priority
        }
      }
    }
  }
`;

/**
 * Query to fetch all games from Arcade Registry via Torii
 * Games contain metadata including name, description, image, color
 */
const GAMES_QUERY = `
  query {
    arcadeGameModels(first: 50) {
      edges {
        node {
          id
          name
          description
          published
          whitelisted
          color
          image
          external_url
        }
      }
    }
  }
`;

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
 * Serializes a ByteArray to a bigint array (from models/index.ts)
 */
function serializeByteArray(byteArray: ByteArray): bigint[] {
  const result: bigint[] = [
    BigInt(byteArray.data.length),
    ...byteArray.data.map((word) => BigInt(word.toString())),
    BigInt(byteArray.pending_word),
    BigInt(byteArray.pending_word_len),
  ];
  return result;
}

/**
 * Poseidon hash of a string representated as a ByteArray (from models/index.ts)
 */
function computeByteArrayHash(str: string): string {
  const bytes = byteArray.byteArrayFromString(str);
  return hash.computePoseidonHashOnElements(serializeByteArray(bytes));
}

/**
 * Computes dojo selector from namespace and event name (from models/index.ts)
 */
function getSelectorFromTag(namespace: string, event: string): string {
  return hash.computePoseidonHashOnElements([
    computeByteArrayHash(namespace),
    computeByteArrayHash(event),
  ]);
}

/**
 * Decode hex-encoded felt252 string (namespace) to ASCII
 */
function decodeFelt252(hex: string): string {
  // Remove 0x prefix if present
  const cleaned = hex.replace(/^0x/, '');
  // Convert hex to string
  let result = '';
  for (let i = 0; i < cleaned.length; i += 2) {
    const byte = Number.parseInt(cleaned.substr(i, 2), 16);
    if (byte > 0) {
      result += String.fromCharCode(byte);
    }
  }
  return result;
}

/**
 * Fetch active editions from Arcade Registry and compute project list
 */
async function getActiveProjects(): Promise<Project[]> {
  // Check cache validity
  const now = Date.now();
  if (cachedActiveProjects && now - cacheTimestamp < CACHE_TTL) {
    return cachedActiveProjects;
  }

  try {
    // Query Torii GraphQL endpoint for editions
    const response = await fetch(TORII_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: EDITIONS_QUERY }),
    });

    if (!response.ok) {
      throw new Error(`Torii request failed: ${response.status}`);
    }

    const json: GraphQLResponse<{
      arcadeEditionModels: {
        edges: Array<{
          node: {
            namespace: string;  // hex-encoded felt252
            config: string;     // JSON string
            whitelisted: boolean;
            published: boolean;
            priority: number;
          };
        }>;
      };
    }> = await response.json();

    if (json.errors) {
      throw new Error(`Torii GraphQL error: ${json.errors.map(e => e.message).join(", ")}`);
    }

    if (!json.data?.arcadeEditionModels?.edges) {
      throw new Error("No edition data returned from Torii");
    }

    // Filter and process editions
    const activeEditions = json.data.arcadeEditionModels.edges
      .map(edge => edge.node)
      .filter(node => node.whitelisted && node.published)
      .sort((a, b) => b.priority - a.priority);

    // Compute projects with model hashes
    const projects: Project[] = activeEditions
      .map(edition => {
        try {
          // Decode namespace from hex
          const namespace = decodeFelt252(edition.namespace);

          // Parse config JSON to get project name
          const config = JSON.parse(edition.config) as { project: string };
          const project = config.project;

          // Compute model hash
          const model = getSelectorFromTag(namespace, "TrophyProgression");

          return {
            model,
            namespace,
            project,
          };
        } catch (error) {
          return null;
        }
      })
      .filter((p): p is Project => p !== null);

    // Update cache
    cachedActiveProjects = projects;
    cacheTimestamp = now;

    return projects;
  } catch (error) {
    // If we have stale cached data, use it as fallback
    if (cachedActiveProjects) {
      return cachedActiveProjects;
    }

    // Ultimate fallback: return empty array (will result in 0 points)
    return [];
  }
}

/**
 * Fetch all games from Arcade Registry via Torii
 */
async function getGames(): Promise<GameData[]> {
  // Check cache validity
  const now = Date.now();
  if (cachedGames && now - gamesCacheTimestamp < CACHE_TTL) {
    return cachedGames;
  }

  try {
    // Query Torii GraphQL endpoint for games
    const response = await fetch(TORII_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: GAMES_QUERY }),
    });

    if (!response.ok) {
      throw new Error(`Torii request failed: ${response.status}`);
    }

    const json: GraphQLResponse<{
      arcadeGameModels: {
        edges: Array<{
          node: {
            id: string;
            name: string;
            description: string;
            published: boolean;
            whitelisted: boolean;
            color: string;
            image: string;
            external_url: string;
          };
        }>;
      };
    }> = await response.json();

    if (json.errors) {
      throw new Error(`Torii GraphQL error: ${json.errors.map(e => e.message).join(", ")}`);
    }

    if (!json.data?.arcadeGameModels?.edges) {
      throw new Error("No game data returned from Torii");
    }

    // Filter and process games - only return published and whitelisted games
    const games: GameData[] = json.data.arcadeGameModels.edges
      .map(edge => edge.node)
      .filter(node => node.published && node.whitelisted);

    // Update cache
    cachedGames = games;
    gamesCacheTimestamp = now;

    return games;
  } catch (error) {
    // If we have stale cached data, use it as fallback
    if (cachedGames) {
      return cachedGames;
    }

    // Ultimate fallback: return empty array
    return [];
  }
}

/**
 * Find game by identifier (gameId from URL)
 * Matches by hex ID or by name (with spaces/dashes removed)
 * Same logic as client-side useProject hook
 */
async function findGameByIdentifier(gameId: string): Promise<GameData | null> {
  const games = await getGames();

  if (games.length === 0) {
    return null;
  }

  // Normalize the gameId for matching (remove spaces and dashes)
  const normalizedGameId = gameId.toLowerCase().replace(/[\s-]/g, "");

  // Try to find game by ID or by normalized name
  const game = games.find(
    (candidate) => {
      // Match by hex ID
      if (candidate.id === gameId) {
        return true;
      }
      // Match by normalized name (remove spaces and dashes)
      const normalizedName = candidate.name.toLowerCase().replace(/[\s-]/g, "");
      return normalizedName === normalizedGameId;
    }
  );

  return game || null;
}

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
 * Must not contain: spaces, underscores, or HTML special characters
 */
function isValidUsername(username: string): boolean {
  if (!username || username.length === 0 || username.length > 31) {
    return false;
  }
  // Check for disallowed characters: HTML special chars, spaces, and underscores
  if (username.includes('<') || username.includes('>') || username.includes('"') || username.includes("'") ||
      username.includes(' ') || username.includes('_')) {
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
    default:
      return "one";
  }
}

/**
 * Compute player statistics from raw data
 * This matches the client logic: only count achievements where ALL tasks are completed
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
  } catch (error) {
    return { totalPoints: 0, gameStats: {} };
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

    // Group progressions by achievementId to check completion
    const achievementGroups = new Map<string, RawProgression[]>();
    playerProgressions.forEach(p => {
      if (!achievementGroups.has(p.achievementId)) {
        achievementGroups.set(p.achievementId, []);
      }
      achievementGroups.get(p.achievementId)!.push(p);
    });

    // Calculate points - only count completed achievements
    // An achievement is complete when ALL its tasks have total >= taskTotal
    let projectPoints = 0;
    achievementGroups.forEach((tasks) => {
      const allTasksComplete = tasks.every(task => task.total >= task.taskTotal);
      if (allTasksComplete) {
        // Use the points from the first task (they should all have the same points value)
        const achievementPoints = tasks[0].points;
        projectPoints += achievementPoints;
      }
    });

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
 * Convert icon URL to cover URL by replacing /icon. with /cover.
 */
function getCoverUrlFromIcon(iconUrl: string): string {
  return iconUrl.replace(/\/icon\.(png|svg|jpg|jpeg|webp)/, '/cover.$1');
}

/**
 * Generate OG image URL for player profile (general or game-specific)
 * @param gameId - Optional game ID for game-specific profile
 * @param gameData - Optional game data for game-specific profile
 */
async function buildPlayerOgImageUrl(
  usernameOrAddress: string,
  points: number,
  gameId?: string,
  gameData?: GameData | null
): Promise<string> {
  const ogParams = new URLSearchParams({
    username: usernameOrAddress,
    points: points.toString(),
    primaryColor: '#FFD546',
    avatarVariant: getAvatarVariant(usernameOrAddress),
  });

  // Add game-specific parameters if gameId is provided
  if (gameId) {
    ogParams.set('game', gameId);

    // Use provided gameData or fetch it
    const data = gameData !== undefined ? gameData : await findGameByIdentifier(gameId);

    if (data) {
      if (data.color) {
        ogParams.set('primaryColor', data.color);
      }
      if (data.image) {
        // Use icon for gameIcon
        ogParams.set('gameIcon', data.image);
        // Convert icon URL to cover URL for gameImage (background)
        ogParams.set('gameImage', getCoverUrlFromIcon(data.image));
      }
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

      // Fetch active projects dynamically
      const activeProjects = await getActiveProjects();

      // Fetch real player data from GraphQL API (only progressions for points)
      const progressionsData = await graphqlRequest<GraphQLProgressionsResponse>(ProgressionsDocument, {
        projects: activeProjects
      });

      // Compute player statistics
      const stats = computePlayerStats(address, progressionsData);

      title = `${usernameOrAddress} | Cartridge Arcade`;
      description = `${stats.totalPoints} points in arcade`;

      // Generate dynamic OG image URL
      imageUrl = await buildPlayerOgImageUrl(usernameOrAddress, stats.totalPoints);
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

      // Fetch game data from onchain
      const gameData = await findGameByIdentifier(gameId);

      // Fetch active projects dynamically
      const activeProjects = await getActiveProjects();

      // Find the specific game project
      // Try exact match first, then try with "arcade-" prefix
      let gameProject = activeProjects.find(p => p.project === gameId);
      if (!gameProject) {
        gameProject = activeProjects.find(p => p.project === `arcade-${gameId}`);
      }

      // Fetch player points for the game (0 if game not found in active projects)
      let gamePoints = 0;
      if (gameProject) {
        const progressionsData = await graphqlRequest<GraphQLProgressionsResponse>(ProgressionsDocument, {
          projects: [gameProject]
        });
        const stats = computePlayerStats(address, progressionsData);
        const gameStats = stats.gameStats[gameProject.project] || { points: 0 };
        gamePoints = gameStats.points;
      }

      // Set title and description using onchain game name
      const gameName = gameData?.name || gameId;
      title = `${usernameOrAddress} in ${gameName} | Cartridge Arcade`;
      description = `${gamePoints} points in ${gameName}`;

      // Generate dynamic OG image URL with game data
      imageUrl = await buildPlayerOgImageUrl(usernameOrAddress, gamePoints, gameId, gameData);
    }
    // Game page: /game/:gameId
    else if (urlParts[0] === "game" && urlParts[1]) {
      const gameId = urlParts[1];

      // Fetch game data from onchain
      const gameData = await findGameByIdentifier(gameId);

      if (gameData) {
        // Use onchain data
        title = `${gameData.name} - Cartridge Arcade`;
        description = gameData.description || `Play ${gameData.name} on Cartridge Arcade - Discover onchain gaming`;

        // Generate dynamic OG image URL using onchain metadata
        const ogParams = new URLSearchParams({
          game: gameId,
          displayName: gameData.name,
          primaryColor: gameData.color || "#FFD546",
        });

        if (gameData.image) {
          // Use icon for gameIcon
          ogParams.set('gameIcon', gameData.image);
          // Convert icon URL to cover URL for gameImage (background)
          ogParams.set('gameImage', getCoverUrlFromIcon(gameData.image));
        }

        imageUrl = `${API_URL}/og/game?${ogParams.toString()}`;
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
        // Try next path
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
