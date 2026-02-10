import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  createRootRoute,
} from "@tanstack/react-router";
import { GameCard } from "./GameCard";

const createStoryRouter = (StoryComponent: ComponentType) => {
  const rootRoute = createRootRoute({
    component: () => (
      <div className="w-[300px]">
        <StoryComponent />
      </div>
    ),
  });
  return createRouter({
    routeTree: rootRoute.addChildren([]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
};

const meta = {
  title: "Dashboard/GameCard",
  component: GameCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const router = createStoryRouter(Story);
      return <RouterProvider router={router} />;
    },
  ],
} satisfies Meta<typeof GameCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const games = {
  lootSurvivor: {
    name: "Loot Survivor",
    icon: "https://static.cartridge.gg/presets/loot-survivor/icon.png",
    cover: "https://static.cartridge.gg/presets/loot-survivor/cover.png",
    color: "#33FF33",
    studio: "Provable Games",
  },
  eternum: {
    name: "Eternum",
    icon: "https://static.cartridge.gg/presets/eternum/icon.svg",
    cover: "https://static.cartridge.gg/presets/eternum/cover.png",
    color: "#dc8b07",
    studio: "Biblioteca DAO",
  },
  darkShuffle: {
    name: "Dark Shuffle",
    icon: "https://static.cartridge.gg/presets/dark-shuffle/icon.svg",
    cover: "https://static.cartridge.gg/presets/dark-shuffle/cover.png",
    color: "#F59100",
    studio: "Provable Games",
  },
  pistols: {
    name: "Pistols at Dawn",
    icon: "https://static.cartridge.gg/presets/pistols/icon.png",
    cover: "https://static.cartridge.gg/presets/pistols/cover.png",
    color: "#EF9758",
    studio: "Underware",
  },
};

export const Default: Story = {
  args: {
    name: games.lootSurvivor.name,
    icon: games.lootSurvivor.icon,
    cover: games.lootSurvivor.cover,
    color: games.lootSurvivor.color,
    studio: games.lootSurvivor.studio,
    href: "/",
    size: "large",
  },
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[620px]">
      <GameCard
        name={games.lootSurvivor.name}
        icon={games.lootSurvivor.icon}
        cover={games.lootSurvivor.cover}
        color={games.lootSurvivor.color}
        studio={games.lootSurvivor.studio}
        href="/"
        size="large"
      />
      <GameCard
        name={games.eternum.name}
        icon={games.eternum.icon}
        cover={games.eternum.cover}
        color={games.eternum.color}
        studio={games.eternum.studio}
        href="/"
        size="large"
      />
      <GameCard
        name={games.darkShuffle.name}
        icon={games.darkShuffle.icon}
        cover={games.darkShuffle.cover}
        color={games.darkShuffle.color}
        studio={games.darkShuffle.studio}
        href="/"
        size="small"
      />
      <GameCard
        name={games.pistols.name}
        icon={games.pistols.icon}
        cover={games.pistols.cover}
        color={games.pistols.color}
        studio={games.pistols.studio}
        href="/"
        size="small"
      />
    </div>
  ),
};

export const SingleCard: Story = {
  args: {
    name: games.lootSurvivor.name,
    icon: games.lootSurvivor.icon,
    cover: games.lootSurvivor.cover,
    color: games.lootSurvivor.color,
    studio: games.lootSurvivor.studio,
    href: "/",
    size: "small",
  },
};

export const WithCover: Story = {
  args: {
    name: games.eternum.name,
    icon: games.eternum.icon,
    cover: games.eternum.cover,
    color: games.eternum.color,
    href: "/",
  },
};

export const WithStudio: Story = {
  args: {
    name: games.darkShuffle.name,
    icon: games.darkShuffle.icon,
    cover: games.darkShuffle.cover,
    color: games.darkShuffle.color,
    studio: games.darkShuffle.studio,
    href: "/",
  },
};

export const WithColor: Story = {
  args: {
    name: games.pistols.name,
    icon: games.pistols.icon,
    cover: games.pistols.cover,
    color: games.pistols.color,
    href: "/",
  },
};

export const LargeSize: Story = {
  args: {
    name: games.eternum.name,
    icon: games.eternum.icon,
    cover: games.eternum.cover,
    color: games.eternum.color,
    studio: games.eternum.studio,
    size: "large",
    href: "/",
  },
};

export const SmallSize: Story = {
  args: {
    name: games.darkShuffle.name,
    icon: games.darkShuffle.icon,
    cover: games.darkShuffle.cover,
    color: games.darkShuffle.color,
    size: "small",
    href: "/",
  },
};
