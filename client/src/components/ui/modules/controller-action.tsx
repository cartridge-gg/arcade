import { SpinnerIcon } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React, { type HTMLAttributes } from "react";

const controllerActionVariants = cva(
  "flex items-center gap-1.5 px-3 py-2 h-10 min-w-48 cursor-pointer data-[disabled=true]:cursor-default",
  {
    variants: {
      variant: {
        darkest: "",
        darker: "",
        dark: "",
        default:
          "bg-background-300 hover:bg-background-400 lg:bg-background-200 lg:hover:bg-background-300 data-[disabled=true]:hover:bg-background-300 data-[disabled=true]:lg:hover:bg-background-200 data-[disabled=true]:text-foreground-300",
        light: "",
        lighter: "",
        lightest: "",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ControllerActionProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof controllerActionVariants> {
  label: string;
  Icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

const ControllerAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ControllerActionProps
>(({ variant, className, label, Icon, disabled, loading, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-disabled={disabled}
      className={cn(controllerActionVariants({ variant }), className)}
      {...props}
    >
      {loading ? <SpinnerIcon size="sm" className="animate-spin" /> : Icon}
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
});

export default ControllerAction;
