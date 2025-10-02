import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Vercel Serverless Function for dynamic meta tags
 *
 * This function serves a minimal HTML page with dynamically generated meta tags
 * for all requests to /player/* and /game/* routes.
 *
 * Why always serve meta tags instead of only for crawlers?
 * - Simpler code - no crawler detection needed
 * - 100% reliable - works for all bots, preview tools, and SEO
 * - Future-proof - no need to maintain crawler list
 * - Negligible performance impact - JavaScript redirect is ~10ms
 *
 * Why inline HTML instead of reading from disk?
 * - Vercel serverless functions are isolated from static assets
 * - Static files (dist/client/) are deployed to CDN separately
 * - This approach is simpler, faster, and more reliable
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get the requested path from query params or URL
    const requestPath = (req.query.path as string) || req.url || "/";

    // Generate meta tags based on route
    const metaTags = generateMetaTags(requestPath);

    // Create minimal HTML with meta tags and redirect
    // Social crawlers parse meta tags but don't execute JS
    // Regular browsers will redirect instantly via JS
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cartridge Arcade</title>
  ${metaTags}
  <meta http-equiv="refresh" content="0;url=${requestPath}">
</head>
<body>
  <script>window.location.href = "${requestPath}";</script>
  <noscript>
    <p>Redirecting to <a href="${requestPath}">Cartridge Arcade</a>...</p>
  </noscript>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).send(html);
  } catch (error) {
    console.error("SSR error:", error);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Generate dynamic meta tags based on the route
 */
function generateMetaTags(url: string): string {
  // Parse the URL to determine the route type
  const urlParts = url.split("/").filter(Boolean);

  // Default meta tags
  let title = "Cartridge Arcade";
  let description = "Discover, Play and Compete in Onchain Games";
  let imageUrl = "https://play.cartridge.gg/preview.png";
  let pageUrl = `https://play.cartridge.gg${url}`;

  try {
    // Profile page: /player/:username
    if (urlParts[0] === "player" && urlParts[1]) {
      const username = urlParts[1];
      title = `${username} - Cartridge Arcade`;
      description = `View ${username}'s profile, achievements, and game stats on Cartridge Arcade`;
      imageUrl = `https://api.cartridge.gg/og/profile?username=${encodeURIComponent(username)}`;
    }
    // Game page: /game/:gameId
    else if (urlParts[0] === "game" && urlParts[1]) {
      const gameId = urlParts[1];
      title = `${gameId} - Cartridge Arcade`;
      description = `Play ${gameId} on Cartridge Arcade - Discover onchain gaming`;
      imageUrl = `https://api.cartridge.gg/og/${gameId}`;
    }
  } catch (error) {
    console.error("Error generating meta tags:", error);
  }

  return `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:site_name" content="Cartridge Arcade" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@cartridge_gg" />
    <meta name="twitter:creator" content="@cartridge_gg" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
  `.trim();
}