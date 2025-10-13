import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ACTIVE_PROJECTS, GAME_CONFIGS } from "./constants";
import { graphqlRequest } from "./graphql";
import { ADDRESS_BY_USERNAME_QUERY, buildProgressionsQuery } from "./queries";
import {
  escapeHtml,
  isValidAddress,
  isValidUsername,
  computePlayerStats,
  buildMetaTags,
  getAvatarVariant,
} from "./utils";

/**
 * Vercel Serverless Function for dynamic meta tags with real player data
 *
 * This function fetches player data from the GraphQL API and generates
 * dynamic Open Graph meta tags for social sharing.
 *
 * All computation happens here - we only send final values to OG image service.
 */

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

      // Generate dynamic OG image URL
      const ogParams = new URLSearchParams({
        username: usernameOrAddress,
        points: stats.totalPoints.toString(),
        primaryColor: '#2C250C',
        avatarVariant: getAvatarVariant(usernameOrAddress),
      });
      imageUrl = `https://api.cartridge.gg/og/profile?${ogParams.toString()}`;
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
        const gameConfig = GAME_CONFIGS[gameId];
        const gameName = gameConfig?.name || gameId;

        title = `${usernameOrAddress} in ${gameName} | Cartridge Arcade`;
        description = `${gameStats.points} points in ${gameName}`;

        // Generate dynamic OG image URL for game-specific page
        const ogParams = new URLSearchParams({
          username: usernameOrAddress,
          points: gameStats.points.toString(),
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

        imageUrl = `https://api.cartridge.gg/og/profile?${ogParams.toString()}`;
      }
    }
    // Game page: /game/:gameId
    else if (urlParts[0] === "game" && urlParts[1]) {
      const gameId = urlParts[1];
      const gameConfig = GAME_CONFIGS[gameId];
      const gameName = gameConfig?.name || gameId;

      title = `${gameName} - Cartridge Arcade`;
      description = `Play ${gameName} on Cartridge Arcade - Discover onchain gaming`;

      // Generate dynamic OG image URL for game page

      if (gameConfig) {
        const ogParams = new URLSearchParams({
          game: gameId,
          primaryColor: gameConfig.color,
        });

        if (gameConfig.cover) {
          ogParams.set('gameImage', gameConfig.cover);
        }
        if (gameConfig.icon) {
          ogParams.set('gameIcon', gameConfig.icon);
        }

        imageUrl = `https://api.cartridge.gg/og/game?${ogParams.toString()}`;
      } else {
        // Fallback to static preview if game not found
        imageUrl = 'https://play.cartridge.gg/preview.png';
      }
    }
  } catch {
    // Silently fall back to default meta tags on error
  }

  return buildMetaTags(title, description, imageUrl, pageUrl);
}

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
  } catch {
    res.status(500).send("Internal Server Error");
  }
}
