import { defineConfig } from "vitest/config";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  test: {
    environment: "edge-runtime",
    globals: true,
    include: ["test/edge-runtime.smoke.test.ts"],
    exclude: ["dist", "www"],
  },
});
