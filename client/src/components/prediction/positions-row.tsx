import { Thumbnail } from "@cartridge/ui";
import { UserAvatar } from "../user/avatar";
import { cn } from "@/lib/utils";
import React from "react";

export interface PredictionPositionCardProps {
  description: string;

  // User Info
  username: string;
  userAvatarClassName: string;

  // Balance Token/Asset Info
  balanceTokenIcon: string;
  balanceTokenAmount: string | number;

  // To Earn Token/Asset Info
  earnTokenIcon: string;
  earnTokenAmount: string | number;
}

export const PredictionPositionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & PredictionPositionCardProps
>(
  (
    {
      description,
      username,
      userAvatarClassName,
      balanceTokenIcon,
      balanceTokenAmount,
      earnTokenIcon,
      earnTokenAmount,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "flex p-3 items-start gap-1 self-stretch rounded bg-background-200",
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className="gap-2 flex-1 flex items-center">
          <div className="flex flex-col items-start justify-center gap-1 flex-1">
            <div className="flex items-center gap-1">
              <div className="flex items-center px-0.5 gap-0.5 rounded-[2px] bg-background-150">
                <UserAvatar username={username} size="sm" />
                <div className="px-0.5 gap-2.5 flex items-center justify-center">
                  <p className="text-primary text-sm font-normal">{username}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground-100">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-[120px] items-center gap-1">
          <Thumbnail
            icon={balanceTokenIcon}
            rounded
            size="xs"
            variant="lighter"
            className={userAvatarClassName}
          />
          <p className="text-sm font-medium text-foreground-100">
            {balanceTokenAmount.toLocaleString()}
          </p>
        </div>

        <div className="flex w-[120px] items-center gap-1">
          <Thumbnail icon={earnTokenIcon} rounded size="xs" variant="lighter" />
          <p className="text-sm font-medium text-foreground-100">
            {earnTokenAmount.toLocaleString()}
          </p>
        </div>
      </div>
    );
  },
);
