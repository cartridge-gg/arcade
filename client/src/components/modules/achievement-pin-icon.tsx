import { cn } from "@cartridge/ui/utils";
import { cva, VariantProps } from "class-variance-authority";

const achievementPinIconVariants = cva(
  "p-1.5 lg:p-2 rounded flex justify-center items-center data-[theme=true]:text-primary transition-colors",
  {
    variants: {
      variant: {
        darkest:
          "bg-background-100 text-foreground-100 data-[empty=true]:text-background-500",
        darker:
          "bg-background-100 text-foreground-100 data-[empty=true]:text-background-500",
        dark: "bg-translucent-dark-150 text-foreground-100 data-[empty=true]:text-background-500",
        default:
          "bg-translucent-dark-150 text-foreground-100 data-[empty=true]:text-foreground-400",
        light:
          "bg-background-300 text-foreground-100 data-[empty=true]:text-foreground-400",
        lighter:
          "bg-background-300 text-foreground-100 data-[empty=true]:text-foreground-400",
        lightest:
          "bg-background-300 text-foreground-100 data-[empty=true]:text-foreground-400",
        ghost:
          "bg-transparent text-foreground-100 data-[empty=true]:text-foreground-400",
      },
      size: {
        default: "w-6 h-6 lg:w-8 lg:h-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface AchievementPinIconProps
  extends VariantProps<typeof achievementPinIconVariants> {
  icon?: string;
  empty?: boolean;
  theme?: boolean;
  className?: string;
  color?: string;
}

export const AchievementPinIcon = ({
  icon,
  empty,
  theme,
  variant,
  size,
  className,
  color,
}: AchievementPinIconProps) => {
  return (
    <div
      data-theme={theme}
      data-empty={empty}
      className={cn(achievementPinIconVariants({ variant, size }), className)}
      style={{ color: theme ? color : undefined }}
    >
      {empty ? (
        <div className="h-full w-full fa-spider-web fa-thin" />
      ) : (
        <div className={cn("h-full w-full fa-solid", icon || "fa-trophy")} />
      )}
    </div>
  );
};

export default AchievementPinIcon;
