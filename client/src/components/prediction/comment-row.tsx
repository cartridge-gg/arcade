import { cn, Thumbnail } from "@cartridge/ui";
import React, { HTMLAttributes } from "react";
import { UserAvatar } from "../user/avatar";

export interface CommentRowProps {
  name: string;
  comment: string;
  timestamp: string;
}

export const CommentRow = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & CommentRowProps
>(({ className, name, comment, timestamp, ...props }, ref) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between self-stretch",
        className,
      )}
      ref={ref}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Thumbnail
          icon={<UserAvatar username={name} />}
          rounded
          size="md"
          variant="lighter"
        />
        <div className="flex flex-col items-start justify-center">
          <div className="flex items-start gap-1">
            <p className="text-foreground-300 text-xs font-normal">{name}</p>
          </div>
          <p className="text-foreground-100 text-xs font-normal">{comment}</p>
        </div>
      </div>
      <div className="flex items-center justify-end w-14 px-0.5 py-1 gap-2.5">
        <p className="text-translucent-light-150 text-xs font-normal">
          {timestamp}
        </p>
      </div>
    </div>
  );
});
