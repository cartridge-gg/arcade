import { cn, Empty, LayoutContent, Skeleton, TabsContent } from "@cartridge/ui";
import { useEffect, useMemo, useRef } from "react";
import { useArcade } from "@/hooks/arcade";
import { EditionModel } from "@cartridge/arcade";
import { Connect } from "../errors";
import { ArcadeDiscoveryGroup } from "../modules/discovery-group";
import ArcadeSubTabs from "../modules/sub-tabs";
import { useAccount } from "@starknet-react/core";
import { UserAvatar } from "../user/avatar";
import { useDiscoversFetcher } from "@/hooks/discovers-fetcher";
import { useAchievements } from "@/hooks/achievements";
import { useVirtualizer } from "@tanstack/react-virtual";
import { getChecksumAddress } from "starknet";
import { useDevice } from "@/hooks/device";
import { FloatingLoadingSpinner } from "@/components/ui/floating-loading-spinner";

const ROW_HEIGHT = 45;

export function Discover({ edition }: { edition?: EditionModel }) {

  const parentRef = useRef<HTMLDivElement>(null);
  const allTabRef = useRef<HTMLDivElement>(null);
  const followingTabRef = useRef<HTMLDivElement>(null);

  const { address, isConnected } = useAccount();
  const isMobile = useDevice();

  const { editions, follows } = useArcade();

  const projects = useMemo(() => {
    return editions.map((edition) => {
      return {
        project: edition.config.project,
        limit: 10000,
      };
    });
  }, [editions]);
  const { events: achievements } = useAchievements();

  const filteredEditions = useMemo(() => {
    return !edition ? editions : [edition];
  }, [editions, edition]);

  const {
    events: { all, following },
    status: activitiesStatus,
    loadingProgress,
  } = useDiscoversFetcher({
    projects,
    achievements,
    editionFilter: filteredEditions.map((e) => e.config.project),
    follows: follows[getChecksumAddress(address ?? "0x0")] || []
  });


  // Virtual scrolling for all events
  const allVirtualizer = useVirtualizer({
    count: all.length,
    getScrollElement: () => allTabRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  // Virtual scrolling for following events
  const followingVirtualizer = useVirtualizer({
    count: following.length,
    getScrollElement: () => followingTabRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  useEffect(() => {
    // Reset scroll on filter change
    if (allTabRef.current) {
      allTabRef.current.scrollTop = 0;
    }
    if (followingTabRef.current) {
      followingTabRef.current.scrollTop = 0;
    }
  }, [edition]);

  return (
    <LayoutContent className="select-none h-full overflow-clip p-0">
      <div
        className="p-0 pt-3 lg:pt-0 my-0 lg:my-6 mt-0 h-full overflow-hidden rounded"
        style={{ scrollbarWidth: "none" }}
      >
        <ArcadeSubTabs tabs={["all", "following"]} className="mb-3 lg:mb-4">
          <div
            ref={parentRef}
            className="flex justify-center gap-8 w-full h-full"
          >
            <TabsContent className="p-0 mt-0 grow w-full h-full" value="all">
              {activitiesStatus === "loading" && all.length === 0 ? (
                <LoadingState />
              ) : activitiesStatus === "error" && all.length === 0 ? (
                <EmptyState className={cn(isMobile && "pb-3")} />
              ) : (
                <div
                  ref={allTabRef}
                  className="h-full overflow-y-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  <div
                    style={{
                      height: `${allVirtualizer.getTotalSize()}px`,
                      position: "relative",
                    }}
                  >
                    {allVirtualizer.getVirtualItems().map((virtualItem) => (
                      <div
                        key={virtualItem.key}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <ArcadeDiscoveryGroup
                          events={[
                            {
                              ...all[virtualItem.index],
                              Icon: (
                                <UserAvatar
                                  username={all[virtualItem.index].name}
                                  size="sm"
                                />
                              ),
                            },
                          ]}
                          rounded
                          identifier={
                            filteredEditions.length === 1
                              ? filteredEditions[0].id
                              : undefined
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
              }
            </TabsContent >
            <TabsContent
              className="p-0 mt-0 grow w-full h-full"
              value="following"
            >
              {!isConnected ? (
                <Connect className={cn(isMobile && "pb-3")} />
              ) : activitiesStatus === "loading" && following.length === 0 ? (
                <LoadingState />
              ) : activitiesStatus === "error" || following.length === 0 ? (
                <EmptyState className={cn(isMobile && "pb-3")} />
              ) : (
                <div
                  ref={followingTabRef}
                  className="h-full overflow-y-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  <div
                    style={{
                      height: `${followingVirtualizer.getTotalSize()}px`,
                      position: "relative",
                    }}
                  >
                    {followingVirtualizer
                      .getVirtualItems()
                      .map((virtualItem) => (
                        <div
                          key={virtualItem.key}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <ArcadeDiscoveryGroup
                            events={[
                              {
                                ...following[virtualItem.index],
                                Icon: (
                                  <UserAvatar
                                    username={following[virtualItem.index].name}
                                    size="sm"
                                  />
                                ),
                              },
                            ]}
                            rounded
                            identifier={
                              filteredEditions.length === 1
                                ? filteredEditions[0].id
                                : undefined
                            }
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </div >
        </ArcadeSubTabs >
      </div >
      <FloatingLoadingSpinner
        isLoading={activitiesStatus === "loading" && (all.length > 0 || following.length > 0)}
        loadingProgress={loadingProgress}
      />
    </LayoutContent >
  );
}

const LoadingState = () => {
  return (
    <div className="flex flex-col gap-y-px overflow-hidden h-full">
      {Array.from({ length: 20 }).map((_, index) => (
        <Skeleton key={index} className="min-h-11 w-full" />
      ))}
    </div>
  );
};

const EmptyState = ({ className }: { className?: string }) => {
  return (
    <Empty
      title="It feels lonely in here"
      icon="discover"
      className={cn("h-full", className)}
    />
  );
};
