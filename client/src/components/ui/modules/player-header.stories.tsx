import type { Meta, StoryObj } from "@storybook/react-vite";
import { AchievementPlayerHeader } from "./player-header";
import { Trophy } from "lucide-react";

const meta = {
  title: "Modules/AchievementPlayerHeader",
  component: AchievementPlayerHeader,
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
} satisfies Meta<typeof AchievementPlayerHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockAddress =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export const Default: Story = {
  args: {
    username: "player123",
    address: mockAddress,
    points: 1250,
    followerCount: 42,
    followingCount: 18,
  },
};

export const GoldRank: Story = {
  args: {
    username: "champion",
    address: mockAddress,
    points: 5000,
    followerCount: 1250,
    followingCount: 45,
    rank: "gold",
  },
};

export const WithFollowers: Story = {
  args: {
    username: "popular_player",
    address: mockAddress,
    points: 3500,
    followerCount: 500,
    followingCount: 120,
    followers: ["alice", "bob", "charlie", "dave"],
  },
};

export const IsFollower: Story = {
  args: {
    username: "following_user",
    address: mockAddress,
    points: 2800,
    followerCount: 150,
    followingCount: 80,
    follower: true,
  },
};

export const Compacted: Story = {
  args: {
    username: "player123",
    address: mockAddress,
    points: 1500,
    followerCount: 75,
    followingCount: 30,
    compacted: true,
  },
};

export const WithIcon: Story = {
  args: {
    username: "verified_player",
    address: mockAddress,
    points: 4200,
    followerCount: 890,
    followingCount: 45,
    icon: <Trophy className="w-6 h-6" />,
  },
};
