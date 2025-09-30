import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import compression from "compression";
import sirv from "sirv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3003;
const base = process.env.BASE || "/";

// Production server
async function createServer() {
  const app = express();

  // Enable compression
  app.use(compression());

  // Serve static assets from dist/client
  app.use(
    base,
    sirv(path.resolve(__dirname, "dist/client"), {
      extensions: [],
      gzip: true,
      brotli: true,
    })
  );

  // Serve index.html with dynamic meta tags for all routes
  app.get("*", async (req, res) => {
    try {
      const url = req.originalUrl.replace(base, "");

      // Read the built index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, "dist/client/index.html"),
        "utf-8"
      );

      // Generate meta tags based on route
      const metaTags = await generateMetaTags(url);

      // Inject meta tags
      const html = template.replace(`<!--ssr-meta-tags-->`, metaTags);

      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (e) {
      console.error("Error serving page:", e);
      res.status(500).end(e.message);
    }
  });

  app.listen(port, () => {
    console.log(`Production server started at http://localhost:${port}`);
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