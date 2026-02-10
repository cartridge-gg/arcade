import type { Meta, StoryObj } from "@storybook/react-vite";
import ControllerAction from "./controller-action";
import { Settings, LogOut, Wallet, Key } from "lucide-react";

const meta = {
  title: "Modules/ControllerAction",
  component: ControllerAction,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ControllerAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Settings",
    Icon: <Settings className="w-5 h-5" />,
  },
};

export const WithLogoutIcon: Story = {
  args: {
    label: "Log Out",
    Icon: <LogOut className="w-5 h-5" />,
  },
};

export const WithWalletIcon: Story = {
  args: {
    label: "Connect Wallet",
    Icon: <Wallet className="w-5 h-5" />,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Action",
    Icon: <Key className="w-5 h-5" />,
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    label: "Loading...",
    loading: true,
  },
};

export const NoIcon: Story = {
  args: {
    label: "Text Only",
  },
};

export const ActionList: Story = {
  render: () => (
    <div className="flex flex-col gap-px w-[200px]">
      <ControllerAction
        label="Settings"
        Icon={<Settings className="w-5 h-5" />}
      />
      <ControllerAction label="Wallet" Icon={<Wallet className="w-5 h-5" />} />
      <ControllerAction label="Log Out" Icon={<LogOut className="w-5 h-5" />} />
    </div>
  ),
};
