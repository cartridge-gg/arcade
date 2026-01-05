import { defineConfig } from "vitest/config";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.integration.test.ts"],
    testTimeout: 60000,
    hookTimeout: 60000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    server: {
      deps: {
        inline: [
          "@dojoengine/torii-wasm",
          "@dojoengine/torii-client",
          "@dojoengine/sdk",
        ],
      },
    },
  },
});
