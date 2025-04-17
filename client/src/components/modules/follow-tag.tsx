import { UserCheckIcon } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@cartridge/ui-next";

export const achievementFollowTagVariants = cva(
  "h-6 w-7 flex items-center justify-center rounded",
  {
    variants: {
      variant: {
        default:
          "border border-background-300 text-background-400 data-[active=true]:text-foreground-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface AchievementFollowTagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementFollowTagVariants> {
  active?: boolean;
}

export const AchievementFollowTag = ({
  active,
  variant,
  className,
  ...props
}: AchievementFollowTagProps) => {
  return (
    <div
      data-active={active}
      className={cn(achievementFollowTagVariants({ variant, className }))}
      {...props}
    >
      <UserCheckIcon className="h-5 w-5 p-[3px]" />
    </div>
  );
};

export default AchievementFollowTag;
