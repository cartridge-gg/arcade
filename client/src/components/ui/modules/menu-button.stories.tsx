import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "@cartridge/ui";
import { ArcadeMenuButton } from "./menu-button";
import { MoreVertical, Settings, Filter, Menu } from "lucide-react";

const meta = {
  title: "Modules/ArcadeMenuButton",
  component: ArcadeMenuButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Select>
        <Story />
      </Select>
    ),
  ],
} satisfies Meta<typeof ArcadeMenuButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <MoreVertical className="w-4 h-4" />,
    simplified: true,
  },
};

export const Active: Story = {
  args: {
    children: <MoreVertical className="w-4 h-4" />,
    active: true,
    simplified: true,
  },
};

export const WithSettingsIcon: Story = {
  args: {
    children: <Settings className="w-4 h-4" />,
    simplified: true,
  },
};

export const WithFilterIcon: Story = {
  args: {
    children: <Filter className="w-4 h-4" />,
    simplified: true,
  },
};

export const WithMenuIcon: Story = {
  args: {
    children: <Menu className="w-4 h-4" />,
    simplified: true,
  },
};

export const ButtonVariations: Story = {
  decorators: [
    (Story) => (
      <div className="flex gap-4">
        <Select>
          <ArcadeMenuButton simplified>
            <MoreVertical className="w-4 h-4" />
          </ArcadeMenuButton>
        </Select>
        <Select>
          <ArcadeMenuButton simplified active>
            <Settings className="w-4 h-4" />
          </ArcadeMenuButton>
        </Select>
        <Select>
          <ArcadeMenuButton simplified>
            <Filter className="w-4 h-4" />
          </ArcadeMenuButton>
        </Select>
        <Select>
          <ArcadeMenuButton simplified>
            <Menu className="w-4 h-4" />
          </ArcadeMenuButton>
        </Select>
      </div>
    ),
  ],
  render: () => null,
};
