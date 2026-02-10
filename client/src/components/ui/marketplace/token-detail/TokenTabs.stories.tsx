import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TokenTabs } from "./TokenTabs";

const meta = {
  title: "Marketplace/TokenDetail/TokenTabs",
  component: TokenTabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TokenTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledTokenTabs({
  initialTab = "activity",
}: { initialTab?: "activity" | "traits" }) {
  const [activeTab, setActiveTab] = useState<"activity" | "traits">(initialTab);
  return <TokenTabs activeTab={activeTab} onTabChange={setActiveTab} />;
}

export const Activity: Story = {
  args: {
    activeTab: "activity",
    onTabChange: () => {},
  },
};

export const Traits: Story = {
  args: {
    activeTab: "traits",
    onTabChange: () => {},
  },
};

export const Interactive: Story = {
  render: () => <ControlledTokenTabs />,
};

export const InteractiveTraits: Story = {
  render: () => <ControlledTokenTabs initialTab="traits" />,
};
