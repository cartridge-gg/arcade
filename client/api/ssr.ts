import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Vercel Serverless Function for dynamic meta tags with real player data
 *
 * This function fetches player data from the GraphQL API and generates
 * dynamic Open Graph meta tags for social sharing.
 *
 * All computation happens here - we only send final values to OG image service.
 */

// =============================================================================
// CONSTANTS
// =============================================================================

const API_URL = process.env.VITE_CARTRIDGE_API_URL || "https://api.cartridge.gg";

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

// GraphQL Queries
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
 * GraphQL requires unquoted keys: { model: "", namespace: "..." }
 * JSON would be wrong: {"model":"","namespace":"..."}
 */
function formatProjectsForGraphQL(projects: Project[]): string {
  return projects
    .map(p => `{ model: "${p.model}", namespace: "${p.namespace}", project: "${p.project}" }`)
    .join(', ');
}

/**
 * Build progressions query
 * Note: The API returns achievements for ALL players in the projects.
 * We filter by playerId client-side in computePlayerStats()
 */
function buildProgressionsQuery(projects: Project[]): string {
  return `
    query PlayerAchievements {
      playerAchievements(
        projects: [${formatProjectsForGraphQL(projects)}]
      ) {
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

// =============================================================================
// TYPES
// =============================================================================

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

interface RawAchievement {
  id: string;
  hidden: boolean;
  points: number;
  taskId: string;
  taskTotal: number;
}

interface PlayerStats {
  totalPoints: number;
  totalCompleted: number;
  totalAchievements: number;
  gameStats: Record<string, {
    points: number;
    completed: number;
    total: number;
  }>;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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
 * Make a GraphQL request to the Cartridge API
 */
async function graphqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  // LOG: Request details
  console.log('[GraphQL Request]', {
    url: `${API_URL}/query`,
    queryPreview: query.substring(0, 200) + '...',
    variables: JSON.stringify(variables, null, 2)
  });

  try {
    const requestBody = JSON.stringify({ query, variables });
    console.log('[GraphQL Request Body]', {
      bodyLength: requestBody.length,
      body: requestBody.substring(0, 500) + '...'
    });

    const response = await fetch(`${API_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // LOG: Response status
    console.log('[GraphQL Response]', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[GraphQL Error Response]', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const json: GraphQLResponse<T> = await response.json();

    if (json.errors && json.errors.length > 0) {
      const errorMessage = json.errors.map((e) => e.message).join(", ");
      console.error('[GraphQL Errors]', json.errors);
      throw new Error(`GraphQL error: ${errorMessage}`);
    }

    if (!json.data) {
      console.error('[GraphQL No Data]', json);
      throw new Error("No data returned from GraphQL query");
    }

    console.log('[GraphQL Success]', {
      dataKeys: Object.keys(json.data || {})
    });

    return json.data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[GraphQL Timeout]');
      throw new Error("GraphQL request timed out after 10 seconds");
    }
    console.error('[GraphQL Request Failed]', error);
    throw error;
  }
}

/**
 * Compute player statistics from raw data
 * This is where all the computation happens
 */
function computePlayerStats(
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
  } catch (error) {
    console.error(`Failed to normalize address ${address}:`, error);
    return { totalPoints: 0, totalCompleted: 0, totalAchievements: 0, gameStats: {} };
  }

  // Process each project's progressions
  for (const item of progressionsData.playerAchievements.items) {
    const project = item.meta.project;

    // Get player's progressions for this project
    const playerProgressions = item.achievements.filter((p: RawProgression) => {
      try {
        return normalizeAddress(p.playerId) === normalizedTargetAddress;
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

// =============================================================================
// META TAG GENERATION
// =============================================================================

/**
 * Build meta tags HTML string
 */
function buildMetaTags(title: string, description: string, imageUrl: string, pageUrl: string): string {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImageUrl = escapeHtml(imageUrl);
  const safePageUrl = escapeHtml(pageUrl);

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
 * Generate meta tags based on route
 * All computation happens here, only final values sent to OG image service
 */
async function generateMetaTags(url: string): Promise<string> {
  const urlParts = url.split("/").filter(Boolean);

  let title = "Cartridge Arcade";
  let description = "Discover, Play and Compete in Onchain Games";
  let imageUrl = "https://play.cartridge.gg/preview.png";
  const pageUrl = `https://play.cartridge.gg${url}`;

  try {
    // Profile page: /player/:username
    if (urlParts[0] === "player" && urlParts[1]) {
      const usernameOrAddress = urlParts[1];

      // Validate format
      const isAddress = usernameOrAddress.match(/^0x[0-9a-fA-F]+$/);
      if (isAddress) {
        if (!isValidAddress(usernameOrAddress)) {
          title = "Invalid Address - Cartridge Arcade";
          description = "The requested address format is invalid";
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
      } else {
        if (!isValidUsername(usernameOrAddress)) {
          title = "Invalid Username - Cartridge Arcade";
          description = "The requested username contains invalid characters";
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
      }

      // Resolve username to address
      let address: string;
      if (isAddress) {
        address = usernameOrAddress;
      } else {
        const data = await graphqlRequest<any>(ADDRESS_BY_USERNAME_QUERY, {
          username: usernameOrAddress.toLowerCase(),
        });

        const resolvedAddress = data.account?.controllers?.edges?.[0]?.node?.address;
        if (!resolvedAddress) {
          title = `${usernameOrAddress} | Cartridge Arcade`;
          description = "Player not found";
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
        address = resolvedAddress;
      }

      // Fetch real player data from GraphQL API (only progressions for points)
      const query = buildProgressionsQuery(ACTIVE_PROJECTS);
      const progressionsData = await graphqlRequest<any>(query);

      // Compute player statistics
      const stats = computePlayerStats(address, progressionsData, null);

      title = `${usernameOrAddress} | Cartridge Arcade`;
      description = `${stats.totalPoints} points`;

      // Use static preview image (OG image generation moved to separate service)
      imageUrl = 'https://play.cartridge.gg/preview.png';
    }
    // Game-specific player page: /game/:gameId/player/:username
    else if (urlParts[0] === "game" && urlParts[1] && urlParts[2] === "player" && urlParts[3]) {
      const gameId = urlParts[1];
      const usernameOrAddress = urlParts[3];

      // Validate format
      const isAddress = usernameOrAddress.match(/^0x[0-9a-fA-F]+$/);
      if (isAddress) {
        if (!isValidAddress(usernameOrAddress)) {
          title = `Invalid Address in ${gameId} - Cartridge Arcade`;
          description = "The requested address format is invalid";
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
      } else {
        if (!isValidUsername(usernameOrAddress)) {
          title = `Invalid Username in ${gameId} - Cartridge Arcade`;
          description = "The requested username contains invalid characters";
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
      }

      // Resolve username to address
      let address: string;
      if (isAddress) {
        address = usernameOrAddress;
      } else {
        const data = await graphqlRequest<any>(ADDRESS_BY_USERNAME_QUERY, {
          username: usernameOrAddress.toLowerCase(),
        });

        const resolvedAddress = data.account?.controllers?.edges?.[0]?.node?.address;
        if (!resolvedAddress) {
          title = `${usernameOrAddress} in ${gameId} | Cartridge Arcade`;
          description = "Player not found";
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
        address = resolvedAddress;
      }

      // Find the specific game project
      const gameProject = ACTIVE_PROJECTS.find(p => p.project === gameId);

      if (!gameProject) {
        // Game not found, use placeholder
        title = `${usernameOrAddress} in ${gameId} | Cartridge Arcade`;
        description = `View ${usernameOrAddress}'s stats in ${gameId}`;

        // Use static preview image (OG image generation moved to separate service)
        imageUrl = 'https://play.cartridge.gg/preview.png';
      } else {
        // Fetch real player data for this specific game only (only progressions for points)
        const query = buildProgressionsQuery([gameProject]);
        const progressionsData = await graphqlRequest<any>(query);

        // Compute player statistics
        const stats = computePlayerStats(address, progressionsData, null);

        // Get game-specific stats
        const gameStats = stats.gameStats[gameId] || { points: 0, completed: 0, total: 0 };

        title = `${usernameOrAddress} in ${gameId} | Cartridge Arcade`;
        description = `${gameStats.points} points in ${gameId}`;

        // Use static preview image (OG image generation moved to separate service)
        imageUrl = 'https://play.cartridge.gg/preview.png';
      }
    }
    // Game page: /game/:gameId
    else if (urlParts[0] === "game" && urlParts[1]) {
      const gameId = urlParts[1];
      title = `${gameId} - Cartridge Arcade`;
      description = `Play ${gameId} on Cartridge Arcade - Discover onchain gaming`;

      // Use static preview image (OG image generation moved to separate service)
      imageUrl = 'https://play.cartridge.gg/preview.png';
    }
  } catch (error) {
    console.error("Error generating meta tags:", error);
  }

  return buildMetaTags(title, description, imageUrl, pageUrl);
}

// =============================================================================
// HANDLER
// =============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const requestPath = (req.query.path as string) || req.url || "/";
    const metaTags = await generateMetaTags(requestPath);

    const safeRequestPath = escapeHtml(requestPath);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cartridge Arcade</title>
  ${metaTags}
  <meta http-equiv="refresh" content="0;url=${safeRequestPath}">
</head>
<body>
  <script>window.location.href = "${safeRequestPath}";</script>
  <noscript>
    <p>Redirecting to <a href="${safeRequestPath}">Cartridge Arcade</a>...</p>
  </noscript>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(html);
  } catch (error) {
    console.error("SSR handler error:", error);
    res.status(500).send("Internal Server Error");
  }
}
