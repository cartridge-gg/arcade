import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-links",
    "@storybook/addon-interactions",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  staticDirs: ["../public"],
  viteFinal: async (config) => {
    const filteredPlugins = (config.plugins || []).filter((plugin) => {
      if (!plugin) return false;
      const pluginName = Array.isArray(plugin) ? undefined : (plugin as { name?: string }).name;
      return pluginName !== "vite-plugin-pwa:build" && pluginName !== "vite-plugin-pwa:dev";
    });

    return mergeConfig(
      { ...config, plugins: filteredPlugins },
      {
        resolve: {
          alias: {
            "@": resolve(__dirname, "../src"),
          },
        },
        optimizeDeps: {
          include: ["@cartridge/ui"],
          exclude: ["@dojoengine/torii-wasm"],
        },
        define: {
          __COMMIT_SHA__: JSON.stringify("storybook"),
        },
      }
    );
  },
  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
};

export default config;
