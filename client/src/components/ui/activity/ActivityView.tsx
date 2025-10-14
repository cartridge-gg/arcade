import {
  ActivityCollectibleCard,
  ActivityGameCard,
  ActivityTokenCard,
  Button,
  Empty,
  LayoutContent,
  PlusIcon,
  Skeleton,
  cn,
} from "@cartridge/ui";
import ActivityAchievementCard from "@/components/ui/modules/activity-achievement-card";
import type {
  ActivityDateGroup,
  ActivityEventView,
} from "@/features/activity/useActivityViewModel";

interface ActivityViewProps {
  status: "loading" | "error" | "idle" | "success" | "empty";
  groups: ActivityDateGroup[];
  onLoadMore: () => void;
  canLoadMore: boolean;
  isInitialLoading: boolean;
}

export const ActivityView = ({
  status,
  groups,
  onLoadMore,
  canLoadMore,
  isInitialLoading,
}: ActivityViewProps) => {
  if (status === "loading" && isInitialLoading) {
    return <ActivityLoadingState />;
  }

  if (status === "error" || status === "empty") {
    return <ActivityEmptyState />;
  }

  return (
    <LayoutContent className="gap-y-6 select-none h-full overflow-y-scroll p-0 py-3 lg:py-6">
      {groups.map(({ date, events }) => (
        <div className="flex flex-col gap-2" key={date}>
          <p className="py-3 text-xs font-semibold text-foreground-400 tracking-wider">
            {date}
          </p>
          {events.map((event, index) => (
            <ActivityEvent key={`${event.key}-${index}`} event={event} />
          ))}
        </div>
      ))}
      <Button
        variant="secondary"
        className={cn(
          "text-foreground-300 hover:text-foreground-200 normal-case text-sm font-medium tracking-normal font-sans",
          (!canLoadMore || groups.length === 0) && "hidden",
        )}
        onClick={onLoadMore}
      >
        <PlusIcon variant="solid" size="xs" />
        See More
      </Button>
    </LayoutContent>
  );
};

const ActivityLoadingState = () => {
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

const ActivityEmptyState = () => {
  return (
    <Empty
      title="No activity available"
      icon="activity"
      className="h-full py-3 lg:py-6"
    />
  );
};

const ActivityEvent = ({ event }: { event: ActivityEventView }) => {
  switch (event.variant) {
    case "token":
      return event.href ? (
        <a href={event.href} target="_blank" rel="noreferrer">
          <ActivityTokenCard
            amount={event.amount ?? ""}
            address={event.address ?? ""}
            value={event.value ?? ""}
            image={event.image ?? ""}
            action={event.action ?? "receive"}
          />
        </a>
      ) : (
        <ActivityTokenCard
          amount={event.amount ?? ""}
          address={event.address ?? ""}
          value={event.value ?? ""}
          image={event.image ?? ""}
          action={event.action ?? "receive"}
        />
      );
    case "collectible":
      return event.href ? (
        <a href={event.href} target="_blank" rel="noreferrer">
          <ActivityCollectibleCard
            name={event.name ?? ""}
            collection={event.collection ?? ""}
            address={event.address ?? ""}
            image={event.image ?? ""}
            action={event.action ?? "mint"}
          />
        </a>
      ) : (
        <ActivityCollectibleCard
          name={event.name ?? ""}
          collection={event.collection ?? ""}
          address={event.address ?? ""}
          image={event.image ?? ""}
          action={event.action ?? "mint"}
        />
      );
    case "game":
      return event.href ? (
        <a href={event.href} target="_blank" rel="noreferrer">
          <ActivityGameCard
            title={event.title ?? ""}
            website={event.website ?? ""}
            image={event.image ?? ""}
            certified={event.certified ?? false}
          />
        </a>
      ) : (
        <ActivityGameCard
          title={event.title ?? ""}
          website={event.website ?? ""}
          image={event.image ?? ""}
          certified={event.certified ?? false}
        />
      );
    case "achievement":
      return (
        <ActivityAchievementCard
          title="Achievement"
          image={event.image ?? ""}
          certified={event.certified ?? false}
          topic={event.title ?? ""}
          points={event.points ?? 0}
          website={event.website ?? ""}
          color={event.color}
        />
      );
    default:
      return null;
  }
};
