import {
  AchievementBit,
  AchievementBits,
  AchievementContent,
  type AchievementContentProps,
  AchievementPagination,
  AchievementPin,
  type AchievementPinProps,
  AchievementShare,
  type AchievementShareProps,
  Card,
  CardHeader,
  CardTitle,
  cn,
} from "@cartridge/ui";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export interface AchievementCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  achievements: {
    id: string;
    index: number;
    completed: boolean;
    content: AchievementContentProps;
    pin?: AchievementPinProps;
    share?: AchievementShareProps;
  }[];
}

export const AchievementCard = ({
  name,
  achievements,
}: AchievementCardProps) => {
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState<number[]>([]);
  const { trackEvent, events } = useAnalytics();
  const [hasTrackedView, setHasTrackedView] = useState(false);

  const visibles = useMemo(() => {
    return (achievements || []).filter(
      (a) => a.index === page || (a.content.hidden && !a.completed),
    );
  }, [achievements, page]);

  const handleNext = useCallback(() => {
    const index = pages.indexOf(page);
    const next = pages[index + 1];
    if (!next) return;

    trackEvent(events.ACHIEVEMENT_PAGE_CHANGED, {
      achievement_name: name,
      from_page: page.toString(),
      to_page: next.toString(),
      direction: "next",
    });

    setPage(next);
  }, [page, pages, trackEvent, events, name]);

  const handlePrevious = useCallback(() => {
    const index = pages.indexOf(page);
    if (index === 0) return;
    const previousPage = pages[index - 1];

    trackEvent(events.ACHIEVEMENT_PAGE_CHANGED, {
      achievement_name: name,
      from_page: page.toString(),
      to_page: previousPage.toString(),
      direction: "previous",
    });

    setPage(previousPage);
  }, [page, pages, trackEvent, events, name]);

  useEffect(() => {
    // Set the page to the first uncompleted achievement or 0 if there are none
    const filtereds = achievements.filter(
      (a) => !a.content.hidden || a.completed,
    );
    // Get the unique list of indexes for the achievements in this group
    const pages =
      filtereds.length > 0 ? [...new Set(filtereds.map((a) => a.index))] : [0];
    setPages(pages);
    const page = filtereds.find((a) => !a.completed);
    setPage(page ? page.index : pages[pages.length - 1]);
  }, [achievements]);

  // Track achievement view when component first renders
  useEffect(() => {
    if (!hasTrackedView && visibles.length > 0) {
      visibles.forEach((achievement) => {
        trackEvent(events.ACHIEVEMENT_VIEWED, {
          achievement_id: achievement.id,
          achievement_name: name,
          completed: achievement.completed,
        });
      });
      setHasTrackedView(true);
    }
  }, [hasTrackedView, visibles, trackEvent, events, name]);

  if (visibles.length === 0) return null;

  return (
    <Card>
      <div className="flex flex-row gap-x-px w-full overflow-hidden">
        <CardHeader className="grow">
          <CardTitle className="capitalize truncate">
            {name.toLowerCase()}
          </CardTitle>
        </CardHeader>
        {pages.length > 1 && (
          <AchievementPagination
            direction="left"
            onClick={handlePrevious}
            disabled={page === pages[0]}
          />
        )}
        {pages.length > 1 && (
          <AchievementPagination
            direction="right"
            onClick={handleNext}
            disabled={page === pages[pages.length - 1]}
          />
        )}
        {pages.length > 1 && (
          <CardHeader>
            <AchievementBits>
              {pages.map((p) => (
                <AchievementBit
                  key={p}
                  completed={achievements
                    .filter((a) => a.index === p)
                    .every((a) => a.completed)}
                  active={p === page}
                  onClick={() => {
                    if (p !== page) {
                      trackEvent(events.ACHIEVEMENT_PAGE_CHANGED, {
                        achievement_name: name,
                        from_page: page.toString(),
                        to_page: p.toString(),
                        direction: "direct",
                      });
                    }
                    setPage(p);
                  }}
                />
              ))}
            </AchievementBits>
          </CardHeader>
        )}
      </div>
      {visibles.map((achievement) => (
        <div
          key={achievement.id}
          className="flex gap-x-px"
          onClick={() => {
            trackEvent(events.ACHIEVEMENT_CARD_CLICKED, {
              achievement_id: achievement.id,
              achievement_name: name,
              completed: achievement.completed,
            });
          }}
        >
          <AchievementContent {...achievement.content} />
          <div
            className={cn(
              "flex flex-col gap-y-px",
              !achievement.pin && !achievement.share && "hidden",
            )}
          >
            {achievement.pin && <AchievementPin {...achievement.pin} />}
            {achievement.share && <AchievementShare {...achievement.share} />}
          </div>
        </div>
      ))}
    </Card>
  );
};

export default AchievementCard;
