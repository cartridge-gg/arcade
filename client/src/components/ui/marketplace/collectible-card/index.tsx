import { CollectibleCardFooter } from "./footer";
import CollectiblePreview from "./preview";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { CollectibleHeader } from "./header";

export interface CollectibleCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleCardVariants> {
  title: string;
  images: string[];
  icon?: string;
  totalCount?: number;
  listingCount?: number;
  price?: string | { value: string; image: string } | null;
  lastSale?: string | { value: string; image: string } | null;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

const collectibleCardVariants = cva(
  "group relative grow rounded overflow-hidden cursor-pointer border-transparent border-[2px] data-[selected=true]:border-foreground-100 min-w-48 h-[184px]",
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

export function CollectibleCard({
  title,
  images,
  icon,
  totalCount,
  listingCount,
  price,
  lastSale,
  selectable = true,
  selected,
  onSelect,
  variant,
  className,
  onError,
  ...props
}: CollectibleCardProps) {
  return (
    <div
      data-selected={selected}
      className={cn(collectibleCardVariants({ variant }), className)}
      {...props}
    >
      <CollectibleHeader
        title={title}
        icon={icon}
        selectable={!selected && selectable}
        selected={selected}
        onSelect={onSelect}
        variant={variant}
        listingCount={listingCount}
      />
      <CollectiblePreview
        images={images}
        size="sm"
        totalCount={totalCount}
        listingCount={listingCount}
        onError={onError}
      />
      <CollectibleCardFooter
        price={price}
        lastSale={lastSale}
        variant={variant}
      />
    </div>
  );
}

export default CollectibleCard;
