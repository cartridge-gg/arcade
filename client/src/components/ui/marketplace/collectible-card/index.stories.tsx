import type { Meta, StoryObj } from "@storybook/react-vite";
import { CollectibleCard } from "./index";

const meta = {
  title: "Marketplace/CollectibleCard",
  component: CollectibleCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CollectibleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockImage =
  "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo";

export const Default: Story = {
  args: {
    title: "Loot Survivor #1234",
    images: [mockImage],
  },
};

export const WithPrice: Story = {
  args: {
    title: "Rare NFT #42",
    images: [mockImage],
    price: "1.5",
    lastSale: "1.2",
  },
};

export const WithPriceObject: Story = {
  args: {
    title: "Token #99",
    images: [mockImage],
    price: { value: "2.5", image: mockImage },
    lastSale: { value: "2.0", image: mockImage },
  },
};

export const WithIcon: Story = {
  args: {
    title: "Collection Item",
    images: [mockImage],
    icon: mockImage,
  },
};

export const Selected: Story = {
  args: {
    title: "Selected Item",
    images: [mockImage],
    selected: true,
  },
};

export const NotSelectable: Story = {
  args: {
    title: "Not Selectable",
    images: [mockImage],
    selectable: false,
  },
};

export const WithListingCount: Story = {
  args: {
    title: "Listed Item",
    images: [mockImage],
    listingCount: 5,
    price: "0.5",
  },
};

export const WithTotalCount: Story = {
  args: {
    title: "Collection",
    images: [mockImage],
    totalCount: 100,
  },
};

export const FadedVariant: Story = {
  args: {
    title: "Faded Item",
    images: [mockImage],
    variant: "faded",
    price: "3.0",
  },
};

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <CollectibleCard title="Item #1" images={[mockImage]} price="1.0" />
      <CollectibleCard
        title="Item #2"
        images={[mockImage]}
        price="2.0"
        selected
      />
      <CollectibleCard
        title="Item #3"
        images={[mockImage]}
        price="0.5"
        listingCount={3}
      />
      <CollectibleCard title="Item #4" images={[mockImage]} lastSale="1.5" />
      <CollectibleCard title="Item #5" images={[mockImage]} icon={mockImage} />
      <CollectibleCard
        title="Item #6"
        images={[mockImage]}
        selectable={false}
      />
    </div>
  ),
};
