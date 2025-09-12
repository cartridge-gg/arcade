import {
  EmptyStateAchievementIcon,
  EmptyStateActivityIcon,
  EmptyStateGuildIcon,
  EmptyStateIcon,
  EmptyStateInventoryIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { Connection } from "../connection";

export function Wrapper({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("h-full", className)} {...props}>
      <div
        className="h-full flex flex-col gap-2 justify-center items-center select-none rounded"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='%23242824' stroke-width='2' stroke-dasharray='3%2c 6' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Connect() {
  return (
    <Wrapper className="">
      <div className="flex flex-col justify-center items-center gap-8 h-full">
        <div className="flex flex-col justify-center items-center gap-3 w-[210px] lg:w-auto">
          <p className="text-foreground-200 text-lg/[22px] font-semibold text-center">
            Connect your Controller
          </p>
          <span className="text-background-500 text-sm text-center">
            Build and customize your own Dojo activity feed.
          </span>
        </div>
        <Connection />
      </div>
    </Wrapper>
  );
}

export function Error({
  title,
  Icon,
  className,
}: {
  title: string;
  Icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Wrapper className={className}>
      <div className="w-[135px] h-[135px] max-w-[135px] max-h-[135px] min-h-[135px] min-w-[135px]">
        {Icon}
      </div>
      <p className="text-sm text-background-500">{title}</p>
    </Wrapper>
  );
}

export function ActivityComingSoon() {
  return (
    <Error
      title="Coming soon"
      Icon={<EmptyStateActivityIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function ActivityError() {
  return (
    <Error
      title="Oops! Something went wrong"
      Icon={<EmptyStateActivityIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function ActivityLoading() {
  return (
    <Error
      title="Loading..."
      Icon={<EmptyStateActivityIcon className="h-full w-full animate-pulse" />}
      className="py-3 lg:py-6"
    />
  );
}

export function ActivityEmpty() {
  return (
    <Error
      title="It feels lonely in here..."
      Icon={<EmptyStateActivityIcon className="h-full w-full" />}
    />
  );
}

export function GuildsComingSoon() {
  return (
    <Error
      title="Coming soon"
      Icon={<EmptyStateGuildIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function GuildsLoading() {
  return (
    <Error
      title="Loading..."
      Icon={<EmptyStateGuildIcon className="h-full w-full animate-pulse" />}
      className="py-3 lg:py-6"
    />
  );
}

export function GuildsError() {
  return (
    <Error
      title="Oops! Something went wrong"
      Icon={<EmptyStateGuildIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function GuildsEmpty() {
  return (
    <Error
      title="It feels lonely in here..."
      Icon={<EmptyStateGuildIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function MarketplaceComingSoon() {
  return (
    <Error
      title="Coming soon"
      Icon={<EmptyStateInventoryIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function MarketplaceLoading() {
  return (
    <Error
      title="Loading..."
      Icon={<EmptyStateInventoryIcon className="h-full w-full animate-pulse" />}
      className="py-3 lg:py-6"
    />
  );
}

export function MarketplaceError() {
  return (
    <Error
      title="Oops! Something went wrong"
      Icon={<EmptyStateInventoryIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function MarketplaceEmpty() {
  return (
    <Error
      title="It feels lonely in here..."
      Icon={<EmptyStateInventoryIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function AboutComingSoon() {
  return (
    <Error
      title="Coming soon"
      Icon={<EmptyStateActivityIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function AboutLoading() {
  return (
    <Error
      title="Loading..."
      Icon={<EmptyStateActivityIcon className="h-full w-full animate-pulse" />}
      className="py-3 lg:py-6"
    />
  );
}

export function AboutError() {
  return (
    <Error
      title="Oops! Something went wrong"
      Icon={<EmptyStateActivityIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function AboutEmpty() {
  return (
    <Error
      title="It feels lonely in here..."
      Icon={<EmptyStateActivityIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function AchievementsComingSoon() {
  return (
    <Error
      title="Coming soon"
      Icon={<EmptyStateAchievementIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function AchievementsError() {
  return (
    <Error
      title="Oops! Something went wrong"
      Icon={<EmptyStateAchievementIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function AchievementsLoading() {
  return (
    <Error
      title="Loading..."
      Icon={
        <EmptyStateAchievementIcon className="h-full w-full animate-pulse" />
      }
      className="py-3 lg:py-6"
    />
  );
}

export function AchievementsEmpty() {
  return (
    <Error
      title="It feels lonely in here..."
      Icon={<EmptyStateAchievementIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function LeaderboardComingSoon() {
  return (
    <Error
      title="Coming soon"
      Icon={<EmptyStateAchievementIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function LeaderboardError() {
  return (
    <Error
      title="Oops! Something went wrong"
      Icon={<EmptyStateAchievementIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function LeaderboardLoading() {
  return (
    <Error
      title="Loading..."
      Icon={
        <EmptyStateAchievementIcon className="h-full w-full animate-pulse" />
      }
      className="py-3 lg:py-6"
    />
  );
}

export function LeaderboardEmpty() {
  return (
    <Error
      title="It feels lonely in here..."
      Icon={<EmptyStateAchievementIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function InventoryComingSoon() {
  return (
    <Error
      title="Coming soon"
      Icon={<EmptyStateInventoryIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function InventoryError() {
  return (
    <Error
      title="Oops! Something went wrong"
      Icon={<EmptyStateInventoryIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function InventoryLoading() {
  return (
    <Error
      title="Loading..."
      Icon={<EmptyStateInventoryIcon className="h-full w-full animate-pulse" />}
      className="py-3 lg:py-6"
    />
  );
}

export function InventoryEmpty() {
  return (
    <Error
      title="It feels lonely in here..."
      Icon={<EmptyStateInventoryIcon className="h-full w-full" />}
      className="py-3 lg:py-6"
    />
  );
}

export function DiscoverComingSoon() {
  return (
    <Error
      title="Coming soon"
      Icon={<EmptyStateActivityIcon className="h-full w-full" />}
      className="pb-3 lg:pb-6"
    />
  );
}

export function DiscoverError() {
  return (
    <Error
      title="Oops! Something went wrong"
      Icon={<EmptyStateActivityIcon className="h-full w-full" />}
      className="pb-3 lg:pb-6"
    />
  );
}

export function DiscoverLoading() {
  return (
    <Error
      title="Loading..."
      Icon={<EmptyStateActivityIcon className="h-full w-full animate-pulse" />}
      className="py-3 lg:py-6"
    />
  );
}

export function DiscoverEmpty() {
  return (
    <Error
      title="It feels lonely in here..."
      Icon={<EmptyStateActivityIcon className="h-full w-full" />}
      className="pb-3 lg:pb-6"
    />
  );
}
export function GenericError() {
  return (
    <Error
      title="Oops! Something went wrong"
      Icon={<EmptyStateIcon className="h-full w-full" />}
    />
  );
}
