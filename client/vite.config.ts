import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import react from "@vitejs/plugin-react-swc";
import topLevelAwait from "vite-plugin-top-level-await";
import process from "node:process";
import mkcert from "vite-plugin-mkcert";
import { VitePWA } from "vite-plugin-pwa";
import vercel from "vite-plugin-vercel";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const resolveFromRoot = (path: string) =>
  resolve(fileURLToPath(new URL(".", import.meta.url)), path);

const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA || "dev";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    wasm(),
    topLevelAwait(),
    mkcert(),
    vercel(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "favicon.ico", "robots.txt"],
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        mode: "development",
        additionalManifestEntries: [
          { url: "/__version__", revision: COMMIT_SHA },
        ],
      },
      manifest: {
        name: "Arcade",
        short_name: "Arcade",
        description:
          "Arcade is a gaming platform to browse through games and players.",
        theme_color: "#FBCB4A",
        background_color: "#161A17",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  define: {
    __COMMIT_SHA__: JSON.stringify(COMMIT_SHA),
  },
  server: {
    port: process.env.NODE_ENV === "development" ? 3003 : undefined,
  },
  resolve: {
    alias: {
      "@": resolveFromRoot("src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: "./",
  build: {
    outDir: "dist",
    // Ref: https://github.com/vitejs/vite/issues/15012#issuecomment-1948550039
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === "SOURCEMAP_ERROR") {
          return;
        }

        defaultHandler(warning);
      },
    },
  },
  publicDir: "public",
  // SSR Configuration
  ssr: {
    noExternal: [
      "@cartridge/arcade",
      "@cartridge/connector",
      "@cartridge/controller",
      "@cartridge/penpal",
      "@cartridge/presets",
      "@dojoengine/sdk",
      "@dojoengine/torii-wasm",
      "@starknet-react/chains",
      "@starknet-react/core",
    ],
    external: ["@cartridge/ui", "posthog-js"],
  },
});
