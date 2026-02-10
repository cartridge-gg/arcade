import type { Meta, StoryObj } from "@storybook/react-vite";
import GameSocial, {
  GameSocialDiscord,
  GameSocialTwitter,
  GameSocialGithub,
  GameSocialTelegram,
} from "./game-social";
import { DiscordIcon } from "@cartridge/ui";

const meta = {
  title: "Modules/GameSocial",
  component: GameSocial,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GameSocial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <DiscordIcon size="sm" />,
    href: "https://discord.gg/example",
    label: "Discord",
  },
};

export const WithoutLabel: Story = {
  args: {
    icon: <DiscordIcon size="sm" />,
    href: "https://discord.gg/example",
  },
};

export const DarkVariant: Story = {
  args: {
    icon: <DiscordIcon size="sm" />,
    href: "https://discord.gg/example",
    label: "Discord",
    variant: "dark",
  },
};

export const Discord: Story = {
  render: () => (
    <GameSocialDiscord
      discord="https://discord.gg/example"
      label
      variant="default"
    />
  ),
};

export const Twitter: Story = {
  render: () => (
    <GameSocialTwitter
      twitter="https://twitter.com/example"
      label
      variant="default"
    />
  ),
};

export const Github: Story = {
  render: () => (
    <GameSocialGithub
      github="https://github.com/example"
      label
      variant="default"
    />
  ),
};

export const Telegram: Story = {
  render: () => (
    <GameSocialTelegram
      telegram="https://t.me/example"
      label
      variant="default"
    />
  ),
};

export const AllSocials: Story = {
  render: () => (
    <div className="flex flex-col gap-px">
      <GameSocialTwitter
        twitter="https://twitter.com/arcade"
        label
        variant="default"
      />
      <GameSocialDiscord
        discord="https://discord.gg/arcade"
        label
        variant="default"
      />
      <GameSocialTelegram
        telegram="https://t.me/arcade"
        label
        variant="default"
      />
      <GameSocialGithub
        github="https://github.com/arcade"
        label
        variant="default"
      />
    </div>
  ),
};
