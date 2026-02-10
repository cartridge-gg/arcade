import type { Meta, StoryObj } from "@storybook/react-vite";
import { SelectItem } from "@cartridge/ui";
import EditionActions from "./edition-actions";

const meta = {
  title: "Modules/EditionActions",
  component: EditionActions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EditionActions>;

export default meta;
type Story = StoryObj<typeof meta>;

const MenuItem = ({ label }: { label: string }) => (
  <SelectItem
    value={label.toLowerCase()}
    className="px-2 py-2 text-sm text-foreground-300 hover:text-foreground-200 hover:bg-background-300 cursor-pointer"
  >
    {label}
  </SelectItem>
);

export const Default: Story = {
  args: {
    label: "Draft Edition",
    children: (
      <>
        <MenuItem label="Edit" />
        <MenuItem label="Delete" />
      </>
    ),
  },
};

export const Published: Story = {
  args: {
    label: "Main Edition",
    published: true,
    children: (
      <>
        <MenuItem label="View" />
        <MenuItem label="Unpublish" />
      </>
    ),
  },
};

export const Whitelisted: Story = {
  args: {
    label: "Beta Edition",
    whitelisted: true,
    children: (
      <>
        <MenuItem label="View" />
        <MenuItem label="Manage Access" />
      </>
    ),
  },
};

export const Certified: Story = {
  args: {
    label: "Official Edition",
    certified: true,
    whitelisted: true,
    children: (
      <>
        <MenuItem label="View" />
        <MenuItem label="Settings" />
      </>
    ),
  },
};

export const Disabled: Story = {
  args: {
    label: "Locked Edition",
    disabled: true,
  },
};
