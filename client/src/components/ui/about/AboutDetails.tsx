import { cn } from "@cartridge/ui/utils";
import { useEffect, useRef, useState } from "react";

export function AboutDetails({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflown, setIsOverflown] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    setIsOverflown(isExpanded || element.scrollHeight > element.clientHeight);
  }, [isExpanded, content]);

  if (!content) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="h-10 flex items-center justify-between">
        <p className="text-xs tracking-wider font-semibold text-foreground-400">
          Details
        </p>
      </div>
      <p>
        <span
          ref={ref}
          className={cn(
            "text-xs font-normal text-foreground-100 text-ellipsis line-clamp-2",
            isExpanded && "line-clamp-none",
          )}
        >
          {content}
        </span>
        <span
          className={cn(
            "text-xs font-medium text-foreground-100 hover:cursor-pointer hover:underline",
            !isOverflown && "hidden",
          )}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {`Read ${isExpanded ? "less" : "more"}`}
        </span>
      </p>
    </div>
  );
}
