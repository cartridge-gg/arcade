import { useMemo } from "react";
import { AchievementCard } from "@/components/ui/modules/achievement-card";
import type { TrophiesViewModel } from "@/features/achievements/useAchievementsViewModel";

export const TrophiesView = ({ groups, softView }: TrophiesViewModel) => {
  const orderedGroups = useMemo(() => {
    return [...groups].sort((a, b) =>
      a.name === "Hidden"
        ? 1
        : b.name === "Hidden"
          ? -1
          : a.name.localeCompare(b.name),
    );
  }, [groups]);

  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      {orderedGroups.map((group) => (
        <AchievementCard
          key={group.name}
          name={group.name}
          achievements={group.items.map((item) => ({
            id: item.id,
            index: item.index,
            completed: item.completed,
            content: item.content,
            share: softView ? undefined : item.share,
            pin: softView
              ? undefined
              : item.pin
                ? {
                    pinned: item.pin.pinned,
                    enabled: item.pin.enabled,
                    onPin: item.pin.onPin,
                  }
                : undefined,
          }))}
        />
      ))}
    </div>
  );
};
