import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Template } from "@/components/template";
import { SonnerToaster } from "@cartridge/ui";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <Template>
        <Outlet />
      </Template>
      <SonnerToaster position="top-center" />
      {import.meta.env.DEV ? (
        <TanStackRouterDevtools position="bottom-right" />
      ) : null}
    </>
  ),
});
