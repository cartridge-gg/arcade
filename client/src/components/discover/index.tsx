import { Empty, LayoutContent, Skeleton, TabsContent } from "@cartridge/ui";
import { useMemo, useRef } from "react";
import { EditionModel, GameModel } from "@cartridge/arcade";
import { Connect } from "../errors";
import { constants, getChecksumAddress } from "starknet";
import { ArcadeDiscoveryGroup } from "../modules/discovery-group";
import { ArcadeDiscoveryEventProps } from "../modules/discovery-event";
import ArcadeSubTabs from "../modules/sub-tabs";
import { useAccount } from "@starknet-react/core";
import { UserAvatar } from "../user/avatar";
import { usePathBuilder } from "@/hooks/path-builder";
import { usePlaythroughsQuery } from "@/queries/discovery";
import {
  useEditionsQuery,
  useFollowsQuery,
  useGamesQuery,
} from "@/queries/games";
import { useAccounts, useDiscovers, usePlaythroughs, useProgressions, useTrophies } from "@/collections";
import { useEditions } from "@/collections/arcade";


export function Discover({ edition }: { edition?: EditionModel }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const { isConnected, address } = useAccount();

  // const { data: gamesRaw = [] } = useGamesQuery(
  //   constants.StarknetChainId.SN_MAIN,
  // );
  // const ppp = usePlaythroughs();
  //
  // const games = useMemo(() => {
  //   return new Map(gamesRaw.map((g) => [g.id, g]));
  // }, [gamesRaw]);
  // const { data: editions = [] } = useEditionsQuery(
  //   constants.StarknetChainId.SN_MAIN,
  // );
  // console.log(testG, editions, gamesRaw);
  // const projects = useMemo(
  //   () => editions.map((e) => ({ project: e.config.project, limit: 1000 })),
  //   [editions],
  // );

  // const {
  //   data: playthroughs = {},
  //   usernames: activitiesUsernames = {},
  //   status: activitiesStatus,
  // } = usePlaythroughsQuery(projects, 1000);

  const editions = useEditions();

  const filteredEditions = useMemo(() => {
    return !edition ? editions : [edition];
  }, [editions, edition]);

  const { data: followsData = [], isLoading: followsLoading } = useFollowsQuery(
    address || "",
  );

  // Transform Follow[] to { [playerId: string]: string[] }
  const follows = useMemo(() => {
    const followsMap: { [playerId: string]: string[] } = {};
    followsData.forEach((follow) => {
      const follower = getChecksumAddress(
        follow.followerAddress || follow.follower,
      );
      const followed = getChecksumAddress(
        follow.followeeAddress || follow.followed,
      );
      if (!followsMap[follower]) {
        followsMap[follower] = [];
      }
      followsMap[follower].push(followed);
    });
    return followsMap;
  }, [followsData]);

  // // subscribe to playthroughs collection
  // const _ = usePlaythroughs();
  const { all: allEvents, following: followingEvents, status: discoversStatus } = useDiscovers();

  return (
    <LayoutContent className="h-full overflow-clip select-none p-0">
      <div
        className="p-0 pt-3 lg:pt-0 my-3 lg:my-6 mt-0 rounded h-full overflow-y-scroll"

        style={{ scrollbarWidth: "none" }}
      >
        <ArcadeSubTabs tabs={["all", "following"]} className="mb-3 lg:mb-4">
          <div
            ref={parentRef}
            className="flex justify-center gap-8 w-full overflow-y-scroll"
          >
            <TabsContent className="p-0 mt-0 grow w-full" value="all">
              {discoversStatus === "loading" && allEvents.length === 0 ? (
                <LoadingState />
              ) : discoversStatus === "error" || allEvents.length === 0 ? (
                <EmptyState />
              ) : (
                <ArcadeDiscoveryGroup
                  events={allEvents.slice(0, 50)}
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
              ) : (discoversStatus === "loading" || followsLoading) &&
                followingEvents.length === 0 ? (
                <LoadingState />
              ) : discoversStatus === "error" ||
                followingEvents.length === 0 ? (
                <EmptyState />
              ) : (
                <ArcadeDiscoveryGroup
                  events={followingEvents.slice(0, 50)}
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
