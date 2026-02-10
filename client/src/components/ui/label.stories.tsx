import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";

const meta = {
  title: "Primitives/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Label text",
  },
};

export const WithHtmlFor: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="email">Email address</Label>
      <input
        id="email"
        type="email"
        placeholder="Enter email"
        className="px-3 py-2 border border-border-200 rounded-md bg-background-100"
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="disabled-input" className="peer-disabled:opacity-70">
        Disabled field
      </Label>
      <input
        id="disabled-input"
        disabled
        placeholder="Disabled"
        className="peer px-3 py-2 border border-border-200 rounded-md bg-background-100 disabled:opacity-50"
      />
    </div>
  ),
};
