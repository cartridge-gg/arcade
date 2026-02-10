import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyAddress } from "./copy-address";

const meta = {
  title: "Modules/CopyAddress",
  component: CopyAddress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CopyAddress>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockAddress =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export const Default: Story = {
  args: {
    address: mockAddress,
  },
};

export const ShortFormat: Story = {
  args: {
    address: mockAddress,
    size: "sm",
  },
};

export const CustomFirstLast: Story = {
  args: {
    address: mockAddress,
    first: 6,
    last: 4,
  },
};

export const WithPlaceholder: Story = {
  args: {
    address: mockAddress,
    placeholder: "Contract Address",
  },
};

export const Variations: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <CopyAddress address={mockAddress} />
      <CopyAddress address={mockAddress} size="sm" />
      <CopyAddress address={mockAddress} first={8} last={6} />
      <CopyAddress address={mockAddress} placeholder="Click to copy" />
    </div>
  ),
};
