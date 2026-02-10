import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsList } from "@cartridge/ui";
import { ArcadeSubTab } from "./sub-tab";
import { List, Grid, LayoutGrid } from "lucide-react";

const meta = {
  title: "Modules/ArcadeSubTab",
  component: ArcadeSubTab,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Tabs defaultValue="list">
          <TabsList className="w-full bg-transparent p-0">
            <Story />
          </TabsList>
        </Tabs>
      </div>
    ),
  ],
} satisfies Meta<typeof ArcadeSubTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    Icon: <List className="w-4 h-4" />,
    value: "list",
    label: "List View",
    active: false,
  },
};

export const Active: Story = {
  args: {
    Icon: <List className="w-4 h-4" />,
    value: "list",
    label: "List View",
    active: true,
  },
};

export const SubTabGroup: Story = {
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Tabs defaultValue="list">
          <TabsList className="w-full bg-transparent p-0 gap-0">
            <ArcadeSubTab
              Icon={<List className="w-4 h-4" />}
              value="list"
              label="List"
              active={true}
            />
            <ArcadeSubTab
              Icon={<Grid className="w-4 h-4" />}
              value="grid"
              label="Grid"
              active={false}
            />
            <ArcadeSubTab
              Icon={<LayoutGrid className="w-4 h-4" />}
              value="compact"
              label="Compact"
              active={false}
            />
          </TabsList>
        </Tabs>
      </div>
    ),
  ],
  render: () => null,
};
