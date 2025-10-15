const fs = require("node:fs");
const path = require("node:path");

const configPath = path.join(__dirname, "../.vercel/output/config.json");

// Read the existing config
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// Define SSR routes (excluding collection route)
const ssrRoutes = [
  {
    src: "^/player/([^/]+)/tab/([^/]+)$",
    dest: "/api/ssr?path=/player/$1/tab/$2",
    check: true,
  },
  {
    src: "^/player/([^/]+)$",
    dest: "/api/ssr?path=/player/$1",
    check: true,
  },
  {
    src: "^/game/([^/]+)/player/([^/]+)$",
    dest: "/api/ssr?path=/game/$1/player/$2",
    check: true,
  },
  {
    src: "^/game/([^/]+)$",
    dest: "/api/ssr?path=/game/$1",
    check: true,
  },
];

// Insert SSR routes before the filesystem route
const fsRouteIndex = config.routes.findIndex(
  (route) => route.src === "^/(?:(.+)/)?(.*)$"
);

if (fsRouteIndex !== -1) {
  config.routes.splice(fsRouteIndex, 0, ...ssrRoutes);
} else {
  // If filesystem route not found, append SSR routes
  config.routes.push(...ssrRoutes);
}

// Write back the modified config
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log("✓ Added SSR routes to Vercel config");
