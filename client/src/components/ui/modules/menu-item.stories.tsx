import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsList, Select, SelectContent } from "@cartridge/ui";
import { ArcadeMenuItem } from "./menu-item";
import { Home, Gamepad2, Trophy, User, Settings, LogOut } from "lucide-react";

const meta = {
  title: "Modules/ArcadeMenuItem",
  component: ArcadeMenuItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Select defaultOpen>
        <SelectContent className="bg-background-200">
          <Tabs defaultValue="home">
            <TabsList className="flex flex-col bg-transparent p-0">
              <Story />
            </TabsList>
          </Tabs>
        </SelectContent>
      </Select>
    ),
  ],
} satisfies Meta<typeof ArcadeMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    Icon: <Home className="w-4 h-4" />,
    value: "home",
    label: "Home",
    active: false,
  },
};

export const Active: Story = {
  args: {
    Icon: <Home className="w-4 h-4" />,
    value: "home",
    label: "Home",
    active: true,
  },
};

export const MenuList: Story = {
  decorators: [
    (Story) => (
      <div className="bg-background-200 rounded-md w-[200px]">
        <Tabs defaultValue="home">
          <TabsList className="flex flex-col bg-transparent p-0 w-full">
            <ArcadeMenuItem
              Icon={<Home className="w-4 h-4" />}
              value="home"
              label="Home"
              active={true}
            />
            <ArcadeMenuItem
              Icon={<Gamepad2 className="w-4 h-4" />}
              value="games"
              label="Games"
              active={false}
            />
            <ArcadeMenuItem
              Icon={<Trophy className="w-4 h-4" />}
              value="achievements"
              label="Achievements"
              active={false}
            />
            <ArcadeMenuItem
              Icon={<User className="w-4 h-4" />}
              value="profile"
              label="Profile"
              active={false}
            />
            <ArcadeMenuItem
              Icon={<Settings className="w-4 h-4" />}
              value="settings"
              label="Settings"
              active={false}
            />
            <ArcadeMenuItem
              Icon={<LogOut className="w-4 h-4" />}
              value="logout"
              label="Log Out"
              active={false}
            />
          </TabsList>
        </Tabs>
      </div>
    ),
  ],
  render: () => null,
};
