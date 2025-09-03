import { cn } from "@cartridge/ui";
import React, { HTMLAttributes } from "react";

export const HolderLabel = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      id="holder-column-labels"
      className={cn("flex items-center self-stretch", className)}
      ref={ref}
      {...props}
    >
      <div className="flex flex-1 items-center justify-end px-3 py-1 gap-2">
        <div className="flex w-8 items-center gap-1">
          <span className="text-foreground-300 text-xs font-medium">#</span>
        </div>

        <div className="flex flex-1 items-center gap-1">
          <span className="text-foreground-300 text-xs font-medium">Owner</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end px-3 py-1 gap-2">
        <div className="flex flex-1 items-center justify-end gap-1">
          <span className="text-foreground-300 text-xs font-medium">
            Shares
          </span>
        </div>

        <div className="flex flex-1 items-center justify-end gap-1">
          <span className="text-foreground-300 text-xs font-medium">
            % Held
          </span>
        </div>
      </div>
    </div>
  );
});
