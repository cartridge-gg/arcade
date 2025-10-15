import { defineConfig } from "tsup";

export default defineConfig(() => ({
  entry: [
    "src/index.ts",
    "src/marketplace/index.ts",
    "src/marketplace/react.tsx",
  ],
  sourcemap: true,
  clean: true,
  format: ["cjs", "esm"],
  globalName: "arcade",
  external: ["react", "react/jsx-runtime"],
  esbuildOptions(options, context) {
    if (context.format === "iife") {
      options.platform = "browser";
      const externals = new Set([...(options.external || [])]);
      externals.add("react");
      externals.add("react/jsx-runtime");
      externals.add("node:*");
      externals.add("*.wasm");
      options.external = Array.from(externals);
    }
  },
}));
