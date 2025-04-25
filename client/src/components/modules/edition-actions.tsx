import { cn, Select, SelectContent, VerifiedIcon } from "@cartridge/ui-next";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes, useState } from "react";
import ArcadeMenuButton from "./menu-button";
import { BranchIcon } from "@/icons/branch";

const editionActionsVariants = cva("flex gap-2 h-8", {
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

interface EditionActionsProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof editionActionsVariants> {
  label: string;
  certified?: boolean;
  disabled?: boolean;
}

const EditionActions = ({
  label,
  certified,
  disabled,
  variant,
  className,
  children,
  ...props
}: EditionActionsProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(editionActionsVariants({ variant }), className)}
      {...props}
    >
      <Select open={open} onOpenChange={setOpen} disabled={disabled}>
        <div className="grow flex justify-end items-center self-center">
          <ArcadeMenuButton
            data-disabled={disabled}
            active={false}
            simplified={true}
            className={cn(
              "bg-background-150 hover:bg-background-200 data-[disabled=true]:hover:bg-background-150 text-foreground-300 hover:text-foreground-200 data-[disabled=true]:hover:text-foreground-300 data-[disabled=true]:cursor-default border border-background-200 h-8 w-full flex items-center justify-start gap-1 px-1",
            )}
          >
            {certified ? (
              <VerifiedIcon size="sm" />
            ) : (
              <BranchIcon className="w-5 h-5 p-0.25" />
            )}
            <p className="text-sm text-start font-normal truncate hidden lg:block lg:w-[120px]">
              {label}
            </p>
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

export default EditionActions;
