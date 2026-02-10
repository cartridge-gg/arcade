import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SearchInput } from "./search-input";

const meta = {
  title: "Modules/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledSearchInput(
  props: Partial<React.ComponentProps<typeof SearchInput>>,
) {
  const [value, setValue] = useState(props.value || "");
  return <SearchInput {...props} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: () => <ControlledSearchInput />,
};

export const WithPlaceholder: Story = {
  render: () => <ControlledSearchInput placeholder="Search games..." />,
};

export const WithValue: Story = {
  render: () => <ControlledSearchInput value="Loot Survivor" />,
};

export const Disabled: Story = {
  render: () => (
    <ControlledSearchInput disabled placeholder="Search disabled" />
  ),
};

export const AutoFocus: Story = {
  render: () => <ControlledSearchInput autoFocus placeholder="Auto focused" />,
};

export const CustomClassName: Story = {
  render: () => (
    <ControlledSearchInput
      className="pl-9 bg-background-200 w-full"
      placeholder="Custom styled"
    />
  ),
};
