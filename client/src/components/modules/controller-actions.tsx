import { DotsIcon, Select, SelectContent } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes, useState } from "react";
import ArcadeMenuButton from "./menu-button";

const controllerActionsVariants = cva("flex gap-2", {
  variants: {
    variant: {
      darkest: "",
      darker: "",
      dark: "",
      default: "",
      light: "",
      lighter: "",
      lightest: "",
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ControllerActionsProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof controllerActionsVariants> {}

const ControllerActions = ({
  variant,
  className,
  children,
  ...props
}: ControllerActionsProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(controllerActionsVariants({ variant }), className)}
      {...props}
    >
      <Select open={open} onOpenChange={setOpen}>
        <div className="grow flex justify-end items-center self-center">
          <ArcadeMenuButton
            active={false}
            className={cn(
              "bg-background-100 hover:bg-background-150 text-foreground-100 hover:text-foreground-100 w-10 h-10",
            )}
          >
            <DotsIcon size="default" />
          </ArcadeMenuButton>
        </div>
        <SelectContent
          className="bg-background-100 flex flex-col gap-px"
          onClick={() => setOpen(false)}
        >
          {children}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ControllerActions;
