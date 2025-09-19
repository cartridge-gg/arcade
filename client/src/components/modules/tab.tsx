import { TabsTrigger } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";

const arcadeTabVariants = cva(
  "flex justify-center items-center text-foreground-300 hover:text-foreground-200 data-[active=true]:text-primary transition-colors",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        default: "p-2 pt-[10px] gap-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ArcadeTabProps extends VariantProps<typeof arcadeTabVariants> {
  Icon: React.ReactNode;
  value: string;
  label: string;
  active?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  suffix?: string;
}

export const ArcadeTab = React.forwardRef<HTMLButtonElement, ArcadeTabProps>(
  (
    { Icon, value, label, active, className, variant, size, onClick, disabled, ...props },
    ref,
  ) => {
    return (
      <TabsTrigger
        value={value}
        className={cn(
          "p-0 flex flex-col items-center cursor-pointer select-none transition-colors data-[state=active]:bg-transparent data-[state=active]:shadow-none  data-[state=active]:drop-shadow-none",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        onClick={disabled ? undefined : onClick}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        <div
          data-active={active}
          className={cn(arcadeTabVariants({ variant, size }))}
        >
          {Icon}
          <p className="font-normal">{label}</p>
        </div>
        <div
          data-active={active}
          className={cn(
            "rounded-full bg-primary h-0.5 w-full translate-y-[1px] text-primary",
            active ? "opacity-100" : "opacity-0",
          )}
        />
      </TabsTrigger>
    );
  },
);

export default ArcadeTab;
