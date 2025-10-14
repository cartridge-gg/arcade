import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const resolveFromRoot = (path: string) => resolve(rootDir, path);

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      reporter: ["text", "json", "html"],
      provider: "v8",
    },
    include: [
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    exclude: ["node_modules", "dist", "www"],
    deps: {
      optimizer: {
        web: {
          include: ["@dojoengine/torii-client"],
        },
      },
    },
    setupFiles: [resolveFromRoot("tests/setup/test-setup.ts")],
  },
  resolve: {
    alias: {
      "@cartridge/ui/utils/api/cartridge": resolveFromRoot(
        "tests/mocks/cartridge-ui-api-cartridge.ts",
      ),
      "@cartridge/ui/utils/api/indexer": resolveFromRoot(
        "tests/mocks/cartridge-ui-api-indexer.ts",
      ),
      "@cartridge/ui/utils": resolveFromRoot(
        "tests/mocks/cartridge-ui-utils.ts",
      ),
      "@dojoengine/torii-wasm": resolveFromRoot("tests/mocks/torii-wasm.ts"),
      "@dojoengine/torii-wasm/pkg/web/dojo_c.js": resolveFromRoot(
        "tests/mocks/torii-wasm-pkg.ts",
      ),
      "@dojoengine/torii-wasm/pkg/web/dojo_c_bg.js": resolveFromRoot(
        "tests/mocks/torii-wasm-pkg.ts",
      ),
      "@dojoengine/torii-wasm/pkg/web/dojo_c_bg.wasm": resolveFromRoot(
        "tests/mocks/torii-wasm-pkg.ts",
      ),
      "@": resolveFromRoot("src"),
      "@cartridge/ui": resolveFromRoot("tests/mocks/cartridge-ui.ts"),
      "@cartridge/arcade": resolveFromRoot("tests/mocks/cartridge-arcade.ts"),
    },
  },
});
