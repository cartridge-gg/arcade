import { SelectTrigger } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React, { type HTMLAttributes } from "react";

const arcadeMenuButtonVariants = cva("p-0 flex items-center justify-center", {
  variants: {
    variant: {
      default:
        "bg-background-200 text-foreground-300 hover:bg-background-300 hover:text-foreground-200 data-[active=true]:text-primary transition-colors cursor-pointer",
    },
    size: {
      default: "w-8 h-8",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ArcadeMenuButtonProps
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof arcadeMenuButtonVariants> {
  active?: boolean;
  simplified?: boolean;
  className?: string;
}

export const ArcadeMenuButton = React.forwardRef<
  HTMLButtonElement,
  ArcadeMenuButtonProps
>(
  (
    { active, variant, size, className, children, simplified, ...props },
    ref,
  ) => {
    return (
      <SelectTrigger
        data-active={active}
        simplified={simplified}
        className={cn(arcadeMenuButtonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </SelectTrigger>
    );
  },
);

export default ArcadeMenuButton;
