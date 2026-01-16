import { Thumbnail } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "@tanstack/react-router";
import { StudioIcon } from "../icons";

const gameCardVariants = cva(
  "relative cursor-pointer rounded-lg transition-all duration-200",
  {
    variants: {
      size: {
        large: "h-[200px] lg:h-[240px]",
        small: "h-[160px] lg:h-[180px]",
      },
    },
    defaultVariants: {
      size: "small",
    },
  },
);

interface GameCardProps extends VariantProps<typeof gameCardVariants> {
  name: string;
  icon: string;
  cover?: string;
  href: string;
  color?: string;
  studio?: string;
  className?: string;
}

export const GameCard = ({
  name,
  icon,
  cover,
  href,
  color,
  studio,
  size,
  className,
}: GameCardProps) => {
  return (
    <div
      className={cn(
        "group rounded-lg transition-shadow duration-200",
        gameCardVariants({ size }),
        className,
      )}
      style={{
        boxShadow: color ? "0 0 0 0 transparent" : undefined,
      }}
      onMouseEnter={(e) => {
        if (color) {
          e.currentTarget.style.boxShadow = `0 0 8px 0 ${color}80`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 0 transparent";
      }}
    >
      <Link
        to={href}
        className="relative block size-full overflow-hidden rounded-lg"
      >
        {cover && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundImage: `url(${cover})` }}
          />
        )}
        {!cover && <div className="absolute inset-0 bg-background-150" />}

        <div
          className="absolute bottom-0 left-0 right-0 h-[100px] z-[1]"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)",
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-3 z-[2]">
          <div className="bg-background-200 p-[1px] rounded shrink-0">
            <Thumbnail
              icon={icon}
              size="lg"
              variant="default"
              className="rounded-xs"
            />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-base font-medium text-white truncate tracking-wide">
              {name}
            </p>
            {studio && (
              <div className="flex gap-0.5">
                <StudioIcon />
                <p className="text-xs text-foreground-300 truncate">{studio}</p>
              </div>
            )}
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[3]"
          style={{
            border: color ? `2px solid ${color}` : undefined,
          }}
        />
      </Link>
    </div>
  );
};
