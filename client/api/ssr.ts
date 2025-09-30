import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vercel Serverless Function for SSR with dynamic meta tags
 * This function serves the index.html with injected meta tags for social media crawlers
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get the requested path from query params
    const requestPath = (req.query.path as string) || req.url || "/";

    // Check if this is a crawler request
    const userAgent = req.headers["user-agent"] || "";
    const isCrawler = detectCrawler(userAgent);

    // For non-crawler requests, redirect to the SPA
    if (!isCrawler) {
      res.setHeader("Location", requestPath);
      res.status(302).end();
      return;
    }

    // Read the built index.html
    const indexPath = path.resolve(__dirname, "../dist/client/index.html");
    let template: string;

    try {
      template = fs.readFileSync(indexPath, "utf-8");
    } catch (error) {
      // Fallback for different potential paths
      const altPath = path.resolve(__dirname, "../../dist/client/index.html");
      template = fs.readFileSync(altPath, "utf-8");
    }

    // Generate meta tags based on route
    const metaTags = generateMetaTags(requestPath);

    // Inject meta tags
    const html = template.replace(`<!--ssr-meta-tags-->`, metaTags);

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).send(html);
  } catch (error) {
    console.error("SSR error:", error);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Detect if the request is from a social media crawler
 */
function detectCrawler(userAgent: string): boolean {
  const crawlers = [
    "facebookexternalhit",
    "facebookcatalog",
    "Twitterbot",
    "LinkedInBot",
    "Discordbot",
    "WhatsApp",
    "TelegramBot",
    "Slackbot",
    "redditbot",
  ];

  const lowerAgent = userAgent.toLowerCase();
  return crawlers.some((bot) => lowerAgent.includes(bot.toLowerCase()));
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