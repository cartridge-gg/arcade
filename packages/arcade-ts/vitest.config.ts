import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      reporter: ["text", "json", "html"],
      provider: "v8",
    },
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "www"],
    deps: {
      optimizer: {
        web: {
          include: ["@dojoengine/torii-client"],
        },
      },
    },
  },
});
