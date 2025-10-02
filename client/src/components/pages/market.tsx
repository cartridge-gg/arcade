import { TraceabilityScene } from "../scenes/traceability";
import { ItemsScene } from "../scenes/items";
import { HoldersScene } from "../scenes/holders";
import { useCallback, useEffect, useMemo } from "react";
import {
  Button,
  cn,
  TabsContent,
  type TabValue,
  Thumbnail,
  TimesIcon,
  VerifiedIcon,
} from "@cartridge/ui";
import { ArcadeTabs } from "../modules";
import { Link, useRouterState } from "@tanstack/react-router";
import { useProject } from "@/hooks/project";
import { joinPaths } from "@/helpers";
import arcade from "@/assets/arcade-logo.png";
import { useCollection } from "@/hooks/market-collections";
import { useAnalytics } from "@/hooks/useAnalytics";

const TABS_ORDER = ["activity", "items", "holders"] as TabValue[];

export function MarketPage() {
  const { game, edition, tab, collection: collectionAddress } = useProject();
  const { collection } = useCollection(collectionAddress || "", 1);

  const props = useMemo(() => {
    if (!collection || collection.length === 0) return {};
    const token = collection[0];
    return { name: token.name };
  }, [collection]);

  const defaultValue = useMemo(() => {
    if (!TABS_ORDER.includes(tab as TabValue)) return "items";
    return tab;
  }, [tab]);

  const { trackEvent, events } = useAnalytics();

  const { location } = useRouterState();
  const handleClick = useCallback(
    (value: string) => {
      trackEvent(events.MARKETPLACE_TAB_SWITCHED, {
        from_tab: tab || "items",
        to_tab: value,
        marketplace_tab: value,
        collection_address: collectionAddress,
        collection_name: props.name,
      });
      const segments = location.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      if (last === value) return;
      if (TABS_ORDER.includes(last as TabValue)) {
        segments.pop();
      }
      segments.push(value as TabValue);
      const target = joinPaths(...segments);
      window.history.pushState({}, "", target || "/");
    },
    [location.pathname, tab, collectionAddress, props.name, trackEvent, events],
  );

  const closeTarget = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const collectionIndex = segments.lastIndexOf("collection");
    if (collectionIndex !== -1) {
      segments.splice(collectionIndex, 2);
    }
    const last = segments[segments.length - 1];
    if (TABS_ORDER.includes(last as TabValue)) {
      segments.pop();
    }
    segments.push("marketplace");
    return joinPaths(...segments) || "/";
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        window.location.href = closeTarget;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeTarget]);

  return (
    <>
      <div
        className={cn(
          "lg:h-[88px] w-full flex flex-col gap-4 lg:p-6 lg:pb-0 border-b border-background-200 lg:border-none p-4",
        )}
      >
        <div className="flex items-start justify-between">
          <div className={cn("flex gap-4 items-center overflow-hidden")}>
            <Thumbnail
              icon={edition?.properties.icon || game?.properties.icon || arcade}
              size="xl"
              className="min-w-16 min-h-16"
            />
            <div className="flex flex-col gap-2 overflow-hidden items-start">
              <p className="font-semibold text-xl/[24px] text-foreground-100 truncate">
                {props.name}
              </p>
              <div className="flex items-center gap-0.5 bg-background-150 rounded px-1.5 py-1 text-foreground-300">
                <VerifiedIcon size="sm" />
                <p className="text-sm font-normal px-0.5">{game?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex flex-col-reverse lg:flex-row gap-3 top-3 right-3 lg:top-6 lg:right-6">
        <CloseButton closeTarget={closeTarget} />
      </div>
      <ArcadeTabs
        order={TABS_ORDER}
        defaultValue={defaultValue as TabValue}
        onTabClick={(tab: TabValue) => handleClick(tab)}
      >
        <div
          className="flex justify-center gap-8 w-full h-full overflow-y-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="activity"
          >
            <TraceabilityScene />
          </TabsContent>
          <TabsContent className="p-0 mt-0 grow w-full" value="items">
            <ItemsScene />
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full h-full"
            value="holders"
          >
            <HoldersScene />
          </TabsContent>
        </div>
      </ArcadeTabs>
    </>
  );
}

function CloseButton({ closeTarget }: { closeTarget: string }) {
  return (
    <Link to={closeTarget}>
      <Button
        variant="secondary"
        size="icon"
        className="bg-background-200 hover:bg-background-300 h-9 w-9 rounded-full"
      >
        <TimesIcon size="sm" />
      </Button>
    </Link>
  );
}
