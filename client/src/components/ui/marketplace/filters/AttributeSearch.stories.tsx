import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AttributeSearch } from "./AttributeSearch";

const meta = {
  title: "Marketplace/Filters/AttributeSearch",
  component: AttributeSearch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AttributeSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledAttributeSearch(
  props: Partial<React.ComponentProps<typeof AttributeSearch>>,
) {
  const [value, setValue] = useState(props.initialValue || "");
  return (
    <AttributeSearch
      attributeName={props.attributeName || "Background"}
      initialValue={value}
      onSearchChange={(attr, val) => {
        setValue(val);
        console.log(`Search changed: ${attr} = ${val}`);
      }}
    />
  );
}

export const Default: Story = {
  render: () => <ControlledAttributeSearch />,
};

export const WithInitialValue: Story = {
  render: () => <ControlledAttributeSearch initialValue="Gold" />,
};

export const DifferentAttribute: Story = {
  render: () => <ControlledAttributeSearch attributeName="Rarity" />,
};
