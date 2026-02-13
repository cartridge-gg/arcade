import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActivityAchievementCard } from "./activity-achievement-card";

const mockImage = "https://static.cartridge.gg/presets/loot-survivor/icon.png";

const meta = {
  title: "Modules/ActivityAchievementCard",
  component: ActivityAchievementCard,
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
} satisfies Meta<typeof ActivityAchievementCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "First Blood",
    topic: "Defeated first enemy",
    points: 100,
    website: "loot-survivor.io",
    image: mockImage,
  },
};

export const WithColor: Story = {
  args: {
    title: "Master Explorer",
    topic: "Explored all areas",
    points: 500,
    website: "eternum.io",
    image: mockImage,
    color: "#fbcb4a",
  },
};

export const Certified: Story = {
  args: {
    title: "Verified Achievement",
    topic: "Completed verification",
    points: 250,
    website: "cartridge.gg",
    image: mockImage,
    certified: true,
  },
};

export const Loading: Story = {
  args: {
    title: "Loading Achievement",
    topic: "Loading...",
    points: 0,
    website: "cartridge.gg",
    image: mockImage,
    loading: true,
  },
};

export const ErrorState: Story = {
  args: {
    title: "Broken Achievement",
    topic: "Failed to load",
    points: 0,
    website: "cartridge.gg",
    image: mockImage,
    error: true,
  },
};

export const HighPoints: Story = {
  args: {
    title: "Legendary",
    topic: "Reached max level",
    points: 10000,
    website: "dark-shuffle.io",
    image: mockImage,
    color: "#ff6b00",
  },
};
