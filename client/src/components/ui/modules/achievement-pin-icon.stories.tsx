import type { Meta, StoryObj } from "@storybook/react-vite";
import { AchievementPinIcon } from "./achievement-pin-icon";

const meta = {
  title: "Modules/AchievementPinIcon",
  component: AchievementPinIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AchievementPinIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: "fa-trophy",
  },
};

export const Empty: Story = {
  args: {
    empty: true,
  },
};

export const Themed: Story = {
  args: {
    icon: "fa-trophy",
    theme: true,
    color: "#fbcb4a",
  },
};

export const CustomIcon: Story = {
  args: {
    icon: "fa-star",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      {(
        [
          "darkest",
          "darker",
          "dark",
          "default",
          "light",
          "lighter",
          "lightest",
          "ghost",
        ] as const
      ).map((variant) => (
        <AchievementPinIcon key={variant} icon="fa-trophy" variant={variant} />
      ))}
    </div>
  ),
};

export const AllVariantsEmpty: Story = {
  render: () => (
    <div className="flex gap-2">
      {(
        [
          "darkest",
          "darker",
          "dark",
          "default",
          "light",
          "lighter",
          "lightest",
          "ghost",
        ] as const
      ).map((variant) => (
        <AchievementPinIcon key={variant} empty variant={variant} />
      ))}
    </div>
  ),
};
