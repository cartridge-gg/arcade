import type { Meta, StoryObj } from "@storybook/react-vite";
import { AchievementPlayerLabel } from "./player-label";
import { Trophy } from "lucide-react";

const meta = {
  title: "Modules/AchievementPlayerLabel",
  component: AchievementPlayerLabel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AchievementPlayerLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockAddress =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export const Default: Story = {
  args: {
    username: "player123",
    address: mockAddress,
  },
};

export const GoldRank: Story = {
  args: {
    username: "champion",
    address: mockAddress,
    rank: "gold",
  },
};

export const SilverRank: Story = {
  args: {
    username: "runner_up",
    address: mockAddress,
    rank: "silver",
  },
};

export const BronzeRank: Story = {
  args: {
    username: "bronze_player",
    address: mockAddress,
    rank: "bronze",
  },
};

export const WithIcon: Story = {
  args: {
    username: "verified_player",
    address: mockAddress,
    icon: <Trophy className="w-6 h-6" />,
  },
};

export const AllRanks: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <AchievementPlayerLabel
        username="Gold Champion"
        address={mockAddress}
        rank="gold"
      />
      <AchievementPlayerLabel
        username="Silver Runner"
        address={mockAddress}
        rank="silver"
      />
      <AchievementPlayerLabel
        username="Bronze Player"
        address={mockAddress}
        rank="bronze"
      />
      <AchievementPlayerLabel username="Regular Player" address={mockAddress} />
    </div>
  ),
};
