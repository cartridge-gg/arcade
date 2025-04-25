import { BranchIcon } from "@/icons/branch";
import { cn, VerifiedIcon } from "@cartridge/ui-next";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";

const editionActionVariants = cva(
  "flex items-center gap-1 px-2 py-2.5 h-10 cursor-pointer",
  {
    variants: {
      variant: {
        darkest: "",
        darker: "",
        dark: "",
        default:
          "bg-background-200 hover:bg-background-300 text-foreground-300 hover:text-foreground-100 data-[active=true]:text-foreground-100",
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

interface EditionActionProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof editionActionVariants> {
  label: string;
  active?: boolean;
  certified?: boolean;
}

const EditionAction = ({
  variant,
  className,
  label,
  active,
  certified,
  ...props
}: EditionActionProps) => {
  return (
    <div
      data-active={active}
      className={cn(editionActionVariants({ variant }), className)}
      {...props}
    >
      {certified ? (
        <VerifiedIcon size="sm" />
      ) : (
        <BranchIcon className="w-5 h-5 p-0.25" />
      )}
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
};

export default EditionAction;
