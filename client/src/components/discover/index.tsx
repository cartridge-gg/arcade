import { cn, Empty, LayoutContent, Skeleton, TabsContent } from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useArcade } from "@/hooks/arcade";
import { EditionModel, GameModel } from "@cartridge/arcade";
import { Connect } from "../errors";
import { getChecksumAddress } from "starknet";
import { ArcadeDiscoveryGroup } from "../modules/discovery-group";
import { useNavigate, useLocation } from "react-router-dom";
import ArcadeSubTabs from "../modules/sub-tabs";
import { useAccount } from "@starknet-react/core";
import { UserAvatar } from "../user/avatar";
import { useDiscovers } from "@/hooks/discovers";
import { joinPaths } from "@/helpers";
import { useDevice } from "@/hooks/device";
import { useDiscoversFetcher } from "@/hooks/discovers-fetcher";
import { useAchievements } from "@/hooks/achievements";
import { useVirtualizer } from "@tanstack/react-virtual";

const ROW_HEIGHT = 44;

type Event = {
  identifier: string;
  name: string;
  address: string;
  Icon: React.ReactNode;
  duration: number;
  count: number;
  actions: string[];
  achievements: {
    title: string;
    icon: string;
    points: number;
  }[];
  timestamp: number;
  logo: string | undefined;
  color: string;
  onClick: () => void;
};

type Events = {
  all: Event[];
  following: Event[];
};

export function Discover({ edition }: { edition?: EditionModel }) {
  const [events, setEvents] = useState<Events>({
    all: [],
    following: [],
  });
  const [processedIdentifiers, setProcessedIdentifiers] = useState<Set<string>>(
    new Set()
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const allTabRef = useRef<HTMLDivElement>(null);
  const followingTabRef = useRef<HTMLDivElement>(null);

  const { isConnected, address } = useAccount();
  const {
    // playthroughs,
    usernames: activitiesUsernames,
    status: activitiesStatus,
  } = useDiscovers();

  const { games, editions, follows } = useArcade();

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

  const { playthroughs } = useDiscoversFetcher({ projects, achievements })

  const following = useMemo(() => {
    if (!address) return [];
    const addresses = follows[getChecksumAddress(address)] || [];
    if (addresses.length === 0) return [];
    return [...addresses, getChecksumAddress(address)];
  }, [follows, address]);


  const location = useLocation();
  const navigate = useNavigate();
  const handleClick = useCallback(
    (game: GameModel, edition: EditionModel, nameOrAddress: string) => {
      // If there are several games displayed, then clicking a card link to the game
      let pathname = location.pathname;
      if (filteredEditions.length > 1) {
        pathname = pathname.replace(/\/game\/[^/]+/, "");
        pathname = pathname.replace(/\/edition\/[^/]+/, "");
        const gameName = `${game?.name.toLowerCase().replace(/ /g, "-") || game.id}`;
        const editionName = `${edition?.name.toLowerCase().replace(/ /g, "-") || edition.id}`;
        if (game.id !== 0) {
          pathname = joinPaths(
            `/game/${gameName}/edition/${editionName}`,
            pathname,
          );
        }
        navigate(pathname || "/");
        return;
      }
      // Otherwise it links to the player
      pathname = pathname.replace(/\/player\/[^/]+/, "");
      pathname = pathname.replace(/\/tab\/[^/]+/, "");
      const player = nameOrAddress.toLowerCase();
      pathname = joinPaths(pathname, `/player/${player}/tab/activity`);
      navigate(pathname || "/");
    },
    [navigate, filteredEditions],
  );

  useEffect(() => {
    // Reset the events if the edition changes, meaning the user has clicked on a new game edition
    setEvents({
      all: [],
      following: [],
    });
    setProcessedIdentifiers(new Set());
  }, [edition]);

  useEffect(() => {
    if (!filteredEditions) return;
    if (!Object.entries(playthroughs)) return;
    if (!Object.entries(activitiesUsernames)) return;

    // Process only new events that haven't been seen before
    const newData = filteredEditions
      .flatMap((edition) => {
        return (
          playthroughs[edition?.config.project]
            ?.filter((activity) => !processedIdentifiers.has(activity.identifier))
            ?.map((activity) => {
              const username =
                activitiesUsernames[getChecksumAddress(activity.callerAddress)];
              if (!username) return null;
              const game = games.find((game) => game.id === edition.gameId);
              if (!game) return null;
              return {
                identifier: activity.identifier,
                project: activity.project,
                name: username,
                address: getChecksumAddress(activity.callerAddress),
                Icon: <UserAvatar username={username} size="sm" />,
                duration: activity.end - activity.start,
                count: activity.count,
                actions: activity.actions,
                achievements: [...activity.achievements],
                timestamp: Math.floor(activity.end / 1000),
                logo: edition.properties.icon,
                color: edition.color,
                onClick: () =>
                  handleClick(
                    game,
                    edition,
                    username || getChecksumAddress(activity.callerAddress),
                  ),
              };
            })
            .filter(
              (item): item is NonNullable<typeof item> => item !== null,
            ) || []
        );
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (newData.length === 0) return;

    // Update processed identifiers
    const newIdentifiers = new Set(processedIdentifiers);
    newData.forEach(event => newIdentifiers.add(event.identifier));
    setProcessedIdentifiers(newIdentifiers);

    // Merge new events with existing ones and sort
    setEvents(prevEvents => {
      const mergedAll = [...prevEvents.all, ...newData]
        .sort((a, b) => b.timestamp - a.timestamp);
      const mergedFollowing = mergedAll.filter((event) =>
        following.includes(event.address)
      );

      return {
        all: mergedAll,
        following: mergedFollowing,
      };
    });
  }, [
    playthroughs,
    filteredEditions,
    activitiesUsernames,
    following,
    handleClick,
  ]);

  // Virtual scrolling for all events
  const allVirtualizer = useVirtualizer({
    count: events.all.length,
    getScrollElement: () => allTabRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  // Virtual scrolling for following events
  const followingVirtualizer = useVirtualizer({
    count: events.following.length,
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
              {activitiesStatus === "loading" && events.all.length === 0 ? (
                <LoadingState />
              ) : activitiesStatus === "error" || events.all.length === 0 ? (
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
                          events={[events.all[virtualItem.index]]}
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
            <TabsContent className="p-0 mt-0 grow w-full h-full" value="following">
              {!isConnected ? (
                <Connect className={cn(isMobile && "pb-3")} />
              ) : activitiesStatus === "error" ||
                following.length === 0 ||
                events.following.length === 0 ? (
                <EmptyState className={cn(isMobile && "pb-3")} />
              ) : activitiesStatus === "loading" &&
                events.following.length === 0 ? (
                <LoadingState />
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
                    {followingVirtualizer.getVirtualItems().map((virtualItem) => (
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
                          events={[events.following[virtualItem.index]]}
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
          </div>
        </ArcadeSubTabs>
      </div>
    </LayoutContent>
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
