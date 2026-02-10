import type { Preview } from "@storybook/react-vite";
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
      options: {
        dark: { name: "dark", value: "#161A17" },
        light: { name: "light", value: "#ffffff" }
      }
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

  initialGlobals: {
    backgrounds: {
      value: "dark"
    }
  }
};

export default preview;
