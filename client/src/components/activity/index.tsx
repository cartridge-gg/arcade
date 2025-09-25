import { useActivities } from "@/hooks/activities";
import {
  ActivityCollectibleCard,
  ActivityGameCard,
  ActivityTokenCard,
  Button,
  cn,
  Empty,
  LayoutContent,
  PlusIcon,
  Skeleton,
} from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import ActivityAchievementCard from "../modules/activity-achievement-card";
import { Link } from "react-router-dom";
import { VoyagerUrl } from "@cartridge/ui/utils";
import { constants } from "starknet";
import { CardProps } from "@/context/activities";
import { useProject } from "@/hooks/project";

const OFFSET = 20;

export function Activity() {
  const { edition } = useProject();
  const [cap, setCap] = useState(OFFSET);
  const { activities, status } = useActivities();

  const toExplorer = useCallback(
    (transactionHash: string, chainId: constants.StarknetChainId) => {
      return VoyagerUrl(chainId).transaction(transactionHash);
    },
    [],
  );

  const { events, dates } = useMemo(() => {
    const filteredData = activities.slice(0, cap);
    return {
      events: filteredData,
      dates: [...new Set(filteredData.map((event) => event.date))],
    };
  }, [activities, cap]);

  useEffect(() => {
    // Reset cap when the game changes
    setCap(OFFSET);
  }, [edition]);

  if (status === "loading" && !events.length) return <LoadingState />;
  if (status === "error" || !events.length) return <EmptyState />;
  return (
    <LayoutContent className="gap-y-6 select-none h-full overflow-y-scroll p-0 py-3 lg:py-6">
      {dates.map((current) => {
        return (
          <div className="flex flex-col gap-2" key={current}>
            <p className="py-3 text-xs font-semibold text-foreground-400 tracking-wider">
              {current}
            </p>
            {events
              .filter(({ date }) => date === current)
              .map((props: CardProps, index) => {
                switch (props.variant) {
                  case "token":
                    return (
                      <Link
                        key={`${props.key}-${index}`}
                        to={toExplorer(props.transactionHash, props.chainId)}
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
                        key={`${props.key}-${index}`}
                        to={toExplorer(props.transactionHash, props.chainId)}
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
                        key={`${props.key}-${index}`}
                        to={toExplorer(props.transactionHash, props.chainId)}
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
                        key={`${props.key}-${index}`}
                        title={"Achievement"}
                        image={props.image}
                        certified={props.certified}
                        topic={props.title}
                        points={props.points || 0}
                        website={props.website}
                        color={props.color}
                      />
                    );
                }
              })}
          </div>
        );
      })}
      <Button
        variant="secondary"
        className={cn(
          "text-foreground-300 hover:text-foreground-200 normal-case text-sm font-medium tracking-normal font-sans",
          (cap >= activities.length || dates.length === 0) && "hidden",
        )}
        onClick={() => setCap((prev) => prev + OFFSET)}
      >
        <PlusIcon variant="solid" size="xs" />
        See More
      </Button>
    </LayoutContent>
  );
}

const LoadingState = () => {
  return (
    <div className="flex flex-col gap-4 py-3 lg:py-6 h-full overflow-hidden">
      <Skeleton className="w-1/5 h-4 py-4 rounded" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 20 }).map((_, index) => (
          <Skeleton key={index} className="w-full h-16 rounded" />
        ))}
      </div>
    </div>
  );
};

const EmptyState = () => {
  return (
    <Empty
      title="No activity available"
      icon="activity"
      className="h-full py-3 lg:py-6"
    />
  );
};
