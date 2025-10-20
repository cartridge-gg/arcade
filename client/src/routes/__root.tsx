import { Outlet, createRootRoute, useRouterState } from "@tanstack/react-router";
import { Template } from "@/components/template";
import { SonnerToaster } from "@cartridge/ui";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/context/theme";

function RootComponent() {
  const router = useRouterState();
  const isStarterpackRoute = router.location.pathname.startsWith("/starterpack/");

  if (isStarterpackRoute) {
    return (
      <>
        <ThemeProvider defaultScheme="dark">
          <Outlet />
        </ThemeProvider>
        <SonnerToaster position="top-center" />
        {import.meta.env.DEV ? (
          <TanStackRouterDevtools position="bottom-right" />
        ) : null}
      </>
    );
  }

  return (
    <>
      <Template>
        <Outlet />
      </Template>
      <SonnerToaster position="top-center" />
      {import.meta.env.DEV ? (
        <TanStackRouterDevtools position="bottom-right" />
      ) : null}
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
