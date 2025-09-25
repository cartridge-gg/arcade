import {
  DiscordIcon,
  GitHubIcon,
  PlayIcon,
  TelegramIcon,
  XIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { cva, VariantProps } from "class-variance-authority";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import { HTMLAttributes } from "react";

interface GameSocialWebsiteProps
  extends VariantProps<typeof GameSocialVariants> {
  website: string;
  label?: boolean;
}
export const GameSocialWebsite = ({ website }: GameSocialWebsiteProps) => {
  return (
    <a
      href={website}
      draggable={false}
      target="_blank"
      className="flex items-center rounded-full p-2 cursor-pointer text-spacer-100 bg-primary hover:bg-primary hover:opacity-80 justify-center lg:px-4 py-2.5"
    >
      <PlayIcon size="sm" />
      <p className="px-0.5 truncate max-w-32">Play</p>
    </a>
  );
};

interface GameSocialDiscordProps
  extends VariantProps<typeof GameSocialVariants> {
  discord: string;
  label?: boolean;
}
export const GameSocialDiscord = ({
  discord,
  label,
  variant,
}: GameSocialDiscordProps) => {
  return (
    <GameSocial
      icon={<DiscordIcon size="sm" />}
      href={discord}
      variant={variant}
      label={label ? "Discord" : undefined}
    />
  );
};

interface GameSocialTwitterProps
  extends VariantProps<typeof GameSocialVariants> {
  twitter: string;
  label?: boolean;
}
export const GameSocialTwitter = ({
  twitter,
  variant,
  label,
}: GameSocialTwitterProps) => {
  const xhandle = twitter.split("/").pop();
  return (
    <GameSocial
      icon={<XIcon size="sm" />}
      href={twitter}
      variant={variant}
      label={label ? `@${xhandle}` : undefined}
    />
  );
};

interface GameSocialGithubProps
  extends VariantProps<typeof GameSocialVariants> {
  github: string;
  label?: boolean;
}
export const GameSocialGithub = ({
  github,
  variant,
  label,
}: GameSocialGithubProps) => {
  return (
    <GameSocial
      icon={<GitHubIcon size="sm" />}
      href={github}
      variant={variant}
      label={label ? "GitHub" : undefined}
    />
  );
};

interface GameSocialTelegramProps
  extends VariantProps<typeof GameSocialVariants> {
  telegram: string;
  label?: boolean;
}
export const GameSocialTelegram = ({
  telegram,
  variant,
  label,
}: GameSocialTelegramProps) => {
  return (
    <GameSocial
      icon={<TelegramIcon size="sm" />}
      href={telegram}
      variant={variant}
      label={label ? "Telegram" : undefined}
    />
  );
};

const GameSocialVariants = cva(
  "flex transition-colors items-center gap-x-0.5 p-2 lg:px-3 cursor-pointer text-foreground-100 text-xs justify-between",
  {
    variants: {
      variant: {
        dark: "bg-background-100 hover:bg-background-200",
        default: "bg-background-200 hover:bg-background-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface GameSocialProps
  extends HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof GameSocialVariants> {
  icon: React.ReactNode;
  href: string;
  label?: string;
}

const GameSocial = ({
  icon,
  href,
  label,
  variant,
  className,
}: GameSocialProps) => {
  return (
    <a
      href={href}
      draggable={false}
      target="_blank"
      className={cn(GameSocialVariants({ variant }), className)}
    >
      <div className="flex gap-2 items-center">
        {icon}
        {label && <p className="px-0.5 truncate max-w-32">{label}</p>}
      </div>

      <div className=" text-background-500">
        <SquareArrowOutUpRightIcon size={16} />
      </div>
    </a>
  );
};

export default GameSocial;
