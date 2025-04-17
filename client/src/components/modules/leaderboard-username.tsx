import { cn } from "@/lib/utils";
import { UserAvatar } from "../user/avatar";

export interface AchievementLeaderboardUsernameProps {
  username: string;
  icon?: string;
  highlight?: boolean;
  className?: string;
}

export const AchievementLeaderboardUsername = ({
  username,
  icon,
  highlight,
  className,
}: AchievementLeaderboardUsernameProps) => {
  return (
    <div
      className={cn(
        "flex gap-1",
        highlight ? "text-primary" : "text-foreground-100",
        className,
      )}
    >
      <div className="h-5 w-5 flex items-center justify-center">
        {icon ? (
          <div className={cn("h-4 w-4 fa-solid", icon)} />
        ) : (
          <UserAvatar username={username} size="sm" />
        )}
      </div>
      <p className="text-sm truncate max-w-28 lg:max-w-none lg:truncate-none">
        {username}
      </p>
    </div>
  );
};

export default AchievementLeaderboardUsername;
