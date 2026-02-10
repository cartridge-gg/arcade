import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsList } from "@cartridge/ui";
import { ArcadeTab } from "./tab";
import { Trophy, Gamepad2, User, Settings } from "lucide-react";

const meta = {
  title: "Modules/ArcadeTab",
  component: ArcadeTab,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Tabs defaultValue="games">
        <TabsList className="bg-transparent border-b border-background-200">
          <Story />
        </TabsList>
      </Tabs>
    ),
  ],
} satisfies Meta<typeof ArcadeTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    Icon: <Gamepad2 className="w-4 h-4" />,
    value: "games",
    label: "Games",
    active: false,
  },
};

export const Active: Story = {
  args: {
    Icon: <Gamepad2 className="w-4 h-4" />,
    value: "games",
    label: "Games",
    active: true,
  },
};

export const TabGroup: Story = {
  decorators: [
    (Story) => (
      <Tabs defaultValue="games">
        <TabsList className="bg-transparent border-b border-background-200 gap-4">
          <ArcadeTab
            Icon={<Gamepad2 className="w-4 h-4" />}
            value="games"
            label="Games"
            active={true}
          />
          <ArcadeTab
            Icon={<Trophy className="w-4 h-4" />}
            value="achievements"
            label="Achievements"
            active={false}
          />
          <ArcadeTab
            Icon={<User className="w-4 h-4" />}
            value="profile"
            label="Profile"
            active={false}
          />
          <ArcadeTab
            Icon={<Settings className="w-4 h-4" />}
            value="settings"
            label="Settings"
            active={false}
          />
        </TabsList>
      </Tabs>
    ),
  ],
  render: () => null,
};
