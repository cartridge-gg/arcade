import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";

import "./storybook.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#161A17" },
        { name: "light", value: "#ffffff" },
      ],
    },
    layout: "centered",
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "dark",
    }),
  ],
  tags: ["autodocs"],
};

export default preview;
