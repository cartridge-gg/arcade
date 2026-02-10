import { useEffect, useMemo } from "react";
import { Outlet, createRootRoute, useMatches } from "@tanstack/react-router";
import { Template } from "@/components/template";
import { SonnerToaster } from "@cartridge/ui";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useNavigationContext } from "@/features/navigation";
import { useArcade } from "@/hooks/arcade";
import { useAccount } from "@/effect";

function RootComponent() {
  const matches = useMatches();
  const hasOwnTemplate = useMemo(
    () => matches.some((m) => m.staticData?.hasOwnTemplate === true),
    [matches],
  );

  const { setPlayer } = useArcade();

  const { manager } = useNavigationContext();
  const { data } = useAccount(manager.getParams().player);
  useEffect(() => {
    if (data) {
      setPlayer((p) => (p !== data.address ? data.address : p));
    } else {
      setPlayer(manager.getParams().player || undefined);
    }
  }, [data, manager, setPlayer]);

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
