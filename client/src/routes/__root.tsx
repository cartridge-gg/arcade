import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { Template } from "@/components/template";
import { SonnerToaster } from "@cartridge/ui";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

function RootComponent() {
  const router = useRouterState();
  const pathname = router.location.pathname;

  const segments = pathname.split("/").filter(Boolean);
  const collectionIndex = segments.findIndex((s) => s === "collection");

  const hasOwnTemplate =
    collectionIndex >= 0 &&
    (collectionIndex === segments.length - 1 ||
      collectionIndex < segments.length - 1);

  return (
    <>
      {hasOwnTemplate ? (
        <Outlet />
      ) : (
        <Template>
          <Outlet />
        </Template>
      )}
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
