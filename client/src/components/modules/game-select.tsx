import { cn, SparklesIcon, Thumbnail } from "@cartridge/ui-next";
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
}

export const arcadeGameSelectVariants = cva(
  "select-none h-10 flex gap-3 justify-start items-center p-2 gap-2 cursor-pointer data-[active=true]:cursor-default",
  {
    variants: {
      variant: {
        darkest: "bg-background-100 hover:bg-background-150",
        darker: "bg-background-100 hover:bg-background-150",
        dark: "bg-background-100 hover:bg-background-150",
        default: "bg-background-200 hover:bg-background-200",
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
      <Thumbnail
        icon={logo}
        size="sm"
        variant={active || hover ? "lightest" : "light"}
      />
      <p
        className={cn(
          "grow text-sm font-normal text-foreground-100 transition-colors duration-150 ease-in-out truncate whitespace-nowrap",
          active && "text-primary",
        )}
      >
        {name}
      </p>
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
