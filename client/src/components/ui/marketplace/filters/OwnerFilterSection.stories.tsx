import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { OwnerFilterSection } from "./OwnerFilterSection";

const meta = {
  title: "Marketplace/Filters/OwnerFilterSection",
  component: OwnerFilterSection,
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
} satisfies Meta<typeof OwnerFilterSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockSuggestions = [
  { username: "alice", address: "0x1234567890abcdef1234567890abcdef12345678" },
  { username: "bob", address: "0xabcdef1234567890abcdef1234567890abcdef12" },
  {
    username: "charlie",
    address: "0x9876543210fedcba9876543210fedcba98765432",
  },
];

function ControlledOwnerFilter(props: {
  initialValue?: string;
  showSuggestions?: boolean;
}) {
  const [inputValue, setInputValue] = useState(props.initialValue || "");
  const isAddressInput = inputValue.startsWith("0x");

  return (
    <OwnerFilterSection
      inputValue={inputValue}
      onInputChange={setInputValue}
      suggestions={
        props.showSuggestions && !isAddressInput ? mockSuggestions : []
      }
      isAddressInput={isAddressInput}
      onSelectSuggestion={(account) => {
        setInputValue(account.username);
        console.log("Selected:", account);
      }}
      onClear={() => setInputValue("")}
    />
  );
}

export const Default: Story = {
  render: () => <ControlledOwnerFilter />,
};

export const WithValue: Story = {
  render: () => <ControlledOwnerFilter initialValue="alice" />,
};

export const WithAddress: Story = {
  render: () => <ControlledOwnerFilter initialValue="0x1234567890abcdef" />,
};

export const WithSuggestions: Story = {
  render: () => <ControlledOwnerFilter initialValue="a" showSuggestions />,
};
