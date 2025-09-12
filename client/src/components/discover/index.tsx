import { Empty, LayoutContent, Skeleton, TabsContent } from "@cartridge/ui";
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

const DEFAULT_CAP = 30;
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

  const [cap, setCap] = useState(DEFAULT_CAP);
  const parentRef = useRef<HTMLDivElement>(null);

  const { isConnected, address } = useAccount();
  const {
    playthroughs,
    usernames: activitiesUsernames,
    status: activitiesStatus,
  } = useDiscovers();
  const { games, editions, follows } = useArcade();

  const following = useMemo(() => {
    if (!address) return [];
    const addresses = follows[getChecksumAddress(address)] || [];
    if (addresses.length === 0) return [];
    return [...addresses, getChecksumAddress(address)];
  }, [follows, address]);

  const filteredEditions = useMemo(() => {
    return !edition ? editions : [edition];
  }, [editions, edition]);

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
  }, [edition]);

  useEffect(() => {
    if (!filteredEditions) return;
    if (!Object.entries(playthroughs)) return;
    if (!Object.entries(activitiesUsernames)) return;
    const data = filteredEditions
      .flatMap((edition) => {
        return (
          playthroughs[edition?.config.project]
            ?.map((activity) => {
              const username =
                activitiesUsernames[getChecksumAddress(activity.callerAddress)];
              if (!username) return null;
              const game = games.find((game) => game.id === edition.gameId);
              if (!game) return null;
              return {
                identifier: activity.identifier,
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
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
    if (!data) return;
    const newEvents: Events = {
      all: data,
      following: data.filter((event) => following.includes(event.address)),
    };
    if (newEvents.all.length === 0) return;
    setEvents(newEvents);
  }, [
    playthroughs,
    filteredEditions,
    activitiesUsernames,
    following,
    handleClick,
  ]);

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
              ) : activitiesStatus === "error" ||
                following.length === 0 ||
                events.following.length === 0 ? (
                <EmptyState />
              ) : activitiesStatus === "loading" &&
                events.following.length === 0 ? (
                <LoadingState />
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
