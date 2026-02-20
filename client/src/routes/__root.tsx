import { useEffect, useMemo } from "react";
import { Outlet, createRootRoute, useMatches } from "@tanstack/react-router";
import { getChecksumAddress } from "starknet";
import { Template } from "@/components/template";
import { ControllerToaster } from "@cartridge/ui";
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
      const param = manager.getParams().player;
      if (param?.match(/^0x[0-9a-fA-F]+$/)) {
        try {
          setPlayer(getChecksumAddress(param));
        } catch {
          setPlayer(undefined);
        }
      } else {
        setPlayer(undefined);
      }
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
      <ControllerToaster position="bottom-right" />
      {import.meta.env.DEV ? (
        <TanStackRouterDevtools position="bottom-left" />
      ) : null}
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
