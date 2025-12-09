import { Thumbnail } from "@cartridge/ui";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

export interface CollectibleCardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof collectibleCardFooterVariants> {
  price?: string | { value: string; image: string } | null;
  lastSale?: string | { value: string; image: string } | null;
}

const collectibleCardFooterVariants = cva(
  "absolute bottom-0 w-full px-3 py-2 flex flex-row items-center justify-between gap-0.5 text-foreground-400 data-[hidden=true]:hidden",
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
  console.log("price: ", price);
  return (
    <div
      data-hidden={price === undefined && lastSale === undefined}
      className={cn(collectibleCardFooterVariants({ variant }), className)}
      {...props}
    >
      <div className="flex flex-col items-start gap-1">
        <p className="text-foreground-300 text-[10px]/3 font-normal">Price</p>
        {!!price && typeof price === "string" ? (
          <p className="text-foreground-100 text-sm font-medium">
            {Number(price).toFixed(2)}
          </p>
        ) : !!price && typeof price === "object" ? (
          <Price price={price} />
        ) : (
          <p>--</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className="text-foreground-300 text-[10px]/3 font-normal">
          Last Sale
        </p>
        {!!lastSale && typeof lastSale === "string" ? (
          <p className="text-foreground-100 text-sm font-medium">{lastSale}</p>
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
      <p className="text-foreground-100 text-sm font-medium">
        {Number(price.value).toFixed(2)}
      </p>
    </div>
  );
}

export default CollectibleCardFooter;
