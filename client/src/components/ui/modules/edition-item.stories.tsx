import type { Meta, StoryObj } from "@storybook/react-vite";
import EditionAction from "./edition-item";

const meta = {
  title: "Modules/EditionAction",
  component: EditionAction,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EditionAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Draft Edition",
  },
};

export const Published: Story = {
  args: {
    label: "Published Edition",
    published: true,
  },
};

export const Whitelisted: Story = {
  args: {
    label: "Whitelisted Edition",
    whitelisted: true,
  },
};

export const Certified: Story = {
  args: {
    label: "Certified Edition",
    certified: true,
    whitelisted: true,
  },
};

export const Active: Story = {
  args: {
    label: "Active Edition",
    active: true,
    certified: true,
    whitelisted: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-[200px]">
      <EditionAction label="Draft" />
      <EditionAction label="Published" published />
      <EditionAction label="Whitelisted" whitelisted />
      <EditionAction label="Certified" certified whitelisted />
      <EditionAction label="Active" active certified whitelisted />
    </div>
  ),
};
