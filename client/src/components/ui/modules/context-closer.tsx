import { useNavigationContext } from "@/features/navigation";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";

const closeVariants = cva("relative group w-5 h-5 cursor-pointer", {
  variants: {
    variant: {
      rounded:
        "absolute group -top-5 -right-5 rounded-full bg-background-150 border border-primary-100 p-4 center hidden lg:flex",
      muted: "cursor-pointer block",
      "rounded-muted":
        "absolute group top-2 right-2 lg:-top-3 lg:-right-3 rounded-full bg-background-100 border border-background-200 p-4 center flex",
    },
  },
  defaultVariants: {
    variant: "rounded",
  },
});
const lineVariants = cva(
  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[15px] h-0.5 group-hover:bg-foreground-100 transition-colors",
  {
    variants: {
      variant: {
        rounded: "bg-current",
        muted: "bg-foreground-400",
        "rounded-muted": "bg-foreground-100",
      },
      direction: {
        left: "rotate-45",
        right: "-rotate-45",
      },
    },
    defaultVariants: {
      variant: "rounded",
    },
  },
);

export function ContextCloser(props: VariantProps<typeof closeVariants>) {
  const { manager } = useNavigationContext();
  return (
    <Link
      to={manager.getParentContextHref()}
      className={cn(closeVariants({ variant: props.variant }))}
    >
      <div
        className={cn(
          lineVariants({ variant: props.variant, direction: "left" }),
        )}
      />
      <div
        className={cn(
          lineVariants({ variant: props.variant, direction: "right" }),
        )}
      />
    </Link>
  );
}
