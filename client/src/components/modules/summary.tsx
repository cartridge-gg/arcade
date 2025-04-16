import {
  AchievementContentProps,
  AchievementPinIcons,
  AchievementPinProps,
  AchievementProgress,
  Card,
  CardContent,
  Metadata,
  Socials,
} from "@cartridge/ui-next";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import ArcadeGameHeader from "./game-header";
import { cn } from "@/lib/utils";

export interface AchievementSummaryProps
  extends VariantProps<typeof achievementSummaryVariants> {
  achievements: {
    id: string;
    content: AchievementContentProps;
    pin?: AchievementPinProps;
  }[];
  metadata: Metadata;
  header?: boolean;
  socials?: Socials;
  active?: boolean;
  className?: string;
  color?: string;
}

const achievementSummaryVariants = cva("border border-transparent", {
  variants: {
    variant: {
      darkest: "",
      darker: "",
      dark: "",
      default: "",
      light: "",
      lighter: "",
      lightest: "",
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const AchievementSummary = ({
  achievements,
  metadata,
  header = true,
  socials,
  active,
  className,
  color,
  variant,
}: AchievementSummaryProps) => {
  const { points, count } = useMemo(() => {
    let points = 0;
    let count = 0;
    achievements.forEach((a) => {
      if (a.content.tasks?.every((t) => t.count >= t.total)) {
        points += a.content.points;
        count++;
      }
    });
    return { points, count };
  }, [achievements]);

  const pins = useMemo(() => {
    if (!achievements) return [];
    return achievements
      .filter((a) => a.content.icon && a.pin?.pinned)
      .map((a) => ({
        id: a.id,
        icon: a.content.icon || "fa-trophy",
        name: a.content.title || "",
        difficulty: a.content.difficulty,
      }))
      .sort((a, b) => a.id.localeCompare(b.id))
      .sort((a, b) => a.difficulty - b.difficulty)
      .slice(0, 3);
  }, [achievements]);

  return (
    <Card className={achievementSummaryVariants({ variant })}>
      {header && (
        <ArcadeGameHeader
          achievements={achievements}
          metadata={metadata}
          socials={socials}
          variant={variant}
          active={active}
          className={className}
          color={color}
        />
      )}
      <CardContent className="p-0 flex gap-3 bg-transparent">
        <AchievementProgress
          count={count}
          total={achievements.length}
          points={points}
          variant={variant}
          completed
          className={cn(
            "grow",
            variant === "dark" && "bg-background-125",
            className,
          )}
          color={color}
        />
        {!header && (
          <AchievementPinIcons theme={active} pins={pins} variant="darkest" />
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementSummary;
