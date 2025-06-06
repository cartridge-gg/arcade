import { SparklesIcon, Thumbnail } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes, useState } from "react";

interface ArcadeGameSelectProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof arcadeGameSelectVariants> {
  name: string;
  logo?: string;
  cover?: string;
  points?: number;
  active?: boolean;
  downlighted?: boolean;
  icon?: string;
}

export const arcadeGameSelectVariants = cva(
  "select-none h-10 flex gap-3 justify-start items-center p-2 gap-2 cursor-pointer data-[active=true]:cursor-default",
  {
    variants: {
      variant: {
        darkest: "bg-background-100 hover:bg-background-150",
        darker: "bg-background-100 hover:bg-background-150",
        dark: "bg-background-100 hover:bg-background-150",
        default: "bg-background-100 hover:bg-background-150",
        light: "bg-background-200 hover:bg-background-200",
        lighter: "bg-background-200 hover:bg-background-200",
        lightest: "bg-background-200 hover:bg-background-200",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const ArcadeGameSelect = ({
  name,
  logo,
  cover,
  points,
  active,
  downlighted,
  icon,
  variant,
  className,
  ...props
}: ArcadeGameSelectProps) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      data-active={active}
      className={cn(arcadeGameSelectVariants({ variant }), className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    >
      <Thumbnail icon={logo} size="sm" variant="default" />
      <div className="grow flex items-center gap-2">
        <p
          className={cn(
            "text-sm font-normal text-foreground-100 transition-colors duration-150 ease-in-out truncate whitespace-nowrap",
            downlighted && "text-foreground-300",
            active && "text-primary",
          )}
        >
          {name}
        </p>
        {icon && (
          <div
            key={icon}
            className="h-5 w-5 p-[3px] flex items-center justify-center"
          >
            <i
              className={cn("fa-solid h-full w-full text-foreground-300", icon)}
            />
          </div>
        )}
      </div>
      {!!points && (
        <ArcadePoints
          label={points.toLocaleString()}
          hover={hover}
          active={active}
        />
      )}
    </div>
  );
};

const arcadePointsVariants = cva(
  "flex items-center gap-x-0.5 rounded-full px-1.5 py-1 cursor-pointer transition-colors duration-150 ease-in-out",
  {
    variants: {
      variant: {
        darkest:
          "text-foreground-200 bg-background-100 data-[active=true]:bg-background-200 data-[active=true]:text-foreground-100",
        darker:
          "text-foreground-200 bg-background-100 data-[active=true]:bg-background-200 data-[active=true]:text-foreground-100",
        dark: "text-foreground-200 bg-background-100 data-[active=true]:bg-background-200 data-[active=true]:text-foreground-100",
        default:
          "text-foreground-200 data-[hover=true]:text-foreground-100 data-[active=true]:text-primary",
        light:
          "text-foreground-300 bg-background-200 data-[active=true]:bg-background-300 data-[active=true]:text-foreground-100",
        lighter:
          "text-foreground-300 bg-background-200 data-[active=true]:bg-background-300 data-[active=true]:text-foreground-100",
        lightest:
          "text-foreground-300 bg-background-200 data-[active=true]:bg-background-300 data-[active=true]:text-foreground-100",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ArcadePointsProps extends VariantProps<typeof arcadePointsVariants> {
  label?: string;
  hover?: boolean;
  active?: boolean;
}

const ArcadePoints = ({ label, hover, active, variant }: ArcadePointsProps) => {
  return (
    <div
      data-active={active}
      data-hover={hover && !active}
      className={arcadePointsVariants({ variant })}
    >
      <SparklesIcon variant={active ? "solid" : "line"} size="xs" />
      <p className="px-0.5 text-xs font-medium">{label}</p>
    </div>
  );
};

export default ArcadeGameSelect;
