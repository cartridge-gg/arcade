import type { Meta, StoryObj } from "@storybook/react-vite";
import { AchievementPinIcons } from "./achievement-pin-icons";

const meta = {
  title: "Modules/AchievementPinIcons",
  component: AchievementPinIcons,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AchievementPinIcons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreePins: Story = {
  args: {
    pins: [
      { id: "1", icon: "fa-trophy" },
      { id: "2", icon: "fa-star" },
      { id: "3", icon: "fa-crown" },
    ],
  },
};

export const OnePin: Story = {
  args: {
    pins: [{ id: "1", icon: "fa-trophy" }],
  },
};

export const TwoPins: Story = {
  args: {
    pins: [
      { id: "1", icon: "fa-trophy" },
      { id: "2", icon: "fa-star" },
    ],
  },
};

export const NoPins: Story = {
  args: {
    pins: [],
  },
};

export const Themed: Story = {
  args: {
    pins: [
      { id: "1", icon: "fa-trophy" },
      { id: "2", icon: "fa-star" },
      { id: "3", icon: "fa-crown" },
    ],
    theme: true,
    color: "#fbcb4a",
  },
};

export const DarkVariant: Story = {
  args: {
    pins: [
      { id: "1", icon: "fa-trophy" },
      { id: "2", icon: "fa-star" },
    ],
    variant: "dark",
  },
};

export const LightVariant: Story = {
  args: {
    pins: [
      { id: "1", icon: "fa-trophy" },
      { id: "2", icon: "fa-star" },
    ],
    variant: "light",
  },
};
