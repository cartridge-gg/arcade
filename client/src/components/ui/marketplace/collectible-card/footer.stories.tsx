import type { Meta, StoryObj } from "@storybook/react-vite";
import { CollectibleCardFooter } from "./footer";

const meta = {
  title: "Marketplace/CollectibleCardFooter",
  component: CollectibleCardFooter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="relative w-[200px] h-[80px] bg-background-200">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CollectibleCardFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockImage = "https://static.cartridge.gg/presets/credit/icon.svg";

export const Default: Story = {
  args: {},
};

export const WithStringPrice: Story = {
  args: {
    price: "1.5",
  },
};

export const WithStringLastSale: Story = {
  args: {
    lastSale: "1.2",
  },
};

export const WithBothStrings: Story = {
  args: {
    price: "2.5",
    lastSale: "2.0",
  },
};

export const WithPriceObject: Story = {
  args: {
    price: { value: "3.5", image: mockImage },
  },
};

export const WithLastSaleObject: Story = {
  args: {
    lastSale: { value: "3.0", image: mockImage },
  },
};

export const WithBothObjects: Story = {
  args: {
    price: { value: "4.5", image: mockImage },
    lastSale: { value: "4.0", image: mockImage },
  },
};

export const MixedFormat: Story = {
  args: {
    price: { value: "5.5", image: mockImage },
    lastSale: "5.0",
  },
};

export const FadedVariant: Story = {
  args: {
    price: "1.0",
    lastSale: "0.8",
    variant: "faded",
  },
};
