import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  serverGraphQL,
  ADDRESS_BY_USERNAME_QUERY,
  PROGRESSIONS_QUERY,
  ACHIEVEMENTS_QUERY,
} from "./lib/graphql";
import { computePlayerStats, formatStatsForOGImage } from "./lib/player-stats";
import type {
  ProgressionsResponse,
  AchievementsResponse,
} from "./lib/player-stats";
import { getProjects } from "./lib/projects";

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
 * Returns true if valid, false otherwise
 */
function isValidUsername(username: string): boolean {
  if (!username || username.length === 0 || username.length > 100) {
    return false;
  }

  // Check for suspicious characters that could be XSS attempts
  if (username.includes('<') || username.includes('>') || username.includes('"') || username.includes("'")) {
    return false;
  }

  return true;
}

/**
 * Validate Starknet address format
 * Supports both 0x-prefixed and non-prefixed hex strings
 */
function isValidAddress(address: string): boolean {
  if (!address) return false;

  // Remove 0x prefix if present
  const cleaned = address.replace(/^0x/, '');

  // Should be hex string (1-64 characters)
  return /^[0-9a-fA-F]{1,64}$/.test(cleaned);
}

/**
 * Vercel Serverless Function for dynamic meta tags with real player data
 *
 * This function fetches player data from the GraphQL API and generates
 * dynamic Open Graph meta tags for social sharing.
 *
 * Flow:
 * 1. Parse route (e.g., /player/username)
 * 2. Resolve username → address (if needed)
 * 3. Fetch player achievements data
 * 4. Compute stats (points, rank, achievements)
 * 5. Generate meta tags with real data
 * 6. Return HTML that redirects to SPA
 *
 * Why redirect instead of SSR the full app?
 * - Simpler: Just need meta tags for crawlers
 * - Faster: No need to bundle entire React app for SSR
 * - Reliable: Crawlers see meta tags, users get fast SPA
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get the requested path from query params or URL
    const requestPath = (req.query.path as string) || req.url || "/";

    // Generate meta tags based on route (with real data)
    const metaTags = await generateMetaTags(requestPath);

    // Create minimal HTML with meta tags and redirect
    // Social crawlers parse meta tags but don't execute JS
    // Regular browsers will redirect instantly via JS
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
    console.error("SSR error:", error);

    // Fallback to static meta tags on error
    const requestPath = (req.query.path as string) || req.url || "/";
    const fallbackHtml = generateFallbackHTML(requestPath);

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).send(fallbackHtml);
  }
}

/**
 * Generate dynamic meta tags based on the route
 * Now with real player data from GraphQL!
 */
async function generateMetaTags(url: string): Promise<string> {
  // Parse the URL to determine the route type
  const urlParts = url.split("/").filter(Boolean);

  // Default meta tags
  let title = "Cartridge Arcade";
  let description = "Discover, Play and Compete in Onchain Games";
  let imageUrl = "https://play.cartridge.gg/preview.png";
  const pageUrl = `https://play.cartridge.gg${url}`;

  try {
    // Profile page: /player/:username
    if (urlParts[0] === "player" && urlParts[1]) {
      const usernameOrAddress = urlParts[1];

      // Validate username/address format
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

      // Resolve username to address if needed
      let address: string;
      if (isAddress) {
        // Already an address
        address = usernameOrAddress;
      } else {
        // Query GraphQL to resolve username
        const data = await serverGraphQL<{
          account?: {
            controllers?: {
              edges?: Array<{ node?: { address: string } }>;
            };
          };
        }>(ADDRESS_BY_USERNAME_QUERY, {
          username: usernameOrAddress.toLowerCase(),
        });

        const resolvedAddress =
          data.account?.controllers?.edges?.[0]?.node?.address;
        if (!resolvedAddress) {
          // Player not found, use static meta tags
          title = `${usernameOrAddress} - Cartridge Arcade`;
          description = `View ${usernameOrAddress}'s profile on Cartridge Arcade`;
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
        address = resolvedAddress;
      }

      // Fetch player data from GraphQL
      const projects = getProjects();

      // Note: Once backend supports playerId filter, this will be much faster
      // For now, it still works but fetches more data than needed
      const [progressionsData, achievementsData] = await Promise.all([
        serverGraphQL<ProgressionsResponse>(PROGRESSIONS_QUERY, {
          projects,
          playerId: address, // This will be used when backend is updated
        }),
        serverGraphQL<AchievementsResponse>(ACHIEVEMENTS_QUERY, {
          projects,
        }),
      ]);

      // Compute player stats
      const stats = computePlayerStats(
        address,
        usernameOrAddress,
        progressionsData,
        achievementsData
      );

      // Generate rich meta tags with real data
      title = `${usernameOrAddress} | Cartridge Arcade`;
      description = `${stats.totalPoints.toLocaleString()} Points • ${stats.totalCompleted}/${stats.totalAchievements} Achievements`;

      // Generate OG image URL with player stats
      const ogParams = formatStatsForOGImage(stats);
      imageUrl = `https://api.cartridge.gg/og/profile?${ogParams}`;

      // Add rank if available
      if (stats.rank) {
        description = `Rank #${stats.rank} • ${description}`;
      }
    }
    // Game-specific player page: /game/:gameId/player/:username
    else if (urlParts[0] === "game" && urlParts[1] && urlParts[2] === "player" && urlParts[3]) {
      const gameId = urlParts[1];
      const usernameOrAddress = urlParts[3];

      // Validate username/address format
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

      // Resolve username to address if needed
      let address: string;
      if (isAddress) {
        address = usernameOrAddress;
      } else {
        const data = await serverGraphQL<{
          account?: {
            controllers?: {
              edges?: Array<{ node?: { address: string } }>;
            };
          };
        }>(ADDRESS_BY_USERNAME_QUERY, {
          username: usernameOrAddress.toLowerCase(),
        });

        const resolvedAddress =
          data.account?.controllers?.edges?.[0]?.node?.address;
        if (!resolvedAddress) {
          title = `${usernameOrAddress} in ${gameId} - Cartridge Arcade`;
          description = `View ${usernameOrAddress}'s stats in ${gameId}`;
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
        address = resolvedAddress;
      }

      // Fetch player data from GraphQL
      const projects = getProjects();

      const [progressionsData, achievementsData] = await Promise.all([
        serverGraphQL<ProgressionsResponse>(PROGRESSIONS_QUERY, {
          projects,
          playerId: address,
        }),
        serverGraphQL<AchievementsResponse>(ACHIEVEMENTS_QUERY, {
          projects,
        }),
      ]);

      // Compute player stats
      const stats = computePlayerStats(
        address,
        usernameOrAddress,
        progressionsData,
        achievementsData
      );

      // Extract game-specific stats
      const gameStats = stats.gameStats[gameId];

      if (gameStats) {
        // Generate meta tags with game-specific data
        title = `${usernameOrAddress} in ${gameId} | Cartridge Arcade`;
        description = `${gameStats.points.toLocaleString()} Points • ${gameStats.completed}/${gameStats.total} Achievements in ${gameId}`;

        // Generate OG image URL with game-specific stats
        const ogParams = new URLSearchParams({
          username: usernameOrAddress,
          game: gameId,
          points: gameStats.points.toString(),
          achievements: `${gameStats.completed}/${gameStats.total}`,
        });
        imageUrl = `https://api.cartridge.gg/og/game-profile?${ogParams.toString()}`;
      } else {
        // Game not found or player hasn't played this game
        title = `${usernameOrAddress} in ${gameId} | Cartridge Arcade`;
        description = `View ${usernameOrAddress}'s stats in ${gameId}`;
      }
    }
    // Game page: /game/:gameId
    else if (urlParts[0] === "game" && urlParts[1]) {
      const gameId = urlParts[1];
      title = `${gameId} - Cartridge Arcade`;
      description = `Play ${gameId} on Cartridge Arcade - Discover onchain gaming`;
      imageUrl = `https://api.cartridge.gg/og/game/${gameId}`;
    }
  } catch (error) {
    console.error("Error generating meta tags:", error);
    // Fall through to return default meta tags
  }

  return buildMetaTags(title, description, imageUrl, pageUrl);
}

/**
 * Build meta tags HTML string
 * All user-controlled content is HTML-escaped to prevent XSS
 */
function buildMetaTags(
  title: string,
  description: string,
  imageUrl: string,
  pageUrl: string
): string {
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
 * Generate fallback HTML with basic meta tags when data fetching fails
 */
function generateFallbackHTML(requestPath: string): string {
  const urlParts = requestPath.split("/").filter(Boolean);

  let title = "Cartridge Arcade";
  let description = "Discover, Play and Compete in Onchain Games";
  const imageUrl = "https://play.cartridge.gg/preview.png";
  const pageUrl = `https://play.cartridge.gg${requestPath}`;

  if (urlParts[0] === "player" && urlParts[1]) {
    const username = urlParts[1];
    title = `${username} - Cartridge Arcade`;
    description = `View ${username}'s profile on Cartridge Arcade`;
  } else if (urlParts[0] === "game" && urlParts[1]) {
    const gameId = urlParts[1];
    title = `${gameId} - Cartridge Arcade`;
    description = `Play ${gameId} on Cartridge Arcade`;
  }

  const metaTags = buildMetaTags(title, description, imageUrl, pageUrl);
  const safeRequestPath = escapeHtml(requestPath);
  const safeTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
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
}
