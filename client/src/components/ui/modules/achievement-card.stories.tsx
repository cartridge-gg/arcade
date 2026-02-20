import type { Meta, StoryObj } from "@storybook/react-vite";
import { AchievementCard } from "./achievement-card";

// Mock useAnalytics by providing a decorator that wraps PostHogProvider
// Since the component uses useAnalytics internally, we mock at the module level
const meta = {
  title: "Modules/AchievementCard",
  component: AchievementCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AchievementCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockAchievements = [
  {
    id: "ach-1",
    index: 0,
    completed: true,
    content: {
      title: "First Victory",
      description: "Win your first battle",
      icon: "fa-trophy",
      points: 100,
      completed: true,
      total: 1,
      count: 1,
      hidden: false,
    },
  },
  {
    id: "ach-2",
    index: 0,
    completed: false,
    content: {
      title: "Explorer",
      description: "Discover 10 hidden areas",
      icon: "fa-compass",
      points: 250,
      completed: false,
      total: 10,
      count: 3,
      hidden: false,
    },
  },
];

export const Default: Story = {
  args: {
    name: "Combat Achievements",
    achievements: mockAchievements,
  },
};

export const AllCompleted: Story = {
  args: {
    name: "Completed Group",
    achievements: mockAchievements.map((a) => ({
      ...a,
      completed: true,
      content: { ...a.content, completed: true, count: a.content.total },
    })),
  },
};

export const SingleAchievement: Story = {
  args: {
    name: "Solo Achievement",
    achievements: [mockAchievements[0]],
  },
};

export const MultiPage: Story = {
  args: {
    name: "Multi-Page Achievements",
    achievements: [
      ...mockAchievements,
      {
        id: "ach-3",
        index: 1,
        completed: false,
        content: {
          title: "Master Crafter",
          description: "Craft 50 items",
          icon: "fa-hammer",
          points: 500,
          completed: false,
          total: 50,
          count: 12,
          hidden: false,
        },
      },
      {
        id: "ach-4",
        index: 2,
        completed: false,
        content: {
          title: "Legendary",
          description: "Reach max level",
          icon: "fa-star",
          points: 1000,
          completed: false,
          total: 1,
          count: 0,
          hidden: false,
        },
      },
    ],
  },
};
