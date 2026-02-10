import type { Meta, StoryObj } from "@storybook/react-vite";
import { LeaderboardUsername } from "./leaderboard-username";

const meta = {
  title: "Modules/LeaderboardUsername",
  component: LeaderboardUsername,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LeaderboardUsername>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    username: "player123",
  },
};

export const Highlighted: Story = {
  args: {
    username: "champion",
    highlight: true,
  },
};

export const WithIcon: Story = {
  args: {
    username: "verified_player",
    icon: "fa-crown",
  },
};

export const LongUsername: Story = {
  args: {
    username: "very_long_username_that_should_truncate",
  },
};

export const Variations: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <LeaderboardUsername username="normal_player" />
      <LeaderboardUsername username="highlighted_player" highlight />
      <LeaderboardUsername username="with_icon" icon="fa-star" />
      <LeaderboardUsername username="another_very_long_username_here" />
    </div>
  ),
};
