import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { Thumbnail } from "@cartridge/ui";
import { UserAvatar } from "@/components/user/avatar";
import type { SearchResultItem } from "./types";

interface SearchResultItemProps {
  item: SearchResultItem;
  query: string;
  onClick?: () => void;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-foreground-100 text-inherit">
            {part}
          </span>
        ) : (
          <span key={i} className="text-foreground-300">
            {part}
          </span>
        ),
      )}
    </>
  );
}

export const SearchResultItemComponent = memo(
  function SearchResultItemComponent({
    item,
    query,
    onClick,
  }: SearchResultItemProps) {
    return (
      <Link
        to={item.link}
        onClick={onClick}
        className="w-full h-10 px-3 py-2.5 flex justify-between items-center gap-3 bg-spacer-100 hover:bg-background-200 transition-colors text-left"
      >
        {item.type === "player" ? (
          <UserAvatar username={item.title} size="xs" className="shrink-0" />
        ) : item.image ? (
          <Thumbnail icon={item.image} size="sm" className="shrink-0" />
        ) : null}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground-100 truncate">
            <HighlightMatch text={item.title} query={query} />
          </div>
          {item.subtitle && (
            <div className="text-xs truncate">
              <HighlightMatch text={item.subtitle} query={query} />
            </div>
          )}
        </div>
        <div className="text-sm text-foreground-400 shrink-0">{item.type}</div>
      </Link>
    );
  },
);
