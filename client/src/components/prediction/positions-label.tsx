import { cn } from "@cartridge/ui";
import React, { HTMLAttributes } from "react";

export const PositionsLabel = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      id="positions-column-labels"
      className={cn("flex px-3 items-center gap-1 self-stretch", className)}
      ref={ref}
      {...props}
    >
      <div className="flex flex-1 items-center justify-end py-1 gap-2">
        <div className="flex flex-1 items-center gap-1">
          <span className="text-foreground-300 text-xs font-medium">
            Market
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 w-[120px]">
        <span className="text-foreground-300 text-xs font-medium">Balance</span>
      </div>

      <div className="flex items-center gap-1 w-[120px]">
        <span className="text-foreground-300 text-xs font-medium">To Earn</span>
      </div>
    </div>
  );
});
