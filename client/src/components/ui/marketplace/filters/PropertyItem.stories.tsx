import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PropertyItem } from "./PropertyItem";

const meta = {
  title: "Marketplace/Filters/PropertyItem",
  component: PropertyItem,
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
} satisfies Meta<typeof PropertyItem>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledPropertyItem(
  props: Partial<React.ComponentProps<typeof PropertyItem>>,
) {
  const [isActive, setIsActive] = useState(props.isActive || false);
  return (
    <PropertyItem
      attributeName={props.attributeName || "Background"}
      property={props.property || "Gold"}
      count={props.count ?? 42}
      isActive={isActive}
      onToggle={(attr, prop, enabled) => {
        setIsActive(enabled);
        console.log(`Toggle: ${attr}/${prop} = ${enabled}`);
      }}
    />
  );
}

export const Default: Story = {
  render: () => <ControlledPropertyItem />,
};

export const Active: Story = {
  render: () => <ControlledPropertyItem isActive />,
};

export const ZeroCount: Story = {
  render: () => <ControlledPropertyItem count={0} />,
};

export const HighCount: Story = {
  render: () => <ControlledPropertyItem count={1234} />,
};

export const LongProperty: Story = {
  render: () => (
    <ControlledPropertyItem property="Very Long Property Name Here" />
  ),
};

export const PropertyList: Story = {
  render: () => (
    <div className="flex flex-col gap-px">
      <ControlledPropertyItem property="Common" count={500} />
      <ControlledPropertyItem property="Uncommon" count={250} isActive />
      <ControlledPropertyItem property="Rare" count={100} />
      <ControlledPropertyItem property="Epic" count={25} />
      <ControlledPropertyItem property="Legendary" count={5} />
    </div>
  ),
};
