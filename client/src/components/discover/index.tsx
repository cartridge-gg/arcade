import { Empty, LayoutContent, Skeleton, TabsContent } from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditionModel, GameModel } from "@cartridge/arcade";
import { Connect } from "../errors";
import { constants, getChecksumAddress } from "starknet";
import { ArcadeDiscoveryGroup } from "../modules/discovery-group";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import ArcadeSubTabs from "../modules/sub-tabs";
import { useAccount } from "@starknet-react/core";
import { UserAvatar } from "../user/avatar";
import { joinPaths } from "@/helpers";
import { usePlaythroughsQuery } from "@/queries/discovery";
import { useEditionsQuery, useFollowsQuery, useGamesQuery } from "@/queries/games";

const DEFAULT_CAP = 30;
const ROW_HEIGHT = 44;

export function Discover({ edition }: { edition?: EditionModel }) {

  const [cap, setCap] = useState(DEFAULT_CAP);
  const parentRef = useRef<HTMLDivElement>(null);

  const { isConnected, address } = useAccount();

  // Using suspense queries - data is guaranteed to be available
  const { data: gamesRaw = [] } = useGamesQuery(constants.StarknetChainId.SN_MAIN);
  // Ordering games for a faster access
  const games = useMemo(() => {
    return new Map(gamesRaw.map(g => [g.id, g]));
  }, [gamesRaw])
  const { data: editions = [] } = useEditionsQuery(constants.StarknetChainId.SN_MAIN);
  const projects = useMemo(() =>
    editions.map(e => ({ project: e.config.project, limit: 1000 })), [editions]);

  const { data: playthroughs = {}, usernames: activitiesUsernames = {}, status: activitiesStatus } = usePlaythroughsQuery(projects, 1000);

  // Get unique player addresses from playthroughs
  // const playerAddresses = useMemo(() => {
  //   const addresses = new Set<string>();
  //   playthroughs?.items?.forEach(item => {
  //     item.playthroughs.forEach(session => {
  //       addresses.add(session.callerAddress);
  //     });
  //   });
  //   return Array.from(addresses);
  // }, [playthroughs]);

  // const { data: usernames } = useAccountNamesQuery(playerAddresses);
  const { data: followsData = [], isLoading: followsLoading } = useFollowsQuery(address || '');

  // Transform Follow[] to { [playerId: string]: string[] }
  const follows = useMemo(() => {
    const followsMap: { [playerId: string]: string[] } = {};
    followsData.forEach((follow: any) => {
      const follower = getChecksumAddress(follow.followerAddress || follow.follower);
      const followed = getChecksumAddress(follow.followeeAddress || follow.followed);
      if (!followsMap[follower]) {
        followsMap[follower] = [];
      }
      followsMap[follower].push(followed);
    });
    return followsMap;
  }, [followsData]);

  // Memoize checksum computation
  const checksumAddress = useMemo(() => {
    return address ? getChecksumAddress(address) : null;
  }, [address]);

  // Convert following to Set for O(1) lookups
  const followingSet = useMemo(() => {
    if (!checksumAddress) return new Set<string>();
    const addresses = follows[checksumAddress] || [];
    if (addresses.length === 0) return new Set<string>();
    return new Set([...addresses, checksumAddress]);
  }, [follows, checksumAddress]);

  const filteredEditions = useMemo(() => {
    return !edition ? editions : [edition];
  }, [editions, edition]);

  const routerState = useRouterState();
  const location = { pathname: routerState.location.pathname };
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
        navigate({ to: pathname || "/" });
        return;
      }
      // Otherwise it links to the player
      pathname = pathname.replace(/\/player\/[^/]+/, "");
      pathname = pathname.replace(/\/tab\/[^/]+/, "");
      const player = nameOrAddress.toLowerCase();
      pathname = joinPaths(pathname, `/player/${player}/tab/activity`);
      navigate({ to: pathname || "/" });
    },
    [navigate, filteredEditions],
  );

  // Cache checksum addresses to avoid repeated computation
  const addressChecksumCache = useMemo(() => {
    const cache = new Map<string, string>();
    // Pre-compute checksums for all known addresses
    Object.values(playthroughs).forEach(activities => {
      activities?.forEach(activity => {
        if (!cache.has(activity.callerAddress)) {
          cache.set(activity.callerAddress, getChecksumAddress(activity.callerAddress));
        }
      });
    });
    return cache;
  }, [playthroughs]);

  // Compute raw events without sorting first
  const rawEvents = useMemo(() => {
    const events: any[] = [];

    for (const edition of filteredEditions) {
      const activities = playthroughs[edition?.config.project];
      if (!activities) continue;

      const game = games.get(edition.gameId);
      if (!game) continue;

      for (const activity of activities) {
        const checksumAddr = addressChecksumCache.get(activity.callerAddress) ||
          getChecksumAddress(activity.callerAddress);
        const username = activitiesUsernames[checksumAddr];

        events.push({
          identifier: activity.identifier,
          name: username,
          address: checksumAddr,
          Icon: <UserAvatar username={username ?? activity.callerAddress} size="sm" />,
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
              username || checksumAddr,
            ),
        });
      }
    }

    return events;
  }, [activitiesUsernames, addressChecksumCache, filteredEditions, games, handleClick, playthroughs]);

  // Sort events separately
  const sortedEvents = useMemo(() => {
    return [...rawEvents].sort((a, b) => b.timestamp - a.timestamp);
  }, [rawEvents]);

  // Filter following events using Set for O(1) lookups
  const events = useMemo(() => {
    const data = filteredEditions
      .flatMap((edition) => {
        return (
          playthroughs[edition?.config.project]
            ?.map((activity) => {
              const username =
                activitiesUsernames[getChecksumAddress(activity.callerAddress)];
              const game = games.get(edition.gameId);
              if (!game) return null;
              return {
                identifier: activity.identifier,
                name: username,
                address: getChecksumAddress(activity.callerAddress),
                Icon: <UserAvatar username={username ?? activity.callerAddress} size="sm" />,
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
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
    const followingEvents = followingSet.size > 0
      ? sortedEvents.filter(event => followingSet.has(event.address))
      : [];

    return {
      all: sortedEvents,
      following: followingEvents,
    };
  }, [sortedEvents, followingSet])

  const handleScroll = useCallback(() => {
    const parent = parentRef.current;
    if (!parent) return;
    const height = parent.clientHeight;
    const newCap = Math.ceil((height + parent.scrollTop) / ROW_HEIGHT);
    if (newCap < cap) return;
    setCap(newCap + 5);
  }, [parentRef, cap, setCap]);

  useEffect(() => {
    const parent = parentRef.current;
    if (parent) {
      parent.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (parent) {
        parent.removeEventListener("scroll", handleScroll);
      }
    };
  }, [cap, parentRef, handleScroll]);

  useEffect(() => {
    // Reset scroll and cap on filter change
    const parent = parentRef.current;
    if (!parent) return;
    parent.scrollTop = 0;
    const height = parent.clientHeight;
    const cap = Math.ceil(height / ROW_HEIGHT);
    setCap(cap + 5);
  }, [parentRef, edition, setCap]);

  return (
    <LayoutContent className="select-none h-full overflow-clip p-0">
      <div
        className="p-0 pt-3 lg:pt-0 my-3 lg:my-6 mt-0 h-full overflow-hidden rounded"
        style={{ scrollbarWidth: "none" }}
      >
        <ArcadeSubTabs tabs={["all", "following"]} className="mb-3 lg:mb-4">
          <div
            ref={parentRef}
            className="flex justify-center gap-8 w-full h-full overflow-y-scroll"
            style={{ scrollbarWidth: "none" }}
          >
            <TabsContent className="p-0 mt-0 grow w-full" value="all">
              {activitiesStatus === "loading" && events.all.length === 0 ? (
                <LoadingState />
              ) : activitiesStatus === "error" || events.all.length === 0 ? (
                <EmptyState />
              ) : (
                <ArcadeDiscoveryGroup
                  events={events.all.slice(0, cap)}
                  rounded
                  identifier={
                    filteredEditions.length === 1
                      ? filteredEditions[0].id
                      : undefined
                  }
                />
              )}
            </TabsContent>
            <TabsContent className="p-0 mt-0 grow w-full" value="following">
              {!isConnected ? (
                <Connect />
              ) : (activitiesStatus === "loading" || followsLoading) &&
                events.following.length === 0 ? (
                <LoadingState />
              ) : activitiesStatus === "error" ||
                followingSet.size === 0 ||
                events.following.length === 0 ? (
                <EmptyState />
              ) : (
                <ArcadeDiscoveryGroup
                  events={events.following.slice(0, cap)}
                  rounded
                  identifier={
                    filteredEditions.length === 1
                      ? filteredEditions[0].id
                      : undefined
                  }
                />
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

const EmptyState = () => {
  return (
    <Empty title="It feels lonely in here" icon="discover" className="h-full" />
  );
};
