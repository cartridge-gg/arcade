import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 3003;
const base = process.env.BASE || "/";

async function createServer() {
  const app = express();

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // Meta tag injection middleware - handle all routes with a catch-all pattern
  app.get(/.*/, async (req, res, next) => {
    const url = req.originalUrl.replace(base, "");

    try {
      // Read index.html template
      let template = fs.readFileSync(
        path.resolve(__dirname, "index.html"),
        "utf-8"
      );

      // Apply Vite HTML transforms
      template = await vite.transformIndexHtml(url, template);

      // Generate meta tags based on route
      const metaTags = await generateMetaTags(url);

      // Inject meta tags into template
      const responseHtml = template.replace(`<!--ssr-meta-tags-->`, metaTags);

      res.status(200).set({ "Content-Type": "text/html" }).end(responseHtml);
    } catch (e) {
      console.error("Error generating meta tags:", e);
      // Fallback to serving template without custom meta tags
      let template = fs.readFileSync(
        path.resolve(__dirname, "index.html"),
        "utf-8"
      );
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    }
  });

  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
  });
}

/**
 * Generate dynamic meta tags based on the route
 */
async function generateMetaTags(url) {
  const API_URL = process.env.VITE_CARTRIDGE_API_URL || "https://api.cartridge.gg";

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
      // TODO: Fetch user data from API
      title = `${username} - Cartridge Arcade`;
      description = `View ${username}'s profile, achievements, and game stats on Cartridge Arcade`;
      imageUrl = `https://play.cartridge.gg/api/og/profile?username=${encodeURIComponent(username)}`;
    }
    // Game page: /game/:gameId
    else if (urlParts[0] === "game" && urlParts[1]) {
      const gameId = urlParts[1];
      // TODO: Fetch game data from API
      title = `${gameId} - Cartridge Arcade`;
      description = `Play ${gameId} on Cartridge Arcade - Discover onchain gaming`;
      imageUrl = `https://play.cartridge.gg/api/og/game?gameId=${encodeURIComponent(gameId)}`;
    }
    // TODO: Achievement page logic when we have the route structure
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

createServer();