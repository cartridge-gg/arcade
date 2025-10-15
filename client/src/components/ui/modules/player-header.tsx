import { type HTMLAttributes, useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { FollowerTag } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import AchievementPlayerLabel from "./player-label";

interface AchievementPlayerHeaderProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementPlayerHeaderVariants> {
  username: string;
  address: string;
  points: number;
  icon?: React.ReactNode;
  follower?: boolean;
  followerCount?: number;
  followingCount?: number;
  followers?: string[];
  compacted?: boolean;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

const achievementPlayerHeaderVariants = cva("flex flex-col gap-y-4", {
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
});

export const AchievementPlayerHeader = ({
  username,
  address,
  points,
  icon,
  follower,
  followerCount,
  followingCount,
  followers,
  compacted,
  variant,
  rank,
  onFollowersClick,
  onFollowingClick,
  className,
  ...props
}: AchievementPlayerHeaderProps) => {
  return (
    <div
      className={cn(
        achievementPlayerHeaderVariants({ variant, rank }),
        className,
      )}
      {...props}
    >
      <AchievementPlayerLabel
        username={username}
        address={address}
        icon={icon}
        variant="default"
        rank={rank}
      />
      <div className="flex flex-col px-2">
        <div className="h-6 flex items-center gap-x-2">
          <p
            className={cn(
              "text-xs text-foreground-300 transition-colors",
              !!onFollowersClick &&
                "hover:underline hover:text-foreground-100 cursor-pointer",
            )}
            onClick={onFollowersClick}
          >
            <strong className="font-medium text-foreground-100">
              {followerCount?.toLocaleString() || 0}
            </strong>{" "}
            Followers
          </p>
          <p
            className={cn(
              "text-xs text-foreground-300 transition-colors",
              !!onFollowingClick &&
                "hover:underline hover:text-foreground-100 cursor-pointer",
            )}
            onClick={onFollowingClick}
          >
            <strong className="font-medium text-foreground-100">
              {followingCount?.toLocaleString() || 0}
            </strong>{" "}
            Following
          </p>
          <p className="text-xs text-foreground-300 flex items-center gap-x-1">
            <strong className="font-medium text-foreground-100">
              {points.toLocaleString()}
            </strong>
            Points
          </p>
          <div className="hidden lg:block">
            {follower && <FollowerTag variant={variant} />}
          </div>
        </div>
        {!compacted && <FollowerDescription followers={followers || []} />}
      </div>
    </div>
  );
};

const FollowerDescription = ({ followers }: { followers: string[] }) => {
  const description = useMemo(() => {
    const names = followers.slice(0, 2);
    if (followers.length > 3) {
      return `Followed by ${names.join(", ")} and ${followers.length - 2} others you follow`;
    }
    if (followers.length === 3) {
      return `Followed by ${names.join(", ")} and ${followers.length - 2} other you follow`;
    }
    if (followers.length > 0) {
      return `Followed by ${names.join(" and ")}`;
    }
    return "Followed by no one you follow";
  }, [followers]);

  return (
    <p className="h-6 flex items-center text-xs text-foreground-300">
      {description}
    </p>
  );
};

export default AchievementPlayerHeader;
