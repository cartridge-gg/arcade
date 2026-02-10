import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";
import { ArcadeGameSelect } from "./game-select";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const routeTree = rootRoute.addChildren([]);

const meta = {
  title: "Modules/ArcadeGameSelect",
  component: ArcadeGameSelect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story, _context) => {
      const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: ["/"] }),
        defaultNotFoundComponent: () => <Story />,
      });
      return (
        <RouterProvider router={router}>
          <div className="w-[280px] bg-background-100 p-2">
            <Story />
          </div>
        </RouterProvider>
      );
    },
  ],
} satisfies Meta<typeof ArcadeGameSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockLogo = "https://static.cartridge.gg/presets/loot-survivor/icon.png";

export const Default: Story = {
  args: {
    name: "Loot Survivor",
    logo: mockLogo,
    gameColor: "#fbcb4a",
  },
};

export const WithPoints: Story = {
  args: {
    name: "Eternum",
    logo: mockLogo,
    points: 1250,
    gameColor: "#fbcb4a",
  },
};

export const Active: Story = {
  args: {
    name: "Active Game",
    logo: mockLogo,
    active: true,
    points: 500,
    gameColor: "#fbcb4a",
  },
};

export const Downlighted: Story = {
  args: {
    name: "Downlighted Game",
    logo: mockLogo,
    downlighted: true,
    gameColor: "#fbcb4a",
  },
};

export const WithCustomColor: Story = {
  args: {
    name: "Custom Color",
    logo: mockLogo,
    active: true,
    gameColor: "#ff6b00",
  },
};

export const AllGames: Story = {
  args: {
    name: "All Games",
    logo: mockLogo,
    points: 5000,
    gameColor: "#fbcb4a",
  },
};

export const GameList: Story = {
  render: () => (
    <div className="flex flex-col gap-px">
      <ArcadeGameSelect
        name="All Games"
        logo={mockLogo}
        points={5000}
        active
        gameColor="#fbcb4a"
      />
      <ArcadeGameSelect
        name="Loot Survivor"
        logo={mockLogo}
        points={1250}
        gameColor="#fbcb4a"
      />
      <ArcadeGameSelect
        name="Eternum"
        logo={mockLogo}
        points={800}
        gameColor="#fbcb4a"
      />
      <ArcadeGameSelect
        name="Dark Shuffle"
        logo={mockLogo}
        points={450}
        gameColor="#fbcb4a"
      />
      <ArcadeGameSelect
        name="Influence"
        logo={mockLogo}
        points={200}
        downlighted
        gameColor="#fbcb4a"
      />
    </div>
  ),
};
