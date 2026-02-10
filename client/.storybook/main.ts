// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-docs")
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
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
  }
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
