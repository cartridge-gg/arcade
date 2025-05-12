import {
  AchievementContentProps,
  AchievementPinProps,
  BranchIcon,
  cn,
  DojoIcon,
  Thumbnail,
  VerifiedIcon,
} from "@cartridge/ui-next";
import { AchievementPinIcons } from "./achievement-pin-icons";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes, useMemo, useState } from "react";

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
  "group h-14 flex justify-between items-center p-3 gap-x-3 data-[clickable=true]:cursor-pointer overflow-hidden",
  {
    variants: {
      variant: {
        darkest: "bg-background-100",
        darker: "bg-background-100",
        dark: "bg-background-125",
        default:
          "bg-background-200 hover:bg-background-300 bg-top bg-cover bg-no-repeat select-none",
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

  return (
    <div
      data-clickable={clickable}
      className={cn(arcadeGameHeaderVariants({ variant }))}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        backgroundImage: `linear-gradient(0deg, ${colorMix})`,
      }}
      {...props}
    >
      <div className="flex items-center gap-3 grow overflow-hidden">
        <div className="flex items-center gap-3 overflow-hidden">
          <Thumbnail
            icon={metadata.logo ?? <DojoIcon className="w-full h-full" />}
            variant={hover && clickable ? "lighter" : "light"}
            size="md"
          />
          <p className="text-foreground-100 text-sm font-medium whitespace-nowrap truncate">
            {metadata.game}
          </p>
        </div>
        <div className="text-foreground-300 border border-background-300 group-hover:border-background-400 rounded px-1.5 py-1 flex items-center ga-0.5">
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
      {pins.length > 0 && (
        <AchievementPinIcons
          theme={active}
          pins={pins}
          variant={variant}
          size="lg"
          className={className}
          color={color}
        />
      )}
    </div>
  );
};

export default ArcadeGameHeader;
