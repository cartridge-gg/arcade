import { Slot } from "@radix-ui/react-slot";
import { cn } from "@cartridge/ui";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const navigationButtonVariants = cva(
  "relative flex flex-row justify-center gap-1 items-center py-2 px-3 rounded-lg font-sans text-sm text-foreground-300 hover:text-primary-100 transition transition-colors duration-150 ease-in before:content-[''] before:absolute before:h-px before:top-0 before:left-0 before:right-0 data-[status=active]:before:bg-primary-100 data-[status=active]:text-primary-100",
  {
    variants: {
      variant: {
        default:
          "flex-1 h-[71px] lg:border lg:border-background-200 lg:flex-initial lg:h-auto lg:before:hidden lg:bg-background-125 lg:data-[status=active]:border-primary-100 lg:data-[status=active]:bg-primary-100 lg:data-[status=active]:text-spacer-100",
        tab: "border border-background-200 bg-background-100 data-[status=active]:text-primary-100 data-[status=active]:bg-background-200 data-[status=active]:border-background-200 border-b h-auto before:hidden cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface LinkItemProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof navigationButtonVariants> {
  asChild?: boolean;
}

export const NavigationButton = React.forwardRef<
  HTMLAnchorElement,
  LinkItemProps
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      ref={ref}
      className={cn(navigationButtonVariants({ variant, className }))}
      {...props}
    />
  );
});

NavigationButton.displayName = "NavigationButton";
