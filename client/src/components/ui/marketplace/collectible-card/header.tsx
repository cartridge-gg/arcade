import { CheckboxIcon, Thumbnail } from "@cartridge/ui";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { useCallback } from "react";
import { useProject } from "@/hooks/project";
import arcade from "@/assets/arcade-logo.png";

export interface CollectibleHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleHeaderVariants> {
  title: string;
  icon?: string | null;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

const collectibleHeaderVariants = cva(
  "group absolute flex gap-2 p-3 justify-between items-center text-sm font-medium transition-all duration-150 z-10",
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

  const { game, edition } = useProject();

  return (
    <div
      className={cn(
        collectibleHeaderVariants({ variant }),
        className,
        // icon === undefined && "pl-2.5",
      )}
      {...props}
    >
      <div className="flex items-center gap-1.5 overflow-hidden">
        <Thumbnail
          variant="light"
          size="sm"
          // icon={icon === null ? undefined : icon}
          icon={edition?.properties.icon || game?.properties.icon || arcade}
          // className={icon === undefined ? "hidden" : ""}
        />
        <p
          className={cn(
            "truncate",
            (selected || selectable) && "pr-6",
            icon === undefined && "pl-2.5",
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
