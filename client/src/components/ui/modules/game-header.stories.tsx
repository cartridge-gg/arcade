import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArcadeGameHeader } from "./game-header";

const meta = {
  title: "Modules/ArcadeGameHeader",
  component: ArcadeGameHeader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ArcadeGameHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    metadata: {
      game: "Loot Survivor",
      edition: "Main",
      certified: true,
    },
  },
};

export const WithLogo: Story = {
  args: {
    metadata: {
      game: "Eternum",
      edition: "Season 1",
      certified: true,
      logo: "https://static.cartridge.gg/presets/eternum/icon.png",
    },
  },
};

export const NotCertified: Story = {
  args: {
    metadata: {
      game: "Community Game",
      edition: "Beta",
      certified: false,
    },
  },
};

export const Clickable: Story = {
  args: {
    metadata: {
      game: "Click Me",
      edition: "Interactive",
      certified: true,
    },
    onClick: () => alert("Clicked!"),
  },
};

export const Active: Story = {
  args: {
    metadata: {
      game: "Active Game",
      edition: "Current",
      certified: true,
    },
    active: true,
  },
};

export const DarkVariant: Story = {
  args: {
    metadata: {
      game: "Dark Theme",
      edition: "v1.0",
      certified: true,
    },
    variant: "dark",
  },
};

export const WithColor: Story = {
  args: {
    metadata: {
      game: "Colored Game",
      edition: "Special",
      certified: true,
    },
    color: "#ff6b00",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <ArcadeGameHeader
        metadata={{ game: "Default", edition: "v1", certified: true }}
        variant="default"
      />
      <ArcadeGameHeader
        metadata={{ game: "Dark", edition: "v1", certified: true }}
        variant="dark"
      />
      <ArcadeGameHeader
        metadata={{ game: "Darker", edition: "v1", certified: false }}
        variant="darker"
      />
      <ArcadeGameHeader
        metadata={{ game: "Ghost", edition: "v1", certified: true }}
        variant="ghost"
      />
    </div>
  ),
};
