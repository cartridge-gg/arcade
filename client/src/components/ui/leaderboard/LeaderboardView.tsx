import { forwardRef } from "react";
import type { UIEvent } from "react";
import { cn, Empty, LayoutContent, Skeleton, TabsContent } from "@cartridge/ui";
import { ConnectContainer } from "@/features/errors";
import ArcadeSubTabs from "@/components/ui/modules/sub-tabs";
import LeaderboardRow from "@/components/ui/modules/leaderboard-row";
import type { LeaderboardEntry } from "@/features/leaderboard/useLeaderboardViewModel";

interface LeaderboardViewProps {
  isConnected: boolean;
  isLoading: boolean;
  isError: boolean;
  allEntries: LeaderboardEntry[];
  followingEntries: LeaderboardEntry[];
  getPlayerTarget: (nameOrAddress: string) => string;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  allListRef: React.RefObject<HTMLDivElement>;
  followingListRef: React.RefObject<HTMLDivElement>;
}

export const LeaderboardView = ({
  isConnected,
  isLoading,
  isError,
  allEntries,
  followingEntries,
  getPlayerTarget,
  onScroll,
  allListRef,
  followingListRef,
}: LeaderboardViewProps) => {
  const hasHighlightInAll = allEntries.some((entry) => entry.highlight);
  const hasHighlightInFollowing = followingEntries.some(
    (entry) => entry.highlight,
  );

  const showAllLoading = isLoading && allEntries.length === 0;
  const showAllEmpty = !isLoading && (isError || allEntries.length === 0);

  const showFollowingLoading = isLoading && followingEntries.length === 0;
  const showFollowingEmpty =
    !showFollowingLoading && (isError || followingEntries.length === 0);

  return (
    <LayoutContent className="select-none h-full overflow-clip p-0">
      <div
        className="p-0 mt-0 h-full overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        <ArcadeSubTabs tabs={["all", "following"]} className="mb-3 lg:mb-4">
          <div
            className="flex justify-center gap-8 w-full h-full overflow-y-scroll"
            style={{ scrollbarWidth: "none" }}
          >
            <TabsContent
              value="all"
              className={cn(
                "p-0 mt-0 lg:pb-6 grow w-full",
                hasHighlightInAll ? "pb-3" : "pb-0",
              )}
            >
              {showAllLoading ? (
                <LeaderboardLoadingState />
              ) : showAllEmpty ? (
                <LeaderboardEmptyState
                  className={cn(hasHighlightInAll ? "pb-0" : "pb-3")}
                />
              ) : (
                <LeaderboardList
                  ref={allListRef}
                  entries={allEntries}
                  getPlayerTarget={getPlayerTarget}
                  onScroll={onScroll}
                />
              )}
            </TabsContent>
            <TabsContent
              value="following"
              className={cn(
                "p-0 mt-0 lg:pb-6 grow w-full",
                hasHighlightInFollowing ? "pb-3" : "pb-0",
              )}
            >
              {!isConnected ? (
                <ConnectContainer
                  className={cn(hasHighlightInFollowing ? "pb-0" : "pb-3")}
                />
              ) : showFollowingLoading ? (
                <LeaderboardLoadingState />
              ) : showFollowingEmpty ? (
                <LeaderboardEmptyState
                  className={cn(hasHighlightInFollowing ? "pb-0" : "pb-3")}
                />
              ) : (
                <LeaderboardList
                  ref={followingListRef}
                  entries={followingEntries}
                  getPlayerTarget={getPlayerTarget}
                  onScroll={onScroll}
                />
              )}
            </TabsContent>
          </div>
        </ArcadeSubTabs>
      </div>
    </LayoutContent>
  );
};

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  getPlayerTarget: (address: string) => string;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
}

const LeaderboardList = forwardRef<HTMLDivElement, LeaderboardListProps>(
  ({ entries, getPlayerTarget, onScroll }, ref) => {
    return (
      <div
        ref={ref}
        className="relative flex flex-col gap-y-px h-full rounded overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
        onScroll={onScroll}
      >
        {entries.map((entry) => (
          <LeaderboardRow
            key={`${entry.address}-${entry.rank}`}
            pins={entry.pins}
            rank={entry.rank}
            name={entry.name}
            points={entry.points}
            highlight={entry.highlight}
            following={entry.following}
            to={getPlayerTarget(entry.address)}
          />
        ))}
      </div>
    );
  },
);

LeaderboardList.displayName = "LeaderboardList";

const LeaderboardLoadingState = () => {
  return (
    <div className="flex flex-col gap-y-px overflow-hidden h-full">
      {Array.from({ length: 20 }).map((_, index) => (
        <Skeleton key={index} className="min-h-11 w-full" />
      ))}
    </div>
  );
};

const LeaderboardEmptyState = ({ className }: { className?: string }) => {
  return (
    <Empty
      title="No leaderboard available for this game."
      icon="leaderboard"
      className={cn("h-full", className)}
    />
  );
};
