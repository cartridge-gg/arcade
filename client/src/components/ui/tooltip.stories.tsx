import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from "./tooltip";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: "This is a tooltip",
    children: (
      <button type="button" className="px-4 py-2 bg-background-200 rounded">
        Hover me
      </button>
    ),
  },
};

export const LongContent: Story = {
  args: {
    content:
      "This is a longer tooltip with more detailed information about the element",
    children: (
      <span className="text-foreground-100 underline cursor-help">
        More info
      </span>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    content: "Click to copy address",
    children: (
      <span className="text-foreground-400 cursor-pointer">0x1234...5678</span>
    ),
  },
};
