import { CheckboxIcon, TagIcon, Thumbnail } from "@cartridge/ui";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useCallback } from "react";

export interface CollectibleHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleHeaderVariants> {
  title: string;
  icon?: string | null;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  listingCount?: number;
}

const collectibleHeaderVariants = cva(
  "group absolute w-full flex gap-2 p-3 justify-between items-center text-sm font-medium transition-all duration-150 z-10 bg-gradient-to-b from-[#000] to-transparent",
  {
    variants: {
      variant: {
        default: "",
        faded: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function CollectibleHeader({
  title,
  icon,
  selectable,
  selected,
  onSelect,
  variant,
  listingCount,
  className,
  ...props
}: CollectibleHeaderProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect?.();
    },
    [onSelect],
  );

  return (
    <div
      className={cn(collectibleHeaderVariants({ variant }), className, "")}
      {...props}
    >
      <div className="flex items-center gap-1 overflow-hidden">
        {!!listingCount && <TagIcon variant="solid" size="sm" />}
        <Thumbnail
          variant="light"
          size="sm"
          icon={icon === null ? undefined : icon}
          className={icon === undefined ? "hidden" : ""}
        />
        <p
          className={cn(
            "truncate",
            (selected || selectable) && "pr-6",
            !!listingCount && "ml-0.5",
          )}
        >
          {title}
        </p>
      </div>
      {selected && (
        <div
          className="absolute right-[9px] top-1/2 -translate-y-1/2 text-foreground-100 cursor-pointer"
          onClick={handleClick}
        >
          <CheckboxIcon variant="line" size="sm" />
        </div>
      )}
      {selectable && !selected && (
        <div
          className="absolute right-[9px] top-1/2 -translate-y-1/2 text-background-500 hover:text-foreground-200 cursor-pointer"
          onClick={handleClick}
        >
          <CheckboxIcon variant="unchecked-line" size="sm" />
        </div>
      )}
    </div>
  );
}

export default CollectibleHeader;
