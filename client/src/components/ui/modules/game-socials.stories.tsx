import type { Meta, StoryObj } from "@storybook/react-vite";
import GameSocials from "./game-socials";

const meta = {
  title: "Modules/GameSocials",
  component: GameSocials,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GameSocials>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllSocials: Story = {
  args: {
    socials: {
      twitter: "https://twitter.com/example",
      discord: "https://discord.gg/example",
      telegram: "https://t.me/example",
      github: "https://github.com/example",
    },
  },
};

export const TwitterOnly: Story = {
  args: {
    socials: {
      twitter: "https://twitter.com/example",
    },
  },
};

export const DiscordOnly: Story = {
  args: {
    socials: {
      discord: "https://discord.gg/example",
    },
  },
};

export const TwoSocials: Story = {
  args: {
    socials: {
      twitter: "https://twitter.com/example",
      discord: "https://discord.gg/example",
    },
  },
};

export const ThreeSocials: Story = {
  args: {
    socials: {
      twitter: "https://twitter.com/example",
      discord: "https://discord.gg/example",
      github: "https://github.com/example",
    },
  },
};

export const NoSocials: Story = {
  args: {
    socials: {},
  },
};
