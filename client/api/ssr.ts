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

const PROGRESSIONS_QUERY = `
  query Progressions($projects: [Project!]!, $playerId: String) {
    playerAchievements(projects: $projects, playerId: $playerId) {
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

const ACHIEVEMENTS_QUERY = `
  query Achievements($projects: [Project!]!) {
    achievements(projects: $projects) {
      items {
        meta {
          project
          model
          namespace
          count
        }
        achievements {
          id
          hidden
          page
          points
          start
          end
          achievementGroup
          icon
          title
          description
          taskId
          taskTotal
          taskDescription
          data
        }
      }
    }
  }
`;

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

  try {
    const response = await fetch(`${API_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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
 * Compute player statistics from raw data
 * This is where all the computation happens
 */
function computePlayerStats(
  address: string,
  progressionsData: any,
  achievementsData: any
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

  // Create map of achievements by project
  const achievementsByProject = new Map<string, RawAchievement[]>();
  for (const item of achievementsData.achievements.items) {
    achievementsByProject.set(item.meta.project, item.achievements);
  }

  // Process each project's progressions
  for (const item of progressionsData.playerAchievements.items) {
    const project = item.meta.project;
    const projectAchievements = achievementsByProject.get(project) || [];
    const visibleAchievements = projectAchievements.filter((a: RawAchievement) => !a.hidden);

    // Get player's progressions for this project
    const playerProgressions = item.achievements.filter((p: RawProgression) => {
      try {
        return normalizeAddress(p.playerId) === normalizedTargetAddress;
      } catch {
        return false;
      }
    });

    // Calculate points and completion
    const projectPoints = playerProgressions.reduce((sum: number, p: RawProgression) => sum + p.points, 0);

    // Count completed achievements
    const completedAchievements = new Set<string>();
    playerProgressions.forEach((p: RawProgression) => {
      if (p.total >= p.taskTotal) {
        completedAchievements.add(p.achievementId);
      }
    });

    const completedCount = completedAchievements.size;

    // Store per-game stats
    gameStats[project] = {
      points: projectPoints,
      completed: completedCount,
      total: visibleAchievements.length,
    };

    totalPoints += projectPoints;
    totalCompleted += completedCount;
    totalAchievements += visibleAchievements.length;
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

      // Fetch player data (with playerId filter for efficiency)
      const projects = ACTIVE_PROJECTS;
      const [progressionsData, achievementsData] = await Promise.all([
        graphqlRequest<any>(PROGRESSIONS_QUERY, { projects, playerId: address }),
        graphqlRequest<any>(ACHIEVEMENTS_QUERY, { projects }),
      ]);

      // Compute stats (ALL COMPUTATION HAPPENS HERE)
      const stats = computePlayerStats(address, progressionsData, achievementsData);

      // Generate meta tags with computed values
      title = `${usernameOrAddress} | Cartridge Arcade`;
      description = `${stats.totalPoints.toLocaleString()} Points • ${stats.totalCompleted}/${stats.totalAchievements} Achievements`;

      // Generate OG image URL using local API
      const ogParams = new URLSearchParams({
        type: 'profile',
        username: usernameOrAddress,
        points: stats.totalPoints.toString(),
        achievements: `${stats.totalCompleted}/${stats.totalAchievements}`,
      });
      imageUrl = `https://play.cartridge.gg/api/og?${ogParams.toString()}`;
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

      // Fetch player data
      const projects = ACTIVE_PROJECTS;
      const [progressionsData, achievementsData] = await Promise.all([
        graphqlRequest<any>(PROGRESSIONS_QUERY, { projects, playerId: address }),
        graphqlRequest<any>(ACHIEVEMENTS_QUERY, { projects }),
      ]);

      // Compute stats (ALL COMPUTATION HAPPENS HERE)
      const stats = computePlayerStats(address, progressionsData, achievementsData);

      // Extract game-specific stats
      const gameStats = stats.gameStats[gameId];

      if (gameStats) {
        title = `${usernameOrAddress} in ${gameId} | Cartridge Arcade`;
        description = `${gameStats.points.toLocaleString()} Points • ${gameStats.completed}/${gameStats.total} Achievements in ${gameId}`;

        // Generate OG image URL using local API
        const ogParams = new URLSearchParams({
          type: 'game-profile',
          username: usernameOrAddress,
          game: gameId,
          points: gameStats.points.toString(),
          achievements: `${gameStats.completed}/${gameStats.total}`,
        });
        imageUrl = `https://play.cartridge.gg/api/og?${ogParams.toString()}`;
      } else {
        title = `${usernameOrAddress} in ${gameId} | Cartridge Arcade`;
        description = `View ${usernameOrAddress}'s stats in ${gameId}`;
      }
    }
    // Game page: /game/:gameId
    else if (urlParts[0] === "game" && urlParts[1]) {
      const gameId = urlParts[1];
      title = `${gameId} - Cartridge Arcade`;
      description = `Play ${gameId} on Cartridge Arcade - Discover onchain gaming`;

      // Generate OG image URL using local API
      const ogParams = new URLSearchParams({
        type: 'game',
        game: gameId,
      });
      imageUrl = `https://play.cartridge.gg/api/og?${ogParams.toString()}`;
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
