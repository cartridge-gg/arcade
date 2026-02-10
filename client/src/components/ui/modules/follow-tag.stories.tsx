import type { Meta, StoryObj } from "@storybook/react-vite";
import { AchievementFollowTag } from "./follow-tag";

const meta = {
  title: "Modules/AchievementFollowTag",
  component: AchievementFollowTag,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AchievementFollowTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: false,
  },
};

export const Active: Story = {
  args: {
    active: true,
  },
};

export const InGroup: Story = {
  render: () => (
    <div className="group flex gap-4 p-4 bg-background-200 hover:bg-background-300 rounded-lg cursor-pointer">
      <span className="text-foreground-300">Hover to see interaction</span>
      <AchievementFollowTag active={false} />
      <AchievementFollowTag active={true} />
    </div>
  ),
};
