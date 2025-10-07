import { ClockIcon, Thumbnail } from "@cartridge/ui";
import { UserAvatar } from "../../user/avatar";
import { cn } from "@/lib/utils";
import React from "react";

export interface PositionCardProps {
  // Game/Position Info
  gameIcon: string;
  description: string;

  // User Info
  username: string;
  userAvatarClassName: string;

  // Timing
  timeRemaining: string;

  // Token/Asset Info
  tokenIcon: string;
  tokenAmount: string | number;
  tokenValue: string;

  // Performance/PnL
  pnlAmount: string;
  pnlClassName: string;

  // Styling
  className?: string;
}

export const PositionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & PositionCardProps
>(
  (
    {
      gameIcon,
      description,
      username,
      userAvatarClassName,
      timeRemaining,
      tokenIcon,
      tokenAmount,
      tokenValue,
      pnlAmount,
      pnlClassName,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex p-2 items-start gap-1 self-stretch rounded bg-background-200",
          className,
        )}
        {...props}
      >
        <div className="gap-2 flex-1 flex items-center">
          <Thumbnail
            icon={gameIcon}
            size="md"
            variant="lighter"
            className="!w-[34px] !h-[34px]"
          />
          <div className="flex flex-col items-start justify-center gap-1 flex-1">
            <div className="flex items-center gap-1 self-stretch">
              <div className="flex items-center px-0.5 gap-0.5 bg-background-150">
                <UserAvatar
                  username={username}
                  size="sm"
                  className={userAvatarClassName}
                />
                <div className="px-0.5 gap-2.5 flex items-center justify-center">
                  <p className="text-primary text-sm font-normal">{username}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground-100">
                {description}
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              <ClockIcon
                variant="solid"
                size="xs"
                className="text-foreground-300"
              />
              <div className="flex items-center justify-center px-0.5 gap-2.5">
                <p className="text-xs font-normal text-foreground-300">
                  {timeRemaining}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-[120px] flex-col items-start justify-center gap-1">
          <div className="flex items-center gap-1">
            <Thumbnail icon={tokenIcon} rounded size="xs" variant="lighter" />
            <p className="text-sm font-medium text-foreground-100">
              {tokenAmount}
            </p>
          </div>
          <p className="text-foreground-300 text-xs font-normal">
            {tokenValue}
          </p>
        </div>

        <div className="flex w-[120px] flex-col items-start justify-center gap-1">
          <div className="flex items-center gap-1">
            <Thumbnail icon={tokenIcon} rounded size="xs" variant="lighter" />
            <p className="text-sm font-medium text-foreground-100">
              {tokenAmount}
            </p>
          </div>
          <p className={cn("text-xs font-normal", pnlClassName)}>{pnlAmount}</p>
        </div>
      </div>
    );
  },
);
