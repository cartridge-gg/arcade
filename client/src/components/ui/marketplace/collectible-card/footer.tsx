import { Thumbnail } from "@cartridge/ui";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface CollectibleCardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleCardFooterVariants> {
  price?: string | { value: string; image: string } | null;
  lastSale?: string | { value: string; image: string } | null;
}

const collectibleCardFooterVariants = cva(
  "absolute bottom-0 w-full p-3 flex flex-col gap-1 text-foreground-400 data-[hidden=true]:hidden bg-gradient-to-t from-[#000] to-transparent",
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

export function CollectibleCardFooter({
  price,
  lastSale,
  variant,
  className,
  ...props
}: CollectibleCardFooterProps) {
  return (
    <div
      data-hidden={price === undefined && lastSale === undefined}
      className={cn(collectibleCardFooterVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-1 text-foreground-300 text-[10px]/3 font-normal">
        <p>Price</p>
        <p>Last Sale</p>
      </div>
      <div className="flex items-center justify-between text-foreground-100 text-sm font-medium">
        {!!price && typeof price === "string" ? (
          <p className="">{Number(price).toFixed(2)}</p>
        ) : !!price && typeof price === "object" ? (
          <Price price={price} />
        ) : (
          <p>--</p>
        )}
        {!!lastSale && typeof lastSale === "string" ? (
          <p>{lastSale}</p>
        ) : !!lastSale && typeof lastSale === "object" ? (
          <Price price={lastSale} />
        ) : (
          <p>--</p>
        )}
      </div>
    </div>
  );
}

function Price({ price }: { price: { value: string; image: string } }) {
  return (
    <div className="flex items-center gap-1">
      <Thumbnail
        icon={price.image}
        variant="lighter"
        size="xs"
        rounded
        transdark
      />
      <p>{Number(price.value).toFixed(2)}</p>
    </div>
  );
}

export default CollectibleCardFooter;
