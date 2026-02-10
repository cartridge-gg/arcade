import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  createRootRoute,
} from "@tanstack/react-router";
import { LeaderboardRow } from "./leaderboard-row";

const createStoryRouter = (StoryComponent: ComponentType) => {
  const rootRoute = createRootRoute({
    component: () => (
      <div className="w-[500px]">
        <StoryComponent />
      </div>
    ),
  });
  return createRouter({
    routeTree: rootRoute.addChildren([]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
};

const meta = {
  title: "Modules/LeaderboardRow",
  component: LeaderboardRow,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const router = createStoryRouter(Story);
      return <RouterProvider router={router} />;
    },
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
