import { createRootRoute, Outlet } from "@tanstack/react-router";
import { SonnerToaster } from "@cartridge/ui";
import { Template } from "@/components/template";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <Template>
        <Outlet />
        <SonnerToaster position="top-center" />
      </Template>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
});
