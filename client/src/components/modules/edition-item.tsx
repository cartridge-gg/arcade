import { BranchIcon } from "@/icons/branch";
import { VerifiedIcon } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
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
  published?: boolean;
  whitelisted?: boolean;
}

const EditionAction = ({
  variant,
  className,
  label,
  active,
  certified,
  published,
  whitelisted,
  ...props
}: EditionActionProps) => {
  return (
    <div
      data-active={active}
      className={cn(editionActionVariants({ variant }), className)}
      {...props}
    >
      {certified && whitelisted ? (
        <VerifiedIcon size="sm" />
      ) : whitelisted ? (
        <BranchIcon className="w-5 h-5 p-0.25" />
      ) : published ? (
        <div
          key="published"
          className="h-5 w-5 p-[3px] flex items-center justify-center"
        >
          <i className="fa-rocket fa-solid h-full w-full" />
        </div>
      ) : (
        <div
          key="default"
          className="h-5 w-5 p-[3px] flex items-center justify-center"
        >
          <i className="fa-eye-slash fa-solid h-full w-full" />
        </div>
      )}
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
};

export default EditionAction;
