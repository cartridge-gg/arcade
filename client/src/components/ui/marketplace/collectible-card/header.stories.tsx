import type { Meta, StoryObj } from "@storybook/react-vite";
import { CollectibleHeader } from "./header";

const meta = {
  title: "Marketplace/CollectibleHeader",
  component: CollectibleHeader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="relative w-[200px] h-[60px] bg-background-200">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CollectibleHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockIcon = "https://static.cartridge.gg/presets/loot-survivor/icon.png";

export const Default: Story = {
  args: {
    title: "Loot Survivor #1234",
  },
};

export const WithIcon: Story = {
  args: {
    title: "Token with Icon",
    icon: mockIcon,
  },
};

export const Selectable: Story = {
  args: {
    title: "Selectable Item",
    selectable: true,
    onSelect: () => console.log("Selected"),
  },
};

export const Selected: Story = {
  args: {
    title: "Selected Item",
    selected: true,
    onSelect: () => console.log("Deselected"),
  },
};

export const WithListingCount: Story = {
  args: {
    title: "Listed Item",
    listingCount: 5,
  },
};

export const LongTitle: Story = {
  args: {
    title: "This is a very long title that should be truncated",
    icon: mockIcon,
  },
};

export const FadedVariant: Story = {
  args: {
    title: "Faded Header",
    variant: "faded",
  },
};

export const AllFeatures: Story = {
  args: {
    title: "Complete Header",
    icon: mockIcon,
    listingCount: 3,
    selectable: true,
    onSelect: () => console.log("Selected"),
  },
};
