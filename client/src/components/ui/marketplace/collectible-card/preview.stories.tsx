import type { Meta, StoryObj } from "@storybook/react-vite";
import { CollectiblePreview } from "./preview";

const meta = {
  title: "Marketplace/CollectiblePreview",
  component: CollectiblePreview,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CollectiblePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockImage =
  "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo";

export const Default: Story = {
  args: {
    images: [mockImage],
  },
};

export const SmallSize: Story = {
  args: {
    images: [mockImage],
    size: "sm",
  },
};

export const MediumSize: Story = {
  args: {
    images: [mockImage],
    size: "md",
  },
};

export const LargeSize: Story = {
  args: {
    images: [mockImage],
    size: "lg",
  },
};

export const MultipleImages: Story = {
  args: {
    images: [
      mockImage,
      "https://static.cartridge.gg/presets/loot-survivor/icon.png",
      "https://static.cartridge.gg/presets/eternum/icon.png",
    ],
  },
};

export const EmptyImages: Story = {
  args: {
    images: [],
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-end">
      <CollectiblePreview images={[mockImage]} size="sm" />
      <CollectiblePreview images={[mockImage]} size="md" />
      <CollectiblePreview images={[mockImage]} size="lg" />
    </div>
  ),
};
