import { useAchievements } from "@/hooks/achievements";
import { useActivities } from "@/hooks/activities";
import {
  ActivityCollectibleCard,
  ActivityGameCard,
  ActivityTokenCard,
  LayoutContent,
} from "@cartridge/ui-next";
import { useCallback, useMemo } from "react";
import { ActivityEmpty, ActivityError, ActivityLoading } from "../errors";
import { useArcade } from "@/hooks/arcade";
import { useProject } from "@/hooks/project";
import { useAddress } from "@/hooks/address";
import ActivityAchievementCard from "../modules/achievement-card";
import { Link } from "react-router-dom";
import { VoyagerUrl } from "@cartridge/utils";
import { constants } from "starknet";

interface CardProps {
  variant: "token" | "collectible" | "game" | "achievement";
  key: string;
  transactionHash: string;
  chainId: constants.StarknetChainId;
  amount: string;
  address: string;
  value: string;
  name: string;
  collection: string;
  image: string;
  title: string;
  website: string;
  certified: boolean;
  action: "send" | "receive" | "mint";
  timestamp: number;
  date: string;
  points: number;
  color?: string;
}

export function Activity() {
  const { address } = useAddress();
  const { project } = useProject();
  const { editions } = useArcade();
  const { events } = useAchievements();
  const { playerActivities: activities, status: activitiesStatus } =
    useActivities();

  const to = useCallback((transactionHash: string) => {
    return VoyagerUrl(constants.StarknetChainId.SN_MAIN).transaction(
      transactionHash,
    );
  }, []);

  const gameEvents = useMemo(() => {
    if (!project) return Object.values(events).flatMap((event) => event);
    return events[project] || [];
  }, [project, events]);

  const getDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (
      date.toDateString() ===
      new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString()
    ) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }, []);

  const getChainId = useCallback((rpc: string | undefined) => {
    if (!rpc) return undefined;
    if (rpc.includes("mainnet")) {
      return constants.StarknetChainId.SN_MAIN;
    } else if (rpc.includes("testnet") || rpc.includes("sepolia")) {
      return constants.StarknetChainId.SN_SEPOLIA;
    }
    return undefined;
  }, []);

  const { data, dates } = useMemo(() => {
    const dates: string[] = [];

    const actions: CardProps[] = (activities || []).map((activity) => {
      const date = getDate(activity.timestamp);
      if (!dates.includes(date)) {
        dates.push(date);
      }
      const title = activity.entrypoint;
      const edition = editions.find(
        (edition) => edition.config.project === activity.project,
      );
      const chainId = getChainId(edition?.config.rpc);
      return {
        variant: "game",
        key: `${activity.entrypoint}-${activity.transactionHash}`,
        transactionHash: activity.transactionHash,
        chainId: chainId,
        title: title.replace("_", " "),
        image: edition?.properties.icon || "",
        website: edition?.socials.website || "",
        certified: !!edition,
        timestamp: activity.timestamp / 1000,
        date: date,
        color: edition?.color,
      } as CardProps;
    });

    const achievements: CardProps[] = Object.keys(events).flatMap((gameKey) => {
      if (project !== gameKey && !!project) return [];
      const gameEvents = events[gameKey].filter(
        (event) => BigInt(event.player) === BigInt(address),
      );
      return gameEvents.map((event) => {
        const date = getDate(event.timestamp * 1000);
        if (!dates.includes(date)) {
          dates.push(date);
        }
        const edition = editions.find(
          (edition) => edition.config.project === gameKey,
        );
        return {
          variant: "achievement",
          transactionHash: "",
          title: event.achievement.title,
          image: event.achievement.icon,
          timestamp: event.timestamp,
          date: date,
          website: edition?.socials.website || "",
          certified: !!edition,
          points: event.achievement.points,
          color: edition?.color,
        } as CardProps;
      });
    });

    const sortedDates = dates.sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    );
    const uniqueDates = [...new Set(sortedDates)];
    return {
      dates: uniqueDates,
      data: [...actions, ...achievements].sort(
        (a, b) => b.timestamp - a.timestamp,
      ),
    };
  }, [activities, gameEvents, address, editions, getDate]);

  switch (activitiesStatus) {
    case "loading": {
      return <ActivityLoading />;
    }
    case "success": {
      return (
        <LayoutContent className="gap-y-6 select-none h-full overflow-y-scroll p-0 py-3 lg:py-6">
          {dates.length > 0 ? (
            dates.map((current) => {
              return (
                <div className="flex flex-col gap-2" key={current}>
                  <p className="py-3 text-xs font-semibold text-foreground-400 tracking-wider">
                    {current}
                  </p>
                  {data
                    .filter(({ date }) => date === current)
                    .map((props: CardProps, index: number) => {
                      switch (props.variant) {
                        case "token":
                          return (
                            <Link
                              key={index}
                              to={to(props.transactionHash)}
                              target="_blank"
                            >
                              <ActivityTokenCard
                                amount={props.amount}
                                address={props.address}
                                value={props.value}
                                image={props.image}
                                action={props.action}
                              />
                            </Link>
                          );
                        case "collectible":
                          return (
                            <Link
                              key={index}
                              to={to(props.transactionHash)}
                              target="_blank"
                            >
                              <ActivityCollectibleCard
                                name={props.name}
                                collection={props.collection}
                                address={props.address}
                                image={props.image}
                                action={props.action}
                              />
                            </Link>
                          );
                        case "game":
                          return (
                            <Link
                              key={index}
                              to={to(props.transactionHash)}
                              target="_blank"
                            >
                              <ActivityGameCard
                                title={props.title}
                                website={props.website}
                                image={props.image}
                                certified={props.certified}
                              />
                            </Link>
                          );
                        case "achievement":
                          return (
                            <ActivityAchievementCard
                              key={index}
                              title={"Achievement"}
                              image={props.image}
                              certified={props.certified}
                              topic={props.title}
                              points={props.points}
                              website={props.website}
                              color={props.color}
                            />
                          );
                      }
                    })}
                </div>
              );
            })
          ) : (
            <ActivityEmpty />
          )}
        </LayoutContent>
      );
    }
    case "error":
    default: {
      return <ActivityError />;
    }
  }
}
