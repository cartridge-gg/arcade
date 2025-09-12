import { useAddress } from "@/hooks/address";
import { cn } from "@/lib/utils";
import React, { useCallback, useMemo } from "react";
import { UserAvatar } from "./avatar";
import { useUsername } from "@/hooks/account";
import { AchievementPlayerBadge, SparklesIcon } from "@cartridge/ui";
import { usePlayerGameStats, usePlayerStats } from "@/hooks/achievements";
import { useArcade } from "@/hooks/arcade";
import { useProject } from "@/hooks/project";
import { joinPaths } from "@/helpers";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "@/hooks/sidebar";

export const UserCard = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { address } = useAddress();
  const { username } = useUsername({ address });
  const { editions } = useArcade();
  const { game } = useProject();
  const location = useLocation();
  const navigate = useNavigate();
  const { close } = useSidebar();

  const projects = useMemo(() => {
    return editions
      .filter((edition) => edition.gameId === game?.id)
      .map((edition) => edition.config.project);
  }, [editions, game]);

  const Icon = useMemo(() => {
    return <UserAvatar username={username} className="h-full w-full" />;
  }, [username]);

  const { earnings: totalEarnings } = usePlayerStats();
  const { earnings: gameEarnings } = usePlayerGameStats(projects);

  const handleClick = useCallback(() => {
    if (!username && !address) return;
    // Update the url params
    let pathname = location.pathname;
    const playerName = `${!username ? address?.toLowerCase() : username.toLowerCase()}`;
    pathname = pathname.replace(/\/collection\/[^/]+/, "");
    pathname = pathname.replace(/\/player\/[^/]+/, "");
    pathname = pathname.replace(/\/tab\/[^/]+/, "");
    pathname = pathname.replace(/\/edition\/[^/]+/, "");
    pathname = joinPaths(pathname, `/player/${playerName}`);
    navigate(pathname);

    // Close sidebar on mobile
    close();
  }, [address, navigate, username, location, close]);

  if (!username) return null;

  return (
    <button
      id="user-card"
      type="button"
      ref={ref}
      className={cn(
        "flex flex-col items-start p-4 gap-2 self-stretch w-full bg-background-100 lg:hover:bg-background-150 border-b border-spacer-100 lg:border lg:border-background-200 lg:hover:border-background-300 lg:rounded-xl",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <div
        id="player-label"
        className="flex items-center justify-between self-stretch"
      >
        <div className="flex items-center gap-3">
          <AchievementPlayerBadge
            icon={Icon}
            variant="default"
            className="!w-10 !h-10"
          />
          <p className="text-foreground-100 text-lg/6 font-semibold">
            {username}
          </p>
        </div>
        <div className="flex items-center gap-1 p-3">
          <div className="flex items-center gap-0.5">
            <SparklesIcon variant="solid" size="xs" />
            <p className="text-xs font-medium text-foreground-100">
              {game ? gameEarnings : totalEarnings}
            </p>
          </div>
          <p className="text-xs font-normal text-foreground-200">Points</p>
        </div>
      </div>
    </button>
  );
});

UserCard.displayName = "UserCard";
