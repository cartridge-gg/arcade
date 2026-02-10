import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavigationButton } from "./link-item";
import { Home, Gamepad2, Trophy, User } from "lucide-react";

const meta = {
  title: "Modules/NavigationButton",
  component: NavigationButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NavigationButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Home className="w-4 h-4" />
        <span>Home</span>
      </>
    ),
    href: "#",
  },
};

export const Active: Story = {
  args: {
    children: (
      <>
        <Gamepad2 className="w-4 h-4" />
        <span>Games</span>
      </>
    ),
    href: "#",
    "data-status": "active",
  },
};

export const TabVariant: Story = {
  args: {
    children: (
      <>
        <Trophy className="w-4 h-4" />
        <span>Achievements</span>
      </>
    ),
    variant: "tab",
    href: "#",
  },
};

export const TabActive: Story = {
  args: {
    children: (
      <>
        <User className="w-4 h-4" />
        <span>Profile</span>
      </>
    ),
    variant: "tab",
    href: "#",
    "data-status": "active",
  },
};

export const NavigationBar: Story = {
  render: () => (
    <div className="flex gap-2 p-4 bg-background-100 rounded-lg">
      <NavigationButton href="#" data-status="active">
        <Home className="w-4 h-4" />
        <span>Home</span>
      </NavigationButton>
      <NavigationButton href="#">
        <Gamepad2 className="w-4 h-4" />
        <span>Games</span>
      </NavigationButton>
      <NavigationButton href="#">
        <Trophy className="w-4 h-4" />
        <span>Achievements</span>
      </NavigationButton>
      <NavigationButton href="#">
        <User className="w-4 h-4" />
        <span>Profile</span>
      </NavigationButton>
    </div>
  ),
};

export const TabBar: Story = {
  render: () => (
    <div className="flex gap-2 p-4 bg-background-100 rounded-lg">
      <NavigationButton variant="tab" href="#" data-status="active">
        Overview
      </NavigationButton>
      <NavigationButton variant="tab" href="#">
        Details
      </NavigationButton>
      <NavigationButton variant="tab" href="#">
        Settings
      </NavigationButton>
    </div>
  ),
};
