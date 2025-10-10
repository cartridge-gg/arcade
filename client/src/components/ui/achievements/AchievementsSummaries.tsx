import AchievementSummary from "@/components/ui/modules/summary";
import type { AchievementSummaryCardView } from "@/features/achievements/useAchievementsViewModel";

interface AchievementsSummariesProps {
  summaryCards: AchievementSummaryCardView[];
}

export const AchievementsSummaries = ({
  summaryCards,
}: AchievementsSummariesProps) => {
  return (
    <div className="flex flex-col gap-y-3 lg:gap-y-4">
      {summaryCards.map((card) => (
        <div key={card.id} className="rounded-lg overflow-hidden">
          <AchievementSummary
            achievements={card.achievements}
            metadata={card.metadata}
            socials={card.socials}
            variant={card.variant}
            header={card.header}
            active={card.active}
            color={card.color}
            onClick={card.onClick}
          />
        </div>
      ))}
    </div>
  );
};
