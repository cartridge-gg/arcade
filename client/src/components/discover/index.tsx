import { LayoutContent, TabsContent } from "@cartridge/ui-next";
import { useCallback, useMemo } from "react";
import { useArcade } from "@/hooks/arcade";
import { EditionModel } from "@bal7hazar/arcade-sdk";
import { useAchievements } from "@/hooks/achievements";
import banner from "@/assets/banner.png";
import {
  Connect,
  DiscoverEmpty,
  DiscoverError,
  DiscoverLoading,
} from "../errors";
import { addAddressPadding, getChecksumAddress } from "starknet";
import { ArcadeDiscoveryGroup } from "../modules/discovery-group";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArcadeSubTabs, { SubTabValue } from "../modules/sub-tabs";
import { useAccount } from "@starknet-react/core";
import { useActivities } from "@/hooks/activities";
import { UserAvatar } from "../user/avatar";

interface Event {
  name: string;
  data: { title: string; label: string; icon: string };
  timestamp: number;
  onClick: () => void;
}

export function Discover({ edition }: { edition?: EditionModel }) {
  const [searchParams] = useSearchParams();
  const { isConnected, address } = useAccount();
  const {
    aggregatedActivities,
    usernames: activitiesUsernames,
    status: activitiesStatus,
  } = useActivities();
  const {
    events,
    usernames: achievementsUsernames,
    isLoading,
    isError,
  } = useAchievements();
  const { editions, follows } = useArcade();

  const following = useMemo(() => {
    if (!address) return [];
    const addresses = follows[getChecksumAddress(address)] || [];
    if (addresses.length === 0) return [];
    return [...addresses, getChecksumAddress(address)];
  }, [follows, address]);

  const filteredEditions = useMemo(() => {
    return !edition ? editions : [edition];
  }, [editions, edition]);

  const navigate = useNavigate();
  const handleClick = useCallback(
    (address: string) => {
      // On click, we update the url param address to the address of the player
      const url = new URL(window.location.href);
      url.searchParams.set("address", address);
      url.searchParams.set("playerTab", "activity");
      navigate(url.toString().replace(window.location.origin, ""));
    },
    [navigate],
  );

  const defaultValue = useMemo(() => {
    // Default tab is ignored if there is no address,
    // meanning the user is not connected and doesnt inspect another user
    return searchParams.get("subTab") || "all";
  }, [searchParams]);

  const handleTabClick = useCallback(
    (value: string) => {
      // Clicking on a tab updates the url param tab to the value of the tab
      // So the tab is persisted in the url and the user can update and share the url
      const url = new URL(window.location.href);
      url.searchParams.set("subTab", value);
      navigate(url.toString().replace(window.location.origin, ""));
    },
    [navigate],
  );

  const editionEvents = useMemo(() => {
    return filteredEditions.map((edition) => {
      const achievements =
        events[edition?.config.project]?.map((event) => {
          const username =
            achievementsUsernames[addAddressPadding(event.player)];
          return {
            name: username,
            address: getChecksumAddress(event.player),
            Icon: <UserAvatar username={username} />,
            data: {
              title: event.achievement.title,
              label: "earned",
              icon: event.achievement.icon,
            },
            timestamp: event.timestamp,
            onClick: () => handleClick(addAddressPadding(event.player)),
          };
        }) || [];
      const activities =
        aggregatedActivities[edition?.config.project]?.map((activity) => {
          const username =
            activitiesUsernames[addAddressPadding(activity.callerAddress)];
          const count = activity.count;
          return {
            name: username,
            address: getChecksumAddress(activity.callerAddress),
            Icon: <UserAvatar username={username} size="sm" />,
            data: {
              title: count > 1 ? `${count} Actions` : activity.entrypoint,
              label: "performed",
              icon: count > 1 ? "fa-layer-group" : "fa-joystick",
            },
            timestamp: Math.floor(activity.timestamp / 1000),
            onClick: () =>
              handleClick(addAddressPadding(activity.callerAddress)),
          };
        }) || [];
      const data = [...achievements, ...activities].sort(
        (a, b) => b.timestamp - a.timestamp,
      );
      if (!data) return { all: [], following: [] };
      if (filteredEditions.length > 1) {
        return {
          all: data.slice(0, 3),
          following: data
            .filter((event) => following.includes(event.address))
            .slice(0, 3),
        };
      }
      return {
        all: data.slice(0, 100),
        following: data
          .filter((event) => following.includes(event.address))
          .slice(0, 100),
      };
    });
  }, [
    events,
    aggregatedActivities,
    filteredEditions,
    achievementsUsernames,
    activitiesUsernames,
    following,
    handleClick,
  ]);

  if (isError || activitiesStatus === "error") return <DiscoverError />;

  if (isLoading && activitiesStatus === "loading") return <DiscoverLoading />;

  return (
    <LayoutContent className="select-none h-full overflow-clip p-0">
      <div
        className="p-0 pt-3 lg:pt-6 mt-0 h-full overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        <ArcadeSubTabs
          tabs={["all", "following"]}
          defaultValue={defaultValue as SubTabValue}
          onTabClick={(tab: SubTabValue) => handleTabClick(tab)}
          className="mb-3 lg:mb-4"
        >
          <div
            className="flex justify-center gap-8 w-full h-full overflow-y-scroll"
            style={{ scrollbarWidth: "none" }}
          >
            <TabsContent className="p-0 mt-0 grow w-full" value="all">
              {filteredEditions.length === 1 &&
              editionEvents.length > 0 &&
              editionEvents[0].all.length === 0 ? (
                <DiscoverEmpty />
              ) : (
                <div className="flex flex-col gap-y-4 pb-3 lg:pb-6">
                  {filteredEditions.map((item, index) => (
                    <GameRow
                      key={`${index}-${item.config.project}`}
                      edition={filteredEditions.length > 1 ? item : undefined}
                      events={editionEvents[index].all}
                      covered={filteredEditions.length > 1}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent className="pb-0 mt-0 grow w-full" value="following">
              {!isConnected ? (
                <Connect />
              ) : following.length === 0 ||
                (filteredEditions.length === 1 &&
                  editionEvents.length > 0 &&
                  editionEvents[0].following.length === 0) ? (
                <DiscoverEmpty />
              ) : (
                <div className="flex flex-col gap-y-4 pb-6">
                  {filteredEditions.map((item, index) => (
                    <GameRow
                      key={`${index}-${item.config.project}`}
                      edition={filteredEditions.length > 1 ? item : undefined}
                      events={editionEvents[index].following}
                      covered={filteredEditions.length > 1}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </ArcadeSubTabs>
      </div>
    </LayoutContent>
  );
}

export function GameRow({
  edition,
  events,
  covered,
}: {
  edition: EditionModel | undefined;
  events: Event[];
  covered: boolean;
}) {
  const { games } = useArcade();
  const game = useMemo(() => {
    return games.find((game) => game.id === edition?.gameId);
  }, [games, edition]);

  const navigate = useNavigate();
  const editionData = useMemo(() => {
    if (!edition) return undefined;
    return {
      metadata: {
        name: game?.name ? `${game.name} - ${edition.name}` : edition.name,
        logo: edition.properties.icon,
        cover: covered
          ? game?.properties.banner || edition.properties.banner || banner
          : banner,
      },
      socials: {},
      onClick: () => {
        const url = new URL(window.location.href);
        if (game) url.searchParams.set("game", game.id.toString());
        url.searchParams.set("edition", edition.id.toString());
        navigate(url.toString().replace(window.location.origin, ""));
      },
    };
  }, [game, edition, covered, navigate]);

  if (events.length === 0) return null;

  return (
    <ArcadeDiscoveryGroup
      game={editionData}
      events={events}
      color={edition?.color}
      rounded
    />
  );
}
