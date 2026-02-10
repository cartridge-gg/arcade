import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { LeaderboardRow } from "./leaderboard-row";

const meta = {
  title: "Modules/LeaderboardRow",
  component: LeaderboardRow,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-[500px]">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof LeaderboardRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    pins: [],
    rank: 4,
    name: "player123",
    points: 1250,
  },
};

export const FirstPlace: Story = {
  args: {
    pins: [],
    rank: 1,
    name: "champion",
    points: 5000,
  },
};

export const SecondPlace: Story = {
  args: {
    pins: [],
    rank: 2,
    name: "runner_up",
    points: 4500,
  },
};

export const ThirdPlace: Story = {
  args: {
    pins: [],
    rank: 3,
    name: "bronze_player",
    points: 4000,
  },
};

export const Highlighted: Story = {
  args: {
    pins: [],
    rank: 15,
    name: "current_user",
    points: 850,
    highlight: true,
  },
};

export const Following: Story = {
  args: {
    pins: [],
    rank: 5,
    name: "friend_player",
    points: 3200,
    following: true,
  },
};

export const NotFollowing: Story = {
  args: {
    pins: [],
    rank: 6,
    name: "other_player",
    points: 3100,
    following: false,
  },
};

export const Leaderboard: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-[500px] flex flex-col">
          <LeaderboardRow pins={[]} rank={1} name="champion" points={5000} />
          <LeaderboardRow pins={[]} rank={2} name="runner_up" points={4500} />
          <LeaderboardRow
            pins={[]}
            rank={3}
            name="bronze_player"
            points={4000}
          />
          <LeaderboardRow pins={[]} rank={4} name="player_4" points={3500} />
          <LeaderboardRow
            pins={[]}
            rank={5}
            name="player_5"
            points={3200}
            following={true}
          />
          <LeaderboardRow
            pins={[]}
            rank={15}
            name="current_user"
            points={850}
            highlight={true}
          />
        </div>
      </MemoryRouter>
    ),
  ],
  render: () => null,
};
