import { useEffect } from "react";
import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { Template } from "@/components/template";
import { SonnerToaster } from "@cartridge/ui";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useNavigationContext } from "@/features/navigation";
import { useArcade } from "@/hooks/arcade";
import { useAccount } from "@/collections";

function RootComponent() {
  const router = useRouterState();
  const { setPlayer } = useArcade();
  const pathname = router.location.pathname;

  const segments = pathname.split("/").filter(Boolean);
  const collectionIndex = segments.findIndex((s) => s === "collection");

  const hasOwnTemplate =
    collectionIndex >= 0 &&
    (collectionIndex === segments.length - 1 ||
      collectionIndex < segments.length - 1);

  const { manager } = useNavigationContext();
  const { data } = useAccount(manager.getParams().player);
  useEffect(() => {
    if (data) {
      setPlayer((p) => (p !== data.address ? data.address : p));
    }
  }, [data, setPlayer]);

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
