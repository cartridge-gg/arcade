#!/usr/bin/env node

/**
 * Post-build script to add SSR route rewrites to Vercel output config
 *
 * The vite-plugin-vercel generates .vercel/output/config.json but doesn't
 * include the rewrites from vercel.json. This script adds them automatically.
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../.vercel/output/config.json');

// Routes to add
const ssrRoutes = [
  {
    src: "^/player/([^/]+)/tab/([^/]+)$",
    dest: "/api/ssr?path=/player/$1/tab/$2",
    check: true
  },
  {
    src: "^/player/([^/]+)$",
    dest: "/api/ssr?path=/player/$1",
    check: true
  },
  {
    src: "^/game/([^/]+)/player/([^/]+)$",
    dest: "/api/ssr?path=/game/$1/player/$2",
    check: true
  },
  {
    src: "^/game/([^/]+)$",
    dest: "/api/ssr?path=/game/$1",
    check: true
  }
];

try {
  // Read existing config
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Find the index of the /api/ssr route
  const ssrRouteIndex = config.routes.findIndex(r => r.src === "^/api/ssr$");

  if (ssrRouteIndex === -1) {
    console.error('❌ Could not find /api/ssr route in config.json');
    process.exit(1);
  }

  // Check if routes already exist
  const hasPlayerRoute = config.routes.some(r => r.src === "^/player/([^/]+)$");

  if (hasPlayerRoute) {
    console.log('✅ SSR routes already exist in config.json');
    process.exit(0);
  }

  // Insert SSR routes after the /api/ssr route
  config.routes.splice(ssrRouteIndex + 1, 0, ...ssrRoutes);

  // Write back to file
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log('✅ Added SSR route rewrites to .vercel/output/config.json');
  console.log(`   Added ${ssrRoutes.length} routes for player/game pages`);

} catch (error) {
  console.error('❌ Error updating config.json:', error.message);
  process.exit(1);
}
