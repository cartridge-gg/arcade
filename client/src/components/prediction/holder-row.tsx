import { cn } from "@cartridge/ui";
import React, { HTMLAttributes } from "react";
import { UserAvatar } from "../user/avatar";

export interface THolders {
  order?: number;
  ownerName: string;
  shares: number;
  percentHeld: number;
}

export const HolderRow = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & THolders
>(({ className, ownerName, shares, percentHeld, order, ...props }, ref) => {
  return (
    <div
      className={cn(
        "flex items-center self-stretch gap-3 px-3 py-2 bg-background-200",
        className,
      )}
      ref={ref}
      {...props}
    >
      <div className="flex items-center p-0.5 gap-2 flex-1">
        <p className="text-foreground-400 w-8 text-sm font-normal">{order}.</p>
        <div className="flex items-center gap-1 text-foreground-100">
          <UserAvatar username={ownerName} size="sm" />
          <p className="text-sm font-medium text-center">{ownerName}</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-1 py-0.5">
        <div className="flex flex-1 items-center justify-end gap-1">
          <img
            src="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
            className="size-4"
          />
          <p className="text-foreground-100 text-sm font-normal">{shares}</p>
        </div>

        <div className="flex flex-1 items-center justify-end gap-1">
          <p className="text-foreground-100 text-sm">{percentHeld}%</p>
        </div>
      </div>
    </div>
  );
});
