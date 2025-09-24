import { cn } from "@cartridge/ui/utils";
import { useEffect, useRef, useState } from "react";

export function Details({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflown, setIsOverflown] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const element = ref.current;
    setIsOverflown(isExpanded || element.scrollHeight > element.clientHeight);
  }, [isExpanded, ref, content]);

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
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {`Read ${isExpanded ? "less" : "more"}`}
        </span>
      </p>
    </div>
  );
}

export default Details;
