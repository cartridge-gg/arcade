import {
  AchievementContentProps,
  AchievementPinProps,
  BranchIcon,
  cn,
  DojoIcon,
  Thumbnail,
  VerifiedIcon,
} from "@cartridge/ui";
import { AchievementPinIcons } from "./achievement-pin-icons";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes, useMemo, useState } from "react";
import { useDevice } from "@/hooks/device";

export interface Metadata {
  game: string;
  edition: string;
  certified: boolean;
  logo?: string;
  cover?: string;
}

export interface Socials {
  website?: string;
  discord?: string;
  telegram?: string;
  twitter?: string;
  github?: string;
}

export interface ArcadeGameHeaderProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof arcadeGameHeaderVariants> {
  metadata: Metadata;
  achievements?: {
    id: string;
    content: AchievementContentProps;
    pin?: AchievementPinProps;
  }[];
  socials?: Socials;
  active?: boolean;
  className?: string;
  color?: string;
}

export const arcadeGameHeaderVariants = cva(
  "group flex justify-between items-center gap-x-3 data-[clickable=true]:cursor-pointer overflow-hidden",
  {
    variants: {
      variant: {
        darkest: "bg-background-100",
        darker: "bg-background-100",
        dark: "bg-background-125",
        default:
          "bg-background-200 p-3 hover:bg-background-300 bg-top bg-cover bg-no-repeat select-none",
        light: "bg-background-200",
        lighter: "bg-background-200",
        lightest: "bg-background-200",
        ghost: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const ArcadeGameHeader = ({
  achievements,
  metadata,
  active,
  variant,
  className,
  color,
  onClick,
  ...props
}: ArcadeGameHeaderProps) => {
  const [hover, setHover] = useState(false);
  const clickable = useMemo(() => !!onClick, [onClick]);
  const { isMobile } = useDevice();

  const pins = useMemo(() => {
    if (!achievements) return [];
    return achievements
      .filter((a) => a.content.icon && a.pin?.pinned)
      .map((a) => ({
        id: a.id,
        icon: a.content.icon || "fa-trophy",
        name: a.content.title || "",
      }))
      .slice(0, 3);
  }, [achievements]);

  const colorMix = useMemo(
    () => `color-mix(in srgb, ${color} 1%, transparent 100%)`,
    [color],
  );

  const style = useMemo(() => {
    if (variant !== "default") return;
    return { backgroundImage: `linear-gradient(0deg, ${colorMix})` };
  }, [variant, colorMix]);

  return (
    <div
      data-clickable={clickable}
      className={cn(arcadeGameHeaderVariants({ variant }))}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={style}
      {...props}
    >
      <div className="flex items-center gap-3 grow overflow-hidden">
        <Thumbnail
          icon={metadata.logo ?? <DojoIcon className="w-full h-full" />}
          variant={
            isMobile ? "lighter" : hover && clickable ? "lighter" : "light"
          }
          size={isMobile ? "lg" : "md"}
        />
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-0.5 lg:gap-3 overflow-hidden">
          <p className="text-foreground-100 text-sm font-medium whitespace-nowrap truncate">
            {metadata.game}
          </p>
          <div className="text-foreground-300 border-0 lg:border border-background-300 group-hover:border-background-400 rounded lg:px-1.5 lg:py-1 flex items-center gap-0.5">
            {metadata.certified ? (
              <VerifiedIcon size="xs" />
            ) : (
              <BranchIcon size="xs" />
            )}
            <p className="text-xs whitespace-nowrap px-0.5 truncate">
              {metadata.edition}
            </p>
          </div>
        </div>
      </div>
      {pins.length > 0 && (
        <AchievementPinIcons
          theme={active}
          pins={pins}
          variant={variant}
          className={cn("h-8", className)}
          color={color}
        />
      )}
    </div>
  );
};

export default ArcadeGameHeader;
