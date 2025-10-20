import { defineConfig } from "vitest/config";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  test: {
    environment: "node",
    globals: true,
    coverage: {
      reporter: ["text", "json", "html"],
      provider: "v8",
    },
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["dist", "www", "src/marketplace/react.test.tsx"],
  },
});
