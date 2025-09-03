import { Button, cn, DoubleWedgeIcon, Thumbnail } from "@cartridge/ui";
import { UserAvatar } from "../user/avatar";
import React, { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  name: string;
  percentage: string;
  percentageChange: string;
}

export const BuyCard = React.forwardRef<HTMLDivElement, Props>(
  ({ className, name, percentage, percentageChange }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-background-200 flex items-center justify-between py-2 px-3 w-full",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Thumbnail
            icon={<UserAvatar username={name} />}
            rounded
            size="md"
            variant="lighter"
          />
          <p className="text-foreground-100 text-sm font-normal">{name}</p>
        </div>
        <div className="flex flex-row gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center p-0.5 text-destructive-100">
              <DoubleWedgeIcon direction="down" />
              <p className="text-xs font-normal">{percentageChange}</p>
            </div>
            <p className="text-foreground-100 text-sm font-medium">
              {percentage}
            </p>
          </div>
          <Button variant="primary" className="w-[88px] h-8">
            <span className="text-spacer-100 text-sm font-medium">Buy</span>
          </Button>
        </div>
      </div>
    );
  },
);
