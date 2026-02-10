import type { Meta, StoryObj } from "@storybook/react-vite";
import { TokenProperties } from "./TokenProperties";

const meta = {
  title: "Marketplace/TokenDetail/TokenProperties",
  component: TokenProperties,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TokenProperties>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    properties: [
      { name: "Background", value: "Gold" },
      { name: "Body", value: "Rare" },
      { name: "Eyes", value: "Blue" },
      { name: "Hat", value: "Crown" },
    ],
  },
};

export const ManyProperties: Story = {
  args: {
    properties: [
      { name: "Background", value: "Gold" },
      { name: "Body", value: "Rare" },
      { name: "Eyes", value: "Blue" },
      { name: "Hat", value: "Crown" },
      { name: "Weapon", value: "Sword" },
      { name: "Armor", value: "Diamond" },
      { name: "Level", value: 42 },
      { name: "Rarity", value: "Legendary" },
    ],
  },
};

export const FewProperties: Story = {
  args: {
    properties: [
      { name: "Rarity", value: "Epic" },
      { name: "Type", value: "Warrior" },
    ],
  },
};

export const NumericValues: Story = {
  args: {
    properties: [
      { name: "Level", value: 50 },
      { name: "HP", value: 1000 },
      { name: "Attack", value: 250 },
      { name: "Defense", value: 180 },
    ],
  },
};

export const SingleProperty: Story = {
  args: {
    properties: [{ name: "Status", value: "Active" }],
  },
};
