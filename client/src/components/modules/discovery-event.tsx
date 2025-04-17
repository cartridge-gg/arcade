import { CardTitle, cn, Skeleton, SpaceInvaderIcon } from "@cartridge/ui-next";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo, HTMLAttributes, useState, useEffect } from "react";

export interface ArcadeDiscoveryEventProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof arcadeDiscoveryEventVariants> {
  name: string;
  timestamp: number;
  Icon?: React.ReactNode;
  data?: {
    title: string;
    label: string;
    icon: string;
  };
  loading?: boolean;
  color?: string;
}

export const arcadeDiscoveryEventVariants = cva(
  "select-none h-11 flex justify-between items-center px-3 py-2.5",
  {
    variants: {
      variant: {
        darkest: "bg-background-100",
        darker: "bg-background-100",
        dark: "bg-background-100",
        default: "bg-background-200 hover:bg-background-300 cursor-pointer",
        light: "bg-background-200",
        lighter: "bg-background-200",
        lightest: "bg-background-200",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const ArcadeDiscoveryEvent = ({
  name,
  timestamp,
  Icon,
  data,
  loading,
  variant,
  className,
  color,
  ...props
}: ArcadeDiscoveryEventProps) => {
  const bgColor = useMemo(() => {
    switch (variant) {
      case "darkest":
      case "darker":
      case "dark":
        return "bg-background-200";
      case "default":
      case "light":
      case "lighter":
      case "lightest":
      case "ghost":
      default:
        return "bg-background-300";
    }
  }, [variant]);

  if (loading) {
    return (
      <div className={cn(arcadeDiscoveryEventVariants({ variant }), className)}>
        <Skeleton className={cn("w-[120px] h-full", bgColor)} />
        <Skeleton className={cn("w-[60px] h-full", bgColor)} />
      </div>
    );
  }
  return (
    <div
      className={cn(arcadeDiscoveryEventVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-center gap-x-1.5">
        {Icon ? Icon : <SpaceInvaderIcon size="sm" variant="solid" />}
        <CardTitle className="text-sm font-normal tracking-normal text-foreground-100 truncate max-w-16 lg:max-w-none lg:truncate-none">
          {name}
        </CardTitle>
        {data && (
          <DiscoveryEvent
            title={data.title}
            label={data.label}
            icon={data.icon}
            className={className}
            color={color}
          />
        )}
      </div>
      <Timestamp timestamp={timestamp} />
    </div>
  );
};

const DiscoveryEvent = ({
  title,
  label,
  icon,
  className,
  color,
}: {
  title: string;
  label: string;
  icon: string;
  className?: string;
  color?: string;
}) => {
  return (
    <div
      data-theme
      className={cn(
        "flex items-center gap-x-1.5 data-[theme=true]:text-primary",
        className,
      )}
      style={{ color }}
    >
      <p className="text-xs text-foreground-300">{label}</p>
      <div className="flex items-center gap-1 p-1 border-background-400 border rounded-sm">
        <div className={cn(icon, "fa-solid w-3 h-3")} />
        <p className="text-xs capitalize truncate max-w-16 lg:max-w-none lg:truncate-none">
          {title.replace(/_/g, " ")}
        </p>
      </div>
    </div>
  );
};

const Timestamp = ({ timestamp }: { timestamp: number }) => {
  const [state, setState] = useState<{
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
  }>({
    seconds: 0,
    minutes: 0,
    hours: 0,
    days: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - timestamp * 1000;
      setState({
        seconds: Math.floor(diff / 1000),
        minutes: Math.floor(diff / (1000 * 60)),
        hours: Math.floor(diff / (1000 * 60 * 60)),
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  const label = useMemo(() => {
    if (state.days > 0) return `${state.days}d ago`;
    if (state.hours > 0) return `${state.hours}h ago`;
    if (state.minutes > 0) return `${state.minutes}m ago`;
    return `${state.seconds}s ago`;
  }, [state]);

  return <p className="text-xs text-foreground-300">{label}</p>;
};
