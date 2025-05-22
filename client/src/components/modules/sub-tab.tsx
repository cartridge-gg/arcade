import { TabsTrigger } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";

const arcadeSubTabVariants = cva(
  "flex justify-center items-center transition-colors border-b border-background-200",
  {
    variants: {
      variant: {
        default:
          "bg-background-100 hover:bg-background-125 text-foreground-400 hover:text-foreground-200 data-[active=true]:bg-background-200 data-[active=true]:text-primary data-[active=true]:border-transparent data-[active=true]:rounded",
      },
      size: {
        default: "px-3 py-2.5 gap-1 text-sm h-10 w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ArcadeSubTabProps
  extends VariantProps<typeof arcadeSubTabVariants> {
  Icon: React.ReactNode;
  value: string;
  label: string;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ArcadeSubTab = React.forwardRef<
  HTMLButtonElement,
  ArcadeSubTabProps
>(
  (
    { Icon, value, label, active, className, variant, size, onClick, ...props },
    ref,
  ) => {
    return (
      <TabsTrigger
        value={value}
        className={cn(
          "p-0 flex flex-col items-center cursor-pointer select-none transition-colors w-full data-[state=active]:shadow-none",
          className,
        )}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        <div
          data-active={active}
          className={cn(arcadeSubTabVariants({ variant, size }))}
        >
          {Icon}
          <p className="font-normal">{label}</p>
        </div>
      </TabsTrigger>
    );
  },
);

export default ArcadeSubTab;
