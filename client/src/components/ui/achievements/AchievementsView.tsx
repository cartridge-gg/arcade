import { Empty, LayoutContent, Skeleton } from "@cartridge/ui";
import { AchievementsSummaries } from "./AchievementsSummaries";
import { TrophiesView } from "./TrophiesView";
import type {
  AchievementSummaryCardView,
  TrophiesViewModel,
} from "@/features/achievements/useAchievementsViewModel";

interface AchievementsViewProps {
  status: "loading" | "error" | "empty" | "success";
  summaryCards: AchievementSummaryCardView[];
  showTrophies: boolean;
  trophies?: TrophiesViewModel;
  multiEdition: boolean;
}

export const AchievementsView = ({
  status,
  summaryCards,
  showTrophies,
  trophies,
  multiEdition,
}: AchievementsViewProps) => {
  if (status === "error" || status === "empty") {
    return <AchievementsEmptyState />;
  }

  if (status === "loading") {
    return (
      <AchievementsLoadingState
        multi={multiEdition && summaryCards.length > 1}
      />
    );
  }

  return (
    <LayoutContent className="gap-y-6 select-none h-full overflow-clip p-0">
      <div className="h-full flex flex-col justify-between gap-y-6">
        <div
          className="p-0 mt-0 overflow-y-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex flex-col gap-3 lg:gap-4 py-3">
            <AchievementsSummaries summaryCards={summaryCards} />
            {showTrophies && trophies && <TrophiesView {...trophies} />}
          </div>
        </div>
      </div>
    </LayoutContent>
  );
};

const AchievementsLoadingState = ({ multi }: { multi?: boolean }) => {
  if (multi) {
    return (
      <div className="flex flex-col gap-y-3 lg:gap-y-4 overflow-hidden h-full py-3">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="min-h-[99px] w-full rounded" />
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-y-3 lg:gap-y-4 overflow-hidden h-full py-3">
      <Skeleton className="min-h-[97px] lg:min-h-10 w-full rounded" />
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="min-h-[177px] w-full rounded" />
      ))}
    </div>
  );
};

const AchievementsEmptyState = () => {
  return (
    <Empty
      title="No achievements exist for this game."
      icon="achievement"
      className="h-full py-3"
    />
  );
};
