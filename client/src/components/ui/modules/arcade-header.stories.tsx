import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";
import { ArcadeHeader } from "./arcade-header";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const routeTree = rootRoute.addChildren([]);

const meta = {
  title: "Modules/ArcadeHeader",
  component: ArcadeHeader,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: ["/"] }),
        defaultNotFoundComponent: () => <Story />,
      });
      return (
        <RouterProvider router={router}>
          <div className="w-full bg-background-100">
            <Story />
          </div>
        </RouterProvider>
      );
    },
  ],
} satisfies Meta<typeof ArcadeHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onLogoClick: () => console.log("Logo clicked"),
  },
};

export const WithChildren: Story = {
  args: {
    onLogoClick: () => console.log("Logo clicked"),
    children: (
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 bg-background-200 rounded text-sm text-foreground-100">
          Connect
        </button>
      </div>
    ),
  },
};
