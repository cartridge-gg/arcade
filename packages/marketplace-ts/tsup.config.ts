import { defineConfig, Options } from "tsup";
import { tsupConfig } from "../config/tsup.web.config.ts";

export default defineConfig({
	...tsupConfig,
	outDir: "dist",
	entry: {
		index: "src/index.ts",
	},
});
