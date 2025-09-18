import { getTime } from "@/helpers";
import { CardTitle, cn, Thumbnail } from "@cartridge/ui";
import { cva, type VariantProps } from "class-variance-authority";
import { useMemo, type HTMLAttributes, useState, useEffect } from "react";

export interface ArcadeDiscoveryEventProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof arcadeDiscoveryEventVariants> {
  identifier: string;
  name: string;
  timestamp: number;
  Icon: React.ReactNode;
  count: number;
  actions: string[];
  duration: number;
  achievements: {
    title: string;
    icon: string;
    points: number;
  }[];
  loading?: boolean;
  color?: string;
  logo?: string;
}

export const arcadeDiscoveryEventVariants = cva(
  "relative select-none h-11 flex justify-between items-center px-3 py-2.5 cursor-pointer",
  {
    variants: {
      variant: {
        darkest: "bg-background-100",
        darker: "bg-background-100",
        dark: "bg-background-100",
        default: "bg-background-200 hover:bg-background-300",
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
  duration,
  count,
  actions,
  achievements,
  logo,
  color,
  variant,
  className,
  ...props
}: ArcadeDiscoveryEventProps) => {
  const colorMix = useMemo(
    () => `color-mix(in srgb, ${color} 1%, transparent 100%)`,
    [color],
  );

  const { points } = useMemo(() => {
    const points = (achievements || []).reduce(
      (acc, achievement) => acc + (achievement.points || 0),
      0,
    );
    return { points };
  }, [achievements]);

  return (
    <div
      className={cn(arcadeDiscoveryEventVariants({ variant }), className)}
      style={{
        backgroundImage: `linear-gradient(0deg, ${colorMix})`,
      }}
      {...props}
    >
      <div className="flex items-center gap-x-1.5">
        {Icon}
        <CardTitle className="text-sm font-normal tracking-normal text-foreground-100 truncate max-w-24 lg:max-w-32 lg:truncate-none">
          {name}
        </CardTitle>
        <DiscoveryEvent
          duration={duration}
          count={count}
          actions={actions}
          points={points}
          className={className}
          color={color}
        />
      </div>
      <div className="flex items-center gap-2">
        <Timestamp timestamp={timestamp} />
        <Thumbnail icon={logo} size="sm" variant="dark" />
      </div>
    </div>
  );
};

const DiscoveryEvent = ({
  // duration,
  points,
  count,
  actions,
  achievements,
  className,
  color,
}: {
  duration: number;
  points: number;
  count: number;
  actions: string[];
  achievements?: { icon: string; title?: string }[];
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
      <Sentence content="performed" />
      <Card
        icon="fa-wave-pulse"
        short={`${count}`}
        long={count === 1 ? actions[0].replace(/_/g, " ") : `${count} Actions`}
      />
      {/* <Sentence content="for" />
      <Card
        icon="fa-clock"
        short={getDuration(duration)}
        long={getDuration(duration)}
        className="hidden lg:flex"
      /> */}
      {points > 0 && (
        <>
          <Sentence content="and earned" />
          {(achievements || []).map((achievement, index) => {
            return (
              <Card
                key={index}
                icon={achievement.icon}
                long={achievement.title}
              />
            );
          })}
          <Card icon="fa-sparkles" short={`${points}`} long={`${points}`} />
        </>
      )}
    </div>
  );
};

const Card = ({
  icon,
  short,
  long,
  className,
}: {
  icon: string;
  short?: string;
  long?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 p-1 rounded-sm bg-translucent-dark-100",
        className,
      )}
    >
      <Icon icon={icon} />
      {!!short && <p className="text-xs px-px capitalize lg:hidden">{short}</p>}
      {!!long && (
        <p className="text-xs px-px capitalize hidden lg:block">{long}</p>
      )}
    </div>
  );
};

const Icon = ({ icon }: { icon: string }) => {
  return (
    <div className="w-4 h-4 p-[2.5px] flex justify-center items-center">
      <div className={cn(icon, "fa-solid w-full h-full")} />
    </div>
  );
};

const Sentence = ({ content }: { content: string }) => {
  return (
    <p className="hidden lg:block text-sm text-translucent-light-150">
      {content}
    </p>
  );
};

const Timestamp = ({ timestamp }: { timestamp: number }) => {
  const [state, setState] = useState<{
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    months: number;
    years: number;
  }>(getTime(timestamp));

  useEffect(() => {
    const interval = setInterval(() => {
      setState(getTime(timestamp));
    }, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  const label = useMemo(() => {
    if (state.years > 0) return `${state.years}y`;
    if (state.months > 0) return `${state.months}mo`;
    if (state.days > 0) return `${state.days}d`;
    if (state.hours > 0) return `${state.hours}h`;
    if (state.minutes > 0) return `${state.minutes}m`;
    return `${state.seconds}s`;
  }, [state]);

  return (
    <p className="text-xs text-translucent-light-150 flex gap-1">
      {label}
      <span className="hidden lg:block">{" ago"}</span>
    </p>
  );
};
