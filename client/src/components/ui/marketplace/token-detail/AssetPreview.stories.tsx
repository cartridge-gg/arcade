import type { Meta, StoryObj } from "@storybook/react";
import { AssetPreview } from "./AssetPreview";

const meta = {
  title: "Marketplace/TokenDetail/AssetPreview",
  component: AssetPreview,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AssetPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockImage =
  "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo";

export const Default: Story = {
  args: {
    image: mockImage,
    name: "Token #1234",
  },
};

export const WithoutImage: Story = {
  args: {
    name: "Token without image",
  },
};

export const CustomClassName: Story = {
  args: {
    image: mockImage,
    name: "Custom styled",
    className: "border border-primary",
  },
};

export const LargeImage: Story = {
  args: {
    image: "https://static.cartridge.gg/presets/loot-survivor/cover.png",
    name: "Large NFT Image",
  },
};
