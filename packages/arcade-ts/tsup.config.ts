import { defineConfig } from "tsup";
import { join } from "path";

export default defineConfig(() => ({
  entry: ["src/index.ts"],
  sourcemap: true,
  clean: true,
  format: ["cjs", "esm"],
  globalName: "starknet",
  noExternal: ["@cartridge/models"],
  esbuildOptions(options, context) {
    // 🔥 forcer la résolution sur le code source local
    options.alias = {
      "@cartridge/models": join(__dirname, "../models/src/index.ts"),
    };

    if (context.format === "iife") {
      options.platform = "browser";
      options.external = [...(options.external || []), "node:*", "*.wasm"];
    }
  },
}));
