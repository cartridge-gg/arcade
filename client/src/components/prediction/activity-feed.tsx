import { cn } from "@cartridge/ui";
import React, { HTMLAttributes } from "react";
import { UserAvatar } from "../user/avatar";

interface Props extends HTMLAttributes<HTMLDivElement> {
  username: string;
  total: number;
  itemName: string;
  timestamp: string;
}

export const PredictionActivityFeed = React.forwardRef<HTMLDivElement, Props>(
  ({ username, total, itemName, timestamp, className, ...props }, ref) => {
    return (
      <div
        id="activity-feed-event"
        className={cn(
          "bg-background-200 flex items-start justify-between self-stretch px-3 py-2",
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-px text-foreground-100">
            <UserAvatar username={username} size="sm" />
            <p className="text-sm font-normal">{username}</p>
          </div>
          <span className="text-translucent-light-150 text-sm font-normal">
            bought
          </span>
          <div className="bg-translucent-dark-100 flex items-center p-1 gap-0.5">
            <img
              src="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
              className="size-4"
            />
            <div className="flex items-center gap-2.5 px-0.5">
              <p className="text-foreground-100 text-xs font-normal">{total}</p>
            </div>
          </div>
          <span className="text-translucent-light-150 text-sm font-normal">
            shares of
          </span>
          <div className="bg-translucent-dark-100 flex items-center p-1 gap-0.5">
            <UserAvatar username={itemName} size="xs" />
            <div className="flex items-center gap-2.5 px-0.5">
              <p className="text-foreground-100 text-xs font-normal">
                {itemName}
              </p>
            </div>
          </div>
        </div>
        <div className="w-14 flex items-center justify-end px-0.5 py-1 gap-2.5">
          <p className="text-translucent-light-150 text-xs font-normal whitespace-nowrap">
            {timestamp}
          </p>
        </div>
      </div>
    );
  },
);
