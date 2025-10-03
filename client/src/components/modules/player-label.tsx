import {
  BronzeTagIcon,
  GoldTagIcon,
  SilverTagIcon,
  AchievementPlayerBadge,
  cn,
} from "@cartridge/ui";
import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { CopyAddress } from "./copy-address";

export interface AchievementPlayerLabelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementPlayerLabelVariants> {
  username: string;
  address: string;
  icon?: React.ReactNode;
}

const achievementPlayerLabelVariants = cva(
  "flex items-center gap-x-5 h-16 pl-2",
  {
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
      rank: {
        default: "",
        gold: "",
        silver: "",
        bronze: "",
      },
    },
    defaultVariants: {
      variant: "default",
      rank: "default",
    },
  },
);

export const AchievementPlayerLabel = ({
  username,
  address,
  icon,
  variant,
  rank,
  className,
  ...props
}: AchievementPlayerLabelProps) => {
  const TagIcon = useMemo(() => {
    switch (rank) {
      case "gold":
        return <GoldTagIcon size="default" className="min-h-6 min-w-6" />;
      case "silver":
        return <SilverTagIcon size="default" className="min-h-6 min-w-6" />;
      case "bronze":
        return <BronzeTagIcon size="default" className="min-h-6 min-w-6" />;
      default:
        return null;
    }
  }, [rank]);

  return (
    <div
      className={cn(achievementPlayerLabelVariants({ variant }), className)}
      {...props}
    >
      <AchievementPlayerBadge
        icon={icon}
        variant={variant}
        rank={rank}
        size="3xl"
      />
      <div className="flex flex-col gap-y-2 justify-between h-[60px] self-end overflow-hidden">
        <div className="flex items-center gap-x-2">
          <p className="text-xl/[24px] font-semibold text-foreground-100 truncate">
            {username}
          </p>
          {TagIcon}
        </div>
        <div className="bg-background-150 w-fit">
          <CopyAddress
            first={2}
            last={4}
            address={`0x${BigInt(address).toString(16)}`}
            size="xs"
            className="text-sm h-7 px-1.5 py-1"
          />
        </div>
      </div>
    </div>
  );
};

export default AchievementPlayerLabel;
