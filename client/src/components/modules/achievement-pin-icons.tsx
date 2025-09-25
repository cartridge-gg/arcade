import { cva, VariantProps } from "class-variance-authority";
import { AchievementPinIcon } from "./achievement-pin-icon";

const achievementPinsVariants = cva("flex items-center gap-2", {
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

export interface AchievementPinIconsProps
  extends VariantProps<typeof achievementPinsVariants> {
  pins: { id: string; icon: string }[];
  theme?: boolean;
  className?: string;
  color?: string;
}

export const AchievementPinIcons = ({
  pins,
  theme,
  variant,
  className,
  color,
}: AchievementPinIconsProps) => {
  return (
    <div className={achievementPinsVariants({ variant })}>
      {pins.map((value) => (
        <AchievementPinIcon
          key={value.id}
          icon={value.icon}
          variant={variant}
          theme={theme}
          className={className}
          color={color}
        />
      ))}
      {Array.from({ length: 3 - pins.length }).map((_, index) => (
        <AchievementPinIcon
          key={index}
          empty
          variant={variant}
          theme={false}
          className={className}
        />
      ))}
    </div>
  );
};

export default AchievementPinIcons;
